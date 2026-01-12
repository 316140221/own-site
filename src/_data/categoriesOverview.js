const path = require("node:path");

const categories = require("./categories.js");
const readJsonOrDefault = require("./lib/readJsonOrDefault.js");

module.exports = function () {
  const list = Array.isArray(categories) ? categories : [];

  return list
    .map((cat) => {
      const slug = String(cat && cat.slug ? cat.slug : "").trim().toLowerCase();
      const label = String(cat && cat.label ? cat.label : slug).trim();
      const indexPath = path.resolve(process.cwd(), `data/indexes/by-category/${slug}.json`);
      const items = readJsonOrDefault(indexPath, []);
      return {
        slug,
        label,
        count: Array.isArray(items) ? items.length : 0,
      };
    })
    .filter((cat) => cat.slug && cat.label)
    .sort((a, b) => {
      const diff = (b.count || 0) - (a.count || 0);
      if (diff) return diff;
      return String(a.label || "").localeCompare(String(b.label || ""));
    });
};

