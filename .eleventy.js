const fs = require("node:fs");
const path = require("node:path");
const { DateTime } = require("luxon");

function safeReadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (_error) {
    return null;
  }
}

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

module.exports = function (eleventyConfig) {
  eleventyConfig.setNunjucksEnvironmentOptions({ autoescape: true });

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
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

  eleventyConfig.addFilter("rfc822", (value) => {
    if (!value) return "";
    const date = value instanceof Date ? value : new Date(String(value));
    if (Number.isNaN(date.getTime())) return "";
    return date.toUTCString();
  });

  eleventyConfig.addFilter("readJson", (relativePath) => {
    if (!relativePath) return null;
    const filePath = path.resolve(process.cwd(), String(relativePath));
    return safeReadJson(filePath);
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
    pathPrefix: process.env.PATH_PREFIX || "/",
  };
};
