const path = require("node:path");

const languages = require("./languages.js");
const readJsonOrDefault = require("./lib/readJsonOrDefault.js");

const PAGE_SIZE = require("./lib/pageSize.js");

module.exports = function () {
  const list = languages();
  const languageList = Array.isArray(list) ? list : [];
  const pages = [];

  for (const lang of languageList) {
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
