const fs = require("node:fs");
const path = require("node:path");

function readJsonOrDefault(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (_error) {
    return fallback;
  }
}

function normalizeAsin(value) {
  return String(value || "").trim().toUpperCase();
}

function uniqBy(items, getKey) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const key = getKey(item);
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function buildAffiliateUrl({ domain, asin, associateTag }) {
  const normalizedAsin = normalizeAsin(asin);
  if (!domain || !normalizedAsin) return null;
  try {
    const url = new URL(`https://${domain}/dp/${normalizedAsin}/`);
    if (associateTag) url.searchParams.set("tag", associateTag);
    return url.toString();
  } catch (_error) {
    return null;
  }
}

module.exports = function () {
  const configPath = path.resolve(process.cwd(), "amazon.config.json");
  const config = readJsonOrDefault(configPath, {});

  const dataPath = path.resolve(process.cwd(), "data/amazon/items.json");
  const data = readJsonOrDefault(dataPath, {});

  const enabled = config?.enabled === true;
  const marketplaceDomain = String(
    process.env.AMAZON_PAAPI_MARKETPLACE ||
      process.env.AMAZON_MARKETPLACE_DOMAIN ||
      config?.marketplace?.domain ||
      data?.marketplace?.domain ||
      "www.amazon.com"
  ).trim();
  const associateTag = String(
    process.env.AMAZON_ASSOCIATE_TAG ||
      process.env.AMAZON_PAAPI_PARTNER_TAG ||
      config?.associateTag ||
      data?.associateTag ||
      ""
  ).trim();

  const configItems = Array.isArray(config?.items) ? config.items : [];
  const dataItems = Array.isArray(data?.items) ? data.items : [];
  const dataByAsin = new Map(
    dataItems
      .map((item) => {
        const asin = normalizeAsin(item?.asin);
        return asin ? [asin, item] : null;
      })
      .filter(Boolean)
  );

  const normalizedConfigItems = uniqBy(
    configItems
      .map((item) => ({ ...item, asin: normalizeAsin(item?.asin) }))
      .filter((item) => item.asin),
    (item) => item.asin
  );

  const sourceItems = normalizedConfigItems.length ? normalizedConfigItems : dataItems;
  const mergedItems = sourceItems
    .map((item) => {
      const asin = normalizeAsin(item?.asin);
      const fromData = asin ? dataByAsin.get(asin) : null;

      const url =
        item?.url ||
        fromData?.url ||
        buildAffiliateUrl({ domain: marketplaceDomain, asin, associateTag });

      return {
        asin,
        title: item?.title || fromData?.title || null,
        image: item?.image || fromData?.image || null,
        url,
        price: fromData?.price || null,
        rating:
          typeof fromData?.rating === "number" ? fromData.rating : null,
        reviewCount:
          typeof fromData?.reviewCount === "number" ? fromData.reviewCount : null,
        note: item?.note || fromData?.note || null,
      };
    })
    .filter((item) => item.asin && item.url);

  return {
    enabled,
    mode: data?.mode || null,
    updatedAt: data?.updatedAt || null,
    marketplace: {
      domain: marketplaceDomain,
    },
    associateTag: associateTag || null,
    items: mergedItems,
    errors: Array.isArray(data?.errors) ? data.errors : [],
  };
};
