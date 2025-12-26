const fs = require("node:fs");
const path = require("node:path");

function readJsonOrDefault(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (_error) {
    return fallback;
  }
}

function normalizeLanguageCode(input) {
  const raw = String(input || "").trim().toLowerCase();
  if (!raw) return "en";
  const base = raw.split("-")[0];
  return base || "en";
}

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
  googleSiteVerification: String(process.env.GOOGLE_SITE_VERIFICATION || "").trim(),
};
