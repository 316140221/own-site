const path = require("node:path");

const PAGE_SIZE = require("./lib/pageSize.js");

const readJsonOrDefault = require("./lib/readJsonOrDefault.js");

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
