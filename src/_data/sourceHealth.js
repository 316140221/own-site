const sourcesData = require("./sources.js");
const stateData = require("./state.js");
const statsData = require("./stats.js");

const DAY_MS = 24 * 60 * 60 * 1000;

function parseIsoToMs(value) {
  const ms = Date.parse(String(value || ""));
  return Number.isFinite(ms) ? ms : null;
}

module.exports = function () {
  const sourcesList = sourcesData();
  const sources = Array.isArray(sourcesList) ? sourcesList : [];
  const state = stateData() || {};
  const stats = statsData() || null;

  const statSources = stats?.sources || {};
  const recencyMap = new Map(
    Array.isArray(stats?.indexes?.sourceRecency)
      ? stats.indexes.sourceRecency.map((item) => [item.id, item.lastPublishedAt || null])
      : []
  );
  const hasRecency = recencyMap.size > 0;
  const staleDaysRaw = Number.parseInt(String(stats?.staleSources?.days ?? "7"), 10);
  const staleDays =
    Number.isFinite(staleDaysRaw) && staleDaysRaw >= 0 ? staleDaysRaw : 7;
  const now = Date.now();
  const staleCutoff = staleDays > 0 ? now - staleDays * DAY_MS : null;

  const merged = sources.map((s) => {
    const id = s.id;
    const st = state[id] || {};
    const ss = statSources[id] || {};

    const pausedUntil = st.pausedUntil || null;
    const pausedUntilDate = pausedUntil ? new Date(String(pausedUntil)) : null;
    const isPausedFromState =
      !!pausedUntilDate &&
      !Number.isNaN(pausedUntilDate.getTime()) &&
      now < pausedUntilDate.getTime();
    const isPausedFromRun = ss.paused === true;
    const isPaused = isPausedFromState || isPausedFromRun;

    const isFailing = ss.ok === false && !ss.paused;
    const statusCode = ss.status ?? st.lastStatus ?? null;
    const tags = [];
    const seenTagKeys = new Set();
    const derivedTags = [
      s.defaultCategory || null,
      s.language || null,
      s.country || null,
    ];
    const allTags = (Array.isArray(s.tags) ? s.tags : []).concat(derivedTags);
    for (const tag of allTags) {
      const text = String(tag || "").trim();
      if (!text) continue;
      const key = text.toLowerCase();
      if (seenTagKeys.has(key)) continue;
      seenTagKeys.add(key);
      tags.push(text);
    }

    const lastArticleAt = recencyMap.get(id) || null;
    const lastArticleMs = hasRecency ? parseIsoToMs(lastArticleAt) : null;
    const isStale =
      hasRecency &&
      staleCutoff != null &&
      (lastArticleMs == null ? true : lastArticleMs < staleCutoff);
    const daysSinceArticle =
      hasRecency && lastArticleMs != null
        ? Math.floor((now - lastArticleMs) / DAY_MS)
        : null;

    return {
      id,
      name: s.name,
      enabled: s.enabled !== false,
      feedUrl: s.feedUrl,
      siteUrl: s.siteUrl || null,
      category: s.defaultCategory || "world",
      language: s.language || "en",
      country: s.country || null,
      tags,
      lastFetchAt: st.lastFetchAt || null,
      lastSuccessAt: st.lastSuccessAt || null,
      lastArticleAt,
      lastFailureAt: st.lastFailureAt || null,
      consecutiveFailures: st.consecutiveFailures || 0,
      pausedUntil,
      lastStatus: st.lastStatus || null,
      lastError: st.lastError || null,
      run: {
        ok: ss.ok ?? null,
        paused: ss.paused ?? null,
        status: ss.status ?? null,
        error: ss.error ?? null,
        fetchedAt: ss.fetchedAt ?? null,
        parsedItems: ss.parsedItems ?? null,
        added: ss.added ?? null,
        duplicates: ss.duplicates ?? null,
        skipped: ss.skipped ?? null,
      },
      isPaused,
      isFailing,
      statusCode,
      isStale,
      daysSinceArticle,
    };
  });

  merged.sort((a, b) => {
    if (a.isFailing !== b.isFailing) return a.isFailing ? -1 : 1;
    if (a.isPaused !== b.isPaused) return a.isPaused ? -1 : 1;
    if (a.isStale !== b.isStale) return a.isStale ? -1 : 1;
    const aName = String(a.name || "");
    const bName = String(b.name || "");
    return aName.localeCompare(bName);
  });

  return merged;
};
