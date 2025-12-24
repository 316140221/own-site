import { buildIndexes } from "./lib/pipeline.mjs";

const latestLimit = Number.parseInt(process.env.LATEST_LIMIT || "500", 10);
const perCategoryLimit = Number.parseInt(process.env.PER_CATEGORY_LIMIT || "500", 10);
const stats = await buildIndexes({ latestLimit, perCategoryLimit });
console.log(JSON.stringify(stats, null, 2));

