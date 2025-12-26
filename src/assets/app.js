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
    "tools.group.formatting": "Formatting",
    "tools.group.hashing": "Hashing",
    "tools.group.generators": "Generators",
    "tools.group.parsing": "Parsing",

    "tools.item.base64.title": "Base64 Encode/Decode",
    "tools.item.base64.desc": "UTF-8 text, URL-safe variant, optional padding removal.",
    "tools.item.base32.title": "Base32 Encode/Decode",
    "tools.item.base32.desc": "RFC 4648 Base32 for UTF-8 text, optional padding removal.",
    "tools.item.url.title": "URL Encode/Decode",
    "tools.item.url.desc": "encodeURIComponent / decodeURIComponent helpers.",
    "tools.item.unicode.title": "Unicode Escape/Unescape",
    "tools.item.unicode.desc": "Escape and unescape \\uXXXX / \\u{...} / \\xNN sequences.",
    "tools.item.json.title": "JSON Format/Minify",
    "tools.item.json.desc": "Pretty-print, minify, optional stable key sorting.",
    "tools.item.hash.title": "SHA Hash",
    "tools.item.hash.desc": "WebCrypto: SHA-256 / SHA-1 / SHA-384 / SHA-512.",
    "tools.item.crc32.title": "CRC32 Checksum",
    "tools.item.crc32.desc": "CRC32 checksum for UTF-8 text (hex + decimal).",
    "tools.item.hmac.title": "HMAC",
    "tools.item.hmac.desc": "WebCrypto HMAC with SHA-256 / SHA-1 / SHA-384 / SHA-512.",
    "tools.item.uuid.title": "UUID Generator",
    "tools.item.uuid.desc": "Generate UUID v4 locally in your browser.",
    "tools.item.password.title": "Password Generator",
    "tools.item.password.desc": "Generate strong random passwords locally.",
    "tools.item.jwt.title": "JWT Decode",
    "tools.item.jwt.desc": "Decode JWT header and payload locally (no verification).",

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

    "tool.base32.encode": "Encode →",
    "tool.base32.decode": "← Decode",
    "tool.base32.lowercase": "Lowercase output",
    "tool.base32.noPadding": "Remove padding (=)",
    "tool.base32.status.encoded": "Encoded ({len} chars)",
    "tool.base32.status.decoded": "Decoded ({len} chars)",
    "tool.base32.error.decode": "Decode failed: please check if the input is valid Base32",

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

    "tool.unicode.escape": "Escape →",
    "tool.unicode.unescape": "← Unescape",
    "tool.unicode.upperHex": "Uppercase hex",
    "tool.unicode.useBraces": "Use \\u{...} for non-BMP",
    "tool.unicode.escapeAscii": "Escape ASCII too",
    "tool.unicode.status.escaped": "Escaped ({len} chars)",
    "tool.unicode.status.unescaped": "Unescaped ({len} chars)",

    "tool.crc32.compute": "Compute",
    "tool.crc32.uppercase": "Uppercase HEX",
    "tool.crc32.prefix": "Prefix 0x",
    "tool.crc32.status.done": "Done ({len} chars)",

    "tool.hmac.message": "Message",
    "tool.hmac.outputLabel": "Output",
    "tool.hmac.secret": "Secret key",
    "tool.hmac.secretPlaceholder": "Secret key…",
    "tool.hmac.compute": "Compute",
    "tool.hmac.algorithm": "Algorithm:",
    "tool.hmac.format": "Format:",
    "tool.hmac.format.hex": "HEX",
    "tool.hmac.format.base64": "Base64",
    "tool.hmac.uppercase": "Uppercase HEX",
    "tool.hmac.status.done": "Done: {alg}",
    "tool.hmac.error.generic": "Compute failed",
    "tool.hmac.error.unsupported": "This browser does not support WebCrypto (crypto.subtle.sign)",

    "tool.uuid.generate": "Generate",
    "tool.uuid.count": "Count:",
    "tool.uuid.uppercase": "Uppercase",
    "tool.uuid.noHyphens": "Remove hyphens",
    "tool.uuid.braces": "Wrap with braces {}",
    "tool.uuid.status.done": "Generated {count} UUID(s)",
    "tool.uuid.error.unsupported": "This browser does not support crypto.getRandomValues",

    "tool.password.generate": "Generate",
    "tool.password.length": "Length:",
    "tool.password.count": "Count:",
    "tool.password.lower": "Lowercase",
    "tool.password.upper": "Uppercase",
    "tool.password.digits": "Digits",
    "tool.password.symbols": "Symbols",
    "tool.password.excludeAmbiguous": "Exclude ambiguous",
    "tool.password.status.done": "Generated {count} password(s) · length {length}",
    "tool.password.error.noCharset": "Please select at least one character set",
    "tool.password.error.unsupported": "This browser does not support crypto.getRandomValues",

    "tool.jwt.inputLabel": "JWT",
    "tool.jwt.placeholder": "Paste JWT here…",
    "tool.jwt.decode": "Decode",
    "tool.jwt.copyPayload": "Copy payload",
    "tool.jwt.header": "Header",
    "tool.jwt.payload": "Payload",
    "tool.jwt.status.decodedSig": "Decoded (signature part present)",
    "tool.jwt.status.decodedNoSig": "Decoded (no signature part)",
    "tool.jwt.error.empty": "Please paste a JWT",
    "tool.jwt.error.format": "Invalid JWT format (expected header.payload.signature)",
    "tool.jwt.error.header": "Header decode failed: please check if the JWT is valid",
    "tool.jwt.error.payload": "Payload decode failed: please check if the JWT is valid",

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
    "tools.group.formatting": "格式化",
    "tools.group.hashing": "哈希",
    "tools.group.generators": "生成器",
    "tools.group.parsing": "解析",

    "tools.item.base64.title": "Base64 编码/解码",
    "tools.item.base64.desc": "UTF-8 文本、URL-safe 变体、可选去掉 padding。",
    "tools.item.base32.title": "Base32 编码/解码",
    "tools.item.base32.desc": "RFC 4648 Base32（UTF-8 文本），可选去掉 padding。",
    "tools.item.url.title": "URL 编码/解码",
    "tools.item.url.desc": "encodeURIComponent / decodeURIComponent 辅助。",
    "tools.item.unicode.title": "Unicode 转义/反转义",
    "tools.item.unicode.desc": "Unicode 序列：\\uXXXX / \\u{...} / \\xNN 的转义与反转义。",
    "tools.item.json.title": "JSON 格式化/压缩",
    "tools.item.json.desc": "格式化、压缩、可选 key 排序（稳定输出）。",
    "tools.item.hash.title": "SHA 哈希",
    "tools.item.hash.desc": "WebCrypto：SHA-256 / SHA-1 / SHA-384 / SHA-512。",
    "tools.item.crc32.title": "CRC32 校验",
    "tools.item.crc32.desc": "UTF-8 文本 CRC32 校验（hex + 十进制）。",
    "tools.item.hmac.title": "HMAC",
    "tools.item.hmac.desc": "WebCrypto HMAC：SHA-256 / SHA-1 / SHA-384 / SHA-512。",
    "tools.item.uuid.title": "UUID 生成器",
    "tools.item.uuid.desc": "在浏览器本地生成 UUID v4。",
    "tools.item.password.title": "随机密码生成器",
    "tools.item.password.desc": "在浏览器本地生成强随机密码。",
    "tools.item.jwt.title": "JWT 解析",
    "tools.item.jwt.desc": "本地解析 JWT 头部与载荷（不做签名校验）。",

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

    "tool.base32.encode": "编码 →",
    "tool.base32.decode": "← 解码",
    "tool.base32.lowercase": "输出小写",
    "tool.base32.noPadding": "去掉 padding（=）",
    "tool.base32.status.encoded": "编码完成（{len} 个字符）",
    "tool.base32.status.decoded": "解码完成（{len} 个字符）",
    "tool.base32.error.decode": "解码失败：请检查输入是否为合法 Base32",

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

    "tool.unicode.escape": "转义 →",
    "tool.unicode.unescape": "← 反转义",
    "tool.unicode.upperHex": "十六进制大写",
    "tool.unicode.useBraces": "非 BMP 使用 \\u{...}",
    "tool.unicode.escapeAscii": "ASCII 也转义",
    "tool.unicode.status.escaped": "转义完成（{len} 个字符）",
    "tool.unicode.status.unescaped": "反转义完成（{len} 个字符）",

    "tool.crc32.compute": "计算",
    "tool.crc32.uppercase": "大写 HEX",
    "tool.crc32.prefix": "前缀 0x",
    "tool.crc32.status.done": "完成（{len} 个字符）",

    "tool.hmac.message": "消息",
    "tool.hmac.outputLabel": "输出",
    "tool.hmac.secret": "密钥",
    "tool.hmac.secretPlaceholder": "密钥…",
    "tool.hmac.compute": "计算",
    "tool.hmac.algorithm": "算法：",
    "tool.hmac.format": "格式：",
    "tool.hmac.format.hex": "HEX",
    "tool.hmac.format.base64": "Base64",
    "tool.hmac.uppercase": "大写 HEX",
    "tool.hmac.status.done": "完成：{alg}",
    "tool.hmac.error.generic": "计算失败",
    "tool.hmac.error.unsupported": "当前浏览器不支持 WebCrypto（crypto.subtle.sign）",

    "tool.uuid.generate": "生成",
    "tool.uuid.count": "数量：",
    "tool.uuid.uppercase": "大写",
    "tool.uuid.noHyphens": "去掉连字符",
    "tool.uuid.braces": "用大括号包裹 {}",
    "tool.uuid.status.done": "已生成 {count} 个 UUID",
    "tool.uuid.error.unsupported": "当前浏览器不支持 crypto.getRandomValues",

    "tool.password.generate": "生成",
    "tool.password.length": "长度：",
    "tool.password.count": "数量：",
    "tool.password.lower": "小写字母",
    "tool.password.upper": "大写字母",
    "tool.password.digits": "数字",
    "tool.password.symbols": "符号",
    "tool.password.excludeAmbiguous": "排除易混淆字符",
    "tool.password.status.done": "已生成 {count} 个密码 · 长度 {length}",
    "tool.password.error.noCharset": "请至少选择一种字符集",
    "tool.password.error.unsupported": "当前浏览器不支持 crypto.getRandomValues",

    "tool.jwt.inputLabel": "JWT",
    "tool.jwt.placeholder": "在这里粘贴 JWT…",
    "tool.jwt.decode": "解析",
    "tool.jwt.copyPayload": "复制 payload",
    "tool.jwt.header": "Header",
    "tool.jwt.payload": "Payload",
    "tool.jwt.status.decodedSig": "解析完成（包含 signature 段）",
    "tool.jwt.status.decodedNoSig": "解析完成（不包含 signature 段）",
    "tool.jwt.error.empty": "请粘贴 JWT",
    "tool.jwt.error.format": "JWT 格式不正确（应为 header.payload.signature）",
    "tool.jwt.error.header": "Header 解析失败：请检查 JWT 是否正确",
    "tool.jwt.error.payload": "Payload 解析失败：请检查 JWT 是否正确",

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
