const articlesData = require("./articles.js");

const ARTICLES_PER_SITEMAP = 5000;

module.exports = function () {
  const articles = Array.isArray(articlesData()) ? articlesData() : [];
  const totalArticles = articles.length;
  const perFile = ARTICLES_PER_SITEMAP;
  const pages = Math.max(1, Math.ceil(totalArticles / perFile));

  const articleSitemaps = [];
  for (let i = 0; i < pages; i += 1) {
    articleSitemaps.push(`/sitemaps/articles-${i + 1}.xml`);
  }

  return {
    perFile,
    totalArticles,
    articleSitemaps,
    coreSitemap: "/sitemaps/core.xml",
  };
};

