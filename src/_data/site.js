const path = require("node:path");

const { firstStringFromEnv, stringFromEnv } = require("./lib/env.js");
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

const defaultLanguageCandidate = normalizeLanguageCode(config.defaultLanguage);
const defaultLanguage =
  defaultLanguageCandidate && languages.includes(defaultLanguageCandidate)
    ? defaultLanguageCandidate
    : languages[0];

const languageLabelsFromConfig = {};
for (const [key, value] of Object.entries(config.languageLabels || {})) {
  const id = normalizeLanguageCode(key);
  if (!id) continue;
  const label = String(value ?? "").trim() || id;
  languageLabelsFromConfig[id] = label;
}

const languageLabels = {
  en: "EN",
  zh: "中文",
  ...languageLabelsFromConfig,
};

function normalizeSiteUrl(raw) {
  const input = String(raw ?? "").trim();
  if (!input) return "";
  try {
    return new URL(input).origin;
  } catch (_error) {
    return input.replace(/\/+$/g, "");
  }
}

const siteUrl = normalizeSiteUrl(stringFromEnv("SITE_URL", "http://localhost:8080"));
const contactEmail = stringFromEnv(
  "CONTACT_EMAIL",
  String(config.contactEmail || "").trim()
);
const googleSiteVerification = stringFromEnv("GOOGLE_SITE_VERIFICATION", "");
const environment = firstStringFromEnv(
  ["DEPLOY_ENV", "CONTEXT", "ELEVENTY_ENV", "NODE_ENV"],
  "production"
).toLowerCase();

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
  url: siteUrl,
  contactEmail,
  googleSiteVerification,
  environment,
};
