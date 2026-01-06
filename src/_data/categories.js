const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_CATEGORIES = [
  { slug: "world", label: "World" },
  { slug: "business", label: "Business" },
  { slug: "tech", label: "Tech" },
  { slug: "science", label: "Science" },
  { slug: "health", label: "Health" },
  { slug: "sports", label: "Sports" },
  { slug: "entertainment", label: "Entertainment" },
];

function readJsonOrDefault(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (_error) {
    return fallback;
  }
}

function normalizeCategories(input) {
  if (!Array.isArray(input)) return [];

  const out = [];
  const seen = new Set();
  for (const entry of input) {
    if (!entry || typeof entry !== "object") continue;
    const slug = String(entry.slug || "").trim().toLowerCase();
    const label = String(entry.label || entry.slug || "").trim();
    if (!slug || !label) continue;
    if (seen.has(slug)) continue;
    seen.add(slug);
    out.push({ slug, label });
  }
  return out;
}

const configPath = path.resolve(process.cwd(), "data/categories.json");
const configured = normalizeCategories(readJsonOrDefault(configPath, null));

module.exports = configured.length ? configured : DEFAULT_CATEGORIES;
