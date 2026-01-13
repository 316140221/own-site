import fs from "node:fs/promises";
import path from "node:path";
import { readJsonOrDefault, writeJson } from "./lib/json.mjs";

function usage() {
  console.error(
    [
      "Usage:",
      "  node scripts/import-opml.mjs <file.opml> [--category world] [--language en] [--country US] [--dry-run]",
      "",
      "Notes:",
      "  - Merges into data/sources.json (skips existing feedUrl duplicates).",
      "  - Generated ids are slugified and de-duplicated automatically.",
    ].join("\n")
  );
  process.exit(2);
}

function parseArgs(argv) {
  const out = {
    file: "",
    defaultCategory: "world",
    language: "en",
    country: "",
    dryRun: false,
  };

  const positional = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") {
      out.dryRun = true;
      continue;
    }
    if (arg === "--category" || arg === "--default-category") {
      out.defaultCategory = String(argv[i + 1] || "world");
      i += 1;
      continue;
    }
    if (arg === "--language") {
      out.language = String(argv[i + 1] || "en");
      i += 1;
      continue;
    }
    if (arg === "--country") {
      out.country = String(argv[i + 1] || "");
      i += 1;
      continue;
    }
    if (arg.startsWith("--")) usage();
    positional.push(arg);
  }

  out.file = positional[0] || "";
  return out;
}

function decodeXmlEntities(value) {
  return String(value || "")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'");
}

function parseAttributes(raw) {
  const attrs = {};
  const input = String(raw || "");
  const re = /(\w+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let match = null;
  while ((match = re.exec(input))) {
    const key = match[1];
    const value = match[2] ?? match[3] ?? "";
    attrs[key] = decodeXmlEntities(value);
  }
  return attrs;
}

function parseOpmlOutlines(xml) {
  const outlines = [];
  const input = String(xml || "");
  const re = /<outline\b([^>]*)\/?>/gi;
  let match = null;
  while ((match = re.exec(input))) {
    const attrs = parseAttributes(match[1] || "");
    if (!attrs.xmlUrl) continue;
    outlines.push(attrs);
  }
  return outlines;
}

function normalizeFeedUrl(url) {
  const raw = String(url || "").trim();
  if (!raw) return "";
  try {
    const parsed = new URL(raw);
    parsed.hash = "";
    parsed.hostname = parsed.hostname.toLowerCase();
    if (parsed.pathname !== "/" && parsed.pathname.endsWith("/")) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }
    return parsed.toString();
  } catch {
    return raw;
  }
}

function slugifyId(input) {
  const raw = String(input || "").trim().toLowerCase();
  if (!raw) return "";
  return raw
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_{2,}/g, "_")
    .slice(0, 48);
}

function deriveBaseId({ name, feedUrl }) {
  const nameSlug = slugifyId(name);
  if (nameSlug) return nameSlug;
  try {
    const u = new URL(feedUrl);
    const host = slugifyId(u.hostname.replace(/^www\./i, ""));
    const parts = u.pathname.split("/").filter(Boolean).slice(0, 2).join("_");
    const pathSlug = slugifyId(parts);
    const combined = [host, pathSlug].filter(Boolean).join("_");
    return combined || host || "source";
  } catch {
    return "source";
  }
}

function ensureUniqueId(base, usedIds) {
  let id = base || "source";
  if (!usedIds.has(id)) {
    usedIds.add(id);
    return id;
  }

  for (let i = 2; i < 1000; i += 1) {
    const candidate = `${id}_${i}`;
    if (usedIds.has(candidate)) continue;
    usedIds.add(candidate);
    return candidate;
  }

  const fallback = `${id}_${Date.now()}`;
  usedIds.add(fallback);
  return fallback;
}

function normalizeLanguageCode(input) {
  const raw = String(input || "en").trim().toLowerCase();
  if (!raw) return "en";
  const base = raw.split("-")[0];
  return base || "en";
}

const args = parseArgs(process.argv.slice(2));
if (!args.file) usage();

const filePath = path.resolve(process.cwd(), args.file);
const xml = await fs.readFile(filePath, "utf8");
const outlines = parseOpmlOutlines(xml);
if (!outlines.length) {
  console.error("No <outline xmlUrl=...> entries found.");
  process.exit(1);
}

const sourcesPath = path.resolve(process.cwd(), "data/sources.json");
const existing = await readJsonOrDefault(sourcesPath, []);
const sources = Array.isArray(existing) ? existing : [];

const usedIds = new Set(
  sources.map((s) => String(s?.id || "").trim()).filter(Boolean)
);
const existingFeeds = new Set(
  sources
    .map((s) => normalizeFeedUrl(s?.feedUrl))
    .filter(Boolean)
);

const added = [];
for (const outline of outlines) {
  const feedUrl = normalizeFeedUrl(outline.xmlUrl);
  if (!feedUrl) continue;
  if (existingFeeds.has(feedUrl)) continue;

  const name = String(outline.title || outline.text || feedUrl).trim() || feedUrl;
  const siteUrl = outline.htmlUrl ? String(outline.htmlUrl).trim() : "";

  const baseId = deriveBaseId({ name, feedUrl });
  const id = ensureUniqueId(baseId, usedIds);

  const source = {
    id,
    name,
    feedUrl,
    siteUrl: siteUrl || undefined,
    defaultCategory: String(args.defaultCategory || "world").trim().toLowerCase() || "world",
    language: normalizeLanguageCode(args.language),
    country: String(args.country || "").trim() || undefined,
    enabled: true,
  };

  added.push(source);
  existingFeeds.add(feedUrl);
}

added.sort((a, b) => String(a?.id || "").localeCompare(String(b?.id || "")));

if (!added.length) {
  console.log("No new sources to add.");
  process.exit(0);
}

const merged = sources.concat(added).map((s) => {
  const out = { ...s };
  if (out.siteUrl === undefined) delete out.siteUrl;
  if (out.country === undefined) delete out.country;
  return out;
});

if (args.dryRun) {
  console.log(JSON.stringify({ addedCount: added.length, added, mergedCount: merged.length }, null, 2));
  process.exit(0);
}

await writeJson(sourcesPath, merged);
console.log(`Added ${added.length} sources into data/sources.json`);

