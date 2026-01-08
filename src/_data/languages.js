const fs = require("node:fs");
const path = require("node:path");

const sources = require("./sources.js");

function normalizeLanguageCode(input) {
  const raw = String(input || "en").trim().toLowerCase();
  if (!raw) return "en";
  const base = raw.split("-")[0];
  return base || "en";
}

const LABELS = {
  en: "English",
  zh: "Chinese",
  ja: "Japanese",
  fr: "French",
  de: "German",
  es: "Spanish",
  ru: "Russian",
};

function readJsonOrDefault(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (_error) {
    return fallback;
  }
}

module.exports = function () {
  const list = sources();
  const enabled = Array.isArray(list) ? list.filter((s) => s && s.enabled !== false) : [];

  const codes = new Set();
  for (const s of enabled) {
    codes.add(normalizeLanguageCode(s.language || "en"));
  }

  return Array.from(codes)
    .map((code) => {
      const indexPath = path.resolve(process.cwd(), `data/indexes/by-language/${code}.json`);
      const items = readJsonOrDefault(indexPath, []);
      return {
        code,
        label: LABELS[code] || code.toUpperCase(),
        count: Array.isArray(items) ? items.length : 0,
      };
    })
    .sort((a, b) => {
      const diff = (b.count || 0) - (a.count || 0);
      if (diff) return diff;
      return String(a.code || "").localeCompare(String(b.code || ""));
    });
};
