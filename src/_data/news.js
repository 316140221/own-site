const path = require("node:path");

const readJsonOrDefault = require("./lib/readJsonOrDefault.js");

module.exports = function () {
  const latestPath = path.resolve(process.cwd(), "data/indexes/latest.json");
  const latest = readJsonOrDefault(latestPath, []);
  return { latest };
};

