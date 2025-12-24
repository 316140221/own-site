import { cleanupOldArticles } from "./lib/pipeline.mjs";

const retentionDays = Number.parseInt(process.env.RETENTION_DAYS || "90", 10);
const archiveDir = process.env.ARCHIVE_DIR || "archives";

const stats = await cleanupOldArticles({
  retentionDays,
  archive: true,
  archiveDir,
});

console.log(JSON.stringify(stats, null, 2));

