const categories = require("./categories.js");

const map = {};
for (const entry of Array.isArray(categories) ? categories : []) {
  if (!entry || typeof entry !== "object") continue;
  const slug = String(entry.slug || "").trim().toLowerCase();
  const label = String(entry.label || "").trim();
  if (!slug || !label) continue;
  map[slug] = label;
}

module.exports = map;
