import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, "amazon.config.json");
const OUTPUT_PATH = path.join(ROOT, "data/amazon/items.json");

function nowIso() {
  return new Date().toISOString();
}

function toAmzDate(date = new Date()) {
  const yyyy = String(date.getUTCFullYear());
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mi = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}T${hh}${mi}${ss}Z`;
}

function sha256Hex(input) {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

function hmacSha256(key, data, encoding) {
  const result = crypto.createHmac("sha256", key).update(data, "utf8");
  return encoding ? result.digest(encoding) : result.digest();
}

function getSignatureKey(secretKey, dateStamp, region, service) {
  const kDate = hmacSha256(`AWS4${secretKey}`, dateStamp);
  const kRegion = hmacSha256(kDate, region);
  const kService = hmacSha256(kRegion, service);
  const kSigning = hmacSha256(kService, "aws4_request");
  return kSigning;
}

async function readJsonOrNull(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch {
    return null;
  }
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
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

function chunk(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

function buildAffiliateUrl({ domain, asin, associateTag }) {
  const normalizedAsin = normalizeAsin(asin);
  if (!domain || !normalizedAsin) return null;
  const url = new URL(`https://${domain}/dp/${normalizedAsin}/`);
  if (associateTag) url.searchParams.set("tag", associateTag);
  return url.toString();
}

function pickPrimaryImage(apiItem) {
  return (
    apiItem?.Images?.Primary?.Large?.URL ||
    apiItem?.Images?.Primary?.Medium?.URL ||
    apiItem?.Images?.Primary?.Small?.URL ||
    null
  );
}

function pickTitle(apiItem) {
  return apiItem?.ItemInfo?.Title?.DisplayValue || null;
}

function pickPrice(apiItem) {
  const listing = apiItem?.Offers?.Listings?.[0] || null;
  const price = listing?.Price || null;
  if (!price) return null;
  const display = price.DisplayAmount || null;
  const amount = typeof price.Amount === "number" ? price.Amount : null;
  const currency = price.Currency || null;
  if (!display && amount == null && !currency) return null;
  return { display, amount, currency };
}

function pickCustomerReviews(apiItem) {
  const starRating =
    typeof apiItem?.CustomerReviews?.StarRating === "number"
      ? apiItem.CustomerReviews.StarRating
      : null;
  const count =
    typeof apiItem?.CustomerReviews?.Count === "number" ? apiItem.CustomerReviews.Count : null;
  if (starRating == null && count == null) return null;
  return { starRating, count };
}

async function fetchPaapiGetItems({
  host,
  region,
  marketplace,
  accessKey,
  secretKey,
  partnerTag,
  itemIds,
} = {}) {
  const service = "ProductAdvertisingAPI";
  const method = "POST";
  const canonicalUri = "/paapi5/getitems";
  const url = `https://${host}${canonicalUri}`;

  const bodyObj = {
    ItemIds: itemIds,
    PartnerTag: partnerTag,
    PartnerType: "Associates",
    Marketplace: marketplace,
    Resources: [
      "ItemInfo.Title",
      "Images.Primary.Large",
      "Offers.Listings.Price",
      "CustomerReviews.Count",
      "CustomerReviews.StarRating",
    ],
  };
  const body = JSON.stringify(bodyObj);

  const amzDate = toAmzDate();
  const dateStamp = amzDate.slice(0, 8);
  const amzTarget = "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems";
  const contentType = "application/json; charset=utf-8";
  const contentEncoding = "amz-1.0";

  const headersForSigning = {
    "content-encoding": contentEncoding,
    "content-type": contentType,
    host: host,
    "x-amz-date": amzDate,
    "x-amz-target": amzTarget,
  };

  const sortedHeaderKeys = Object.keys(headersForSigning).sort();
  const canonicalHeaders = sortedHeaderKeys
    .map((key) => `${key}:${String(headersForSigning[key]).trim()}\n`)
    .join("");
  const signedHeaders = sortedHeaderKeys.join(";");

  const payloadHash = sha256Hex(body);
  const canonicalRequest = [
    method,
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  const signingKey = getSignatureKey(secretKey, dateStamp, region, service);
  const signature = hmacSha256(signingKey, stringToSign, "hex");
  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(url, {
    method,
    headers: {
      "content-type": contentType,
      "content-encoding": contentEncoding,
      "x-amz-date": amzDate,
      "x-amz-target": amzTarget,
      authorization,
    },
    body,
  });

  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    // ignore
  }
  if (!res.ok) {
    const message =
      json?.Errors?.[0]?.Message ||
      json?.message ||
      json?.Message ||
      `HTTP ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.body = text;
    throw error;
  }

  return json;
}

export async function updateAmazonData() {
  const startedAt = nowIso();
  const config = (await readJsonOrNull(CONFIG_PATH)) || {};

  const enabled = config?.enabled === true;
  const rawItems = Array.isArray(config?.items) ? config.items : [];
  const items = uniqBy(
    rawItems
      .map((item) => ({
        ...item,
        asin: normalizeAsin(item?.asin),
      }))
      .filter((item) => item.asin),
    (item) => item.asin
  );

  const marketplaceDomain = String(
    process.env.AMAZON_PAAPI_MARKETPLACE ||
      process.env.AMAZON_MARKETPLACE_DOMAIN ||
      config?.marketplace?.domain ||
      "www.amazon.com"
  ).trim();
  const host = String(
    process.env.AMAZON_PAAPI_HOST || config?.marketplace?.host || "webservices.amazon.com"
  ).trim();
  const region = String(
    process.env.AMAZON_PAAPI_REGION || config?.marketplace?.region || "us-east-1"
  ).trim();
  const marketplace = marketplaceDomain;

  const associateTag = String(
    process.env.AMAZON_ASSOCIATE_TAG ||
      process.env.AMAZON_PAAPI_PARTNER_TAG ||
      config?.associateTag ||
      ""
  ).trim();

  const accessKey = String(process.env.AMAZON_PAAPI_ACCESS_KEY || "").trim();
  const secretKey = String(process.env.AMAZON_PAAPI_SECRET_KEY || "").trim();
  const partnerTag = String(process.env.AMAZON_PAAPI_PARTNER_TAG || associateTag || "").trim();

  const baseOutput = {
    updatedAt: nowIso(),
    startedAt,
    enabled,
    mode: "disabled",
    marketplace: { domain: marketplaceDomain, host, region },
    associateTag: associateTag || null,
    items: [],
    errors: [],
  };

  if (!enabled) {
    await writeJson(OUTPUT_PATH, baseOutput);
    return {
      ok: true,
      skipped: true,
      reason: "disabled",
      enabled,
      mode: baseOutput.mode,
      updatedAt: baseOutput.updatedAt,
      itemCount: 0,
      errorCount: 0,
    };
  }

  if (items.length === 0) {
    const out = { ...baseOutput, mode: "empty" };
    await writeJson(OUTPUT_PATH, out);
    return {
      ok: true,
      skipped: true,
      reason: "no-items",
      enabled,
      mode: out.mode,
      updatedAt: out.updatedAt,
      itemCount: 0,
      errorCount: 0,
    };
  }

  const canUsePaapi = Boolean(accessKey && secretKey && partnerTag && host && region && marketplace);

  if (!canUsePaapi) {
    const outItems = items.map((item) => ({
      asin: item.asin,
      title: item.title || null,
      image: item.image || null,
      url: buildAffiliateUrl({ domain: marketplaceDomain, asin: item.asin, associateTag }),
      note: item.note || null,
      updatedAt: baseOutput.updatedAt,
      source: "config",
    }));
    const out = { ...baseOutput, mode: "link-only", items: outItems };
    await writeJson(OUTPUT_PATH, out);
    return {
      ok: true,
      skipped: true,
      reason: "missing-paapi-creds",
      enabled,
      mode: out.mode,
      updatedAt: out.updatedAt,
      itemCount: out.items.length,
      errorCount: 0,
    };
  }

  const ids = items.map((item) => item.asin);
  const idChunks = chunk(ids, 10);

  const byAsin = new Map();
  const errors = [];
  for (const group of idChunks) {
    try {
      const json = await fetchPaapiGetItems({
        host,
        region,
        marketplace,
        accessKey,
        secretKey,
        partnerTag,
        itemIds: group,
      });

      const apiItems = json?.ItemsResult?.Items || [];
      for (const apiItem of apiItems) {
        const asin = normalizeAsin(apiItem?.ASIN);
        if (!asin) continue;

        const reviews = pickCustomerReviews(apiItem);
        byAsin.set(asin, {
          asin,
          title: pickTitle(apiItem),
          image: pickPrimaryImage(apiItem),
          url: apiItem?.DetailPageURL || null,
          price: pickPrice(apiItem),
          rating: reviews?.starRating ?? null,
          reviewCount: reviews?.count ?? null,
          updatedAt: baseOutput.updatedAt,
          source: "paapi",
        });
      }

      const apiErrors = Array.isArray(json?.Errors) ? json.Errors : [];
      for (const err of apiErrors) {
        errors.push({
          code: err?.Code || null,
          message: err?.Message || null,
        });
      }
    } catch (error) {
      errors.push({
        code: "RequestError",
        message: error?.message || String(error),
      });
    }
  }

  const outItems = items.map((item) => {
    const api = byAsin.get(item.asin) || null;
    return {
      asin: item.asin,
      title: item.title || api?.title || null,
      image: item.image || api?.image || null,
      url:
        api?.url ||
        buildAffiliateUrl({ domain: marketplaceDomain, asin: item.asin, associateTag }),
      price: api?.price || null,
      rating: api?.rating ?? null,
      reviewCount: api?.reviewCount ?? null,
      note: item.note || null,
      updatedAt: baseOutput.updatedAt,
      source: api ? "paapi" : "mixed",
    };
  });

  const out = {
    ...baseOutput,
    mode: "paapi",
    items: outItems,
    errors,
  };
  await writeJson(OUTPUT_PATH, out);
  return {
    ok: true,
    skipped: false,
    enabled,
    mode: out.mode,
    updatedAt: out.updatedAt,
    itemCount: out.items.length,
    errorCount: out.errors.length,
  };
}
