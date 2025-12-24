import { cleanupOldArticles } from "./lib/pipeline.mjs";

const retentionDays = Number.parseInt(process.env.RETENTION_DAYS || "90", 10);
const stats = await cleanupOldArticles({ retentionDays });
console.log(JSON.stringify(stats, null, 2));

