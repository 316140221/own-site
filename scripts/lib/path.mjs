import sharedPath from "../../shared/path.cjs";

export function toPosixPath(inputPath) {
  return sharedPath.toPosixPath(inputPath);
}

export function stripQueryAndHash(value) {
  return sharedPath.stripQueryAndHash(value);
}

export function isExternalAssetUrl(url) {
  return sharedPath.isExternalAssetUrl(url);
}

export function normalizePathPrefix(rawPrefix = process.env.PATH_PREFIX) {
  const value = rawPrefix === undefined ? process.env.PATH_PREFIX : rawPrefix;
  return sharedPath.normalizePathPrefix(value);
}

export function stripPathPrefix(urlPath, rawPrefix = process.env.PATH_PREFIX) {
  const value = String(urlPath || "").trim();
  if (!value) return value;

  const prefix = normalizePathPrefix(rawPrefix);
  if (prefix === "/") return value;
  const prefixTrimmed = prefix.replace(/\/$/, "");

  if (value === prefix || value === prefixTrimmed) return "/";
  if (value.startsWith(prefix)) return `/${value.slice(prefix.length).replace(/^\/+/, "")}`;
  if (value.startsWith(`${prefixTrimmed}/`)) {
    return `/${value.slice(prefixTrimmed.length + 1).replace(/^\/+/, "")}`;
  }

  return value;
}
