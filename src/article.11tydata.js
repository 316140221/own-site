const fs = require("node:fs");
const path = require("node:path");

function safeReadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (_error) {
    return null;
  }
}

const RELATED_LIMIT = 6;
const relatedIndexCache = new Map();
const articleMetaCache = new Map();

function toTime(value) {
  const parsed = Date.parse(String(value || ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function getIndexKey(category, language) {
  const cat = String(category || "").trim();
  const lang = String(language || "").trim();
  return `${cat}::${lang}`;
}

function getSortedIndex(articles, category, language) {
  const key = getIndexKey(category, language);
  if (relatedIndexCache.has(key)) return relatedIndexCache.get(key);

  const lang = String(language || "").trim();
  const list = (Array.isArray(articles) ? articles : [])
    .filter(
      (entry) =>
        entry &&
        entry.category === category &&
        (!lang || String(entry.language || "").trim() === lang)
    )
    .slice()
    .sort((a, b) => toTime(b.publishedAt) - toTime(a.publishedAt));

  relatedIndexCache.set(key, list);
  return list;
}

function getArticleMeta(entry) {
  if (!entry || !entry.id || !entry.path) return null;
  if (articleMetaCache.has(entry.id)) return articleMetaCache.get(entry.id);
  const filePath = path.resolve(process.cwd(), String(entry.path));
  const article = safeReadJson(filePath);
  const meta = article
    ? {
        title: article.title || "",
        sourceName: article.source && article.source.name ? String(article.source.name) : "",
      }
    : null;
  articleMetaCache.set(entry.id, meta);
  return meta;
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
    relatedArticles: (data) => {
      const current = data.entry;
      if (!current || !current.id) return [];
      if (!current.category) return [];

      const result = [];
      const seen = new Set([current.id]);

      const sameLang =
        current.language ? getSortedIndex(data.articles, current.category, current.language) : [];
      const sameCategory = getSortedIndex(data.articles, current.category, "");

      function addFrom(list) {
        for (const entry of list) {
          if (!entry || !entry.id || seen.has(entry.id)) continue;
          seen.add(entry.id);
          const meta = getArticleMeta(entry);
          if (!meta || !meta.title) continue;
          result.push({
            id: entry.id,
            title: meta.title,
            publishedAt: entry.publishedAt,
            sourceName: meta.sourceName,
          });
          if (result.length >= RELATED_LIMIT) break;
        }
      }

      addFrom(sameLang);
      if (result.length < RELATED_LIMIT) addFrom(sameCategory);
      return result;
    },
    title: (data) => data.article?.title || "Article",
    description: (data) => data.article?.summary || data.site.description,
  },
};
