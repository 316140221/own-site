import crypto from "node:crypto";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import Parser from "rss-parser";
import { boolFromEnv, intFromEnv, stringFromEnv } from "./env.mjs";
import { readJsonOrDefault, writeJson } from "./json.mjs";
import sharedEntities from "../../shared/entities.cjs";

const { decodeHtmlEntities } = sharedEntities;

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
const BY_SOURCE_DIR = path.join(INDEXES_DIR, "by-source");
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

function stripHtml(input) {
  return String(input ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

function stripHtmlPreserveNewlines(input) {
  return String(input ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|section|article|h\d|li|ul|ol|blockquote|pre|table|tr)>/gi, "\n\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<[^>]+>/g, " ");
}

function normalizeWhitespace(input) {
  return String(input ?? "").replace(/\s+/g, " ").trim();
}

function normalizeWhitespacePreserveNewlines(input) {
  return String(input || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function truncate(input, maxLen) {
  const text = String(input ?? "");
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1).trimEnd() + "…";
}

function stripBoilerplateFromContent(text) {
  const lines = String(text || "").split("\n");
  if (!lines.length) return "";

  const kept = [];
  const seen = new Set();

  const boilerplatePatterns = [
    /^(read more|continue reading|watch now|listen now|click here|learn more)\b/i,
    /^(lire la suite|lire aussi|abonnez-vous)\b/i,
    /^(leer m[aá]s|seguir leyendo|suscr[ií]bete)\b/i,
    /^(続きを読む|もっと読む)\b/i,
    /^(阅读更多|继续阅读)\b/i,
    /^the post .* appeared first on\b/i,
  ];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (kept.length && kept[kept.length - 1] !== "") kept.push("");
      continue;
    }

    const lower = trimmed.toLowerCase();
    const looksBoilerplate =
      boilerplatePatterns.some((re) => re.test(trimmed)) ||
      /(cookie|privacy|subscribe|newsletter|sign up|advertisement|sponsored)/i.test(trimmed) ||
      /(publicit[eé]|confidentialit[eé]|suscripci[oó]n|publicidad)/i.test(trimmed) ||
      /(クッキー|プライバシー|広告)/i.test(trimmed) ||
      /(隐私|订阅|广告)/i.test(trimmed) ||
      lower === "advertisement";
    if (looksBoilerplate) continue;

    const normalized = lower.replace(/[^\p{L}\p{N}]+/gu, " ").trim();
    if (normalized && seen.has(normalized)) continue;
    if (normalized) seen.add(normalized);
    kept.push(trimmed);
  }

  while (kept.length && kept[kept.length - 1] === "") kept.pop();
  return kept.join("\n");
}

function looksLikeRssOrAtom(text) {
  const sample = String(text || "").slice(0, 600);
  return /^\uFEFF?\s*(?:<\?xml[^>]*>\s*)?(?:<rss\b|<feed\b|<rdf:RDF\b|<rdf:rdf\b)/i.test(
    sample
  );
}

function classifyCategory(article, rulesConfig) {
  const fallback = String(article.category || "world");
  if (!rulesConfig || rulesConfig.enabled === false) return fallback;
  const language = normalizeLanguageCode(article.language || "en");
  let rules = Array.isArray(rulesConfig.rules) ? rulesConfig.rules : [];

  const languagesConfig =
    rulesConfig && typeof rulesConfig.languages === "object" ? rulesConfig.languages : null;
  if (languagesConfig && language && languagesConfig[language]) {
    const langEntry = languagesConfig[language];
    if (langEntry && langEntry.enabled === false) return fallback;
    rules = Array.isArray(langEntry?.rules) ? langEntry.rules : [];
  }

  if (rules.length === 0) return fallback;

  const tags = Array.isArray(article.tags) ? article.tags.join(" ") : "";
  const text = `${article.title || ""} ${article.summary || ""} ${tags}`.toLowerCase();
  const wordText = text.replace(/[^\p{L}\p{N}]+/gu, " ").trim();
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
      const isAsciiWord = /^[a-z0-9]+$/.test(kw);
      if (isAsciiWord) {
        if (words.has(kw)) return category;
        continue;
      }
      if (text.includes(kw)) return category;
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

function computePausedUntil({
  failures,
  fetchedAt,
  threshold = 3,
  baseHours = 24,
  maxHours = 168,
} = {}) {
  const count = Number.parseInt(failures || 0, 10) || 0;
  if (count < threshold) return null;

  const exponent = Math.max(0, count - threshold);
  const hours = Math.min(baseHours * 2 ** exponent, maxHours);
  const baseDate = fetchedAt ? new Date(String(fetchedAt)) : new Date();
  const baseTime = Number.isNaN(baseDate.getTime()) ? Date.now() : baseDate.getTime();
  return new Date(baseTime + hours * 60 * 60 * 1000).toISOString();
}

const TRACKING_QUERY_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "utm_reader",
  "utm_name",
  "utm_referrer",
  "utm_social",
  "utm_social-type",
  "gclid",
  "fbclid",
  "igshid",
  "mc_cid",
  "mc_eid",
  "ref",
  "ref_src",
  "ref_url",
  "cmp",
  "cmpid",
  "ocid",
  "icid",
  "ncid",
  "mkt_tok",
  "spm",
  "scid",
  "_hsenc",
  "_hsmi",
  "amp",
]);

export function normalizeUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.hostname = parsed.hostname.toLowerCase();
    if (parsed.hostname.startsWith("www.")) parsed.hostname = parsed.hostname.slice(4);

    if (
      (parsed.protocol === "http:" && parsed.port === "80") ||
      (parsed.protocol === "https:" && parsed.port === "443")
    ) {
      parsed.port = "";
    }
    if (parsed.protocol === "http:") parsed.protocol = "https:";

    const toDelete = [];
    for (const [key] of parsed.searchParams) {
      const lower = key.toLowerCase();
      if (
        lower.startsWith("utm_") ||
        TRACKING_QUERY_PARAMS.has(lower)
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

function normalizeUrlForDedupeKey(url) {
  const normalized = normalizeUrl(String(url || "")).trim();
  if (!normalized) return "";
  return normalized;
}

function scoreArticleQuality(article) {
  const summaryLen = String(article?.summary || "").length;
  const contentLen = String(article?.contentText || "").length;
  const imageScore = article?.image ? 10 : 0;
  const summaryScore = Math.min(summaryLen, 400) / 40;
  const contentScore = Math.min(contentLen, 2000) / 200;
  const weightRaw = article?.source?.weight;
  const weight = Number(weightRaw);
  const sourceWeight = Number.isFinite(weight)
    ? Math.max(0.5, Math.min(2, weight))
    : 1;
  return (imageScore + summaryScore + contentScore) * sourceWeight;
}

function normalizeTitleForStoryKey(title, sourceName) {
  const rawTitle = normalizeWhitespace(decodeHtmlEntities(String(title || "")));
  if (!rawTitle) return "";

  let text = rawTitle.toLowerCase();
  const source = normalizeWhitespace(String(sourceName || "")).toLowerCase();

  if (source) {
    const suffixes = [` - ${source}`, ` – ${source}`, ` — ${source}`, ` | ${source}`, ` · ${source}`];
    for (const suffix of suffixes) {
      if (text.endsWith(suffix)) {
        text = text.slice(0, -suffix.length).trim();
        break;
      }
    }
  }

  text = text.replace(/https?:\/\/\S+/g, " ");
  text = text.replace(/[^\p{L}\p{N}]+/gu, " ");
  text = normalizeWhitespace(text);
  if (!text) return "";
  return text.length > 220 ? text.slice(0, 220) : text;
}

function safeMs(value) {
  const ms = Date.parse(String(value || ""));
  return Number.isFinite(ms) ? ms : 0;
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

function normalizeImageUrl(raw, baseUrl) {
  const trimmed = String(raw || "").trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("data:")) return null;

  const normalized = trimmed.startsWith("//") ? `https:${trimmed}` : trimmed;

  try {
    const resolved = baseUrl ? new URL(normalized, baseUrl) : new URL(normalized);
    if (resolved.protocol !== "http:" && resolved.protocol !== "https:") return null;
    return resolved.toString();
  } catch {
    return null;
  }
}

function extractFirstImageFromHtml(html) {
  const input = String(html || "");
  if (!input) return null;

  const match = input.match(/<img[^>]+src\s*=\s*["']([^"']+)["'][^>]*>/i);
  if (match && match[1]) return match[1];

  const matchSrcset = input.match(
    /<img[^>]+srcset\s*=\s*["']([^"']+)["'][^>]*>/i
  );
  if (!matchSrcset || !matchSrcset[1]) return null;

  const first = String(matchSrcset[1]).split(",")[0] || "";
  const candidate = first.trim().split(/\s+/)[0];
  return candidate || null;
}

function pickImage(item, source) {
  const baseUrl = source?.siteUrl || source?.feedUrl || null;

  if (item.enclosure && item.enclosure.url) {
    return normalizeImageUrl(item.enclosure.url, baseUrl);
  }
  if (Array.isArray(item.mediaContent) && item.mediaContent[0]?.$?.url) {
    return normalizeImageUrl(item.mediaContent[0].$.url, baseUrl);
  }
  if (Array.isArray(item.mediaThumbnail) && item.mediaThumbnail[0]?.$?.url) {
    return normalizeImageUrl(item.mediaThumbnail[0].$.url, baseUrl);
  }

  const htmlCandidates = [
    item.content,
    item["content:encoded"],
    item.summary,
    item.contentSnippet,
  ].filter(Boolean);

  for (const html of htmlCandidates) {
    const candidate = extractFirstImageFromHtml(html);
    const normalized = normalizeImageUrl(candidate, baseUrl);
    if (normalized) return normalized;
  }

  return null;
}

function cleanSummary(item) {
  const raw = item.contentSnippet || item.content || item.summary || "";
  const text = normalizeWhitespace(decodeHtmlEntities(stripHtml(String(raw))));
  return truncate(text, 360);
}

function pickRawContent(item) {
  const candidates = [
    ["content:encoded", item && item["content:encoded"]],
    ["content", item && item.content],
    ["summary", item && item.summary],
    ["contentSnippet", item && item.contentSnippet],
  ];

  for (const [source, value] of candidates) {
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (!trimmed) continue;
    return { source, value: trimmed };
  }

  return null;
}

function cleanContentText(
  item,
  { maxLen = 8000, minLen = 200, summary = "", stripBoilerplate = true } = {}
) {
  const picked = pickRawContent(item);
  if (!picked) return { text: null, source: null };

  const rawText = decodeHtmlEntities(stripHtmlPreserveNewlines(picked.value));
  const text = normalizeWhitespacePreserveNewlines(rawText);
  if (!text) return { text: null, source: null };

  const filtered = stripBoilerplate
    ? normalizeWhitespacePreserveNewlines(stripBoilerplateFromContent(text))
    : text;
  if (!filtered) return { text: null, source: null };

  const maxChars = Number.isFinite(maxLen) && maxLen > 0 ? maxLen : 8000;
  const truncated = truncate(filtered, maxChars);
  if (Number.isFinite(minLen) && minLen > 0 && truncated.length < minLen) {
    return { text: null, source: null };
  }

  const normalizedSummary = normalizeWhitespace(String(summary || ""));
  if (normalizedSummary && truncated.length <= normalizedSummary.length + 40) {
    return { text: null, source: null };
  }

  return { text: truncated, source: picked.source };
}

async function fetchResponseWithTimeout(url, { headers }, timeoutMs) {
  const timeout = Number(timeoutMs);
  const hasTimeout = Number.isFinite(timeout) && timeout > 0;
  const controller = hasTimeout ? new AbortController() : null;
  const timer = hasTimeout ? setTimeout(() => controller.abort(), timeout) : null;

  try {
    const response = await fetch(url, {
      headers,
      redirect: "follow",
      signal: controller?.signal,
    });
    return response;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function sleep(ms) {
  const delay = Number(ms);
  if (!Number.isFinite(delay) || delay <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, delay));
}

function parseRetryAfterMs(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;

  const seconds = Number.parseInt(raw, 10);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;

  const when = Date.parse(raw);
  if (!Number.isFinite(when)) return null;
  const diff = when - Date.now();
  return diff > 0 ? diff : 0;
}

function computeBackoffMs({ attempt, baseDelayMs, maxDelayMs }) {
  const base = Number(baseDelayMs);
  const max = Number(maxDelayMs);
  const baseOk = Number.isFinite(base) && base > 0 ? base : 500;
  const maxOk = Number.isFinite(max) && max > 0 ? max : 8000;

  const exp = Math.min(10, Math.max(0, Number(attempt) || 0));
  const raw = Math.min(maxOk, baseOk * 2 ** exp);
  const jitter = raw * (0.15 * (Math.random() * 2 - 1));
  return Math.max(0, Math.round(raw + jitter));
}

function isRetryableStatus(status) {
  return (
    status === 408 ||
    status === 425 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
}

async function fetchResponseWithRetry(
  url,
  { headers },
  timeoutMs,
  { retries = 2, baseDelayMs = 500, maxDelayMs = 8000 } = {}
) {
  const maxRetries = Number.parseInt(retries || 0, 10);
  const allowedRetries = Number.isFinite(maxRetries) ? Math.max(0, Math.min(10, maxRetries)) : 0;

  let attempt = 0;
  let retriesUsed = 0;
  let lastError = null;

  while (attempt <= allowedRetries) {
    try {
      const response = await fetchResponseWithTimeout(url, { headers }, timeoutMs);
      if (response.ok || response.status === 304) {
        return { response, retriesUsed };
      }

      if (attempt < allowedRetries && isRetryableStatus(response.status)) {
        retriesUsed += 1;
        const retryAfter = parseRetryAfterMs(response.headers.get("retry-after"));
        try {
          await response.body?.cancel();
        } catch {
          // ignore
        }
        const delayMs =
          retryAfter !== null
            ? Math.min(Math.max(0, retryAfter), Number(maxDelayMs) || 8000)
            : computeBackoffMs({ attempt, baseDelayMs, maxDelayMs });
        await sleep(delayMs);
        attempt += 1;
        continue;
      }

      return { response, retriesUsed };
    } catch (error) {
      lastError = error;

      const name = error && typeof error === "object" ? error.name : "";
      const retryable =
        name === "AbortError" ||
        (error instanceof TypeError && String(error.message || "").includes("fetch"));
      if (attempt < allowedRetries && retryable) {
        retriesUsed += 1;
        const delayMs = computeBackoffMs({ attempt, baseDelayMs, maxDelayMs });
        await sleep(delayMs);
        attempt += 1;
        continue;
      }

      throw error;
    }
  }

  if (lastError) throw lastError;
  return fetchResponseWithTimeout(url, { headers }, timeoutMs).then((response) => ({
    response,
    retriesUsed,
  }));
}

async function mapLimit(items, limit, mapper) {
  const list = Array.isArray(items) ? items : [];
  const max = Number.parseInt(limit || 0, 10) || 1;
  const concurrency = Math.max(1, Math.min(list.length || 1, max));
  const results = new Array(list.length);

  let nextIndex = 0;
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (true) {
        const index = nextIndex;
        nextIndex += 1;
        if (index >= list.length) break;
        results[index] = await mapper(list[index], index);
      }
    })
  );

  return results;
}

function createSemaphore(limit) {
  const max = Number.parseInt(limit || 0, 10) || 1;
  const cap = Math.max(1, max);
  let active = 0;
  const queue = [];

  const acquire = () =>
    new Promise((resolve) => {
      const tryAcquire = () => {
        if (active < cap) {
          active += 1;
          resolve(() => {
            active = Math.max(0, active - 1);
            const next = queue.shift();
            if (next) next();
          });
          return;
        }
        queue.push(tryAcquire);
      };
      tryAcquire();
    });

  return { acquire, limit: cap };
}

function safeHostname(url) {
  try {
    return new URL(String(url || "")).hostname.toLowerCase();
  } catch {
    return "";
  }
}

export async function fetchAllSources({
  maxItemsPerFeed = 80,
  timeoutMs,
} = {}) {
  const contentMaxChars = intFromEnv("RSS_CONTENT_MAX_CHARS", 8000, { min: 0 });
  const contentMinChars = intFromEnv("RSS_CONTENT_MIN_CHARS", 200, { min: 0 });
  const minIntervalMinutes = intFromEnv("FETCH_MIN_INTERVAL_MINUTES", 0, { min: 0 });
  const resolvedTimeoutMs = intFromEnv("FETCH_TIMEOUT_MS", timeoutMs ?? 15000, { min: 0, max: 120000 });
  const fetchRetries = intFromEnv("FETCH_RETRIES", 2, { min: 0, max: 10 });
  const fetchRetryDelayMs = intFromEnv("FETCH_RETRY_DELAY_MS", 500, { min: 0 });
  const fetchRetryMaxDelayMs = intFromEnv("FETCH_RETRY_MAX_DELAY_MS", 8000, { min: 0 });
  const stripBoilerplate = boolFromEnv("RSS_CONTENT_STRIP_BOILERPLATE", true);

  const fetchUserAgent = stringFromEnv("FETCH_USER_AGENT", "news-atlas-bot/0.1");

  const [sources, state, blocklist, existingArticleIndex] = await Promise.all([
    readJsonOrDefault(SOURCES_PATH, []),
    readJsonOrDefault(STATE_PATH, {}),
    readJsonOrDefault(BLOCKLIST_PATH, { domains: [], titleContains: [] }),
    readJsonOrDefault(ARTICLES_INDEX_PATH, []),
  ]);
  const existingIndexById = new Map(
    Array.isArray(existingArticleIndex)
      ? existingArticleIndex
          .filter((e) => e && e.id && e.path)
          .map((e) => [String(e.id), String(e.path)])
      : []
  );
  const knownIds = new Set(
    Array.isArray(existingArticleIndex)
      ? existingArticleIndex.map((e) => e && e.id).filter(Boolean)
      : []
  );

  const failureBackoffThreshold = intFromEnv("FAILURE_BACKOFF_THRESHOLD", 3, { min: 0 });
  const failureBackoffBaseHours = intFromEnv("FAILURE_BACKOFF_BASE_HOURS", 24, { min: 0 });
  const failureBackoffMaxHours = intFromEnv("FAILURE_BACKOFF_MAX_HOURS", 168, { min: 0 });

  const run = {
    startedAt: nowIso(),
    finishedAt: null,
    totals: {
      sources: 0,
      ok: 0,
      failed: 0,
      paused: 0,
      added: 0,
      backfilled: 0,
      duplicates: 0,
      skipped: 0,
    },
    sources: {},
  };

  await Promise.all([
    fs.mkdir(ARTICLES_DIR, { recursive: true }),
    fs.mkdir(INDEXES_DIR, { recursive: true }),
  ]);

  const enabledSources = sources.filter((s) => s && s.enabled !== false);
  run.totals.sources = enabledSources.length;

  const fetchConcurrency = intFromEnv("FETCH_CONCURRENCY", 4, { min: 0 });
  const hostConcurrency = intFromEnv("FETCH_HOST_CONCURRENCY", 2, { min: 0 });
  const sourceConcurrency =
    Number.isFinite(fetchConcurrency) && fetchConcurrency > 0
      ? Math.max(1, Math.min(32, fetchConcurrency))
      : 1;
  const perHostConcurrency =
    Number.isFinite(hostConcurrency) && hostConcurrency > 0
      ? Math.max(1, Math.min(16, hostConcurrency))
      : 0;

  const hostSemaphores = new Map();

  await mapLimit(enabledSources, sourceConcurrency, async (source) => {
    const sourceId = String(source?.id || "").trim();
    if (!sourceId) return;

    const sourceState = state[sourceId] || {};
    const headers = {
      "user-agent": fetchUserAgent,
      accept: "application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.1",
    };

    if (sourceState.etag) headers["if-none-match"] = sourceState.etag;
    if (sourceState.lastModified) headers["if-modified-since"] = sourceState.lastModified;

    const perSource = {
      ok: false,
      paused: false,
      status: null,
      error: null,
      retries: 0,
      fetchedAt: nowIso(),
      parsedItems: 0,
      added: 0,
      backfilled: 0,
      duplicates: 0,
      skipped: 0,
    };
    run.sources[sourceId] = perSource;

    const pausedUntil = sourceState.pausedUntil ? String(sourceState.pausedUntil) : null;
    if (pausedUntil) {
      const pausedUntilDate = new Date(pausedUntil);
      if (!Number.isNaN(pausedUntilDate.getTime()) && Date.now() < pausedUntilDate.getTime()) {
        perSource.paused = true;
        perSource.error = `Paused until ${pausedUntil}`;
        run.totals.paused += 1;
        return;
      }
    }

    const sourceMinIntervalMinutesRaw =
      source && Object.prototype.hasOwnProperty.call(source, "minFetchIntervalMinutes")
        ? source.minFetchIntervalMinutes
        : minIntervalMinutes;
    const sourceMinIntervalMinutes = Number.parseInt(String(sourceMinIntervalMinutesRaw || "0"), 10);
    if (Number.isFinite(sourceMinIntervalMinutes) && sourceMinIntervalMinutes > 0) {
      const lastFetchDate = sourceState.lastFetchAt ? new Date(String(sourceState.lastFetchAt)) : null;
      const lastFetchMs = lastFetchDate ? lastFetchDate.getTime() : Number.NaN;
      if (!Number.isNaN(lastFetchMs)) {
        const nextAllowedMs = lastFetchMs + sourceMinIntervalMinutes * 60 * 1000;
        if (Date.now() < nextAllowedMs) {
          perSource.paused = true;
          perSource.error = `Cooldown until ${new Date(nextAllowedMs).toISOString()}`;
          run.totals.paused += 1;
          return;
        }
      }
    }

    try {
      const host = safeHostname(source.feedUrl);
      let releaseHost = null;
      if (host && perHostConcurrency > 0) {
        if (!hostSemaphores.has(host)) {
          hostSemaphores.set(host, createSemaphore(perHostConcurrency));
        }
        releaseHost = await hostSemaphores.get(host).acquire();
      }

      try {
        const { response, retriesUsed } = await fetchResponseWithRetry(
          source.feedUrl,
          { headers },
          resolvedTimeoutMs,
          {
            retries: fetchRetries,
            baseDelayMs: fetchRetryDelayMs,
            maxDelayMs: fetchRetryMaxDelayMs,
          }
        );

        perSource.retries = retriesUsed;

        perSource.status = response.status;

        if (response.status === 304) {
          perSource.ok = true;
          run.totals.ok += 1;
          state[sourceId] = {
            ...sourceState,
            lastFetchAt: perSource.fetchedAt,
            lastSuccessAt: perSource.fetchedAt,
            consecutiveFailures: 0,
            pausedUntil: null,
            lastStatus: 304,
            lastError: null,
          };
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const contentType = response.headers.get("content-type") || "";
        const text = await response.text();
        if (!looksLikeRssOrAtom(text)) {
          const snippet = normalizeWhitespace(text.slice(0, 180));
          throw new Error(
            `Not an RSS/Atom feed (content-type: ${contentType || "unknown"}). ${snippet}`
          );
        }

        let feed = null;
        try {
          feed = await parser.parseString(text);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          throw new Error(`RSS parse error: ${message}`);
        }
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
            const existingRelPath = existingIndexById.get(id);
            if (existingRelPath) {
              const existingAbsPath = path.resolve(ROOT, existingRelPath);
              const existingArticle = await readJsonOrDefault(existingAbsPath, null);
              if (existingArticle && !existingArticle.contentText) {
                const content = cleanContentText(item, {
                  maxLen: contentMaxChars,
                  minLen: contentMinChars,
                  summary: existingArticle.summary || cleanSummary(item),
                  stripBoilerplate,
                });
                if (content.text) {
                  existingArticle.contentText = content.text;
                  existingArticle.contentSource = content.source;
                  try {
                    await fs.writeFile(
                      existingAbsPath,
                      JSON.stringify(existingArticle, null, 2) + "\n",
                      "utf8"
                    );
                    perSource.backfilled += 1;
                    run.totals.backfilled += 1;
                  } catch {
                    // ignore write errors
                  }
                }
              }
            }

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

          const article = {
            id,
            title,
            summary: cleanSummary(item),
            canonicalUrl,
            source: {
              id: sourceId,
              name: source.name,
              url: source.siteUrl || null,
              feedUrl: source.feedUrl,
              country: source.country || null,
              language: source.language || null,
              weight: source.weight ?? null,
            },
            publishedAt,
            fetchedAt: perSource.fetchedAt,
            category,
            tags: Array.isArray(item.categories) ? item.categories : [],
            image: pickImage(item, source),
            language: source.language || "en",
            storagePath: relPath,
          };

          const content = cleanContentText(item, {
            maxLen: contentMaxChars,
            minLen: contentMinChars,
            summary: article.summary,
            stripBoilerplate,
          });
          if (content.text) {
            article.contentText = content.text;
            article.contentSource = content.source;
          }

          await fs.mkdir(dir, { recursive: true });
          try {
            await fs.writeFile(filePath, JSON.stringify(article, null, 2) + "\n", {
              flag: "wx",
            });
          } catch (error) {
            if (error && typeof error === "object" && error.code === "EEXIST") {
              knownIds.add(id);
              perSource.duplicates += 1;
              run.totals.duplicates += 1;
              continue;
            }
            throw error;
          }

          knownIds.add(id);
          perSource.added += 1;
          run.totals.added += 1;
        }

        state[sourceId] = {
          etag: response.headers.get("etag") || sourceState.etag || null,
          lastModified:
            response.headers.get("last-modified") ||
            sourceState.lastModified ||
            null,
          lastFetchAt: perSource.fetchedAt,
          lastSuccessAt: perSource.fetchedAt,
          consecutiveFailures: 0,
          pausedUntil: null,
          lastStatus: perSource.status,
          lastError: null,
        };

        perSource.ok = true;
        run.totals.ok += 1;
      } finally {
        if (releaseHost) releaseHost();
      }
    } catch (error) {
      perSource.error = error instanceof Error ? error.message : String(error);
      run.totals.failed += 1;

      const prevFailures = Number.parseInt(sourceState.consecutiveFailures || 0, 10) || 0;
      const failures = prevFailures + 1;
      const nextPausedUntil = computePausedUntil({
        failures,
        fetchedAt: perSource.fetchedAt,
        threshold: failureBackoffThreshold,
        baseHours: failureBackoffBaseHours,
        maxHours: failureBackoffMaxHours,
      });
      state[sourceId] = {
        ...sourceState,
        lastFetchAt: perSource.fetchedAt,
        lastFailureAt: perSource.fetchedAt,
        consecutiveFailures: failures,
        pausedUntil: nextPausedUntil,
        lastStatus: perSource.status ?? sourceState.lastStatus ?? null,
        lastError: perSource.error,
      };
    }
  });

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
    const oldest = oldDayDirs[0]?.dateStr || null;
    const newest = oldDayDirs[oldDayDirs.length - 1]?.dateStr || null;

    const resolvedArchiveDirBase = path.resolve(
      ROOT,
      String(archiveDir || "archives")
    );
    const archiveLayout = stringFromEnv("ARCHIVE_LAYOUT", "").toLowerCase();
    const resolvedArchiveDir =
      (archiveLayout === "monthly" || archiveLayout === "month") && oldest
        ? path.join(resolvedArchiveDirBase, String(oldest).slice(0, 7))
        : resolvedArchiveDirBase;

    const baseName =
      oldest && newest
        ? `articles-${oldest}-to-${newest}.tgz`
        : `articles-before-${cutoffDateStr}.tgz`;
    const desired = path.join(resolvedArchiveDir, baseName);
    archivePath = (await fileExists(desired))
      ? path.join(
          resolvedArchiveDir,
          baseName.replace(/\.tgz$/, `-${Date.now()}.tgz`)
        )
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
  await fs.mkdir(BY_SOURCE_DIR, { recursive: true });
  const categoryRules = await readJsonOrDefault(CATEGORY_RULES_PATH, null);

  const allFiles = (await fileExists(ARTICLES_DIR))
    ? await listFilesRecursive(ARTICLES_DIR)
    : [];

  const readConcurrency = intFromEnv("INDEX_READ_CONCURRENCY", 32, { min: 1, max: 256 });
  const dedupeUrlAliases = boolFromEnv("INDEX_DEDUPE_URL_ALIASES", true);

  const entries = (await mapLimit(allFiles, readConcurrency, async (filePath) => {
    const article = await readJsonOrDefault(filePath, null);
    if (!article || !article.id || !article.publishedAt) return null;

    if (!article.storagePath) {
      article.storagePath = path
        .relative(ROOT, filePath)
        .replaceAll(path.sep, "/");
    }

    return { filePath, article };
  })).filter(Boolean);

  const byId = new Map();
  for (const entry of entries) {
    const article = entry.article;
    const existing = byId.get(article.id);
    if (!existing) {
      byId.set(article.id, entry);
      continue;
    }

    const existingArticle = existing.article;
    const existingScore = scoreArticleQuality(existingArticle);
    const nextScore = scoreArticleQuality(article);
    if (nextScore > existingScore) byId.set(article.id, entry);
  }

  const duplicateIds = Math.max(0, entries.length - byId.size);
  const keptPaths = new Set(Array.from(byId.values()).map((e) => e.filePath));
  const duplicatePaths = entries
    .filter((e) => !keptPaths.has(e.filePath))
    .map((e) => e.filePath);

  await Promise.all(
    duplicatePaths.map(async (p) => {
      try {
        await fs.rm(p, { force: true });
      } catch {
        // ignore
      }
    })
  );

  let selectedEntries = Array.from(byId.values());
  let duplicateUrls = 0;
  let urlDuplicatePaths = [];
  const redirects = {};

  if (dedupeUrlAliases) {
    const groups = new Map();
    for (const entry of selectedEntries) {
      const key = normalizeUrlForDedupeKey(entry.article?.canonicalUrl);
      const mapKey = key || `id:${entry.article.id}`;
      if (!groups.has(mapKey)) groups.set(mapKey, []);
      groups.get(mapKey).push(entry);
    }

    const byUrlKey = new Map();
    for (const [key, group] of groups.entries()) {
      let best = group[0];
      let bestScore = scoreArticleQuality(best.article);
      for (const entry of group.slice(1)) {
        const score = scoreArticleQuality(entry.article);
        if (score > bestScore) {
          best = entry;
          bestScore = score;
        }
      }
      byUrlKey.set(key, best);

      if (!key.startsWith("id:")) {
        for (const entry of group) {
          if (entry === best) continue;
          const fromId = String(entry.article?.id || "").trim();
          const toId = String(best.article?.id || "").trim();
          if (fromId && toId && fromId !== toId) redirects[fromId] = toId;
        }
      }
    }

    duplicateUrls = Math.max(0, selectedEntries.length - byUrlKey.size);
    const keptByUrl = new Set(Array.from(byUrlKey.values()).map((e) => e.filePath));
    urlDuplicatePaths = selectedEntries.filter((e) => !keptByUrl.has(e.filePath)).map((e) => e.filePath);

    await Promise.all(
      urlDuplicatePaths.map(async (p) => {
        try {
          await fs.rm(p, { force: true });
        } catch {
          // ignore
        }
      })
    );

    selectedEntries = Array.from(byUrlKey.values());
  }

  if (duplicatePaths.length + urlDuplicatePaths.length > 0) {
    await removeEmptyDirs(ARTICLES_DIR);
  }

  await writeJson(path.join(INDEXES_DIR, "redirects.json"), redirects);

  const uniqueArticles = selectedEntries.map((e) => e.article);
  const sourceLatest = new Map();
  for (const article of uniqueArticles) {
    article.category = classifyCategory(article, categoryRules);
    const sourceId = String(article?.source?.id || "").trim();
    if (sourceId) {
      const publishedMs = safeMs(article.publishedAt);
      if (Number.isFinite(publishedMs) && publishedMs > 0) {
        const prev = sourceLatest.get(sourceId) || 0;
        if (publishedMs > prev) sourceLatest.set(sourceId, publishedMs);
      }
    }
  }
  uniqueArticles.sort((a, b) =>
    String(b.publishedAt).localeCompare(String(a.publishedAt))
  );

  const fetchStats = await readJsonOrDefault(
    path.join(INDEXES_DIR, "fetch-stats.json"),
    null
  );
  const runSources = fetchStats && typeof fetchStats === "object" ? fetchStats.sources || {} : {};
  const sourceMultipliers = new Map();
  for (const [sourceId, src] of Object.entries(runSources)) {
    const ok = src && src.ok === true;
    const paused = src && src.paused === true;
    const failed = src && src.ok === false && !paused;
    const added = Number(src?.added) || 0;
    const duplicates = Number(src?.duplicates) || 0;
    const denom = Math.max(1, added + duplicates);
    const dupRate = duplicates / denom;

    let multiplier = 1;
    multiplier *= 1 - Math.min(0.35, dupRate * 0.35);
    if (failed) multiplier *= 0.8;
    if (ok) multiplier *= 1.03;
    sourceMultipliers.set(sourceId, Math.max(0.5, Math.min(1.15, multiplier)));
  }

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

  const storiesWindowHours = intFromEnv("STORIES_WINDOW_HOURS", 48, { min: 0 });
  const storiesMaxArticles = intFromEnv("STORIES_MAX_ARTICLES", 800, { min: 0 });
  const storiesMinSources = intFromEnv("STORIES_MIN_SOURCES", 2, { min: 0 });
  const storiesLimit = intFromEnv("STORIES_LIMIT", 200, { min: 0 });
  const topWindowHours = intFromEnv("TOP_WINDOW_HOURS", 48, { min: 0 });
  const topLimit = intFromEnv("TOP_LIMIT", 200, { min: 0 });

  const cutoffStoriesMs =
    Number.isFinite(storiesWindowHours) && storiesWindowHours > 0
      ? Date.now() - storiesWindowHours * 60 * 60 * 1000
      : 0;
  const cutoffTopMs =
    Number.isFinite(topWindowHours) && topWindowHours > 0
      ? Date.now() - topWindowHours * 60 * 60 * 1000
      : 0;

  const windowArticles = [];
  for (const article of uniqueArticles) {
    if (
      Number.isFinite(storiesMaxArticles) &&
      storiesMaxArticles > 0 &&
      windowArticles.length >= storiesMaxArticles
    ) {
      break;
    }
    const publishedMs = safeMs(article.publishedAt);
    if (cutoffStoriesMs && publishedMs && publishedMs < cutoffStoriesMs) break;
    windowArticles.push(article);
  }

  const storyGroups = new Map();
  for (const article of windowArticles) {
    const key = normalizeTitleForStoryKey(article.title, article.source?.name);
    if (!key) continue;
    if (!storyGroups.has(key)) storyGroups.set(key, []);
    storyGroups.get(key).push(article);
  }

  const stories = [];
  for (const [key, group] of storyGroups.entries()) {
    if (!Array.isArray(group) || group.length < 2) continue;

    const sourceSet = new Set(
      group
        .map((a) => String(a?.source?.id || a?.source?.name || "").trim())
        .filter(Boolean)
    );
    if (Number.isFinite(storiesMinSources) && storiesMinSources > 1) {
      if (sourceSet.size < storiesMinSources) continue;
    }

    let best = group[0];
    let bestScore = scoreArticleQuality(best);
    for (const a of group.slice(1)) {
      const score = scoreArticleQuality(a);
      if (score > bestScore) {
        best = a;
        bestScore = score;
      }
    }

    const items = group
      .slice()
      .sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)))
      .map((a) => ({
        id: a.id,
        title: a.title,
        canonicalUrl: a.canonicalUrl,
        publishedAt: a.publishedAt,
        category: a.category,
        language: normalizeLanguageCode(a.language || "en"),
        source: { id: a.source?.id, name: a.source?.name },
      }));

    const publishedAt = items[0]?.publishedAt || best.publishedAt;
    stories.push({
      id: crypto.createHash("sha1").update(key).digest("hex").slice(0, 12),
      title: best.title,
      publishedAt,
      category: best.category,
      language: normalizeLanguageCode(best.language || "en"),
      sources: Array.from(sourceSet).sort((a, b) => a.localeCompare(b)),
      coverage: sourceSet.size,
      items,
    });
  }

  stories.sort((a, b) => {
    if (b.coverage !== a.coverage) return b.coverage - a.coverage;
    return String(b.publishedAt).localeCompare(String(a.publishedAt));
  });

  const cappedStories =
    Number.isFinite(storiesLimit) && storiesLimit > 0
      ? stories.slice(0, Math.min(1000, storiesLimit))
      : stories.slice(0, 200);
  await writeJson(path.join(INDEXES_DIR, "stories.json"), cappedStories);

  const topCandidates = uniqueArticles
    .filter((a) => {
      const ms = safeMs(a.publishedAt);
      if (!cutoffTopMs) return true;
      return ms && ms >= cutoffTopMs;
    })
    .map((a) => {
      const base = scoreArticleQuality(a);
      const sourceId = String(a?.source?.id || "").trim();
      const multiplier = sourceMultipliers.get(sourceId) || 1;
      const score = Math.round(base * multiplier * 100) / 100;
      return {
        id: a.id,
        title: a.title,
        summary: a.summary,
        canonicalUrl: a.canonicalUrl,
        source: { id: a.source?.id, name: a.source?.name },
        publishedAt: a.publishedAt,
        category: a.category,
        image: a.image || null,
        language: normalizeLanguageCode(a.language || "en"),
        score,
      };
    });

  topCandidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return String(b.publishedAt).localeCompare(String(a.publishedAt));
  });

  const cappedTop =
    Number.isFinite(topLimit) && topLimit > 0
      ? topCandidates.slice(0, Math.min(2000, topLimit))
      : topCandidates.slice(0, 200);
  await writeJson(path.join(INDEXES_DIR, "top.json"), cappedTop);

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

  const bySource = new Map();
  for (const article of uniqueArticles) {
    const sourceId = String(article.source?.id || "").trim();
    const sourceName = String(article.source?.name || "").trim();
    if (!sourceId) continue;

    if (!bySource.has(sourceId)) bySource.set(sourceId, []);
    const list = bySource.get(sourceId);
    if (list.length >= perCategoryLimit) continue;
    list.push({
      id: article.id,
      title: article.title,
      summary: article.summary,
      canonicalUrl: article.canonicalUrl,
      source: { id: sourceId, name: sourceName || sourceId },
      publishedAt: article.publishedAt,
      category: article.category,
      image: article.image || null,
      language: normalizeLanguageCode(article.language || "en"),
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

  for (const [sourceId, list] of bySource.entries()) {
    await writeJson(path.join(BY_SOURCE_DIR, `${sourceId}.json`), list);
  }

  const sourceRecency = Array.from(sourceLatest.entries()).map(([sourceId, ms]) => ({
    id: sourceId,
    lastPublishedAt: new Date(ms).toISOString(),
  }));

  return {
    totalArticles: uniqueArticles.length,
    duplicateIds,
    duplicateUrls,
    deletedDuplicates: duplicatePaths.length + urlDuplicatePaths.length,
    storyClusters: cappedStories.length,
    topItems: cappedTop.length,
    sourceRecency,
  };
}
