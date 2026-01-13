import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { toPosixPath } from "./lib/path.mjs";

function usage() {
  return [
    "Restore an articles archive into this repo (extracts paths like data/articles/...).",
    "",
    "Usage:",
    "  node scripts/restore-archive.mjs <archive.tgz...> [--dry-run]",
    "",
    "Examples:",
    "  node scripts/restore-archive.mjs archives/articles-2025-01-01-to-2025-02-01.tgz",
    "  node scripts/restore-archive.mjs archives/articles-*.tgz --dry-run",
    "  node scripts/restore-archive.mjs archives/articles-2025-01-*.tgz archives/articles-2025-02-*.tgz",
    "",
    "After restore, you likely want to rebuild indexes:",
    "  npm run indexes",
  ].join("\n");
}

const args = process.argv.slice(2);
const positional = [];
let dryRun = false;
const ROOT = process.cwd();

for (const arg of args) {
  if (arg === "--help" || arg === "-h") {
    console.log(usage());
    process.exit(0);
  }
  if (arg === "--dry-run") {
    dryRun = true;
    continue;
  }
  positional.push(arg);
}

function hasGlob(value) {
  return /[*?]/.test(String(value || ""));
}

function globToRegExp(pattern) {
  const raw = String(pattern || "");
  const escaped = raw.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  const regex = escaped.replace(/\*/g, ".*").replace(/\?/g, ".");
  return new RegExp(`^${regex}$`, "i");
}

async function expandArchivePattern(pattern) {
  const raw = String(pattern || "");
  if (!raw) return [];

  if (!hasGlob(raw)) return [path.resolve(ROOT, raw)];

  const dir = path.resolve(ROOT, path.dirname(raw));
  const base = path.basename(raw);
  const re = globToRegExp(base);
  let entries = [];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const matches = entries
    .filter((entry) => entry.isFile() && re.test(entry.name))
    .map((entry) => path.join(dir, entry.name))
    .sort((a, b) => a.localeCompare(b));

  return matches;
}

async function resolveArchives(patterns) {
  const list = Array.isArray(patterns) ? patterns : [];
  const out = [];
  const seen = new Set();

  for (const pattern of list) {
    const matches = await expandArchivePattern(pattern);
    if (!matches.length) {
      const abs = path.resolve(ROOT, String(pattern || ""));
      if (hasGlob(pattern)) {
        throw new Error(`No archives matched pattern: ${toPosixPath(abs)}`);
      }
      matches.push(abs);
    }

    for (const match of matches) {
      if (seen.has(match)) continue;
      seen.add(match);
      out.push(match);
    }
  }

  out.sort((a, b) => toPosixPath(a).localeCompare(toPosixPath(b)));
  return out;
}

async function assertArchiveExists(archivePath) {
  try {
    const stat = await fs.stat(archivePath);
    if (!stat.isFile()) throw new Error("not a file");
  } catch {
    throw new Error(`Missing archive: ${toPosixPath(archivePath)}`);
  }
}

async function extractArchive(archivePath) {
  const tarArgs = ["-xzf", archivePath, "-C", ROOT];
  await new Promise((resolve, reject) => {
    const child = spawn("tar", tarArgs, { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`tar exited with code ${code}`));
    });
  });
}

if (!positional.length) {
  console.error(usage());
  process.exit(2);
}

let archives = [];
try {
  archives = await resolveArchives(positional);
} catch (error) {
  console.error(`[restore-archive] ${String(error?.message || error)}`);
  process.exit(2);
}

if (!archives.length) {
  console.error("[restore-archive] No archives resolved");
  process.exit(2);
}

try {
  await Promise.all(archives.map((archivePath) => assertArchiveExists(archivePath)));
} catch (error) {
  console.error(`[restore-archive] ${String(error?.message || error)}`);
  process.exit(2);
}

if (dryRun) {
  console.log(`[restore-archive] Dry run: matched ${archives.length} archive(s):`);
  for (const archivePath of archives) {
    const tarArgs = ["-xzf", archivePath, "-C", ROOT];
    console.log(
      `- tar ${tarArgs.map((a) => JSON.stringify(toPosixPath(a))).join(" ")}`
    );
  }
  process.exit(0);
}

for (const archivePath of archives) {
  console.log(`[restore-archive] Extracting ${toPosixPath(archivePath)}`);
  await extractArchive(archivePath);
}

console.log("[restore-archive] Done.");
