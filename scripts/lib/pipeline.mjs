import crypto from "node:crypto";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import Parser from "rss-parser";

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: true }],
    ],
  },
});

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data");
const ARTICLES_DIR = path.join(DATA_DIR, "articles");
const INDEXES_DIR = path.join(DATA_DIR, "indexes");
const BY_CATEGORY_DIR = path.join(INDEXES_DIR, "by-category");
const BY_LANGUAGE_DIR = path.join(INDEXES_DIR, "by-language");
const ARTICLES_INDEX_PATH = path.join(INDEXES_DIR, "articles.json");
const STATE_PATH = path.join(DATA_DIR, "state.json");
const SOURCES_PATH = path.join(DATA_DIR, "sources.json");
const BLOCKLIST_PATH = path.join(DATA_DIR, "blocklist.json");
const CATEGORY_RULES_PATH = path.join(DATA_DIR, "category-rules.json");
const TMP_DIR = path.join(ROOT, ".tmp");

function nowIso() {
  return new Date().toISOString();
}

function formatUtcYmd(date) {
  const yyyy = String(date.getUTCFullYear());
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJsonOrDefault(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function decodeHtmlEntities(input) {
  return input
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'");
}

function stripHtml(input) {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

function normalizeWhitespace(input) {
  return input.replace(/\s+/g, " ").trim();
}

function truncate(input, maxLen) {
  if (input.length <= maxLen) return input;
  return input.slice(0, maxLen - 1).trimEnd() + "…";
}

function classifyCategory(article, rulesConfig) {
  const fallback = String(article.category || "world");
  if (!rulesConfig || rulesConfig.enabled === false) return fallback;
  const rules = Array.isArray(rulesConfig.rules) ? rulesConfig.rules : [];
  if (rules.length === 0) return fallback;

  const tags = Array.isArray(article.tags) ? article.tags.join(" ") : "";
  const text = `${article.title || ""} ${article.summary || ""} ${tags}`.toLowerCase();
  const wordText = text.replace(/[^a-z0-9]+/g, " ").trim();
  const words = new Set(wordText ? wordText.split(" ").filter(Boolean) : []);

  for (const rule of rules) {
    const category = rule && rule.category ? String(rule.category) : "";
    if (!category) continue;
    const keywords = Array.isArray(rule.keywords) ? rule.keywords : [];
    for (const raw of keywords) {
      const kw = String(raw || "").trim().toLowerCase();
      if (!kw) continue;
      if (kw.includes(" ")) {
        if (text.includes(kw)) return category;
        continue;
      }
      if (words.has(kw)) return category;
    }
  }

  return fallback;
}

function normalizeLanguageCode(input) {
  const raw = String(input || "en").trim().toLowerCase();
  if (!raw) return "en";
  const base = raw.split("-")[0];
  return base || "en";
}

export function normalizeUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.hostname = parsed.hostname.toLowerCase();

    const toDelete = [];
    for (const [key] of parsed.searchParams) {
      const lower = key.toLowerCase();
      if (
        lower.startsWith("utm_") ||
        lower === "gclid" ||
        lower === "fbclid" ||
        lower === "igshid" ||
        lower === "mc_cid" ||
        lower === "mc_eid"
      ) {
        toDelete.push(key);
      }
    }
    for (const key of toDelete) parsed.searchParams.delete(key);

    const entries = Array.from(parsed.searchParams.entries());
    entries.sort(([a], [b]) => a.localeCompare(b));
    parsed.search = "";
    for (const [k, v] of entries) parsed.searchParams.append(k, v);

    if (parsed.pathname !== "/" && parsed.pathname.endsWith("/")) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }

    return parsed.toString();
  } catch {
    return url;
  }
}

function computeId(canonicalUrl) {
  return crypto.createHash("sha1").update(canonicalUrl).digest("hex");
}

function parsePublishedAt(item) {
  const raw =
    item.isoDate ||
    item.pubDate ||
    item.published ||
    item.updated ||
    item.date ||
    null;
  const date = raw ? new Date(raw) : new Date();
  if (Number.isNaN(date.getTime())) return nowIso();
  return date.toISOString();
}

function pickImage(item) {
  if (item.enclosure && item.enclosure.url) return String(item.enclosure.url);
  if (Array.isArray(item.mediaContent) && item.mediaContent[0]?.$?.url) {
    return String(item.mediaContent[0].$.url);
  }
  if (Array.isArray(item.mediaThumbnail) && item.mediaThumbnail[0]?.$?.url) {
    return String(item.mediaThumbnail[0].$.url);
  }
  return null;
}

function cleanSummary(item) {
  const raw = item.contentSnippet || item.content || item.summary || "";
  const text = normalizeWhitespace(decodeHtmlEntities(stripHtml(String(raw))));
  return truncate(text, 360);
}

async function fetchTextWithTimeout(url, { headers }, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers,
      redirect: "follow",
      signal: controller.signal,
    });
    const text = await response.text();
    return { response, text };
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchAllSources({
  maxItemsPerFeed = 80,
  timeoutMs = 15000,
} = {}) {
  const sources = await readJsonOrDefault(SOURCES_PATH, []);
  const state = await readJsonOrDefault(STATE_PATH, {});
  const blocklist = await readJsonOrDefault(BLOCKLIST_PATH, {
    domains: [],
    titleContains: [],
  });
  const existingArticleIndex = await readJsonOrDefault(ARTICLES_INDEX_PATH, []);
  const knownIds = new Set(
    Array.isArray(existingArticleIndex)
      ? existingArticleIndex.map((e) => e && e.id).filter(Boolean)
      : []
  );

  const run = {
    startedAt: nowIso(),
    finishedAt: null,
    totals: { sources: 0, ok: 0, failed: 0, added: 0, duplicates: 0, skipped: 0 },
    sources: {},
  };

  await fs.mkdir(ARTICLES_DIR, { recursive: true });
  await fs.mkdir(INDEXES_DIR, { recursive: true });

  const enabledSources = sources.filter((s) => s && s.enabled !== false);
  run.totals.sources = enabledSources.length;

  for (const source of enabledSources) {
    const sourceState = state[source.id] || {};
    const headers = {
      "user-agent": "news-atlas-bot/0.1",
      accept: "application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.1",
    };

    if (sourceState.etag) headers["if-none-match"] = sourceState.etag;
    if (sourceState.lastModified)
      headers["if-modified-since"] = sourceState.lastModified;

    const perSource = {
      ok: false,
      status: null,
      error: null,
      fetchedAt: nowIso(),
      parsedItems: 0,
      added: 0,
      duplicates: 0,
      skipped: 0,
    };
    run.sources[source.id] = perSource;

    try {
      const { response, text } = await fetchTextWithTimeout(
        source.feedUrl,
        { headers },
        timeoutMs
      );

      perSource.status = response.status;

      if (response.status === 304) {
        perSource.ok = true;
        run.totals.ok += 1;
        state[source.id] = {
          ...sourceState,
          lastFetchAt: perSource.fetchedAt,
          lastSuccessAt: perSource.fetchedAt,
          consecutiveFailures: 0,
          lastStatus: 304,
          lastError: null,
        };
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const feed = await parser.parseString(text);
      const items = Array.isArray(feed.items) ? feed.items : [];
      const limited = items.slice(0, maxItemsPerFeed);
      perSource.parsedItems = limited.length;

      for (const item of limited) {
        const link = item.link || item.guid;
        if (!link) continue;

        const canonicalUrl = normalizeUrl(String(link));
        const id = computeId(canonicalUrl);

        const title = String(item.title || "").trim() || canonicalUrl;
        const titleLower = title.toLowerCase();
        const blockedTitle = Array.isArray(blocklist.titleContains)
          ? blocklist.titleContains.some((t) => titleLower.includes(String(t).toLowerCase()))
          : false;

        let blockedDomain = false;
        try {
          const hostname = new URL(canonicalUrl).hostname.toLowerCase();
          blockedDomain = Array.isArray(blocklist.domains)
            ? blocklist.domains.some((d) => hostname === String(d).toLowerCase())
            : false;
        } catch {
          blockedDomain = false;
        }

        if (blockedTitle || blockedDomain) {
          perSource.skipped += 1;
          run.totals.skipped += 1;
          continue;
        }

        if (knownIds.has(id)) {
          perSource.duplicates += 1;
          run.totals.duplicates += 1;
          continue;
        }

        const publishedAt = parsePublishedAt(item);
        const publishedDate = new Date(publishedAt);
        const yyyy = String(publishedDate.getUTCFullYear());
        const mm = String(publishedDate.getUTCMonth() + 1).padStart(2, "0");
        const dd = String(publishedDate.getUTCDate()).padStart(2, "0");

        const category = String(source.defaultCategory || "world");
        const dir = path.join(ARTICLES_DIR, category, yyyy, mm, dd);
        const relPath = path
          .join("data", "articles", category, yyyy, mm, dd, `${id}.json`)
          .replaceAll(path.sep, "/");
        const filePath = path.join(dir, `${id}.json`);

        if (await fileExists(filePath)) {
          perSource.duplicates += 1;
          run.totals.duplicates += 1;
          continue;
        }

        const article = {
          id,
          title,
          summary: cleanSummary(item),
          canonicalUrl,
          source: {
            id: source.id,
            name: source.name,
            url: source.siteUrl || null,
            feedUrl: source.feedUrl,
            country: source.country || null,
            language: source.language || null,
          },
          publishedAt,
          fetchedAt: perSource.fetchedAt,
          category,
          tags: Array.isArray(item.categories) ? item.categories : [],
          image: pickImage(item),
          language: source.language || "en",
          storagePath: relPath,
        };

        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(filePath, JSON.stringify(article, null, 2) + "\n");

        knownIds.add(id);
        perSource.added += 1;
        run.totals.added += 1;
      }

      state[source.id] = {
        etag: response.headers.get("etag") || sourceState.etag || null,
        lastModified:
          response.headers.get("last-modified") ||
          sourceState.lastModified ||
          null,
        lastFetchAt: perSource.fetchedAt,
        lastSuccessAt: perSource.fetchedAt,
        consecutiveFailures: 0,
        lastStatus: perSource.status,
        lastError: null,
      };

      perSource.ok = true;
      run.totals.ok += 1;
    } catch (error) {
      perSource.error = error instanceof Error ? error.message : String(error);
      run.totals.failed += 1;

      const prevFailures = Number.parseInt(sourceState.consecutiveFailures || 0, 10) || 0;
      state[source.id] = {
        ...sourceState,
        lastFetchAt: perSource.fetchedAt,
        lastFailureAt: perSource.fetchedAt,
        consecutiveFailures: prevFailures + 1,
        lastStatus: perSource.status ?? sourceState.lastStatus ?? null,
        lastError: perSource.error,
      };
    }
  }

  run.finishedAt = nowIso();
  await writeJson(STATE_PATH, state);
  await writeJson(path.join(INDEXES_DIR, "fetch-stats.json"), run);
  return run;
}

async function listFilesRecursive(dir) {
  const results = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await listFilesRecursive(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      results.push(fullPath);
    }
  }
  return results;
}

async function removeEmptyDirs(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  await Promise.all(
    entries
      .filter((e) => e.isDirectory())
      .map((e) => removeEmptyDirs(path.join(dir, e.name)))
  );

  const after = await fs.readdir(dir);
  if (after.length === 0 && dir !== ARTICLES_DIR) {
    await fs.rmdir(dir);
  }
}

async function runTarCreate({ archivePath, listPath }) {
  await fs.mkdir(path.dirname(archivePath), { recursive: true });

  return new Promise((resolve, reject) => {
    const child = spawn("tar", ["-czf", archivePath, "-T", listPath], {
      cwd: ROOT,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`tar exited with code ${code}`));
    });
  });
}

async function listOldArticleDayDirs(cutoffDateStr) {
  if (!(await fileExists(ARTICLES_DIR))) return [];

  const results = [];
  const categories = await fs.readdir(ARTICLES_DIR, { withFileTypes: true });

  for (const cat of categories) {
    if (!cat.isDirectory()) continue;
    const catPath = path.join(ARTICLES_DIR, cat.name);

    const years = await fs.readdir(catPath, { withFileTypes: true });
    for (const y of years) {
      if (!y.isDirectory()) continue;
      if (!/^\d{4}$/.test(y.name)) continue;
      const yearPath = path.join(catPath, y.name);

      const months = await fs.readdir(yearPath, { withFileTypes: true });
      for (const m of months) {
        if (!m.isDirectory()) continue;
        if (!/^\d{1,2}$/.test(m.name)) continue;
        const mm = String(m.name).padStart(2, "0");
        const monthPath = path.join(yearPath, m.name);

        const days = await fs.readdir(monthPath, { withFileTypes: true });
        for (const d of days) {
          if (!d.isDirectory()) continue;
          if (!/^\d{1,2}$/.test(d.name)) continue;
          const dd = String(d.name).padStart(2, "0");

          const dateStr = `${y.name}-${mm}-${dd}`;
          if (dateStr >= cutoffDateStr) continue;

          const dayPath = path.join(monthPath, d.name);
          results.push({
            absPath: dayPath,
            relPath: path.relative(ROOT, dayPath).replaceAll(path.sep, "/"),
            dateStr,
          });
        }
      }
    }
  }

  results.sort((a, b) => a.relPath.localeCompare(b.relPath));
  return results;
}

async function countJsonFilesInDir(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries.filter((e) => e.isFile() && e.name.endsWith(".json")).length;
}

export async function cleanupOldArticles({
  retentionDays = 90,
  archive = false,
  archiveDir = "archives",
} = {}) {
  const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  const cutoffDateStr = formatUtcYmd(cutoffDate);

  const oldDayDirs = await listOldArticleDayDirs(cutoffDateStr);
  if (oldDayDirs.length === 0) {
    return {
      removedCount: 0,
      archived: false,
      archivePath: null,
      cutoffDate: cutoffDateStr,
    };
  }

  let removedCount = 0;
  for (const dir of oldDayDirs) {
    removedCount += await countJsonFilesInDir(dir.absPath);
  }

  let archivePath = null;
  if (archive) {
    const resolvedArchiveDir = path.resolve(ROOT, String(archiveDir || "archives"));
    const baseName = `articles-before-${cutoffDateStr}.tgz`;
    const desired = path.join(resolvedArchiveDir, baseName);
    archivePath = (await fileExists(desired))
      ? path.join(resolvedArchiveDir, `articles-before-${cutoffDateStr}-${Date.now()}.tgz`)
      : desired;

    await fs.mkdir(TMP_DIR, { recursive: true });
    const listPath = path.join(TMP_DIR, `archive-${cutoffDateStr}.list`);
    await fs.writeFile(
      listPath,
      oldDayDirs.map((d) => d.relPath).join("\n") + "\n",
      "utf8"
    );

    await runTarCreate({ archivePath, listPath });
    await fs.rm(listPath, { force: true });

    const manifestPath = archivePath.replace(/\.tgz$/, ".json");
    const oldest = oldDayDirs[0]?.dateStr || null;
    const newest = oldDayDirs[oldDayDirs.length - 1]?.dateStr || null;
    await writeJson(manifestPath, {
      createdAt: nowIso(),
      retentionDays,
      cutoffDate: cutoffDateStr,
      archivedDayDirs: oldDayDirs.length,
      archivedArticles: removedCount,
      oldestDate: oldest,
      newestDate: newest,
      archivePath: path.relative(ROOT, archivePath).replaceAll(path.sep, "/"),
    });
  }

  for (const dir of oldDayDirs) {
    await fs.rm(dir.absPath, { recursive: true, force: true });
  }
  await removeEmptyDirs(ARTICLES_DIR);

  return {
    removedCount,
    archived: Boolean(archivePath),
    archivePath: archivePath
      ? path.relative(ROOT, archivePath).replaceAll(path.sep, "/")
      : null,
    cutoffDate: cutoffDateStr,
  };
}

export async function buildIndexes({
  latestLimit = 500,
  perCategoryLimit = 500,
} = {}) {
  await fs.mkdir(BY_CATEGORY_DIR, { recursive: true });
  await fs.mkdir(BY_LANGUAGE_DIR, { recursive: true });
  const categoryRules = await readJsonOrDefault(CATEGORY_RULES_PATH, null);

  const allFiles = (await fileExists(ARTICLES_DIR))
    ? await listFilesRecursive(ARTICLES_DIR)
    : [];

  const articles = [];
  for (const filePath of allFiles) {
    const article = await readJsonOrDefault(filePath, null);
    if (!article || !article.id || !article.publishedAt) continue;

    articles.push(article);
  }

  const byId = new Map();
  for (const article of articles) {
    const existing = byId.get(article.id);
    if (!existing) {
      byId.set(article.id, article);
      continue;
    }

    const existingScore =
      (existing.image ? 10 : 0) + Math.min((existing.summary || "").length, 400) / 40;
    const nextScore =
      (article.image ? 10 : 0) + Math.min((article.summary || "").length, 400) / 40;

    if (nextScore > existingScore) byId.set(article.id, article);
  }

  const uniqueArticles = Array.from(byId.values());
  for (const article of uniqueArticles) {
    article.category = classifyCategory(article, categoryRules);
  }
  uniqueArticles.sort((a, b) =>
    String(b.publishedAt).localeCompare(String(a.publishedAt))
  );

  const latest = uniqueArticles.slice(0, latestLimit).map((a) => ({
    id: a.id,
    title: a.title,
    summary: a.summary,
    canonicalUrl: a.canonicalUrl,
    source: { id: a.source?.id, name: a.source?.name },
    publishedAt: a.publishedAt,
    category: a.category,
    image: a.image || null,
    language: normalizeLanguageCode(a.language || "en"),
  }));

  const byCategory = new Map();
  for (const article of uniqueArticles) {
    const category = String(article.category || "world");
    if (!byCategory.has(category)) byCategory.set(category, []);
    const list = byCategory.get(category);
    if (list.length >= perCategoryLimit) continue;
    list.push({
      id: article.id,
      title: article.title,
      summary: article.summary,
      canonicalUrl: article.canonicalUrl,
      source: { id: article.source?.id, name: article.source?.name },
      publishedAt: article.publishedAt,
      category: article.category,
      image: article.image || null,
      language: normalizeLanguageCode(article.language || "en"),
    });
  }

  const byLanguage = new Map();
  for (const article of uniqueArticles) {
    const language = normalizeLanguageCode(article.language || "en");
    if (!byLanguage.has(language)) byLanguage.set(language, []);
    const list = byLanguage.get(language);
    if (list.length >= perCategoryLimit) continue;
    list.push({
      id: article.id,
      title: article.title,
      summary: article.summary,
      canonicalUrl: article.canonicalUrl,
      source: { id: article.source?.id, name: article.source?.name },
      publishedAt: article.publishedAt,
      category: article.category,
      image: article.image || null,
      language,
    });
  }

  const articleIndex = uniqueArticles.map((a) => ({
    id: a.id,
    category: a.category,
    language: normalizeLanguageCode(a.language || "en"),
    publishedAt: a.publishedAt,
    path: a.storagePath,
  }));

  await writeJson(path.join(INDEXES_DIR, "latest.json"), latest);
  await writeJson(path.join(INDEXES_DIR, "articles.json"), articleIndex);

  for (const [category, list] of byCategory.entries()) {
    await writeJson(path.join(BY_CATEGORY_DIR, `${category}.json`), list);
  }

  for (const [language, list] of byLanguage.entries()) {
    await writeJson(path.join(BY_LANGUAGE_DIR, `${language}.json`), list);
  }

  return {
    totalArticles: uniqueArticles.length,
    duplicateIds: articles.length - uniqueArticles.length,
  };
}
