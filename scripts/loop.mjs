import { spawn } from "node:child_process";
import { boolFromEnv, intFromEnv } from "./lib/env.mjs";

function nowIso() {
  return new Date().toISOString();
}

function sleep(ms) {
  if (!ms) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseArgs(argv) {
  const args = [...argv];

  let times = intFromEnv("LOOP_TIMES", 30, { min: 1 });
  let delayMs = intFromEnv("LOOP_DELAY_MS", 0, { min: 0 });
  let durationMs = intFromEnv("LOOP_DURATION_MS", 0, { min: 0 });
  let continueOnFail = boolFromEnv("LOOP_CONTINUE_ON_FAIL", false);

  if (args.includes("--help") || args.includes("-h")) {
    return { help: true };
  }

  function splitEquals(value) {
    const text = String(value || "");
    const index = text.indexOf("=");
    if (index === -1) return { flag: text, value: null };
    return { flag: text.slice(0, index), value: text.slice(index + 1) };
  }

  const sepIndex = args.indexOf("--");
  if (sepIndex === -1) {
    throw new Error("Missing command separator `--`");
  }

  const optionArgs = args.slice(0, sepIndex);
  const command = args.slice(sepIndex + 1);
  if (command.length === 0) {
    throw new Error("Missing command after `--`");
  }

  for (let i = 0; i < optionArgs.length; i += 1) {
    const { flag, value: eqValue } = splitEquals(optionArgs[i]);
    if (flag === "--times" || flag === "-n") {
      const value = eqValue ?? optionArgs[i + 1];
      if (eqValue == null) i += 1;
      const parsed = Number.parseInt(String(value || ""), 10);
      if (Number.isFinite(parsed) && parsed > 0) times = parsed;
      continue;
    }
    if (flag === "--delay-ms" || flag === "-d") {
      const value = eqValue ?? optionArgs[i + 1];
      if (eqValue == null) i += 1;
      const parsed = Number.parseInt(String(value || ""), 10);
      if (Number.isFinite(parsed) && parsed >= 0) delayMs = parsed;
      continue;
    }
    if (flag === "--duration-ms" || flag === "-m") {
      const value = eqValue ?? optionArgs[i + 1];
      if (eqValue == null) i += 1;
      const parsed = Number.parseInt(String(value || ""), 10);
      if (Number.isFinite(parsed) && parsed >= 0) durationMs = parsed;
      continue;
    }
    if (flag === "--continue-on-fail" || flag === "-c") {
      continueOnFail = true;
      continue;
    }
    throw new Error(`Unknown option: ${flag}`);
  }

  return { help: false, times, delayMs, durationMs, continueOnFail, command };
}

function limitString(input, maxLen = 8000) {
  const text = String(input || "");
  if (text.length <= maxLen) return text;
  return text.slice(0, Math.max(0, maxLen - 3)) + "...";
}

async function runCommand(command) {
  const startedAt = nowIso();
  const startMs = Date.now();

  return new Promise((resolve) => {
    const child = spawn(command[0], command.slice(1), {
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString("utf8");
      if (stdout.length > 200_000) stdout = stdout.slice(-200_000);
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString("utf8");
      if (stderr.length > 200_000) stderr = stderr.slice(-200_000);
    });

    child.on("close", (code, signal) => {
      const finishedAt = nowIso();
      const durationMs = Date.now() - startMs;

      let json = null;
      const trimmed = stdout.trim();
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        try {
          json = JSON.parse(trimmed);
        } catch {
          json = null;
        }
      }

      resolve({
        startedAt,
        finishedAt,
        durationMs,
        exitCode: code,
        signal: signal || null,
        ok: code === 0,
        stdout: limitString(stdout, 20000),
        stderr: limitString(stderr, 20000),
        json,
      });
    });
  });
}

function usage() {
  return [
    "Usage:",
    "  node scripts/loop.mjs [options] -- <command> [args...]",
    "",
    "Options:",
    "  --times, -n <N>        Run N times (default: 30 or $LOOP_TIMES)",
    "  --delay-ms, -d <ms>    Wait between runs (default: 0 or $LOOP_DELAY_MS)",
    "  --duration-ms, -m <ms> Stop after time budget ($LOOP_DURATION_MS)",
    "  --continue-on-fail, -c Do not stop on failures ($LOOP_CONTINUE_ON_FAIL=1)",
    "",
    "Example:",
    "  node scripts/loop.mjs --times 30 -- node scripts/update.mjs",
    "  node scripts/loop.mjs --duration-ms 18000000 -- node scripts/update.mjs",
    "",
  ].join("\n");
}

let parsed;
try {
  parsed = parseArgs(process.argv.slice(2));
} catch (error) {
  console.error(String(error?.message || error));
  console.error("");
  console.error(usage());
  process.exit(1);
}

if (parsed.help) {
  console.log(usage());
  process.exit(0);
}

const startedAt = nowIso();
const results = [];
let aborted = false;
let stopReason = null;
const stopAtMs = parsed.durationMs ? Date.now() + parsed.durationMs : null;

for (let i = 0; i < parsed.times; i += 1) {
  if (stopAtMs && Date.now() >= stopAtMs) {
    stopReason = "duration_ms_reached";
    break;
  }
  if (i > 0 && parsed.delayMs) await sleep(parsed.delayMs);
  if (stopAtMs && Date.now() >= stopAtMs) {
    stopReason = "duration_ms_reached";
    break;
  }

  const cmdText = parsed.command.map((item) => JSON.stringify(String(item))).join(" ");
  console.error(`[loop] ${i + 1}/${parsed.times} ${cmdText}`);
  const result = await runCommand(parsed.command);
  results.push({ index: i + 1, ...result });

  if (!result.ok && !parsed.continueOnFail) {
    aborted = true;
    stopReason = "first_failure";
    break;
  }
}

if (!stopReason) stopReason = aborted ? "first_failure" : "times_reached";

const finishedAt = nowIso();
const totals = {
  runs: results.length,
  ok: results.filter((r) => r.ok).length,
  failed: results.filter((r) => !r.ok).length,
  durationMs: results.reduce((sum, r) => sum + (r.durationMs || 0), 0),
};

console.log(
  JSON.stringify(
    {
      startedAt,
      finishedAt,
      aborted,
      times: parsed.times,
      delayMs: parsed.delayMs,
      durationMs: parsed.durationMs,
      continueOnFail: parsed.continueOnFail,
      command: parsed.command,
      totals,
      stopReason,
      results,
    },
    null,
    2
  )
);

