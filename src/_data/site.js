const path = require("node:path");

const readJsonOrDefault = require("./lib/readJsonOrDefault.js");
const normalizeLanguageCode = require("./lib/normalizeLanguageCode.js");

const configPath = path.resolve(process.cwd(), "site.config.json");
const config = readJsonOrDefault(configPath, {});

const languagesRaw = Array.isArray(config.languages) ? config.languages : ["en"];
const languages = Array.from(
  new Set(
    languagesRaw
      .map((l) => normalizeLanguageCode(l))
      .filter(Boolean)
      .concat(["en"])
  )
);

const defaultLanguage = languages.includes(normalizeLanguageCode(config.defaultLanguage))
  ? normalizeLanguageCode(config.defaultLanguage)
  : languages[0];

const languageLabels = {
  en: "EN",
  zh: "中文",
  ...(config.languageLabels || {}),
};

module.exports = {
  name: config.name || "Cloud Utility Desk",
  brand: config.brand || config.name || "Cloud Utility Desk",
  tagline: config.tagline || "",
  description: config.description || "",
  language: defaultLanguage,
  defaultLanguage,
  languages,
  languagesCsv: languages.join(","),
  languageLabels,
  url: process.env.SITE_URL || "http://localhost:8080",
  contactEmail: String(process.env.CONTACT_EMAIL || config.contactEmail || "").trim(),
  googleSiteVerification: String(process.env.GOOGLE_SITE_VERIFICATION || "").trim(),
  environment:
    process.env.DEPLOY_ENV ||
    process.env.CONTEXT ||
    process.env.ELEVENTY_ENV ||
    process.env.NODE_ENV ||
    "production",
};
