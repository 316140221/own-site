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
const sourceIndexCache = new Map();

const MORE_FROM_SOURCE_LIMIT = 6;
const KEY_POINTS_LIMIT = 5;

const TITLE_STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "in",
  "into",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "their",
  "this",
  "to",
  "with",
  "will",
  "who",
]);

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

function getSourceIndex(sourceId) {
  const key = String(sourceId || "").trim();
  if (!key) return [];
  if (sourceIndexCache.has(key)) return sourceIndexCache.get(key);

  const indexPath = path.resolve(process.cwd(), `data/indexes/by-source/${key}.json`);
  const list = safeReadJson(indexPath);
  const normalized = Array.isArray(list) ? list : [];
  sourceIndexCache.set(key, normalized);
  return normalized;
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

function truncateText(value, maxLen = 200) {
  const input = String(value || "");
  const limit = Number.parseInt(String(maxLen || "200"), 10);
  const length = Number.isFinite(limit) && limit > 0 ? limit : 200;
  if (input.length <= length) return input;
  if (length <= 1) return "…";
  return input.slice(0, length - 1).trimEnd() + "…";
}

function containsCjk(value) {
  return /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/.test(String(value || ""));
}

function normalizeSentenceForCompare(value) {
  const input = String(value || "").toLowerCase();
  return input
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/www\.\S+/g, " ")
    .replace(/[\u2018\u2019\u201c\u201d"'`]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function splitIntoSentences(value) {
  const input = String(value || "")
    .replace(/\r\n?/g, "\n")
    .replace(/\t/g, " ")
    .trim();
  if (!input) return [];

  const lines = input.split(/\n+/g).map((line) => line.trim()).filter(Boolean);
  const sentences = [];

  for (const line of lines) {
    let text = line.replace(/^[-–—*•●·]+\s+/, "").trim();
    if (!text) continue;

    text = text.replace(/([。！？!?]+)/g, "$1\n");
    text = text.replace(/\.(\s+)(?=[A-Z0-9\"'“”([{])/g, ".\n");
    text = text.replace(/;(\s+)(?=[A-Z0-9])/g, ";\n");
    text = text.replace(/:(\s+)(?=[A-Z0-9])/g, ":\n");

    for (const part of text.split(/\n+/g)) {
      const sentence = part.trim();
      if (sentence) sentences.push(sentence);
    }
  }

  return sentences;
}

function extractTitleKeywords(title) {
  if (containsCjk(title)) return [];
  const words = String(title || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .map((w) => w.trim())
    .filter((w) => w.length >= 4 && !TITLE_STOPWORDS.has(w));
  return Array.from(new Set(words));
}

function scoreSentence(sentence, { titleKeywords = [], sourceBonus = 0 } = {}) {
  const len = sentence.length;
  const cjk = containsCjk(sentence);
  const target = cjk ? 45 : 110;
  const base = Math.max(0, 80 - Math.abs(len - target));

  let score = base + sourceBonus;
  if (/\d/.test(sentence)) score += 12;
  if (/%/.test(sentence)) score += 6;
  if (/[A-Z][a-z]/.test(sentence)) score += 6;

  const lower = sentence.toLowerCase();
  for (const kw of titleKeywords) {
    if (kw && lower.includes(kw)) score += 8;
  }

  return score;
}

function isUsefulSentence(sentence, normalizedTitle) {
  const text = String(sentence || "").trim();
  if (!text) return false;
  if (/https?:\/\/|www\./i.test(text)) return false;
  if (/cookie|privacy|subscribe|newsletter|sign up|advertisement/i.test(text)) return false;
  if (/^(read more|continue reading|watch now)\b/i.test(text)) return false;

  const len = text.length;
  const cjk = containsCjk(text);
  const minLen = cjk ? 12 : 25;
  const maxLen = cjk ? 140 : 240;
  if (len < minLen || len > maxLen) return false;

  const normalized = normalizeSentenceForCompare(text);
  if (!normalized) return false;
  if (normalizedTitle && normalized === normalizedTitle) return false;

  return true;
}

function extractKeyPoints({ title = "", summary = "", contentText = "" } = {}) {
  const normalizedTitle = normalizeSentenceForCompare(title);
  const titleKeywords = extractTitleKeywords(title);

  const candidates = [];
  const summarySentences = splitIntoSentences(summary);
  for (const sentence of summarySentences) {
    if (!isUsefulSentence(sentence, normalizedTitle)) continue;
    candidates.push({
      sentence,
      normalized: normalizeSentenceForCompare(sentence),
      score: scoreSentence(sentence, { titleKeywords, sourceBonus: 30 }),
    });
  }

  const contentSentences = splitIntoSentences(contentText);
  for (const sentence of contentSentences) {
    if (!isUsefulSentence(sentence, normalizedTitle)) continue;
    candidates.push({
      sentence,
      normalized: normalizeSentenceForCompare(sentence),
      score: scoreSentence(sentence, { titleKeywords, sourceBonus: 0 }),
    });
  }

  candidates.sort((a, b) => b.score - a.score);

  const picked = [];
  const seen = new Set();
  for (const candidate of candidates) {
    if (!candidate.normalized || seen.has(candidate.normalized)) continue;
    let tooSimilar = false;
    for (const existing of picked) {
      if (
        existing.normalized.includes(candidate.normalized) ||
        candidate.normalized.includes(existing.normalized)
      ) {
        tooSimilar = true;
        break;
      }
    }
    if (tooSimilar) continue;

    seen.add(candidate.normalized);
    picked.push(candidate);
    if (picked.length >= KEY_POINTS_LIMIT) break;
  }

  const points = picked.map((p) => p.sentence.trim()).filter(Boolean);
  return points.length >= 2 ? points : [];
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
    keyPoints: (data) => {
      const article = data.article;
      if (!article) return [];
      return extractKeyPoints({
        title: article.title,
        summary: article.summary,
        contentText: article.contentText,
      });
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
    moreFromSource: (data) => {
      const current = data.entry;
      if (!current || !current.id) return [];

      const sourceId = data.article?.source?.id;
      if (!sourceId) return [];

      const list = getSourceIndex(sourceId);
      if (!list.length) return [];

      const result = [];
      for (const item of list) {
        if (!item || !item.id || item.id === current.id) continue;
        if (!item.title) continue;
        result.push({
          id: item.id,
          title: item.title,
          publishedAt: item.publishedAt,
        });
        if (result.length >= MORE_FROM_SOURCE_LIMIT) break;
      }

      return result;
    },
    title: (data) => data.article?.title || "Article",
    description: (data) => {
      const summary = String(data.article?.summary || "").trim();
      if (summary) return summary;

      const title = String(data.article?.title || "").trim();
      const source = String(data.article?.source?.name || "").trim();
      const category = String(data.article?.category || "").trim();

      const parts = [];
      if (title) parts.push(title);
      if (source) parts.push(source);
      if (category) parts.push(category);
      const fallback = parts.length ? parts.join(" · ") : String(data.site?.description || "");

      return truncateText(fallback, 200) || String(data.site?.description || "");
    },
  },
};
