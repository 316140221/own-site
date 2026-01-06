const sourcesData = require("./sources.js");

function normalizeTagId(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  const collapsed = raw
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
  return collapsed;
}

module.exports = function () {
  const sources = Array.isArray(sourcesData()) ? sourcesData() : [];
  const map = new Map();

  for (const source of sources) {
    const manualTags = Array.isArray(source?.tags) ? source.tags : [];
    const derivedTags = [
      source?.defaultCategory || null,
      source?.language || null,
      source?.country || null,
    ].filter(Boolean);
    const tags = manualTags.concat(derivedTags);
    for (const tag of tags) {
      const id = normalizeTagId(tag);
      if (!id) continue;
      if (map.has(id)) continue;
      const label = String(tag || "").trim() || id;
      map.set(id, {
        id,
        label,
        param: encodeURIComponent(id),
      });
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    String(a.label || "").localeCompare(String(b.label || ""))
  );
};
