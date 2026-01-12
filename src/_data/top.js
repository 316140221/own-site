const path = require("node:path");

const readJsonOrDefault = require("./lib/readJsonOrDefault.js");

module.exports = function () {
  const filePath = path.resolve(process.cwd(), "data/indexes/top.json");
  const items = readJsonOrDefault(filePath, []);
  const windowHours = Number.parseInt(process.env.TOP_WINDOW_HOURS || "48", 10);
  return {
    windowHours: Number.isFinite(windowHours) && windowHours > 0 ? windowHours : 48,
    items: Array.isArray(items) ? items : [],
  };
};

