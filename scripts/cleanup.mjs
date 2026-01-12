import { cleanupOldArticles } from "./lib/pipeline.mjs";
import { intFromEnv } from "./lib/env.mjs";

const retentionDays = intFromEnv("RETENTION_DAYS", 90, { min: 1, max: 3650 });
const stats = await cleanupOldArticles({ retentionDays });
console.log(JSON.stringify(stats, null, 2));

