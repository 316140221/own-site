const fs = require("node:fs");
const path = require("node:path");

function readJsonOrDefault(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (_error) {
    return fallback;
  }
}

module.exports = function () {
  const filePath = path.resolve(process.cwd(), "data/indexes/redirects.json");
  const redirects = readJsonOrDefault(filePath, {});
  if (!redirects || typeof redirects !== "object" || Array.isArray(redirects)) return [];

  return Object.entries(redirects)
    .filter(([from, to]) => from && to && from !== to)
    .map(([from, to]) => ({ from: String(from), to: String(to) }))
    .sort((a, b) => a.from.localeCompare(b.from));
};

