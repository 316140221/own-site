const fs = require("node:fs");
const path = require("node:path");

const { intFromEnv } = require("./lib/env.js");

const cssPath = path.resolve(process.cwd(), "src/assets/style.css");
const DEFAULT_MAX_BYTES = intFromEnv("CRITICAL_CSS_MAX_BYTES", 14000, {
  min: 0,
  max: 100000,
});

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, " ");
}

function minifyCss(css) {
  return stripComments(css)
    .replace(/\s*([{}:;,>+~])\s*/g, "$1")
    .replace(/\s{2,}/g, " ")
    .replace(/\n+/g, " ")
    .trim();
}

function safeSlice(css, maxBytes) {
  const totalBytes = Buffer.byteLength(css, "utf8");
  if (totalBytes <= maxBytes) return css;
  const sliced = Buffer.from(css, "utf8").subarray(0, maxBytes).toString("utf8");
  const lastBrace = sliced.lastIndexOf("}");
  if (lastBrace === -1) return "";
  return sliced.slice(0, lastBrace + 1).trim();
}

module.exports = function () {
  try {
    const raw = fs.readFileSync(cssPath, "utf8");
    const minified = minifyCss(raw);
    const inline = safeSlice(minified, DEFAULT_MAX_BYTES);
    const totalBytes = Buffer.byteLength(minified, "utf8");
    const inlineBytes = Buffer.byteLength(inline, "utf8");
    return {
      inline,
      inlined: Boolean(inline),
      totalBytes,
      inlineBytes,
      threshold: DEFAULT_MAX_BYTES,
      truncated: inlineBytes < totalBytes,
    };
  } catch (error) {
    return {
      inline: "",
      inlined: false,
      totalBytes: 0,
      inlineBytes: 0,
      threshold: DEFAULT_MAX_BYTES,
      truncated: false,
      error: error.message,
    };
  }
};
