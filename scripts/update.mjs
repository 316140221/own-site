import fs from "node:fs/promises";
import path from "node:path";
import { buildIndexes, cleanupOldArticles, fetchAllSources } from "./lib/pipeline.mjs";
import { updateAmazonData } from "./lib/amazon.mjs";
import { boolFromEnv, intFromEnv, stringFromEnv } from "./lib/env.mjs";

function formatMarkdownSummary(summary) {
  const finishedAt = summary?.finishedAt || "";
  const fetch = summary?.fetch || {};
  const cleanup = summary?.cleanup || {};
  const indexes = summary?.indexes || {};

  const lines = [];
  lines.push("## News Atlas update");
  if (finishedAt) lines.push(`- Finished: \`${finishedAt}\``);
  lines.push(
    `- Sources: **${fetch.ok || 0} OK**, **${fetch.failed || 0} failed**, **${
      fetch.paused || 0
    } paused**`
  );
  lines.push(
    `- Items: **${fetch.added || 0} added**, **${fetch.backfilled || 0} backfilled**, **${
      fetch.duplicates || 0
    } duplicates**, **${fetch.skipped || 0} skipped**`
  );
  if (typeof fetch.retries === "number") {
    lines.push(`- Retries: **${fetch.retries}**`);
  }
  if (typeof cleanup.removedCount === "number") {
    lines.push(`- Cleanup: deleted **${cleanup.removedCount}** files`);
  }
  if (typeof indexes.totalArticles === "number") {
    lines.push(`- Indexed articles: **${indexes.totalArticles}**`);
  }
  if (typeof indexes.deletedDuplicates === "number" && indexes.deletedDuplicates > 0) {
    lines.push(`- Dedup: deleted **${indexes.deletedDuplicates}** duplicate files`);
  }
  if (typeof indexes.storyClusters === "number") {
    lines.push(`- Stories: **${indexes.storyClusters}**`);
  }
  if (typeof indexes.topItems === "number") {
    lines.push(`- Top index: **${indexes.topItems}**`);
  }

  const sources = summary?.sources || {};
  const stale = summary?.staleSources || null;
  const failures = Object.entries(sources)
    .filter(([, s]) => s && s.ok === false && !s.paused)
    .map(([id, s]) => `- \`${id}\`: ${s.status || "n/a"} ${s.error || ""}`.trim());
  const paused = Object.entries(sources)
    .filter(([, s]) => s && s.paused)
    .map(([id, s]) => `- \`${id}\`: ${s.error || "Paused"}`.trim());

  const staleItems = Array.isArray(stale?.items) ? stale.items : [];
  if (staleItems.length) {
    lines.push("");
    lines.push(
      `### Stale sources (>${stale?.days || 7}d no new articles)`
    );
    lines.push(
      ...staleItems.map(
        (item) =>
          `- \`${item.id}\`${item.name ? ` (${item.name})` : ""}: last article ${item.lastPublishedAt || "unknown"}`
      )
    );
  }

  if (paused.length) {
    lines.push("");
    lines.push("### Paused sources");
    lines.push(...paused);
  }
  if (failures.length) {
    lines.push("");
    lines.push("### Failed sources");
    lines.push(...failures);
  }

  lines.push("");
  return lines.join("\n");
}

const retentionDays = intFromEnv("RETENTION_DAYS", 90, { min: 1, max: 3650 });
const maxItemsPerFeed = intFromEnv("MAX_ITEMS_PER_FEED", 80, { min: 1, max: 500 });
const archiveOld = boolFromEnv("ARCHIVE_OLD", false);
const archiveDir = stringFromEnv("ARCHIVE_DIR", "archives");

const fetchStats = await fetchAllSources({ maxItemsPerFeed });
const totalRetries = Object.values(fetchStats.sources || {}).reduce(
  (sum, s) => sum + (Number(s?.retries) || 0),
  0
);
const cleanupStats = await cleanupOldArticles({
  retentionDays,
  archive: archiveOld,
  archiveDir,
});
const indexStats = await buildIndexes({});
let amazonStats = null;
try {
  amazonStats = await updateAmazonData();
} catch (error) {
  amazonStats = {
    ok: false,
    error: error?.message || String(error),
  };
}

let sourceNameMap = new Map();
try {
  const sourcesJson = await fs.readFile(path.resolve(process.cwd(), "data/sources.json"), "utf8");
  const sources = JSON.parse(sourcesJson);
  if (Array.isArray(sources)) {
    sourceNameMap = new Map(
      sources
        .filter((s) => s && s.id)
        .map((s) => [String(s.id), String(s.name || "")])
    );
  }
} catch (_error) {
  sourceNameMap = new Map();
}

const staleDays = intFromEnv("STALE_SOURCE_DAYS", 7, { min: 0, max: 3650 });
const staleCutoff =
  staleDays > 0 ? Date.now() - staleDays * 24 * 60 * 60 * 1000 : null;
const recencyMap = new Map(
  Array.isArray(indexStats?.sourceRecency)
    ? indexStats.sourceRecency.map((item) => [item.id, Date.parse(String(item.lastPublishedAt || ""))])
    : []
);
const staleItems = [];
if (staleCutoff != null) {
  for (const sourceId of Object.keys(fetchStats.sources || {})) {
    const ms = recencyMap.get(sourceId);
    const lastPublishedAt =
      Number.isFinite(ms) && ms > 0 ? new Date(ms).toISOString() : null;
    const isStale = !Number.isFinite(ms) || ms < staleCutoff;
    if (isStale) {
      staleItems.push({
        id: sourceId,
        name: sourceNameMap.get(sourceId) || null,
        lastPublishedAt,
        daysSinceLastArticle:
          Number.isFinite(ms) && ms > 0
            ? Math.floor((Date.now() - ms) / (24 * 60 * 60 * 1000))
            : null,
      });
    }
  }
}

staleItems.sort((a, b) => {
  const aDays = Number.isFinite(a?.daysSinceLastArticle) ? a.daysSinceLastArticle : -1;
  const bDays = Number.isFinite(b?.daysSinceLastArticle) ? b.daysSinceLastArticle : -1;
  if (aDays !== bDays) return bDays - aDays;
  return String(a?.id || "").localeCompare(String(b?.id || ""));
});

const staleSources = {
  days: staleDays,
  total: staleItems.length,
  items: staleItems,
};

const summary = {
  startedAt: fetchStats.startedAt,
  finishedAt: fetchStats.finishedAt,
  fetch: {
    sources: fetchStats.totals.sources,
    ok: fetchStats.totals.ok,
    failed: fetchStats.totals.failed,
    paused: fetchStats.totals.paused || 0,
    added: fetchStats.totals.added,
    backfilled: fetchStats.totals.backfilled || 0,
    duplicates: fetchStats.totals.duplicates,
    skipped: fetchStats.totals.skipped,
    retries: totalRetries,
  },
  cleanup: cleanupStats,
  indexes: indexStats,
  amazon: amazonStats,
  sources: fetchStats.sources,
  staleSources,
};

await fs.mkdir(path.resolve(process.cwd(), "data/indexes"), { recursive: true });
await fs.writeFile(
  path.resolve(process.cwd(), "data/indexes/stats.json"),
  JSON.stringify(summary, null, 2) + "\n",
  "utf8"
);

const historyDays = intFromEnv("RUN_HISTORY_DAYS", 30, { min: 0, max: 3650 });
if (Number.isFinite(historyDays) && historyDays > 0) {
  const runsDir = path.resolve(process.cwd(), "data/indexes/runs");
  await fs.mkdir(runsDir, { recursive: true });
  const runId = String(summary.finishedAt || new Date().toISOString()).replace(
    /[:.]/g,
    "-"
  );
  await fs.writeFile(
    path.join(runsDir, `${runId}.json`),
    JSON.stringify(summary, null, 2) + "\n",
    "utf8"
  );

  const cutoffMs = Date.now() - historyDays * 24 * 60 * 60 * 1000;
  const entries = await fs.readdir(runsDir);
  await Promise.all(
    entries
      .filter((name) => name.endsWith(".json"))
      .map(async (name) => {
        const fullPath = path.join(runsDir, name);
        try {
          const stat = await fs.stat(fullPath);
          if (stat.mtimeMs < cutoffMs) await fs.unlink(fullPath);
        } catch {
          // ignore
        }
      })
  );
}

const stepSummaryPath = stringFromEnv("GITHUB_STEP_SUMMARY", "");
if (stepSummaryPath) {
  await fs.appendFile(stepSummaryPath, formatMarkdownSummary(summary), "utf8");
}

console.log(JSON.stringify(summary, null, 2));
