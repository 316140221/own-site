const fs = require("node:fs");
const path = require("node:path");

const PAGE_SIZE = 50;

function readJsonOrDefault(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (_error) {
    return fallback;
  }
}

module.exports = function () {
  const latestPath = path.resolve(process.cwd(), "data/indexes/latest.json");
  const items = readJsonOrDefault(latestPath, []);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pages = [];

  for (let pageNumber = 0; pageNumber < totalPages; pageNumber += 1) {
    pages.push({
      pageNumber,
      totalPages,
      pageSize: PAGE_SIZE,
      items: items.slice(pageNumber * PAGE_SIZE, (pageNumber + 1) * PAGE_SIZE),
    });
  }

  return pages;
};
