const fs = require("node:fs");
const path = require("node:path");

function safeReadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (_error) {
    return null;
  }
}

module.exports = {
  eleventyComputed: {
    ogType: () => "article",
    article: (data) => {
      if (!data.entry || !data.entry.path) return null;
      const filePath = path.resolve(process.cwd(), String(data.entry.path));
      const article = safeReadJson(filePath);
      if (!article) return null;
      if (data.entry.category) article.category = data.entry.category;
      return article;
    },
    title: (data) => data.article?.title || "Article",
    description: (data) => data.article?.summary || data.site.description,
  },
};
