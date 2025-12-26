import fs from "node:fs/promises";
import path from "node:path";
import { buildIndexes, cleanupOldArticles, fetchAllSources } from "./lib/pipeline.mjs";

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
  if (typeof cleanup.deletedFiles === "number") {
    lines.push(`- Cleanup: deleted **${cleanup.deletedFiles}** files`);
  }
  if (typeof indexes.totalArticles === "number") {
    lines.push(`- Indexed articles: **${indexes.totalArticles}**`);
  }
  if (typeof indexes.deletedDuplicates === "number" && indexes.deletedDuplicates > 0) {
    lines.push(`- Dedup: deleted **${indexes.deletedDuplicates}** duplicate files`);
  }

  const sources = summary?.sources || {};
  const failures = Object.entries(sources)
    .filter(([, s]) => s && s.ok === false && !s.paused)
    .map(([id, s]) => `- \`${id}\`: ${s.status || "n/a"} ${s.error || ""}`.trim());
  const paused = Object.entries(sources)
    .filter(([, s]) => s && s.paused)
    .map(([id, s]) => `- \`${id}\`: ${s.error || "Paused"}`.trim());

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

const retentionDays = Number.parseInt(process.env.RETENTION_DAYS || "90", 10);
const maxItemsPerFeed = Number.parseInt(process.env.MAX_ITEMS_PER_FEED || "80", 10);
const archiveOld =
  String(process.env.ARCHIVE_OLD || "").toLowerCase() === "1" ||
  String(process.env.ARCHIVE_OLD || "").toLowerCase() === "true";
const archiveDir = process.env.ARCHIVE_DIR || "archives";

const fetchStats = await fetchAllSources({ maxItemsPerFeed });
const cleanupStats = await cleanupOldArticles({
  retentionDays,
  archive: archiveOld,
  archiveDir,
});
const indexStats = await buildIndexes({});

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
  },
  cleanup: cleanupStats,
  indexes: indexStats,
  sources: fetchStats.sources,
};

await fs.mkdir(path.resolve(process.cwd(), "data/indexes"), { recursive: true });
await fs.writeFile(
  path.resolve(process.cwd(), "data/indexes/stats.json"),
  JSON.stringify(summary, null, 2) + "\n",
  "utf8"
);

const historyDays = Number.parseInt(process.env.RUN_HISTORY_DAYS || "30", 10);
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

const stepSummaryPath = process.env.GITHUB_STEP_SUMMARY;
if (stepSummaryPath) {
  await fs.appendFile(stepSummaryPath, formatMarkdownSummary(summary), "utf8");
}

console.log(JSON.stringify(summary, null, 2));
