import fs from "node:fs/promises";
import path from "node:path";
import { buildIndexes, cleanupOldArticles, fetchAllSources } from "./lib/pipeline.mjs";

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
    added: fetchStats.totals.added,
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

console.log(JSON.stringify(summary, null, 2));
