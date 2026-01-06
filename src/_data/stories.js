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
  const filePath = path.resolve(process.cwd(), "data/indexes/stories.json");
  const items = readJsonOrDefault(filePath, []);
  const windowHours = Number.parseInt(process.env.STORIES_WINDOW_HOURS || "48", 10);
  return {
    windowHours: Number.isFinite(windowHours) && windowHours > 0 ? windowHours : 48,
    items: Array.isArray(items) ? items : [],
  };
};

