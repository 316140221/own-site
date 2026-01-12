const path = require("node:path");

const readJsonOrDefault = require("./lib/readJsonOrDefault.js");

module.exports = function () {
  const filePath = path.resolve(process.cwd(), "data/sources.json");
  return readJsonOrDefault(filePath, []);
};

