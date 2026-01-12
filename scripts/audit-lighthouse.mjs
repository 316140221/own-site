import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { toPosixPath } from "./lib/path.mjs";

const distDir = path.resolve(process.cwd(), process.argv[2] || "dist");

function readHtml(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function toBytes(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function getBudget(envKey, fallback) {
  return toBytes(process.env[envKey], fallback);
}

function pageBudgets(key, defaults) {
  return {
    js: getBudget(`LH_${key}_JS_BUDGET`, defaults.js),
    lcpImage: getBudget(`LH_${key}_LCP_BUDGET`, defaults.lcpImage),
    missingDims: getBudget(`LH_${key}_CLS_MISSING`, defaults.missingDims),
  };
}

const budgets = {
  home: pageBudgets("HOME", { js: 220 * 1024, lcpImage: 380 * 1024, missingDims: 0 }),
  category: pageBudgets("CATEGORY", { js: 220 * 1024, lcpImage: 380 * 1024, missingDims: 0 }),
  article: pageBudgets("ARTICLE", { js: 260 * 1024, lcpImage: 420 * 1024, missingDims: 0 }),
};

function resolveLocalAsset(src) {
  const trimmed = String(src || "").trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return null;
  const cleaned = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;
  return path.join(distDir, cleaned);
}

function fileSizeBytes(src) {
  const fullPath = resolveLocalAsset(src);
  if (!fullPath) return 0;
  try {
    const stat = fs.statSync(fullPath);
    return stat.isFile() ? stat.size : 0;
  } catch {
    return 0;
  }
}

function fileTransferBytes(src) {
  const fullPath = resolveLocalAsset(src);
  if (!fullPath) return 0;
  const ext = path.extname(fullPath).toLowerCase();
  try {
    const raw = fs.readFileSync(fullPath);
    if (ext === ".js" || ext === ".css" || ext === ".html" || ext === ".xml" || ext === ".txt") {
      return zlib.gzipSync(raw).length;
    }
    return raw.length;
  } catch {
    return 0;
  }
}

function analyzePage(label, filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    return { label, missing: true, filePath };
  }

  const html = readHtml(filePath);
  const scriptRe = /<script[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  const scripts = [];
  while ((match = scriptRe.exec(html))) {
    scripts.push(match[1]);
  }
  const jsBytes = scripts.reduce((sum, src) => sum + fileTransferBytes(src), 0);

  const imgRe = /<img\b[^>]*>/gi;
  let largestImageBytes = 0;
  let missingDims = 0;
  while ((match = imgRe.exec(html))) {
    const tag = match[0];
    const srcMatch = tag.match(/src\s*=\s*["']([^"']+)["']/i);
    const src = srcMatch ? srcMatch[1] : null;
    const hasWidth = /width\s*=\s*["'][^"']+["']/i.test(tag);
    const hasHeight = /height\s*=\s*["'][^"']+["']/i.test(tag);
    if (!hasWidth || !hasHeight) missingDims += 1;
    const size = fileSizeBytes(src);
    if (size > largestImageBytes) largestImageBytes = size;
  }

  return {
    label,
    filePath,
    jsBytes,
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

if (errors.length > 0) {
  console.error("[audit-lighthouse] Budget checks failed:");
  for (const err of errors) {
    console.error(`- ${err}`);
  }
  process.exit(1);
}

console.log("[audit-lighthouse] OK: core pages within Lighthouse-style budgets");
