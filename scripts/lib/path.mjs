import path from "node:path";

export function toPosixPath(inputPath) {
  if (!inputPath) return "";
  const text = String(inputPath);
  if (!text) return "";
  if (path.sep === "\\") return text.replace(/\\/g, "/");
  return text;
}

