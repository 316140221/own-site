import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import {
  normalizePathPrefix,
  stripPathPrefix,
  stripQueryAndHash,
  toPosixPath,
} from "./lib/path.mjs";
import { intFromEnv } from "./lib/env.mjs";

const distDir = path.resolve(process.cwd(), process.argv[2] || "dist");
const sizeCache = new Map();
const transferCache = new Map();
const missingLocalAssets = new Map();
const pathPrefix = normalizePathPrefix();

function readHtml(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function pageBudgets(key, defaults) {
  return {
    js: intFromEnv(`LH_${key}_JS_BUDGET`, defaults.js, { min: 0 }),
    css: intFromEnv(`LH_${key}_CSS_BUDGET`, defaults.css, { min: 0 }),
    lcpImage: intFromEnv(`LH_${key}_LCP_BUDGET`, defaults.lcpImage, { min: 0 }),
    missingDims: intFromEnv(`LH_${key}_CLS_MISSING`, defaults.missingDims, { min: 0 }),
  };
}

const budgets = {
  home: pageBudgets("HOME", { js: 220 * 1024, css: 80 * 1024, lcpImage: 380 * 1024, missingDims: 0 }),
  category: pageBudgets("CATEGORY", { js: 220 * 1024, css: 80 * 1024, lcpImage: 380 * 1024, missingDims: 0 }),
  article: pageBudgets("ARTICLE", { js: 260 * 1024, css: 90 * 1024, lcpImage: 420 * 1024, missingDims: 0 }),
};

function isExternalAsset(url) {
  const raw = String(url || "").trim();
  if (!raw) return true;
  if (/^https?:\/\//i.test(raw)) return true;
  if (raw.startsWith("//")) return true;
  return /^(data|mailto|tel|javascript|blob|about):/i.test(raw);
}

function resolveLocalAsset(src) {
  const trimmed = String(src || "").trim();
  if (!trimmed) return null;
  if (isExternalAsset(trimmed)) return null;
  const cleaned = stripQueryAndHash(trimmed);
  if (!cleaned) return null;

  const absolute = cleaned.startsWith("/")
    ? cleaned
    : `/${cleaned.replace(/^\.?\/+/, "")}`;
  const stripped = stripPathPrefix(absolute);
  const relative = stripped.startsWith("/") ? stripped.slice(1) : stripped;
  return path.join(distDir, relative);
}

function recordMissingLocalAsset(src, fullPath) {
  if (!fullPath) return;
  if (missingLocalAssets.has(fullPath)) return;
  const url = String(src || "").trim();
  missingLocalAssets.set(fullPath, url);
}

function fileSizeBytes(src) {
  const fullPath = resolveLocalAsset(src);
  if (!fullPath) return 0;
  if (sizeCache.has(fullPath)) return sizeCache.get(fullPath);
  try {
    const stat = fs.statSync(fullPath);
    if (!stat.isFile()) {
      recordMissingLocalAsset(src, fullPath);
      sizeCache.set(fullPath, 0);
      return 0;
    }
    const size = stat.size;
    sizeCache.set(fullPath, size);
    return size;
  } catch {
    recordMissingLocalAsset(src, fullPath);
    sizeCache.set(fullPath, 0);
    return 0;
  }
}

function fileTransferBytes(src) {
  const fullPath = resolveLocalAsset(src);
  if (!fullPath) return 0;
  if (transferCache.has(fullPath)) return transferCache.get(fullPath);
  const ext = path.extname(fullPath).toLowerCase();
  try {
    const raw = fs.readFileSync(fullPath);
    if (ext === ".js" || ext === ".css" || ext === ".html" || ext === ".xml" || ext === ".txt") {
      const size = zlib.gzipSync(raw).length;
      transferCache.set(fullPath, size);
      return size;
    }
    const size = raw.length;
    transferCache.set(fullPath, size);
    return size;
  } catch {
    recordMissingLocalAsset(src, fullPath);
    transferCache.set(fullPath, 0);
    return 0;
  }
}

function inferPathPrefixHint() {
  const hits = new Map();
  for (const missingPath of missingLocalAssets.keys()) {
    const rel = toPosixPath(path.relative(distDir, missingPath));
    const match = rel.match(/^([^/]+)\/(assets|pagefind)\/(.+)$/);
    if (!match) continue;
    const altPath = path.join(distDir, match[2], match[3]);
    if (!fs.existsSync(altPath)) continue;
    const candidate = normalizePathPrefix(`/${match[1]}/`);
    hits.set(candidate, (hits.get(candidate) || 0) + 1);
  }

  let best = null;
  let bestCount = 0;
  for (const [prefix, count] of hits.entries()) {
    if (count > bestCount) {
      best = prefix;
      bestCount = count;
    }
  }

  if (!best || best === pathPrefix) return null;
  if (bestCount < 2) return null;
  return { prefix: best, evidence: bestCount };
}

function analyzePage(label, filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    return { label, missing: true, filePath };
  }

  const html = readHtml(filePath);
  const scriptRe = /<script\b[^>]*\ssrc=["']([^"']+)["'][^>]*>/gi;
  let match;
  const scripts = new Set();
  while ((match = scriptRe.exec(html))) {
    const src = stripQueryAndHash(match[1]);
    if (src) scripts.add(src);
  }

  const styles = new Set();
  const linkRe = /<link\b[^>]*>/gi;
  while ((match = linkRe.exec(html))) {
    const tag = match[0];
    const relRaw = tag.match(/\srel\s*=\s*["']([^"']+)["']/i);
    const relList = String(relRaw?.[1] || "")
      .trim()
      .toLowerCase()
      .split(/\s+/g)
      .filter(Boolean);
    if (!relList.length) continue;

    const hrefRaw = tag.match(/\shref\s*=\s*["']([^"']+)["']/i);
    const href = hrefRaw ? stripQueryAndHash(hrefRaw[1]) : "";
    if (!href) continue;

    if (relList.includes("stylesheet")) {
      styles.add(href);
      continue;
    }
    if (relList.includes("modulepreload")) {
      scripts.add(href);
      continue;
    }
    if (relList.includes("preload")) {
      const asRaw = tag.match(/\sas\s*=\s*["']([^"']+)["']/i);
      const asValue = String(asRaw?.[1] || "").trim().toLowerCase();
      if (asValue === "style") styles.add(href);
      if (asValue === "script") scripts.add(href);
    }
  }
  const jsBytes = Array.from(scripts).reduce(
    (sum, src) => sum + fileTransferBytes(src),
    0
  );
  const cssBytes = Array.from(styles).reduce(
    (sum, src) => sum + fileTransferBytes(src),
    0
  );

  const imgRe = /<img\b[^>]*>/gi;
  let largestImageBytes = 0;
  let missingDims = 0;
  while ((match = imgRe.exec(html))) {
    const tag = match[0];
    const srcMatch = tag.match(/\ssrc\s*=\s*["']([^"']+)["']/i);
    const src = srcMatch ? srcMatch[1] : null;
    const hasWidth = /\swidth\s*=\s*["'][^"']+["']/i.test(tag);
    const hasHeight = /\sheight\s*=\s*["'][^"']+["']/i.test(tag);
    if (!hasWidth || !hasHeight) missingDims += 1;
    const size = fileSizeBytes(src);
    if (size > largestImageBytes) largestImageBytes = size;
  }

  return {
    label,
    filePath,
    jsBytes,
    cssBytes,
    largestImageBytes,
    missingDims,
  };
}

function findFirstHtml(baseDir) {
  if (!fs.existsSync(baseDir)) return null;
  const entries = fs.readdirSync(baseDir, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) {
      return path.join(baseDir, entry.name);
    }
    if (entry.isDirectory()) {
      const candidate = path.join(baseDir, entry.name, "index.html");
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return null;
}

if (!fs.existsSync(distDir)) {
  console.error(`[audit-lighthouse] Missing dist directory: ${toPosixPath(distDir)}`);
  process.exit(2);
}

const homePath = path.join(distDir, "index.html");
const categoryPath = findFirstHtml(path.join(distDir, "category"));
const articlePath = findFirstHtml(path.join(distDir, "p"));

const pages = [
  { key: "home", path: homePath },
  { key: "category", path: categoryPath },
  { key: "article", path: articlePath },
];

const errors = [];

for (const page of pages) {
  const analysis = analyzePage(page.key, page.path);
  if (analysis.missing) {
    errors.push(`${page.key}: missing file (${toPosixPath(page.path) || "n/a"})`);
    continue;
  }
  const budget = budgets[page.key] || budgets.home;
  if (budget.js && analysis.jsBytes > budget.js) {
    errors.push(
      `${page.key}: JS ${Math.round(analysis.jsBytes / 1024)}KB > budget ${Math.round(
        budget.js / 1024
      )}KB`
    );
  }
  if (budget.css && analysis.cssBytes > budget.css) {
    errors.push(
      `${page.key}: CSS ${Math.round(analysis.cssBytes / 1024)}KB > budget ${Math.round(
        budget.css / 1024
      )}KB`
    );
  }
  if (budget.lcpImage && analysis.largestImageBytes > budget.lcpImage) {
    errors.push(
      `${page.key}: largest image ${Math.round(
        analysis.largestImageBytes / 1024
      )}KB > budget ${Math.round(budget.lcpImage / 1024)}KB`
    );
  }
  if (
    Number.isFinite(budget.missingDims) &&
    analysis.missingDims > budget.missingDims
  ) {
    errors.push(
      `${page.key}: ${analysis.missingDims} img tags missing width/height > budget ${budget.missingDims}`
    );
  }
}

if (missingLocalAssets.size > 0) {
  errors.push(`missing local asset files: ${missingLocalAssets.size}`);
  const list = Array.from(missingLocalAssets.entries())
    .slice(0, 12)
    .map(([fullPath, url]) => {
      const rel = toPosixPath(path.relative(distDir, fullPath));
      return `${url || "(unknown)"} -> ${rel}`;
    });
  errors.push(...list);

  const hint = inferPathPrefixHint();
  if (hint) {
    errors.push(
      `hint: PATH_PREFIX mismatch? detected "${hint.prefix}" (${hint.evidence} hit(s)); run with PATH_PREFIX=${hint.prefix}`
    );
  }
}

if (errors.length > 0) {
  console.error("[audit-lighthouse] Budget checks failed:");
  for (const err of errors) {
    console.error(`- ${err}`);
  }
  process.exit(1);
}

console.log("[audit-lighthouse] OK: core pages within Lighthouse-style budgets");
