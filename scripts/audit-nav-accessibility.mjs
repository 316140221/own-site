import fs from "node:fs";
import path from "node:path";
import { toPosixPath } from "./lib/path.mjs";

const htmlArg = process.argv[2] || "dist/index.html";
const htmlPath = path.resolve(process.cwd(), htmlArg);
const cssPath = path.resolve(process.cwd(), "src/assets/style.css");

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (_error) {
    return "";
  }
}

function parseAttrs(raw) {
  const attrs = {};
  const attrRe = /(\w[\w-]*)\s*=\s*["']([^"']*)["']/gi;
  let match;
  while ((match = attrRe.exec(raw))) {
    attrs[match[1].toLowerCase()] = match[2];
  }
  attrs.classList = (attrs.class || "")
    .split(/\s+/g)
    .map((c) => c.trim())
    .filter(Boolean);
  return attrs;
}

function collectFocusables(html) {
  if (!html) return [];
  const items = [];
  const re = /<(a|button|input)[^>]*>/gi;
  let match;
  while ((match = re.exec(html))) {
    const tag = match[1].toLowerCase();
    const raw = match[0];
    const attrs = parseAttrs(raw);
    const disabled =
      /\bdisabled\b/i.test(raw) || attrs.disabled !== undefined || attrs["aria-disabled"] === "true";
    const tabIndex = attrs.tabindex !== undefined ? Number(attrs.tabindex) : null;
    const href = attrs.href || "";
    const focusBlocked = tabIndex === -1;
    items.push({
      tag,
      raw,
      classes: attrs.classList,
      href,
      tabIndex: Number.isFinite(tabIndex) ? tabIndex : 0,
      disabled,
      focusBlocked,
    });
  }
  return items;
}

if (!fs.existsSync(htmlPath)) {
  console.error(`[nav-a11y] Missing HTML: ${toPosixPath(htmlPath)}`);
  process.exit(2);
}

const html = readFileSafe(htmlPath);
const css = readFileSafe(cssPath);
const errors = [];
const warnings = [];

const focusRuleOk = /:focus-visible\s*{[^}]*outline[^}]*}/i.test(css);
if (!focusRuleOk) errors.push("style.css lacks a :focus-visible outline rule");

const beforeMain = html.split(/<main[\s>]/i)[0] || html;
const focusables = collectFocusables(beforeMain).filter((item) => !item.disabled);
if (!focusables.length) {
  errors.push("no focusable elements found before <main> (expected skip link and nav controls)");
}

const skipIndex = focusables.findIndex((item) => item.classes.includes("skip-link"));
if (skipIndex !== 0) {
  errors.push(`skip link should be the first tab stop before <main> (found at index ${skipIndex})`);
}

const brandIndex = focusables.findIndex((item) => item.classes.includes("brand"));
if (brandIndex === -1) {
  errors.push("brand link is not focusable");
}

const toggleIndex = focusables.findIndex((item) => item.classes.includes("menu-toggle"));
if (toggleIndex === -1) {
  errors.push("menu toggle is not focusable");
} else if (brandIndex !== -1 && toggleIndex < brandIndex) {
  warnings.push("menu toggle appears before brand link in tab order");
}

const navMatch = html.match(/<nav[^>]*id=["']site-nav["'][^>]*>([\s\S]*?)<\/nav>/i);
const navHtml = navMatch ? navMatch[1] : "";
const navLinks = collectFocusables(navHtml).filter((item) => item.tag === "a" && !item.focusBlocked);
if (!navHtml) errors.push('nav#site-nav not found');
if (navLinks.length < 4) errors.push(`nav links too few (found ${navLinks.length}, expected >= 4)`);

const blocked = focusables.filter((item) => item.focusBlocked);
if (blocked.length) {
  warnings.push(`${blocked.length} item(s) have tabindex=-1 before <main>`);
}

const missingHref = navLinks.filter((item) => !item.href);
if (missingHref.length) warnings.push(`${missingHref.length} nav link(s) missing href`);

if (errors.length) {
  console.error(`[nav-a11y] FAIL ${errors.length} issue(s):`);
  errors.forEach((msg) => console.error(`- ${msg}`));
  if (warnings.length) {
    console.error(`[nav-a11y] warnings (${warnings.length}):`);
    warnings.forEach((msg) => console.error(`- ${msg}`));
  }
  process.exit(1);
}

if (warnings.length) {
  console.log(`[nav-a11y] OK with warnings (${warnings.length}):`);
  warnings.forEach((msg) => console.log(`- ${msg}`));
} else {
  console.log(
    `[nav-a11y] OK: focusable_before_main=${focusables.length} nav_links=${navLinks.length} focus-visible=${focusRuleOk ? "yes" : "no"}`
  );
}
