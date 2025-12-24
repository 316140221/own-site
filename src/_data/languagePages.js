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

module.exports = function (data) {
  const languages = (data && data.languages) || [];
  const pages = [];

  for (const lang of languages) {
    const indexPath = path.resolve(
      process.cwd(),
      `data/indexes/by-language/${lang.code}.json`
    );
    const items = readJsonOrDefault(indexPath, []);
    const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));

    for (let pageNumber = 0; pageNumber < totalPages; pageNumber += 1) {
      pages.push({
        code: lang.code,
        label: lang.label,
        pageNumber,
        totalPages,
        pageSize: PAGE_SIZE,
        items: items.slice(pageNumber * PAGE_SIZE, (pageNumber + 1) * PAGE_SIZE),
      });
    }
  }

  return pages;
};

