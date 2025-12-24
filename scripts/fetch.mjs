import { fetchAllSources } from "./lib/pipeline.mjs";

const maxItemsPerFeed = Number.parseInt(process.env.MAX_ITEMS_PER_FEED || "80", 10);
const stats = await fetchAllSources({ maxItemsPerFeed });
console.log(JSON.stringify(stats, null, 2));

