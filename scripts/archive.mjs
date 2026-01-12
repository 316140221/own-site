import { cleanupOldArticles } from "./lib/pipeline.mjs";
import { intFromEnv, stringFromEnv } from "./lib/env.mjs";

const retentionDays = intFromEnv("RETENTION_DAYS", 90, { min: 1, max: 3650 });
const archiveDir = stringFromEnv("ARCHIVE_DIR", "archives");

const stats = await cleanupOldArticles({
  retentionDays,
  archive: true,
  archiveDir,
});

console.log(JSON.stringify(stats, null, 2));

