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
  const latestPath = path.resolve(process.cwd(), "data/indexes/latest.json");
  const latest = readJsonOrDefault(latestPath, []);
  return { latest };
};

