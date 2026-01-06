const fs = require("node:fs");
const path = require("node:path");

function readJsonOrDefault(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (_error) {
    return fallback;
  }
}

function normalizeNumber(value, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return n;
}

module.exports = function () {
  const runsDir = path.resolve(process.cwd(), "data/indexes/runs");
  let names = [];
  try {
    names = fs.readdirSync(runsDir);
  } catch (_error) {
    return { runs: [], maxAdded: 0, maxFailed: 0 };
  }

  const runs = names
    .filter((name) => name.endsWith(".json"))
    .map((name) => {
      const filePath = path.join(runsDir, name);
      const data = readJsonOrDefault(filePath, null);
      if (!data || typeof data !== "object") return null;

      const finishedAt = data.finishedAt || null;
      const fetch = data.fetch || {};

      const added = normalizeNumber(fetch.added);
      const failed = normalizeNumber(fetch.failed);
      const paused = normalizeNumber(fetch.paused);
      const retries = normalizeNumber(fetch.retries);

      return {
        id: name.replace(/\.json$/, ""),
        finishedAt,
        ok: normalizeNumber(fetch.ok),
        failed,
        paused,
        retries,
        added,
        duplicates: normalizeNumber(fetch.duplicates),
        backfilled: normalizeNumber(fetch.backfilled),
        skipped: normalizeNumber(fetch.skipped),
        totalArticles: normalizeNumber(data.indexes?.totalArticles),
        storyClusters: normalizeNumber(data.indexes?.storyClusters),
        topItems: normalizeNumber(data.indexes?.topItems),
        cleanupRemoved: normalizeNumber(data.cleanup?.removedCount),
      };
    })
    .filter(Boolean)
    .sort((a, b) => String(b.finishedAt || "").localeCompare(String(a.finishedAt || "")));

  const limited = runs.slice(0, 60);
  const maxAdded = limited.reduce((max, run) => Math.max(max, run.added), 0);
  const maxFailed = limited.reduce((max, run) => Math.max(max, run.failed), 0);

  for (const run of limited) {
    run.addedPct = maxAdded ? Math.max(0, Math.min(1, run.added / maxAdded)) : 0;
    run.failedPct = maxFailed ? Math.max(0, Math.min(1, run.failed / maxFailed)) : 0;
  }

  return { runs: limited, maxAdded, maxFailed };
};
