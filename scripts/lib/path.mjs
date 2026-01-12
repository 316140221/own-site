import path from "node:path";

export function toPosixPath(inputPath) {
  if (!inputPath) return "";
  const text = String(inputPath);
  if (!text) return "";
  if (path.sep === "\\") return text.replace(/\\/g, "/");
  return text;
}

export function stripQueryAndHash(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return raw.split(/[?#]/, 1)[0];
}

export function normalizePathPrefix(rawPrefix = process.env.PATH_PREFIX) {
  const raw = String(rawPrefix || "/").trim();
  if (!raw || raw === "/") return "/";
  return `/${raw.replace(/^\/+|\/+$/g, "")}/`;
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
