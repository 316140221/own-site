const path = require("node:path");

const categories = require("./categories.js");
const readJsonOrDefault = require("./lib/readJsonOrDefault.js");

const PAGE_SIZE = require("./lib/pageSize.js");

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
