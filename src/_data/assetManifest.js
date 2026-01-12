const fs = require("node:fs");
const path = require("node:path");

const manifestPath = path.resolve(process.cwd(), "build/asset-manifest.json");
const buildAssetDir = path.resolve(process.cwd(), "build/assets");

const { ASSET_KEYS, DEFAULT_ASSET_PATHS } = require("../../shared/assets.cjs");

const DEFAULTS = DEFAULT_ASSET_PATHS;
const REQUIRED_KEYS = ASSET_KEYS;

function readManifest() {
  try {
    const raw = fs.readFileSync(manifestPath, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch (_error) {
    return null;
  }
}

function normalizeAssetPath(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return "";
  if (trimmed.startsWith("//")) return "";
  const cleaned = trimmed.split(/[?#]/, 1)[0];
  if (!cleaned) return "";
  return cleaned.startsWith("/") ? cleaned : `/${cleaned.replace(/^\/+/, "")}`;
}

function buildAssetExists(assetPath) {
  const normalized = normalizeAssetPath(assetPath);
  if (!normalized) return false;
  const basename = path.basename(normalized);
  if (!basename) return false;
  const fullPath = path.join(buildAssetDir, basename);
  try {
    return fs.statSync(fullPath).isFile();
  } catch (_error) {
    return false;
  }
}

function resolveEntries(manifest) {
  if (!manifest || !manifest.entries || typeof manifest.entries !== "object") return {};

  const resolved = {};
  for (const key of REQUIRED_KEYS) {
    const value = normalizeAssetPath(manifest.entries[key]);
    if (!value) continue;
    if (!buildAssetExists(value)) continue;
    resolved[key] = value;
  }
  return resolved;
}

module.exports = function () {
  const manifest = readManifest();
  const resolved = resolveEntries(manifest);
  const ready = REQUIRED_KEYS.every((key) => resolved[key]);

  const immutableTtlSecondsRaw = manifest && Number(manifest.immutableTtlSeconds);
  const immutableTtlSeconds =
    Number.isFinite(immutableTtlSecondsRaw) && immutableTtlSecondsRaw >= 0
      ? immutableTtlSecondsRaw
      : 31536000;
  return {
    ready,
    app: (ready && resolved["app.js"]) || DEFAULTS["app.js"],
    style: (ready && resolved["style.css"]) || DEFAULTS["style.css"],
    shop: (ready && resolved["shop.js"]) || DEFAULTS["shop.js"],
    sources: (ready && resolved["sources.js"]) || DEFAULTS["sources.js"],
    generatedAt: manifest && manifest.generatedAt ? manifest.generatedAt : "",
    immutableTtlSeconds,
  };
};
