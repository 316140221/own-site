const fs = require("node:fs");
const path = require("node:path");
const { DateTime } = require("luxon");
const { ASSET_KEYS } = require("./shared/assets.cjs");
const readJsonOrDefault = require("./src/_data/lib/readJsonOrDefault.js");

function normalizePathPrefix(rawPrefix) {
  const raw = String(rawPrefix || "/").trim();
  if (!raw || raw === "/") return "/";
  return `/${raw.replace(/^\/+|\/+$/g, "")}/`;
}

const PATH_PREFIX = normalizePathPrefix(process.env.PATH_PREFIX || "/");

function absoluteUrl(url, baseUrl) {
  if (!baseUrl) return url;
  try {
    return new URL(url, baseUrl).toString();
  } catch (_error) {
    return url;
  }
}

function xmlEscape(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function textToHtml(value) {
  const input = String(value ?? "").trim();
  if (!input) return "";

  const paragraphs = input.split(/\n{2,}/g).map((p) => p.trim()).filter(Boolean);
  return paragraphs
    .map((p) => `<p>${xmlEscape(p).replace(/\n/g, "<br />")}</p>`)
    .join("\n");
}

function decodeHtmlEntities(input) {
  return String(input ?? "")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'");
}

function titleCase(value) {
  return String(value ?? "")
    .trim()
    .split(/[\s_-]+/g)
    .filter(Boolean)
    .map((word) => word.slice(0, 1).toUpperCase() + word.slice(1))
    .join(" ");
}

function jsonLd(value) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function truncateText(value, maxLen = 160) {
  const input = String(value ?? "");
  const limit = Number.parseInt(String(maxLen ?? "160"), 10);
  const length = Number.isFinite(limit) && limit > 0 ? limit : 160;
  if (input.length <= length) return input;
  if (length <= 1) return "…";
  return input.slice(0, length - 1).trimEnd() + "…";
}

function withPathPrefix(urlPath) {
  const normalizedPrefix = PATH_PREFIX;
  const value = String(urlPath || "/");
  if (!value.startsWith("/")) {
    return normalizedPrefix === "/" ? `/${value}` : `${normalizedPrefix}${value}`;
  }
  if (normalizedPrefix === "/") return value;
  return `${normalizedPrefix}${value.replace(/^\/+/, "")}`;
}

function toItemListElements(items, siteUrl, limit = 10) {
  const list = Array.isArray(items) ? items : [];
  const cap = Number.isFinite(Number(limit)) ? Math.max(1, Math.min(50, Number(limit))) : 10;

  const elements = [];
  for (let i = 0; i < Math.min(list.length, cap); i += 1) {
    const item = list[i];
    const id = item && item.id ? String(item.id) : "";
    if (!id) continue;

    const title = decodeHtmlEntities(item && item.title ? String(item.title) : "").trim();
    const url = absoluteUrl(withPathPrefix(`/p/${id}/`), siteUrl);
    elements.push({
      "@type": "ListItem",
      position: i + 1,
      url,
      name: title || url,
    });
  }

  return elements;
}

function cleanTags(tags, limit = 20) {
  const list = Array.isArray(tags) ? tags : [];
  const cap = Number.isFinite(Number(limit)) ? Math.max(1, Math.min(50, Number(limit))) : 20;

  const seen = new Set();
  const out = [];
  for (const tag of list) {
    const text = decodeHtmlEntities(String(tag ?? "")).trim();
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(text);
    if (out.length >= cap) break;
  }

  return out;
}

module.exports = function (eleventyConfig) {
  eleventyConfig.setNunjucksEnvironmentOptions({ autoescape: true });

  const assetManifest = readJsonOrDefault(
    path.resolve(process.cwd(), "build/asset-manifest.json"),
    null
  );
  const buildAssetDir = path.resolve(process.cwd(), "build/assets");
  const entries =
    assetManifest && assetManifest.entries && typeof assetManifest.entries === "object"
      ? assetManifest.entries
      : null;
  const requiredKeys = ASSET_KEYS;

  function buildAssetExists(assetPath) {
    const value = String(assetPath || "").trim();
    if (!value) return false;
    if (/^https?:\/\//i.test(value)) return false;
    if (value.startsWith("//")) return false;
    const cleaned = value.split(/[?#]/, 1)[0];
    if (!cleaned) return false;
    const basename = path.basename(cleaned);
    if (!basename) return false;
    const fullPath = path.join(buildAssetDir, basename);
    try {
      return fs.statSync(fullPath).isFile();
    } catch (_error) {
      return false;
    }
  }

  const useHashedAssets =
    !!entries &&
    requiredKeys.every((key) => {
      const value = entries[key];
      return typeof value === "string" && value.trim() && buildAssetExists(value);
    });

  if (useHashedAssets) {
    eleventyConfig.addPassthroughCopy({ "build/assets": "assets" });
    eleventyConfig.addPassthroughCopy({ "src/assets/favicon.svg": "assets/favicon.svg" });
  } else {
    eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  }
  if (fs.existsSync("CNAME")) eleventyConfig.addPassthroughCopy("CNAME");
  if (fs.existsSync(".nojekyll")) eleventyConfig.addPassthroughCopy(".nojekyll");

  eleventyConfig.addFilter("formatDate", (value) => {
    if (!value) return "";
    const date =
      value instanceof Date ? value : DateTime.fromISO(String(value)).toJSDate();
    return DateTime.fromJSDate(date, { zone: "utc" }).toFormat("yyyy-LL-dd");
  });

  eleventyConfig.addFilter("formatDateTime", (value) => {
    if (!value) return "";
    const date =
      value instanceof Date ? value : DateTime.fromISO(String(value)).toJSDate();
    return DateTime.fromJSDate(date, { zone: "utc" }).toFormat(
      "yyyy-LL-dd HH:mm 'UTC'"
    );
  });

  eleventyConfig.addFilter("absoluteUrl", (url, baseUrl) =>
    absoluteUrl(url, baseUrl)
  );

  eleventyConfig.addFilter("xmlEscape", (value) => xmlEscape(value));
  eleventyConfig.addFilter("textToHtml", (value) => textToHtml(value));
  eleventyConfig.addFilter("decodeEntities", (value) => decodeHtmlEntities(value));
  eleventyConfig.addFilter("titleCase", (value) => titleCase(value));
  eleventyConfig.addFilter("jsonLd", (value) => jsonLd(value));
  eleventyConfig.addFilter("truncateText", (value, maxLen) => truncateText(value, maxLen));
  eleventyConfig.addFilter("toItemListElements", (items, siteUrl, limit) =>
    toItemListElements(items, siteUrl, limit)
  );
  eleventyConfig.addFilter("cleanTags", (tags, limit) => cleanTags(tags, limit));

  eleventyConfig.addFilter("rfc822", (value) => {
    if (!value) return "";
    const date = value instanceof Date ? value : new Date(String(value));
    if (Number.isNaN(date.getTime())) return "";
    return date.toUTCString();
  });

  eleventyConfig.addFilter("readJson", (relativePath) => {
    if (!relativePath) return null;
    const filePath = path.resolve(process.cwd(), String(relativePath));
    return readJsonOrDefault(filePath, null);
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "dist",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "11ty.js"],
    pathPrefix: PATH_PREFIX,
  };
};
