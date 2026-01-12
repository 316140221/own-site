const path = require("node:path");

const sources = require("./sources.js");
const readJsonOrDefault = require("./lib/readJsonOrDefault.js");

const PAGE_SIZE = require("./lib/pageSize.js");

module.exports = function () {
  const list = sources();
  const allSources = Array.isArray(list) ? list.filter((s) => s && s.id) : [];

  const pages = [];

  for (const s of allSources) {
    const sourceId = String(s.id || "").trim();
    if (!sourceId) continue;

    const indexPath = path.resolve(process.cwd(), `data/indexes/by-source/${sourceId}.json`);
    const items = readJsonOrDefault(indexPath, []);
    const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));

    for (let pageNumber = 0; pageNumber < totalPages; pageNumber += 1) {
      pages.push({
        id: sourceId,
        enabled: s.enabled !== false,
        name: s.name || sourceId,
        siteUrl: s.siteUrl || null,
        feedUrl: s.feedUrl || null,
        pageNumber,
        totalPages,
        pageSize: PAGE_SIZE,
        items: items.slice(pageNumber * PAGE_SIZE, (pageNumber + 1) * PAGE_SIZE),
      });
    }
  }

  return pages;
};
