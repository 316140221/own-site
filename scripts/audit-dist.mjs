import fs from "node:fs";
import path from "node:path";

const distArg = process.argv[2] || "dist";
const distDir = path.resolve(process.cwd(), distArg);

const SCAN_EXTENSIONS = new Set([".html", ".xml", ".txt"]);
const IGNORE_DIRS = new Set(["pagefind"]);

const BANNED_PATTERNS = [
  { label: "npm run build:site", regex: /\bnpm run build:site\b/i },
  { label: "npm run update", regex: /\bnpm run update\b/i },
  { label: "npm run indexes", regex: /\bnpm run indexes\b/i },
  { label: "Run npm run", regex: /\bRun npm run\b/i },
  { label: "No stories yet. Run", regex: /No stories yet\. Run\b/i },
];

function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
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

if (!fs.existsSync(distDir)) {
  console.error(`[audit-dist] Missing directory: ${distDir}`);
  process.exit(2);
}

let scannedFiles = 0;
const violations = [];

for (const filePath of walk(distDir)) {
  const ext = path.extname(filePath).toLowerCase();
  if (!SCAN_EXTENSIONS.has(ext)) continue;

  scannedFiles += 1;
  const relPath = path.relative(distDir, filePath);
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
}

if (violations.length) {
  console.error(
    `[audit-dist] Found ${violations.length} public-content issue(s) in ${scannedFiles} file(s):`
  );
  for (const v of violations) {
    console.error(`- ${v.file}:${v.line} contains "${v.label}": ${v.snippet}`);
  }
  process.exit(1);
}

console.log(`[audit-dist] OK: scanned ${scannedFiles} file(s).`);
