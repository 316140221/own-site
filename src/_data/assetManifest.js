const fs = require("node:fs");
const path = require("node:path");

const manifestPath = path.resolve(process.cwd(), "build/asset-manifest.json");
const buildAssetDir = path.resolve(process.cwd(), "build/assets");

const DEFAULTS = {
  "app.js": "/assets/app.js",
  "style.css": "/assets/style.css",
  "shop.js": "/assets/shop.js",
  "sources.js": "/assets/sources.js",
};

const REQUIRED_KEYS = ["app.js", "style.css", "shop.js", "sources.js"];

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
  return trimmed;
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

function resolveEntry(manifest, key) {
  if (!manifest || !manifest.entries) return "";
  const value = normalizeAssetPath(manifest.entries[key]);
  if (!value) return "";
  if (!buildAssetExists(value)) return "";
  return value;
}

function manifestReady(manifest) {
  if (!manifest || !manifest.entries || typeof manifest.entries !== "object") return false;
  return REQUIRED_KEYS.every((key) => resolveEntry(manifest, key));
}

module.exports = function () {
  const manifest = readManifest();
  const ready = manifestReady(manifest);
  return {
    ready,
    app: (ready && resolveEntry(manifest, "app.js")) || DEFAULTS["app.js"],
    style: (ready && resolveEntry(manifest, "style.css")) || DEFAULTS["style.css"],
    shop: (ready && resolveEntry(manifest, "shop.js")) || DEFAULTS["shop.js"],
    sources: (ready && resolveEntry(manifest, "sources.js")) || DEFAULTS["sources.js"],
    generatedAt: manifest && manifest.generatedAt ? manifest.generatedAt : "",
    immutableTtlSeconds:
      (manifest && Number(manifest.immutableTtlSeconds)) || 31536000,
  };
};
