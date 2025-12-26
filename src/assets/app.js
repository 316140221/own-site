const I18N = {
  en: {
    "nav.menu": "Menu",
    "nav.news": "News",
    "nav.tools": "Tools",
    "nav.toolsAll": "All tools",
    "nav.categories": "Categories",
    "nav.language": "Language",
    "nav.search": "Search",
    "nav.about": "About",

    "home.tools": "Tools",
    "home.latest": "Latest",

    "tools.title": "Tools",
    "tools.subtitle": "All tools run locally in your browser. Nothing is uploaded.",
    "tools.localNotice": "Runs locally in your browser. Nothing is uploaded.",

    "tools.group.encoding": "Encoding",
    "tools.group.hashing": "Hashing",

    "tools.item.base64.title": "Base64 Encode/Decode",
    "tools.item.base64.desc": "UTF-8 text, URL-safe variant, optional padding removal.",
    "tools.item.url.title": "URL Encode/Decode",
    "tools.item.url.desc": "encodeURIComponent / decodeURIComponent helpers.",
    "tools.item.json.title": "JSON Format/Minify",
    "tools.item.json.desc": "Pretty-print, minify, optional stable key sorting.",
    "tools.item.hash.title": "SHA Hash",
    "tools.item.hash.desc": "WebCrypto: SHA-256 / SHA-1 / SHA-384 / SHA-512.",

    "tool.common.input": "Input",
    "tool.common.output": "Output",
    "tool.common.placeholder": "Paste text here…",
    "tool.common.resultPlaceholder": "Result will appear here…",
    "tool.common.swap": "Swap",
    "tool.common.copyOutput": "Copy output",
    "tool.common.clear": "Clear",

    "tool.common.status.swapped": "Swapped input/output",
    "tool.common.status.copied": "Copied output",
    "tool.common.error.copy": "Copy failed: clipboard access was blocked",

    "tool.base64.encode": "Encode →",
    "tool.base64.decode": "← Decode",
    "tool.base64.urlSafe": "URL-safe (- _)",
    "tool.base64.noPadding": "Remove padding (=)",
    "tool.base64.status.encoded": "Encoded ({len} chars)",
    "tool.base64.status.decoded": "Decoded ({len} chars)",
    "tool.base64.error.decode": "Decode failed: please check if the input is valid Base64",

    "tool.url.encode": "Encode →",
    "tool.url.decode": "← Decode",
    "tool.url.placeholder": "e.g. spaces, &, ?, unicode…",
    "tool.url.plusForSpace": "Use “+” for spaces (querystring style)",
    "tool.url.status.encoded": "Encoded ({len} chars)",
    "tool.url.status.decoded": "Decoded ({len} chars)",
    "tool.url.error.encode": "Encode failed",
    "tool.url.error.decode": "Decode failed: please check if the input is valid URL encoding",

    "tool.json.inputLabel": "Input JSON",
    "tool.json.placeholder": 'e.g. {"a":1,"b":[true,false]}',
    "tool.json.format": "Format",
    "tool.json.minify": "Minify",
    "tool.json.indent": "Indent:",
    "tool.json.sortKeys": "Sort keys (stable output)",
    "tool.json.status.formatted": "Formatted ({len} chars)",
    "tool.json.status.minified": "Minified ({len} chars)",
    "tool.json.error.format": "Format failed",
    "tool.json.error.minify": "Minify failed",
    "tool.json.error.empty": "Please paste JSON",
    "tool.json.error.parse": "Parse failed: please check the JSON syntax",

    "tool.hash.outputLabel": "Output (hex)",
    "tool.hash.resultPlaceholder": "Hash will appear here…",
    "tool.hash.run": "Compute",
    "tool.hash.algorithm": "Algorithm:",
    "tool.hash.uppercase": "Uppercase HEX",
    "tool.hash.status.done": "Done: {alg}",
    "tool.hash.error.generic": "Compute failed",
    "tool.hash.error.unsupported": "This browser does not support WebCrypto (crypto.subtle.digest)",
  },
  zh: {
    "nav.menu": "菜单",
    "nav.news": "新闻",
    "nav.tools": "工具",
    "nav.toolsAll": "全部工具",
    "nav.categories": "分类",
    "nav.language": "语言",
    "nav.search": "搜索",
    "nav.about": "关于",

    "home.tools": "工具",
    "home.latest": "最新",

    "tools.title": "工具",
    "tools.subtitle": "所有工具均在浏览器本地运行，不会上传内容。",
    "tools.localNotice": "纯前端运行，内容不会上传。",

    "tools.group.encoding": "编码 / 解析",
    "tools.group.hashing": "哈希",

    "tools.item.base64.title": "Base64 编码/解码",
    "tools.item.base64.desc": "UTF-8 文本、URL-safe 变体、可选去掉 padding。",
    "tools.item.url.title": "URL 编码/解码",
    "tools.item.url.desc": "encodeURIComponent / decodeURIComponent 辅助。",
    "tools.item.json.title": "JSON 格式化/压缩",
    "tools.item.json.desc": "格式化、压缩、可选 key 排序（稳定输出）。",
    "tools.item.hash.title": "SHA 哈希",
    "tools.item.hash.desc": "WebCrypto：SHA-256 / SHA-1 / SHA-384 / SHA-512。",

    "tool.common.input": "输入",
    "tool.common.output": "输出",
    "tool.common.placeholder": "在这里粘贴文本…",
    "tool.common.resultPlaceholder": "结果会显示在这里…",
    "tool.common.swap": "交换",
    "tool.common.copyOutput": "复制输出",
    "tool.common.clear": "清空",

    "tool.common.status.swapped": "已交换输入/输出",
    "tool.common.status.copied": "已复制输出",
    "tool.common.error.copy": "复制失败：浏览器不允许访问剪贴板",

    "tool.base64.encode": "编码 →",
    "tool.base64.decode": "← 解码",
    "tool.base64.urlSafe": "URL-safe（- _）",
    "tool.base64.noPadding": "去掉 padding（=）",
    "tool.base64.status.encoded": "编码完成（{len} 个字符）",
    "tool.base64.status.decoded": "解码完成（{len} 个字符）",
    "tool.base64.error.decode": "解码失败：请检查输入是否为合法 Base64",

    "tool.url.encode": "编码 →",
    "tool.url.decode": "← 解码",
    "tool.url.placeholder": "例如：中文、空格、&、? 等…",
    "tool.url.plusForSpace": "空格使用 “+”（兼容 querystring）",
    "tool.url.status.encoded": "编码完成（{len} 个字符）",
    "tool.url.status.decoded": "解码完成（{len} 个字符）",
    "tool.url.error.encode": "编码失败",
    "tool.url.error.decode": "解码失败：请检查输入是否为合法 URL 编码",

    "tool.json.inputLabel": "输入 JSON",
    "tool.json.placeholder": '例如：{"a":1,"b":[true,false]}',
    "tool.json.format": "格式化",
    "tool.json.minify": "压缩",
    "tool.json.indent": "缩进：",
    "tool.json.sortKeys": "key 排序（稳定输出）",
    "tool.json.status.formatted": "格式化完成（{len} 个字符）",
    "tool.json.status.minified": "压缩完成（{len} 个字符）",
    "tool.json.error.format": "格式化失败",
    "tool.json.error.minify": "压缩失败",
    "tool.json.error.empty": "请输入 JSON",
    "tool.json.error.parse": "解析失败：请检查 JSON 格式",

    "tool.hash.outputLabel": "输出（hex）",
    "tool.hash.resultPlaceholder": "哈希会显示在这里…",
    "tool.hash.run": "计算",
    "tool.hash.algorithm": "算法：",
    "tool.hash.uppercase": "大写 HEX",
    "tool.hash.status.done": "计算完成：{alg}",
    "tool.hash.error.generic": "计算失败",
    "tool.hash.error.unsupported": "当前浏览器不支持 WebCrypto（crypto.subtle.digest）",
  },
};

const LANG_STORAGE_KEY = "site_lang";

function normalizeLang(input) {
  const raw = String(input || "").trim().toLowerCase();
  if (!raw) return "";
  return raw.split("-")[0] || "";
}

function getSupportedLangs() {
  const raw = document.documentElement.getAttribute("data-supported-langs") || "";
  const list = raw
    .split(",")
    .map((l) => normalizeLang(l))
    .filter(Boolean);
  const unique = Array.from(new Set(list));
  return unique.length ? unique : ["en"];
}

function getDefaultLang() {
  return normalizeLang(document.documentElement.getAttribute("data-default-lang")) || "en";
}

function formatTemplate(message, vars) {
  const input = String(message || "");
  if (!vars || typeof vars !== "object") return input;
  return input.replace(/\{(\w+)\}/g, (_m, k) =>
    Object.prototype.hasOwnProperty.call(vars, k) ? String(vars[k]) : `{${k}}`
  );
}

function t(key, vars, lang) {
  const normalizedLang = normalizeLang(lang) || "en";
  const dict = I18N[normalizedLang] || I18N.en || {};
  const fallback = I18N.en || {};
  const message = dict[key] || fallback[key] || String(key || "");
  return formatTemplate(message, vars);
}

function getLang() {
  const supported = getSupportedLangs();
  const stored = normalizeLang(localStorage.getItem(LANG_STORAGE_KEY));
  if (stored && supported.includes(stored)) return stored;
  const def = getDefaultLang();
  if (def && supported.includes(def)) return def;
  return supported[0] || "en";
}

function applyI18n(lang) {
  const activeLang = normalizeLang(lang) || "en";
  document.documentElement.lang = activeLang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!key) return;
    el.textContent = t(key, null, activeLang);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (!key) return;
    el.setAttribute("placeholder", t(key, null, activeLang));
  });

  document.querySelectorAll("[data-set-lang]").forEach((el) => {
    const target = normalizeLang(el.getAttribute("data-set-lang"));
    el.setAttribute("aria-current", target === activeLang ? "true" : "false");
  });
}

function setLang(next) {
  const normalized = normalizeLang(next);
  const supported = getSupportedLangs();
  const resolved = supported.includes(normalized) ? normalized : getLang();
  localStorage.setItem(LANG_STORAGE_KEY, resolved);
  applyI18n(resolved);
  window.dispatchEvent(new CustomEvent("site:lang", { detail: { lang: resolved } }));
}

function setupLangSwitch() {
  document.querySelectorAll("[data-set-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-set-lang");
      setLang(lang);
    });
  });
}

window.SiteI18n = {
  t: (key, vars) => t(key, vars, getLang()),
  getLang: () => getLang(),
  setLang: (lang) => setLang(lang),
  supported: () => getSupportedLangs(),
};

function closeNavDropdowns(except) {
  document.querySelectorAll(".nav-dropdown[open]").forEach((details) => {
    if (details !== except) details.removeAttribute("open");
  });
}

function setupNav() {
  const header = document.querySelector(".site-header");
  const nav = document.getElementById("site-nav");
  const toggle = document.querySelector(".menu-toggle");
  if (!header || !nav || !toggle) return;

  function setNavOpen(open) {
    header.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (!open) closeNavDropdowns(null);
  }

  toggle.addEventListener("click", () => {
    const open = !header.classList.contains("nav-open");
    setNavOpen(open);
  });

  nav.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest("a")) setNavOpen(false);
    if (target.closest("[data-set-lang]")) setNavOpen(false);
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const dropdown = target.closest(".nav-dropdown");
    if (dropdown) closeNavDropdowns(dropdown);
    else closeNavDropdowns(null);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    setNavOpen(false);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupNav();
  setupLangSwitch();
  applyI18n(getLang());
});
