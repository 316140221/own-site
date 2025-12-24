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

module.exports = function () {
  const list = sources();
  const enabled = Array.isArray(list) ? list.filter((s) => s && s.enabled !== false) : [];

  const codes = new Set();
  for (const s of enabled) {
    codes.add(normalizeLanguageCode(s.language || "en"));
  }

  return Array.from(codes)
    .sort()
    .map((code) => ({
      code,
      label: LABELS[code] || code.toUpperCase(),
    }));
};

