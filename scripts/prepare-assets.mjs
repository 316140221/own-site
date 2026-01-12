import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import sharedAssets from "../shared/assets.cjs";
import { toPosixPath } from "./lib/path.mjs";
import { intFromEnv } from "./lib/env.mjs";

const rootDir = process.cwd();
const assetDir = path.resolve(rootDir, "src/assets");
const outputDir = path.resolve(rootDir, "build/assets");
const manifestPath = path.resolve(rootDir, "build/asset-manifest.json");
const immutableTtlSeconds = intFromEnv("ASSET_IMMUTABLE_TTL", 31536000, { min: 0 });

const ASSETS_TO_HASH = [...(sharedAssets?.ASSET_KEYS || [])];

function ensureDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  fs.mkdirSync(dirPath, { recursive: true });
}

function hashContent(content) {
  return createHash("sha256").update(content).digest("hex").slice(0, 12);
}

function buildManifest(entries) {
  const manifest = {
    generatedAt: new Date().toISOString(),
    immutableTtlSeconds,
    entries,
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  return manifest;
}

function main() {
  ensureDir(outputDir);

  const entries = {};
  const missing = [];
  for (const name of ASSETS_TO_HASH) {
    const srcPath = path.join(assetDir, name);
    if (!fs.existsSync(srcPath)) {
      missing.push({ name, srcPath });
      continue;
    }
    const content = fs.readFileSync(srcPath);
    const hash = hashContent(content);
    const ext = path.extname(name);
    const base = path.basename(name, ext);
    const hashedName = `${base}.${hash}${ext}`;
    const outPath = path.join(outputDir, hashedName);
    fs.writeFileSync(outPath, content);
    entries[name] = `/assets/${hashedName}`;
    console.log(`[prepare-assets] ${name} -> ${hashedName}`);
  }

  if (missing.length) {
    console.error("[prepare-assets] Missing required source assets:");
    missing.forEach((item) =>
      console.error(`- ${item.name}: ${toPosixPath(item.srcPath)}`)
    );
    process.exit(1);
  }

  buildManifest(entries);
  console.log(
    `[prepare-assets] Manifest written to ${toPosixPath(manifestPath)} with ${Object.keys(entries).length} asset(s)`
  );
}

main();
