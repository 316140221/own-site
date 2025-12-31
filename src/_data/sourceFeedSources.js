const sources = require("./sources.js");

function normalizeLanguageCode(input) {
  const raw = String(input || "en").trim().toLowerCase();
  if (!raw) return "en";
  const base = raw.split("-")[0];
  return base || "en";
}

module.exports = function () {
  const list = sources();
  const allSources = Array.isArray(list) ? list.filter((s) => s && s.id) : [];

  return allSources
    .map((s) => ({
      id: String(s.id || "").trim(),
      name: s.name || s.id,
      feedUrl: s.feedUrl || null,
      siteUrl: s.siteUrl || null,
      language: normalizeLanguageCode(s.language || "en"),
    }))
    .filter((s) => s.id);
};
