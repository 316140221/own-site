import fs from "node:fs";
import path from "node:path";
import sharedAssets from "../shared/assets.cjs";
import { normalizePathPrefix, stripQueryAndHash, toPosixPath } from "./lib/path.mjs";
import { intFromEnv } from "./lib/env.mjs";

const distArg = process.argv[2] || "dist";
const distDir = path.resolve(process.cwd(), distArg);

const SCAN_EXTENSIONS = new Set([".html", ".xml", ".txt", ".json", ".opml", ".webmanifest"]);
const SIZE_EXTENSIONS = new Set([".js", ".css", ".html"]);
const IGNORE_DIRS = new Set(["pagefind"]);
const MANIFEST_PATH = path.resolve(process.cwd(), "build/asset-manifest.json");
const HEADERS_PATH = path.resolve(process.cwd(), distArg, "_headers");

const SIZE_BUDGET = {
  js: intFromEnv("BUDGET_JS_BYTES", 420 * 1024, { min: 0 }),
  css: intFromEnv("BUDGET_CSS_BYTES", 260 * 1024, { min: 0 }),
  html: intFromEnv("BUDGET_HTML_BYTES", 160 * 1024, { min: 0 }),
};

const BANNED_PATTERNS = [
  { label: "npm run build:site", regex: /\bnpm run build:site\b/i },
  { label: "npm run update", regex: /\bnpm run update\b/i },
  { label: "npm run indexes", regex: /\bnpm run indexes\b/i },
  { label: "Run npm run", regex: /\bRun npm run\b/i },
  { label: "No stories yet. Run", regex: /No stories yet\. Run\b/i },
];

const plainAssets = Array.from(
  new Set(
    Object.values(sharedAssets?.DEFAULT_ASSET_PATHS || {})
      .map((value) => String(value || "").trim())
      .filter(Boolean)
  )
).sort((a, b) => a.localeCompare(b));

function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      yield* walk(fullPath);
      continue;
    }
    if (entry.isFile()) yield fullPath;
  }
}

function formatSnippet(text, index) {
  const start = Math.max(0, index - 80);
  const end = Math.min(text.length, index + 180);
  return text
    .slice(start, end)
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function lineNumberForIndex(text, index) {
  if (index <= 0) return 1;
  return text.slice(0, index).split(/\r?\n/g).length;
}

function readManifest() {
  try {
    const raw = fs.readFileSync(MANIFEST_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch (_error) {
    return null;
  }
}

function manifestAssetToDistRelPath(assetPath) {
  const raw = toPosixPath(stripQueryAndHash(assetPath));
  if (!raw) return "";
  const normalized = raw.startsWith("/") ? raw : `/${raw}`;
  const idx = normalized.indexOf("/assets/");
  const assetRoot = idx !== -1 ? normalized.slice(idx) : normalized;
  return assetRoot.replace(/^\/+/, "");
}

if (!fs.existsSync(distDir)) {
  console.error(`[audit-dist] Missing directory: ${toPosixPath(distDir)}`);
  process.exit(2);
}

let scannedFiles = 0;
const violations = [];
const sizeStats = {
  js: { total: 0, max: 0, maxFile: null },
  css: { total: 0, max: 0, maxFile: null },
  html: { total: 0, max: 0, maxFile: null },
};
const plainAssetHits = [];

for (const filePath of walk(distDir)) {
  const ext = path.extname(filePath).toLowerCase();
  if (SIZE_EXTENSIONS.has(ext)) {
    const stat = fs.statSync(filePath);
    const relPath = toPosixPath(path.relative(distDir, filePath));
    if (ext === ".js") {
      sizeStats.js.total += stat.size;
      if (stat.size > sizeStats.js.max) {
        sizeStats.js.max = stat.size;
        sizeStats.js.maxFile = relPath;
      }
    } else if (ext === ".css") {
      sizeStats.css.total += stat.size;
      if (stat.size > sizeStats.css.max) {
        sizeStats.css.max = stat.size;
        sizeStats.css.maxFile = relPath;
      }
    } else if (ext === ".html") {
      sizeStats.html.total += stat.size;
      if (stat.size > sizeStats.html.max) {
        sizeStats.html.max = stat.size;
        sizeStats.html.maxFile = relPath;
      }
    }
  }

  if (!SCAN_EXTENSIONS.has(ext)) continue;

  scannedFiles += 1;
  const relPath = toPosixPath(path.relative(distDir, filePath));
  const content = fs.readFileSync(filePath, "utf8");

  for (const banned of BANNED_PATTERNS) {
    const index = content.search(banned.regex);
    if (index === -1) continue;

    violations.push({
      file: relPath,
      line: lineNumberForIndex(content, index),
      label: banned.label,
      snippet: formatSnippet(content, index),
    });
  }

  if (ext === ".html") {
    for (const assetPath of plainAssets) {
      const idx = content.indexOf(assetPath);
      if (idx !== -1) {
        plainAssetHits.push({
          file: relPath,
          line: lineNumberForIndex(content, idx),
          asset: assetPath,
        });
      }
    }
  }
}

const sizeBreaches = [];
for (const [key, stats] of Object.entries(sizeStats)) {
  const limit = SIZE_BUDGET[key];
  if (limit && stats.max > limit) {
    sizeBreaches.push({
      type: key,
      size: stats.max,
      limit,
      file: stats.maxFile,
      total: stats.total,
    });
  }
}

const cacheIssues = [];
const manifest = readManifest();

if (!manifest || !manifest.entries || !Object.keys(manifest.entries).length) {
  cacheIssues.push("asset manifest missing or empty (build/asset-manifest.json)");
}

if (manifest && manifest.entries && Object.keys(manifest.entries).length) {
  for (const [key, value] of Object.entries(manifest.entries)) {
    const rel = manifestAssetToDistRelPath(value);
    if (!rel) continue;
    const fullPath = path.join(distDir, rel);
    if (!fs.existsSync(fullPath)) {
      cacheIssues.push(
        `hashed asset missing on disk for ${key}: ${String(value || "").trim()} (expected ${toPosixPath(fullPath)})`
      );
    }
  }
}

if (plainAssetHits.length) {
  cacheIssues.push(
    ...plainAssetHits.map(
      (hit) => `${hit.file}:${hit.line} references non-hashed asset ${hit.asset}`
    )
  );
}

if (fs.existsSync(HEADERS_PATH)) {
  const headersContent = fs.readFileSync(HEADERS_PATH, "utf8");
  const immutableTtlRaw = manifest && Number(manifest.immutableTtlSeconds);
  const immutableTtl =
    Number.isFinite(immutableTtlRaw) && immutableTtlRaw >= 0 ? immutableTtlRaw : 31536000;

  const prefix = normalizePathPrefix();
  const prefixTrimmed = prefix === "/" ? "" : prefix.replace(/\/$/, "");
  const firstRuleLine = headersContent
    .split(/\r?\n/g)
    .map((line) => line.trimEnd())
    .find((line) => line && !/^\s/.test(line));
  const detectedPrefix =
    firstRuleLine && firstRuleLine.endsWith("/*")
      ? normalizePathPrefix(firstRuleLine.replace(/\/\*$/, "/"))
      : null;
  const headersPaths = new Set(
    headersContent
      .split(/\r?\n/g)
      .map((line) => line.trimEnd())
      .filter((line) => line && !/^\s/.test(line))
  );
  const withPrefix = (pattern) => {
    const value = String(pattern || "").trim();
    if (!value) return value;
    if (prefixTrimmed && value.startsWith("/")) return `${prefixTrimmed}${value}`;
    return value;
  };

  const rootRule = withPrefix("/*");
  const pagefindRule = withPrefix("/pagefind/*");
  if (!headersPaths.has(rootRule)) {
    cacheIssues.push(`_headers missing root rule "${rootRule}"`);
  }
  if (!headersPaths.has(pagefindRule)) {
    cacheIssues.push(`_headers missing pagefind rule "${pagefindRule}"`);
  }
  if (
    detectedPrefix &&
    detectedPrefix !== prefix &&
    (!headersPaths.has(rootRule) || !headersPaths.has(pagefindRule))
  ) {
    cacheIssues.push(
      `hint: dist/_headers looks generated with PATH_PREFIX=${detectedPrefix} (current ${prefix}); run with matching PATH_PREFIX to avoid false failures`
    );
  }

  if (!/Cache-Control:\s*public,max-age=\d+,immutable/i.test(headersContent)) {
    cacheIssues.push("_headers missing immutable cache-control rule for assets");
  }
  if (!headersContent.includes("Cache-Control: public,max-age=300")) {
    cacheIssues.push("_headers missing short-lived cache-control rule for HTML");
  }
  if (headersContent.includes("/assets/") && !headersContent.includes(String(immutableTtl))) {
    cacheIssues.push(`_headers does not mention configured immutable TTL ${immutableTtl}`);
  }

  const manifestEntries =
    manifest && manifest.entries && typeof manifest.entries === "object"
      ? manifest.entries
      : {};
  const hashedAssets = Array.from(
    new Set(
      Object.values(manifestEntries)
        .map((value) => toPosixPath(stripQueryAndHash(value)))
        .map((value) => String(value || "").trim())
        .map((value) => (value.startsWith("/") ? value : `/${value.replace(/^\/+/, "")}`))
        .map((value) => {
          const idx = value.indexOf("/assets/");
          return idx !== -1 ? value.slice(idx) : value;
        })
        .filter((value) => value.startsWith("/assets/"))
        .filter(Boolean)
    )
  );
  if (hashedAssets.length) {
    for (const assetPath of hashedAssets) {
      const rule = withPrefix(assetPath.startsWith("/") ? assetPath : `/${assetPath.replace(/^\/+/, "")}`);
      if (!headersPaths.has(rule)) {
        cacheIssues.push(`_headers missing hashed asset rule "${rule}"`);
      }
    }
  } else {
    const wildcardAssetsRule = withPrefix("/assets/*");
    if (!headersPaths.has(wildcardAssetsRule)) {
      cacheIssues.push(`_headers missing wildcard assets rule "${wildcardAssetsRule}"`);
    }
  }
} else {
  cacheIssues.push("missing dist/_headers for CDN TTL configuration");
}

if (violations.length || sizeBreaches.length || cacheIssues.length) {
  console.error(
    `[audit-dist] Found ${violations.length} public-content issue(s), ${sizeBreaches.length} size breach(es), ${cacheIssues.length} cache issue(s) in ${scannedFiles} file(s):`
  );
  for (const v of violations) {
    console.error(`- ${v.file}:${v.line} contains "${v.label}": ${v.snippet}`);
  }

  if (sizeBreaches.length) {
    console.error("[audit-dist] Bundle size budget exceeded:");
    for (const breach of sizeBreaches) {
      const kb = (breach.size / 1024).toFixed(1);
      const limitKb = (breach.limit / 1024).toFixed(1);
      const extra = breach.file ? ` (${breach.file})` : "";
      console.error(`- ${breach.type} max ${kb}KB > budget ${limitKb}KB${extra}`);
    }
  }
  if (cacheIssues.length) {
    console.error("[audit-dist] Cache/cdn checks failed:");
    cacheIssues.forEach((issue) => console.error(`- ${issue}`));
  }
  process.exit(1);
}

console.log(
  `[audit-dist] OK: scanned ${scannedFiles} file(s). size totals(js/css/html KB)=${(sizeStats.js.total / 1024).toFixed(1)}/${(sizeStats.css.total / 1024).toFixed(1)}/${(sizeStats.html.total / 1024).toFixed(1)} max(js/css/html KB)=${(sizeStats.js.max / 1024).toFixed(1)}/${(sizeStats.css.max / 1024).toFixed(1)}/${(sizeStats.html.max / 1024).toFixed(1)} maxFiles(js/css/html)=${sizeStats.js.maxFile || "-"} / ${sizeStats.css.maxFile || "-"} / ${sizeStats.html.maxFile || "-"}`
);
