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
  const filePath = path.resolve(process.cwd(), "data/indexes/articles.json");
  return readJsonOrDefault(filePath, []);
};

