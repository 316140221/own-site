import fs from "node:fs";
import path from "node:path";
import { toPosixPath } from "./lib/path.mjs";

const rootDir = process.cwd();
const distDir = path.resolve(rootDir, process.argv[2] || "dist");
const headersPath = path.join(distDir, "_headers");
const manifestPath = path.resolve(rootDir, "build/asset-manifest.json");

function normalizePathPrefix() {
  const raw = String(process.env.PATH_PREFIX || "/").trim();
  if (!raw || raw === "/") return "/";
  return `/${raw.replace(/^\/+|\/+$/g, "")}/`;
}

function readManifest() {
  try {
    const raw = fs.readFileSync(manifestPath, "utf8");
    return JSON.parse(raw);
  } catch (_error) {
    return null;
  }
}

function ensureDist() {
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
}

function buildHeaderLines(manifest) {
  const immutableTtl = (manifest && Number(manifest.immutableTtlSeconds)) || 31536000;
  const entries = (manifest && manifest.entries) || {};
  const prefix = normalizePathPrefix();
  const prefixTrimmed = prefix === "/" ? "" : prefix.replace(/\/$/, "");

  function withPrefix(pathPattern) {
    const value = String(pathPattern || "").trim();
    if (!value) return value;
    if (prefixTrimmed && value.startsWith("/")) return `${prefixTrimmed}${value}`;
    return value;
  }
  const headerLines = [];

  headerLines.push(
    withPrefix("/*"),
    "  Cache-Control: public,max-age=300",
    ""
  );

  const hashedAssets = Object.values(entries)
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  if (hashedAssets.length) {
    for (const assetPath of hashedAssets) {
      headerLines.push(
        withPrefix(assetPath),
        `  Cache-Control: public,max-age=${immutableTtl},immutable`,
        ""
      );
    }
  } else {
    headerLines.push(
      withPrefix("/assets/*"),
      `  Cache-Control: public,max-age=${immutableTtl},immutable`,
      ""
    );
  }

  headerLines.push(
    withPrefix("/pagefind/*"),
    "  Cache-Control: public,max-age=604800,immutable",
    ""
  );

  return headerLines.join("\n").trimEnd() + "\n";
}

function main() {
  ensureDist();
  const manifest = readManifest();
  const content = buildHeaderLines(manifest);
  fs.writeFileSync(headersPath, content);
  console.log(`[post-build-cache] Wrote headers to ${toPosixPath(headersPath)}`);
}

main();
