const path = require("node:path");

const { intFromEnv } = require("./lib/env.js");
const readJsonOrDefault = require("./lib/readJsonOrDefault.js");

module.exports = function () {
  const filePath = path.resolve(process.cwd(), "data/indexes/top.json");
  const items = readJsonOrDefault(filePath, []);
  const windowHours = intFromEnv("TOP_WINDOW_HOURS", 48, { min: 1, max: 8760 });
  return {
    windowHours,
    items: Array.isArray(items) ? items : [],
  };
};

