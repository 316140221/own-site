import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { toPosixPath } from "./lib/path.mjs";

function usage() {
  return [
    "Restore an articles archive into this repo (extracts paths like data/articles/...).",
    "",
    "Usage:",
    "  node scripts/restore-archive.mjs <archive.tgz> [--dry-run]",
    "",
    "Examples:",
    "  node scripts/restore-archive.mjs archives/articles-2025-01-01-to-2025-02-01.tgz",
    "  node scripts/restore-archive.mjs archives/articles-*.tgz --dry-run",
    "",
    "After restore, you likely want to rebuild indexes:",
    "  npm run indexes",
  ].join("\n");
}

const args = process.argv.slice(2);
const positional = [];
let dryRun = false;

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

const archiveArg = positional[0];
if (!archiveArg) {
  console.error(usage());
  process.exit(2);
}

const archivePath = path.resolve(process.cwd(), archiveArg);
try {
  await fs.access(archivePath);
} catch {
  console.error(`[restore-archive] Missing archive: ${toPosixPath(archivePath)}`);
  process.exit(2);
}

const tarArgs = ["-xzf", archivePath, "-C", process.cwd()];
if (dryRun) {
  console.log(
    `[restore-archive] Dry run: tar ${tarArgs.map((a) => JSON.stringify(toPosixPath(a))).join(" ")}`
  );
  process.exit(0);
}

await new Promise((resolve, reject) => {
  const child = spawn("tar", tarArgs, { stdio: "inherit" });
  child.on("error", reject);
  child.on("exit", (code) => {
    if (code === 0) resolve();
    else reject(new Error(`tar exited with code ${code}`));
  });
});

console.log("[restore-archive] Done.");

