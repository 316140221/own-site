const path = require("node:path");

const readJsonOrDefault = require("./lib/readJsonOrDefault.js");

function normalizeAsin(value) {
  return String(value || "").trim().toUpperCase();
}

function normalizeTagLabel(value) {
  return String(value || "").trim();
}

function normalizeTagId(label) {
  return String(label || "").trim().toLowerCase();
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

function parseNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number.parseFloat(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function clampNumber(value, min, max) {
  const n = parseNumber(value);
  if (n == null) return null;
  return Math.min(max, Math.max(min, n));
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

  const featuredLimit =
    clampNumber(config?.featuredLimit, 1, 24) ??
    clampNumber(process.env.AMAZON_FEATURED_LIMIT, 1, 24) ??
    4;

  const configGroups = Array.isArray(config?.groups) ? config.groups : [];
  const groupLabelById = new Map(
    configGroups
      .map((g) => {
        const id = String(g?.id || "").trim();
        const label = String(g?.label || "").trim();
        if (!id) return null;
        return [id, label || id];
      })
      .filter(Boolean)
  );

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

      const groupId = String(item?.group || "").trim() || "picks";
      const groupLabel = groupLabelById.get(groupId) || groupId;

      const tagsInput = Array.isArray(item?.tags) ? item.tags : [];
      const tagsLabels = tagsInput
        .map((t) => normalizeTagLabel(t))
        .filter(Boolean)
        .slice(0, 20);
      const tagIds = Array.from(
        new Set(tagsLabels.map((label) => normalizeTagId(label)).filter(Boolean))
      );

      const affiliateUrl = buildAffiliateUrl({
        domain: marketplaceDomain,
        asin,
        associateTag,
      });
      const goPath = `/go/${asin.toLowerCase()}/`;

      return {
        asin,
        groupId,
        groupLabel,
        tags: tagsLabels,
        tagIds,
        featured: item?.featured === true,
        rank: parseNumber(item?.rank) ?? 9999,
        title: item?.title || fromData?.title || null,
        image: item?.image || fromData?.image || null,
        affiliateUrl,
        goPath,
        price: fromData?.price || null,
        rating:
          typeof fromData?.rating === "number" ? fromData.rating : null,
        reviewCount:
          typeof fromData?.reviewCount === "number" ? fromData.reviewCount : null,
        note: item?.note || fromData?.note || null,
      };
    })
    .filter((item) => item.asin && item.affiliateUrl && item.goPath);

  mergedItems.sort((a, b) => {
    if ((a.featured ? 0 : 1) !== (b.featured ? 0 : 1)) return (a.featured ? 0 : 1) - (b.featured ? 0 : 1);
    if (a.rank !== b.rank) return a.rank - b.rank;
    return a.asin.localeCompare(b.asin);
  });

  const activeItems = enabled ? mergedItems : [];

  const featured = [];
  const featuredSet = new Set();
  for (const item of activeItems) {
    if (!item.featured) continue;
    if (featured.length >= featuredLimit) break;
    featured.push(item);
    featuredSet.add(item.asin);
  }
  for (const item of activeItems) {
    if (featured.length >= featuredLimit) break;
    if (featuredSet.has(item.asin)) continue;
    featured.push(item);
    featuredSet.add(item.asin);
  }

  const tagsMap = new Map();
  for (const item of activeItems) {
    for (const tagId of item.tagIds || []) {
      const existing = tagsMap.get(tagId);
      if (existing) existing.count += 1;
      else {
        const label =
          (item.tags || []).find((t) => normalizeTagId(t) === tagId) || tagId;
        tagsMap.set(tagId, { id: tagId, label, count: 1 });
      }
    }
  }
  const tags = Array.from(tagsMap.values()).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.label.localeCompare(b.label);
  });

  const groupsOrder = [];
  for (const g of configGroups) {
    const id = String(g?.id || "").trim();
    if (id) groupsOrder.push(id);
  }
  for (const item of activeItems) {
    if (!groupsOrder.includes(item.groupId)) groupsOrder.push(item.groupId);
  }

  const itemsByGroupId = new Map();
  for (const item of activeItems) {
    const arr = itemsByGroupId.get(item.groupId) || [];
    arr.push(item);
    itemsByGroupId.set(item.groupId, arr);
  }

  const groups = groupsOrder
    .map((id) => {
      const items = itemsByGroupId.get(id) || [];
      if (!items.length) return null;
      const label = groupLabelById.get(id) || id;
      return { id, label, items };
    })
    .filter(Boolean);

  return {
    enabled,
    mode: data?.mode || null,
    updatedAt: data?.updatedAt || null,
    marketplace: {
      domain: marketplaceDomain,
    },
    associateTag: associateTag || null,
    featuredLimit,
    items: mergedItems,
    activeItems,
    featuredItems: featured,
    tags,
    groups,
    errors: Array.isArray(data?.errors) ? data.errors : [],
  };
};
