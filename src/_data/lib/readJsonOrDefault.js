const fs = require("node:fs");

module.exports = function readJsonOrDefault(filePath, fallback) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const text =
      raw && raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
    return JSON.parse(text);
  } catch (_error) {
    return fallback;
  }
};
