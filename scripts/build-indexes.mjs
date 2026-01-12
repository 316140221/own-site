import { buildIndexes } from "./lib/pipeline.mjs";
import { intFromEnv } from "./lib/env.mjs";

const latestLimit = intFromEnv("LATEST_LIMIT", 500, { min: 1, max: 10000 });
const perCategoryLimit = intFromEnv("PER_CATEGORY_LIMIT", 500, { min: 1, max: 10000 });
const stats = await buildIndexes({ latestLimit, perCategoryLimit });
console.log(JSON.stringify(stats, null, 2));

