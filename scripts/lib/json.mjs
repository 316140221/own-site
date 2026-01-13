import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";

function stripBom(input) {
  const text = String(input ?? "");
  if (!text) return "";
  if (text.charCodeAt(0) === 0xfeff) return text.slice(1);
  return text;
}

export async function readJsonOrDefault(filePath, fallback) {
  try {
    const raw = await fsPromises.readFile(filePath, "utf8");
    return JSON.parse(stripBom(raw));
  } catch {
    return fallback;
  }
}

export function readJsonOrDefaultSync(filePath, fallback) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(stripBom(raw));
  } catch {
    return fallback;
  }
}

export async function writeJson(filePath, data) {
  await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
  await fsPromises.writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

export function writeJsonSync(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}
