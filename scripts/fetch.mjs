import { fetchAllSources } from "./lib/pipeline.mjs";
import { intFromEnv } from "./lib/env.mjs";

const maxItemsPerFeed = intFromEnv("MAX_ITEMS_PER_FEED", 80, { min: 1, max: 500 });
const stats = await fetchAllSources({ maxItemsPerFeed });
console.log(JSON.stringify(stats, null, 2));

