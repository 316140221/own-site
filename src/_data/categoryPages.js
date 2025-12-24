const fs = require("node:fs");
const path = require("node:path");

const categories = require("./categories.js");

const PAGE_SIZE = 50;

function readJsonOrDefault(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (_error) {
    return fallback;
  }
}

module.exports = function () {
  const pages = [];

  for (const category of categories) {
    const indexPath = path.resolve(
      process.cwd(),
      `data/indexes/by-category/${category.slug}.json`
    );
    const items = readJsonOrDefault(indexPath, []);
    const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));

    for (let pageNumber = 0; pageNumber < totalPages; pageNumber += 1) {
      pages.push({
        slug: category.slug,
        label: category.label,
        pageNumber,
        totalPages,
        pageSize: PAGE_SIZE,
        items: items.slice(pageNumber * PAGE_SIZE, (pageNumber + 1) * PAGE_SIZE),
      });
    }
  }

  return pages;
};
