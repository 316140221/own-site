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

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });

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

