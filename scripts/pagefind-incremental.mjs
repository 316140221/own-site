import crypto from "node:crypto";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { toPosixPath } from "./lib/path.mjs";
import { intFromEnv } from "./lib/env.mjs";

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, "dist");
const CACHE_DIR = path.join(ROOT, "build", "pagefind-cache");
const MANIFEST_PATH = path.join(CACHE_DIR, "manifest.json");
const CACHE_INDEX_DIR = path.join(CACHE_DIR, "pagefind");
const CACHE_WORK_DIR = path.join(CACHE_DIR, ".pagefind");
const DIST_INDEX_DIR = path.join(DIST_DIR, "pagefind");
const DIST_WORK_DIR = path.join(DIST_DIR, ".pagefind");
const DEFAULT_HASH_CONCURRENCY = Math.max(1, Math.min(16, (os.cpus() || []).length || 1));
const HASH_CONCURRENCY = intFromEnv("PAGEFIND_HASH_CONCURRENCY", DEFAULT_HASH_CONCURRENCY, {
  min: 1,
  max: 32,
});

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(targetPath) {
  await fs.mkdir(targetPath, { recursive: true });
}

async function hashFile(filePath) {
  const buf = await fs.readFile(filePath);
  return crypto.createHash("sha1").update(buf).digest("hex");
}

async function mapLimit(items, limit, worker) {
  const list = Array.isArray(items) ? items : [];
  const max = Number.isFinite(limit) ? Math.max(1, Math.floor(limit)) : 1;
  let cursor = 0;
  const runners = Array.from({ length: Math.min(max, list.length) }, async () => {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= list.length) break;
      await worker(list[index], index);
    }
  });
  await Promise.all(runners);
}

async function collectHtmlHashes(baseDir) {
  const entries = [];
  async function walk(current) {
    const dirEntries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of dirEntries) {
      if (entry.name === "pagefind" || entry.name === ".pagefind") continue;
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }
      const isHtml = entry.isFile() && entry.name.toLowerCase().endsWith(".html");
      if (!isHtml) continue;
      entries.push({
        fullPath,
        rel: toPosixPath(path.relative(baseDir, fullPath)),
      });
    }
  }

  await walk(baseDir);
  entries.sort((a, b) => a.rel.localeCompare(b.rel));

  const hashes = {};
  await mapLimit(entries, HASH_CONCURRENCY, async (entry) => {
    hashes[entry.rel] = await hashFile(entry.fullPath);
  });
  return hashes;
}

async function readManifest() {
  try {
    const raw = await fs.readFile(MANIFEST_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.files) {
      return parsed;
    }
    return { files: {} };
  } catch {
    return { files: {} };
  }
}

async function writeManifest(payload) {
  await ensureDir(CACHE_DIR);
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(payload, null, 2) + "\n", "utf8");
}

async function copyDir(src, dest) {
  await fs.rm(dest, { recursive: true, force: true, maxRetries: 3, retryDelay: 50 });
  await fs.cp(src, dest, { recursive: true });
}

async function runPagefind() {
  const runnerPath = path.join(ROOT, "node_modules", "pagefind", "lib", "runner", "bin.cjs");
  const runnerExists = await pathExists(runnerPath);
  const localBin =
    process.platform === "win32"
      ? path.join(ROOT, "node_modules", ".bin", "pagefind.cmd")
      : path.join(ROOT, "node_modules", ".bin", "pagefind");
  const useRunner = runnerExists;
  const useLocalBin = !useRunner && (await pathExists(localBin));
  const cmd = useRunner
    ? process.execPath
    : useLocalBin
      ? localBin
      : process.platform === "win32"
        ? "npx.cmd"
        : "npx";
  const args = useRunner
    ? [runnerPath, "--site", DIST_DIR]
    : useLocalBin
      ? ["--site", DIST_DIR]
      : ["pagefind", "--site", DIST_DIR];

  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: "inherit",
    });

    child.on("error", (error) => reject(error));
    child.on("exit", (code) => {
      if (code === 0) return resolve();
      reject(new Error(`pagefind exited with code ${code}`));
    });
  });
}

async function restoreCache() {
  const hasWorkCache = await pathExists(CACHE_WORK_DIR);
  if (hasWorkCache) {
    await ensureDir(DIST_DIR);
    await copyDir(CACHE_WORK_DIR, DIST_WORK_DIR);
    console.log(
      `[pagefind-incremental] Restored parser cache from "${toPosixPath(CACHE_WORK_DIR)}"`
    );
  }
}

async function reuseIndexIfUnchanged(hashes, changed, removed) {
  const hasCachedIndex = await pathExists(CACHE_INDEX_DIR);
  if (!hasCachedIndex) return false;
  if (changed.length || removed.length) return false;

  await ensureDir(DIST_DIR);
  await copyDir(CACHE_INDEX_DIR, DIST_INDEX_DIR);
  const hasWorkCache = await pathExists(CACHE_WORK_DIR);
  if (hasWorkCache) {
    await copyDir(CACHE_WORK_DIR, DIST_WORK_DIR);
  }

  await writeManifest({
    files: hashes,
    indexedAt: new Date().toISOString(),
    changed,
    removed,
    reused: true,
  });
  console.log(
    `[pagefind-incremental] No HTML changes detected; reused cached index from "${toPosixPath(CACHE_INDEX_DIR)}"`
  );
  return true;
}

async function saveCache(hashes, changed, removed) {
  const hasIndex = await pathExists(DIST_INDEX_DIR);
  if (!hasIndex) {
    throw new Error("Pagefind index not found after build");
  }

  await ensureDir(CACHE_DIR);
  await copyDir(DIST_INDEX_DIR, CACHE_INDEX_DIR);
  if (await pathExists(DIST_WORK_DIR)) {
    await copyDir(DIST_WORK_DIR, CACHE_WORK_DIR);
  }

  await writeManifest({
    files: hashes,
    indexedAt: new Date().toISOString(),
    changed,
    removed,
    reused: false,
  });
  console.log(
    `[pagefind-incremental] Indexed ${Object.keys(hashes).length} pages (changed ${changed.length}, removed ${removed.length}). Cache refreshed.`
  );
}

async function main() {
  if (!(await pathExists(DIST_DIR))) {
    throw new Error(`dist directory not found at "${toPosixPath(DIST_DIR)}"`);
  }

  console.log(`[pagefind-incremental] Hash concurrency=${HASH_CONCURRENCY}`);

  const prevManifest = await readManifest();
  const prevFiles = prevManifest.files || {};
  const currentHashes = await collectHtmlHashes(DIST_DIR);
  const changed = [];
  const removed = [];

  for (const [rel, hash] of Object.entries(currentHashes)) {
    if (prevFiles[rel] !== hash) changed.push(rel);
  }
  for (const rel of Object.keys(prevFiles)) {
    if (!currentHashes[rel]) removed.push(rel);
  }

  changed.sort((a, b) => a.localeCompare(b));
  removed.sort((a, b) => a.localeCompare(b));

  if (await reuseIndexIfUnchanged(currentHashes, changed, removed)) return;

  if (changed.length) {
    const preview = changed.slice(0, 5).join(", ");
    console.log(
      `[pagefind-incremental] Detected ${changed.length} new/changed HTML files: ${preview}${
        changed.length > 5 ? "..." : ""
      }`
    );
  }
  if (removed.length) {
    const preview = removed.slice(0, 5).join(", ");
    console.log(
      `[pagefind-incremental] Detected ${removed.length} removed HTML files: ${preview}${
        removed.length > 5 ? "..." : ""
      }`
    );
  }

  await restoreCache();
  await runPagefind();
  await saveCache(currentHashes, changed, removed);
}

main().catch((error) => {
  console.error(`[pagefind-incremental] ${error.message}`);
  process.exit(1);
});
