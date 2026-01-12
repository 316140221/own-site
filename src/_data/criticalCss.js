const fs = require("node:fs");
const path = require("node:path");

const cssPath = path.resolve(process.cwd(), "src/assets/style.css");
const DEFAULT_MAX_BYTES = Number(process.env.CRITICAL_CSS_MAX_BYTES || 14000);

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
  if (css.length <= maxBytes) return css;
  const sliced = css.slice(0, maxBytes);
  const lastBrace = sliced.lastIndexOf("}");
  if (lastBrace === -1) return "";
  return sliced.slice(0, lastBrace + 1).trim();
}

module.exports = function () {
  try {
    const raw = fs.readFileSync(cssPath, "utf8");
    const minified = minifyCss(raw);
    const inline = safeSlice(minified, DEFAULT_MAX_BYTES);
    return {
      inline,
      inlined: Boolean(inline),
      totalBytes: minified.length,
      inlineBytes: inline.length,
      threshold: DEFAULT_MAX_BYTES,
      truncated: inline.length < minified.length,
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
