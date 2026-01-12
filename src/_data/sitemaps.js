const articlesData = require("./articles.js");

const ARTICLES_PER_SITEMAP = 5000;

module.exports = function () {
  const articlesList = articlesData();
  const articles = Array.isArray(articlesList) ? articlesList : [];
  const totalArticles = articles.length;
  const perFile = ARTICLES_PER_SITEMAP;
  const pages = Math.max(1, Math.ceil(totalArticles / perFile));

  const articleSitemaps = [];
  const articleSitemapsDetailed = [];
  for (let i = 0; i < pages; i += 1) {
    const pagePath = `/sitemaps/articles-${i + 1}.xml`;
    articleSitemaps.push(pagePath);

    const sliceStart = i * perFile;
    const slice = articles.slice(sliceStart, sliceStart + perFile);
    const firstWithDate = slice.find((entry) => entry && entry.publishedAt);
    const lastmod = firstWithDate ? firstWithDate.publishedAt : null;
    articleSitemapsDetailed.push({ path: pagePath, lastmod });
  }

  return {
    perFile,
    totalArticles,
    articleSitemaps,
    articleSitemapsDetailed,
    coreSitemap: "/sitemaps/core.xml",
    coreLastmod: articles.find((entry) => entry && entry.publishedAt)?.publishedAt || null,
  };
};
