const path = require("node:path");

function toPosixPath(inputPath) {
  if (!inputPath) return "";
  const text = String(inputPath);
  if (!text) return "";
  if (path.sep === "\\") return text.replace(/\\/g, "/");
  return text;
}

function stripQueryAndHash(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return raw.split(/[?#]/, 1)[0];
}

function normalizePathPrefix(rawPrefix) {
  const raw = String(rawPrefix || "/").trim();
  if (!raw || raw === "/") return "/";
  return `/${raw.replace(/^\/+|\/+$/g, "")}/`;
}

function isExternalAssetUrl(url) {
  const raw = String(url || "").trim();
  if (!raw) return true;
  if (raw.startsWith("//")) return true;
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return true;
  return false;
}

module.exports = {
  isExternalAssetUrl,
  normalizePathPrefix,
  stripQueryAndHash,
  toPosixPath,
};
