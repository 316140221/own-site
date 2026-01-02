const I18N = {
  en: {
    "nav.menu": "Menu",
    "nav.skip": "Skip to content",
    "nav.top": "Back to top",
    "nav.home": "Home",
    "nav.shop": "Shop",
    "nav.news": "News",
    "nav.tools": "Tools",
    "nav.toolsAll": "All tools",
    "nav.categories": "Categories",
    "nav.language": "Language",
    "nav.search": "Search",
    "nav.about": "About",
    "nav.privacy": "Privacy",
    "nav.disclosure": "Affiliate Disclosure",
    "nav.contact": "Contact",
    "nav.terms": "Terms",
    "nav.rss": "RSS",
    "nav.theme": "Theme",
    "nav.library": "Library",

    "theme.auto": "Auto",
    "theme.light": "Light",
    "theme.dark": "Dark",

    "library.title": "Library",
    "library.subtitle": "Saved and recently viewed items are stored locally in your browser.",
    "library.favorites": "Favorites",
    "library.recent": "Recently viewed",
    "library.clear": "Clear",
    "library.emptyFavorites": "No favorites yet.",
    "library.emptyRecent": "No recently viewed items yet.",
    "library.remove": "Remove",
    "library.toolsFavorites": "Favorite tools",
    "library.toolsRecent": "Recently used tools",
    "library.emptyToolsFavorites": "No saved tools yet.",
    "library.emptyToolsRecent": "No recently used tools yet.",
    "library.shopFavorites": "Saved products",
    "library.emptyShopFavorites": "No saved products yet.",
    "library.search.label": "Filter",
    "library.search.placeholder": "Filter…",
    "library.sort.label": "Sort",
    "library.sort.recent": "Recent",
    "library.sort.titleAsc": "Title A→Z",
    "library.sort.titleDesc": "Title Z→A",
    "library.export": "Export",
    "library.import": "Import",
    "library.backupNote":
      "Import/export only affects your local saved items (JSON). Nothing is uploaded.",
    "library.status.filtered": "Showing {count} items for “{q}”",
    "library.status.noResults": "No items match “{q}”.",
    "library.status.exported": "Exported.",
    "library.importSuccess":
      "Imported: {articles} articles, {tools} tools, {shop} products.",
    "library.importFailed": "Import failed. Please check the JSON file.",

    "search.label": "Search",
    "search.title": "Search",
    "search.placeholder": "Search… (/)",
    "search.go": "Go",
    "search.notice1": "Search works on the deployed build (Pagefind index is generated during",
    "search.notice2": ").",

    "home.tools": "Tools",
    "home.start": "Start",
    "home.latest": "Latest",
    "home.shopFeatured": "Featured",
    "home.shopAll": "View all",
    "home.shopBrowse": "Browse:",

    "article.copy": "Copy link",
    "article.share": "Share",
    "article.related": "Recommended",
    "article.openOriginal": "Open original →",
    "article.readOriginal": "Read original",
    "article.fromRss": "From RSS",
    "article.fromRssNote": "Excerpt extracted from the source RSS feed (may be truncated). For the official version, use “Open original”.",
    "article.keyPoints": "Key points",
    "article.moreIn": "More in",
    "article.moreFromSource": "More from {source}",
    "article.moreFromSourceAll": "View all from this source",
    "article.save": "Save",
    "article.unsave": "Unsave",

    "common.copied": "Copied",
    "common.copyFailed": "Copy failed",

    "breadcrumbs.home": "Home",
    "pager.prev": "← Prev",
    "pager.next": "Next →",
    "pager.meta": "Page {current} / {total}",

    "languages.title": "Languages",
    "languages.empty": "No languages detected.",

    "sources.title": "Sources",

    "shop.title": "Shop",
    "shop.subtitle": "Curated Amazon items. Purchases via links may earn us a commission.",
    "shop.filter": "Filter:",
    "shop.tag.all": "All",
    "shop.filterStatus": "Filtered by: {tag} · {count} items",
    "shop.filterStatusBoth": "Filtered: {tag} · “{q}” · {count} items",
    "shop.search.label": "Search products",
    "shop.search.placeholder": "Search products…",
    "shop.search.clear": "Clear",
    "shop.searchStatus": "Search: “{q}” · {count} items",
    "shop.reset": "Reset filters",
    "shop.featured": "Featured",
    "shop.sort.label": "Sort:",
    "shop.sort.default": "Default",
    "shop.sort.rating": "Rating",
    "shop.sort.reviews": "Reviews",
    "shop.sort.priceAsc": "Price ↑",
    "shop.sort.priceDesc": "Price ↓",
    "shop.sort.titleAsc": "Title A→Z",
    "shop.sort.titleDesc": "Title Z→A",
    "shop.noResults": "No items match this filter.",
    "shop.cta": "View on Amazon",
    "shop.savedOnly": "Saved only",
    "shop.savedStatus": "Saved only · {count} items",
    "shop.savedFilterStatus": "Saved only: {tag} · {count} items",
    "shop.savedFilterStatusBoth": "Saved only: {tag} · “{q}” · {count} items",
    "shop.savedSearchStatus": "Saved only: “{q}” · {count} items",
    "shop.savedBanner": "Saved {count} products →",
    "shop.updatedAt": "Updated",
    "shop.disclaimer": "As an Amazon Associate I earn from qualifying purchases.",
    "shop.empty": "No items yet.",
    "shop.disabled": "Not enabled. Configure",
    "shop.disabled2": "and run",

    "tools.title": "Tools",
    "tools.subtitle": "All tools run locally in your browser. Nothing is uploaded.",
    "tools.localNotice": "Runs locally in your browser. Nothing is uploaded.",
    "tools.nav.jump": "Jump to tool",
    "tools.filter.label": "Filter tools",
    "tools.filter.placeholder": "Filter tools…",
    "tools.filter.clear": "Clear",
    "tools.filter.status": "Showing {count} tools for “{q}”",
    "tools.filter.empty": "No tools match this filter.",
    "tools.quick.options": "Options",
    "tools.related": "Related tools",

    "tools.group.dev": "Development",
    "tools.group.encoding": "Encoding & Conversion",
    "tools.group.image": "Image",
    "tools.group.efficiency": "Efficiency",
    "tools.group.calculators": "Calculators",
    "tools.group.other": "Other",

    "tools.item.base64.title": "Base64 Encode/Decode",
    "tools.item.base64.desc": "UTF-8 text, URL-safe variant, optional padding removal.",
    "tools.item.base32.title": "Base32 Encode/Decode",
    "tools.item.base32.desc": "RFC 4648 Base32 for UTF-8 text, optional padding removal.",
    "tools.item.url.title": "URL Encode/Decode",
    "tools.item.url.desc": "encodeURIComponent / decodeURIComponent helpers.",
    "tools.item.unicode.title": "Unicode Escape/Unescape",
    "tools.item.unicode.desc": "Escape and unescape \\uXXXX / \\u{...} / \\xNN sequences.",
    "tools.item.hex.title": "Hex Encode/Decode",
    "tools.item.hex.desc": "UTF-8 text ↔ HEX bytes (with optional separators).",
    "tools.item.html.title": "HTML Escape/Unescape",
    "tools.item.html.desc": "Escape/unescape HTML entities like &lt; &gt; &amp; &quot; &#39;.",
    "tools.item.morse.title": "Morse Encode/Decode",
    "tools.item.morse.desc": "Encode and decode International Morse code.",
    "tools.item.base58.title": "Base58 Encode/Decode",
    "tools.item.base58.desc": "Bitcoin alphabet Base58 for UTF-8 text.",
    "tools.item.base85.title": "Base85 (Ascii85) Encode/Decode",
    "tools.item.base85.desc": "Ascii85/Base85 for UTF-8 text, optional “z” compression.",
    "tools.item.rot13.title": "ROT13",
    "tools.item.rot13.desc": "ROT13 transform for A-Z / a-z text.",
    "tools.item.escape.title": "Escape/Unescape (JS)",
    "tools.item.escape.desc": "Legacy JavaScript escape()/unescape() encoder/decoder.",
    "tools.item.json.title": "JSON Format/Minify",
    "tools.item.json.desc": "Pretty-print, minify, optional stable key sorting.",
    "tools.item.csv.title": "CSV ↔ JSON",
    "tools.item.csv.desc": "Convert between CSV and JSON (headers, delimiter options).",
    "tools.item.diff.title": "Text/JSON Diff",
    "tools.item.diff.desc": "Compare two texts (or JSON) and generate a unified diff locally.",
    "tools.item.xml.title": "XML Format/Minify",
    "tools.item.xml.desc": "Pretty-print or minify XML locally in your browser.",
    "tools.item.case.title": "Text Case Converter",
    "tools.item.case.desc": "Convert between common casing styles (camel, snake, kebab, title…).",
    "tools.item.lines.title": "Text Lines Tool",
    "tools.item.lines.desc": "Sort, dedupe, and clean up text lines.",
    "tools.item.hash.title": "SHA Hash",
    "tools.item.hash.desc": "WebCrypto: SHA-256 / SHA-1 / SHA-384 / SHA-512.",
    "tools.item.crc32.title": "CRC32 Checksum",
    "tools.item.crc32.desc": "CRC32 checksum for UTF-8 text (hex + decimal).",
    "tools.item.hmac.title": "HMAC",
    "tools.item.hmac.desc": "WebCrypto HMAC with SHA-256 / SHA-1 / SHA-384 / SHA-512.",
    "tools.item.md5.title": "MD5 Hash",
    "tools.item.md5.desc": "MD5 hash for UTF-8 text (hex or base64).",
    "tools.item.md4.title": "MD4 Hash",
    "tools.item.md4.desc": "MD4 hash for UTF-8 text (hex or base64).",
    "tools.item.md2.title": "MD2 Hash",
    "tools.item.md2.desc": "MD2 hash for UTF-8 text (hex or base64).",
    "tools.item.file-hash.title": "File Hash",
    "tools.item.file-hash.desc": "Compute file hashes locally (SHA + CRC32).",
    "tools.item.uuid.title": "UUID Generator",
    "tools.item.uuid.desc": "Generate UUID v4 locally in your browser.",
    "tools.item.uuid-v7.title": "UUID v7 Generator",
    "tools.item.uuid-v7.desc": "Generate time-ordered UUID v7 locally in your browser.",
    "tools.item.password.title": "Password Generator",
    "tools.item.password.desc": "Generate strong random passwords locally.",
    "tools.item.nanoid.title": "Nano ID Generator",
    "tools.item.nanoid.desc": "Generate short URL-safe IDs locally.",
    "tools.item.lorem.title": "Lorem Ipsum Generator",
    "tools.item.lorem.desc": "Generate lorem ipsum text locally.",
    "tools.item.ulid.title": "ULID Generator",
    "tools.item.ulid.desc": "Generate time-sortable ULIDs locally in your browser.",
    "tools.item.random-bytes.title": "Random Bytes Generator",
    "tools.item.random-bytes.desc": "Generate random bytes / API keys locally (hex, base64, base64url).",
    "tools.item.utm.title": "UTM Link Builder",
    "tools.item.utm.desc": "Generate tracking links with UTM parameters locally.",
    "tools.item.amazon-link.title": "Amazon Affiliate Link Builder",
    "tools.item.amazon-link.desc": "Generate Amazon /go links and affiliate URLs locally.",
    "tools.item.jwt.title": "JWT Decode",
    "tools.item.jwt.desc": "Decode JWT header and payload locally (no verification).",
    "tools.item.querystring.title": "Query String Parse/Build",
    "tools.item.querystring.desc": "Parse a URL/querystring into JSON, or build a querystring from JSON.",
    "tools.item.regex.title": "Regex Tester",
    "tools.item.regex.desc": "Test matches or do replacements with JavaScript RegExp.",
    "tools.item.aes.title": "AES-GCM Encrypt/Decrypt",
    "tools.item.aes.desc": "AES-GCM + PBKDF2 (passphrase) in your browser.",
    "tools.item.rsa.title": "RSA Hybrid Encrypt/Decrypt",
    "tools.item.rsa.desc": "Hybrid RSA-OAEP + AES-GCM for practical encrypt/decrypt.",
    "tools.item.timestamp.title": "Timestamp Converter",
    "tools.item.timestamp.desc": "Convert between Unix timestamps and dates.",
    "tools.item.number-base.title": "Number Base Converter",
    "tools.item.number-base.desc": "Convert numbers between bases (2-36).",
    "tools.item.ip.title": "IPv4 CIDR Calculator",
    "tools.item.ip.desc": "Compute netmask, network, broadcast, and host range from CIDR.",
    "tools.item.color.title": "Color Converter",
    "tools.item.color.desc": "Convert between HEX/RGB/HSL color formats.",

    "tool.common.input": "Input",
    "tool.common.output": "Output",
    "tool.common.placeholder": "Paste text here…",
    "tool.common.resultPlaceholder": "Result will appear here…",
    "tool.common.swap": "Swap",
    "tool.common.copyOutput": "Copy output",
    "tool.common.clear": "Clear",
    "tool.state.clearSaved": "Reset settings",
    "tool.state.cleared": "Reset saved settings",

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

    "tool.base58.encode": "Encode →",
    "tool.base58.decode": "← Decode",
    "tool.base58.status.encoded": "Encoded ({len} chars)",
    "tool.base58.status.decoded": "Decoded ({len} chars)",
    "tool.base58.error.invalid": "Decode failed: please check if the input is valid Base58",
    "tool.base58.error.utf8": "UTF-8 decode failed: the decoded bytes are not valid UTF-8",

    "tool.base85.encode": "Encode →",
    "tool.base85.decode": "← Decode",
    "tool.base85.useZ": "Use “z” for 4 zero bytes",
    "tool.base85.delimiters": "Wrap with <~ ~>",
    "tool.base85.status.encoded": "Encoded ({len} chars)",
    "tool.base85.status.decoded": "Decoded ({len} chars)",
    "tool.base85.error.decode": "Decode failed: please check if the input is valid Ascii85/Base85",
    "tool.base85.error.utf8": "UTF-8 decode failed: the decoded bytes are not valid UTF-8",

    "tool.rot13.convert": "Convert",
    "tool.rot13.status.done": "Converted ({len} chars)",

    "tool.escape.encode": "Escape →",
    "tool.escape.decode": "← Unescape",
    "tool.escape.uppercase": "Uppercase hex",
    "tool.escape.status.encoded": "Escaped ({len} chars)",
    "tool.escape.status.decoded": "Unescaped ({len} chars)",

    "tool.hex.encode": "Encode →",
    "tool.hex.decode": "← Decode",
    "tool.hex.uppercase": "Uppercase",
    "tool.hex.spaces": "Space-separated bytes",
    "tool.hex.prefix": "Prefix 0x",
    "tool.hex.status.encoded": "Encoded ({len} chars)",
    "tool.hex.status.decoded": "Decoded ({len} chars)",
    "tool.hex.error.invalid": "Invalid HEX input",
    "tool.hex.error.oddLength": "Invalid HEX length (must be even number of digits)",
    "tool.hex.error.utf8": "UTF-8 decode failed: the bytes are not valid UTF-8",

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

    "tool.csv.placeholder": "e.g. name,age\\nAlice,30\\nBob,25",
    "tool.csv.parse": "CSV → JSON",
    "tool.csv.build": "JSON → CSV",
    "tool.csv.delimiter": "Delimiter:",
    "tool.csv.delimiter.comma": "Comma (,)",
    "tool.csv.delimiter.tab": "Tab (\\t)",
    "tool.csv.delimiter.semicolon": "Semicolon (;)",
    "tool.csv.headerRow": "Header row",
    "tool.csv.trim": "Trim fields",
    "tool.csv.skipEmpty": "Skip empty lines",
    "tool.csv.quoteAll": "Quote all fields",
    "tool.csv.sortKeys": "Sort keys",
    "tool.csv.prettyJson": "Pretty JSON",
    "tool.csv.status.parsed": "Parsed ({rows} rows)",
    "tool.csv.status.built": "Built ({rows} rows)",
    "tool.csv.error.empty": "Please paste CSV or JSON",
    "tool.csv.error.noRows": "No rows found",
    "tool.csv.error.json": "Invalid JSON input (expected an array of objects/arrays)",

    "tool.diff.left": "Left",
    "tool.diff.right": "Right",
    "tool.diff.leftPlaceholder": "Paste left text…",
    "tool.diff.rightPlaceholder": "Paste right text…",
    "tool.diff.compare": "Compare",
    "tool.diff.mode": "Mode:",
    "tool.diff.mode.auto": "Auto",
    "tool.diff.mode.text": "Text",
    "tool.diff.mode.json": "JSON",
    "tool.diff.ignoreWs": "Ignore whitespace",
    "tool.diff.ignoreCase": "Ignore case",
    "tool.diff.status.done": "Compared: +{adds} -{dels} · {same} same · {lines} lines",
    "tool.diff.status.swapped": "Swapped left/right",
    "tool.diff.error.generic": "Compare failed",
    "tool.diff.error.json": "Invalid JSON ({side})",
    "tool.diff.error.jsonEmpty": "Please paste JSON ({side})",
    "tool.diff.error.tooLarge": "Too many lines ({count}). Please reduce the input.",

    "tool.xml.placeholder": "<root><item id='1'>hello</item></root>",
    "tool.xml.format": "Format",
    "tool.xml.minify": "Minify",
    "tool.xml.indent": "Indent:",
    "tool.xml.indent.tab": "Tab",
    "tool.xml.status.formatted": "Formatted ({len} chars)",
    "tool.xml.status.minified": "Minified ({len} chars)",
    "tool.xml.error.empty": "Please paste XML",
    "tool.xml.error.parse": "Parse failed: please check the XML syntax",

    "tool.case.convert": "Convert",
    "tool.case.mode": "Mode:",
    "tool.case.mode.camel": "camelCase",
    "tool.case.mode.pascal": "PascalCase",
    "tool.case.mode.snake": "snake_case",
    "tool.case.mode.kebab": "kebab-case",
    "tool.case.mode.constant": "CONSTANT_CASE",
    "tool.case.mode.title": "Title Case",
    "tool.case.mode.lower": "lowercase",
    "tool.case.mode.upper": "UPPERCASE",
    "tool.case.status.done": "Converted ({len} chars)",

    "tool.lines.placeholder": "e.g. one\\ntwo\\ntwo\\nthree",
    "tool.lines.run": "Apply",
    "tool.lines.trim": "Trim lines",
    "tool.lines.removeEmpty": "Remove empty lines",
    "tool.lines.unique": "Unique",
    "tool.lines.sort": "Sort:",
    "tool.lines.sort.none": "None",
    "tool.lines.sort.asc": "A → Z",
    "tool.lines.sort.desc": "Z → A",
    "tool.lines.reverse": "Reverse",
    "tool.lines.number": "Add line numbers",
    "tool.lines.status.done": "Done ({before} → {after} lines)",

    "tool.html.escape": "Escape →",
    "tool.html.unescape": "← Unescape",
    "tool.html.escapeQuotes": "Escape quotes",
    "tool.html.status.escaped": "Escaped ({len} chars)",
    "tool.html.status.unescaped": "Unescaped ({len} chars)",

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

    "tool.md5.compute": "Compute",
    "tool.md5.format": "Format:",
    "tool.md5.format.hex": "HEX",
    "tool.md5.format.base64": "Base64",
    "tool.md5.uppercase": "Uppercase HEX",
    "tool.md5.status.done": "Done ({len} chars)",
    "tool.md5.error.generic": "Compute failed",

    "tool.md4.compute": "Compute",
    "tool.md4.format": "Format:",
    "tool.md4.format.hex": "HEX",
    "tool.md4.format.base64": "Base64",
    "tool.md4.uppercase": "Uppercase HEX",
    "tool.md4.status.done": "Done ({len} chars)",
    "tool.md4.error.generic": "Compute failed",

    "tool.md2.compute": "Compute",
    "tool.md2.format": "Format:",
    "tool.md2.format.hex": "HEX",
    "tool.md2.format.base64": "Base64",
    "tool.md2.uppercase": "Uppercase HEX",
    "tool.md2.status.done": "Done ({len} chars)",
    "tool.md2.error.generic": "Compute failed",

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

    "tool.uuid7.generate": "Generate",
    "tool.uuid7.count": "Count:",
    "tool.uuid7.monotonic": "Monotonic (same timestamp)",
    "tool.uuid7.uppercase": "Uppercase",
    "tool.uuid7.noHyphens": "Remove hyphens",
    "tool.uuid7.braces": "Wrap with braces {}",
    "tool.uuid7.status.done": "Generated {count} UUID(s)",
    "tool.uuid7.error.unsupported": "This browser does not support crypto.getRandomValues",

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

    "tool.nanoid.generate": "Generate",
    "tool.nanoid.length": "Length:",
    "tool.nanoid.count": "Count:",
    "tool.nanoid.preset": "Alphabet:",
    "tool.nanoid.preset.url": "URL-safe",
    "tool.nanoid.preset.alnum": "Alphanumeric",
    "tool.nanoid.preset.hex": "HEX",
    "tool.nanoid.preset.numeric": "Numeric",
    "tool.nanoid.preset.custom": "Custom",
    "tool.nanoid.custom": "Custom:",
    "tool.nanoid.customPlaceholder": "Paste custom alphabet…",
    "tool.nanoid.status.done": "Generated {count} ID(s) · length {length}",
    "tool.nanoid.error.unsupported": "This browser does not support crypto.getRandomValues",
    "tool.nanoid.error.length": "Invalid length (4-128)",
    "tool.nanoid.error.count": "Invalid count (1-50)",
    "tool.nanoid.error.alphabet": "Alphabet must contain at least 2 unique characters",

    "tool.lorem.generate": "Generate",
    "tool.lorem.paragraphs": "Paragraphs:",
    "tool.lorem.sentences": "Sentences/para:",
    "tool.lorem.words": "Words/sentence:",
    "tool.lorem.startWithLorem": "Start with “Lorem ipsum…”",
    "tool.lorem.status.done": "Generated {paragraphs} paragraph(s)",
    "tool.lorem.error.paragraphs": "Invalid paragraphs (1-20)",
    "tool.lorem.error.sentences": "Invalid sentences (1-40)",
    "tool.lorem.error.words": "Invalid words (3-60)",

    "tool.ulid.generate": "Generate",
    "tool.ulid.count": "Count:",
    "tool.ulid.monotonic": "Monotonic (same timestamp)",
    "tool.ulid.lowercase": "Lowercase",
    "tool.ulid.status.done": "Generated {count} ULID(s)",
    "tool.ulid.error.unsupported": "This browser does not support crypto.getRandomValues",

    "tool.randomBytes.generate": "Generate",
    "tool.randomBytes.bytes": "Bytes:",
    "tool.randomBytes.count": "Count:",
    "tool.randomBytes.encoding": "Encoding:",
    "tool.randomBytes.encoding.hex": "HEX",
    "tool.randomBytes.encoding.base64": "Base64",
    "tool.randomBytes.encoding.base64url": "Base64URL",
    "tool.randomBytes.uppercase": "Uppercase HEX",
    "tool.randomBytes.prefix": "Prefix 0x",
    "tool.randomBytes.status.done": "Generated {count} value(s)",
    "tool.randomBytes.error.unsupported": "This browser does not support crypto.getRandomValues",
    "tool.randomBytes.error.bytes": "Invalid byte length",
    "tool.randomBytes.error.count": "Invalid count",
    "tool.randomBytes.error.tooLarge": "Too large (max {max} bytes total)",

    "tool.utm.url": "URL",
    "tool.utm.urlPlaceholder": "Paste a URL…",
    "tool.utm.source": "utm_source:",
    "tool.utm.medium": "utm_medium:",
    "tool.utm.campaign": "utm_campaign:",
    "tool.utm.term": "utm_term:",
    "tool.utm.content": "utm_content:",
    "tool.utm.custom": "Custom:",
    "tool.utm.customPlaceholder": "Extra params… (e.g. ref=twitter&foo=bar)",
    "tool.utm.generate": "Generate",
    "tool.utm.open": "Open",
    "tool.utm.status.done": "Link updated",
    "tool.utm.error.url": "Invalid URL",

    "tool.amazonLink.asin": "ASIN",
    "tool.amazonLink.asinPlaceholder": "Paste ASIN or Amazon URL…",
    "tool.amazonLink.title": "Title:",
    "tool.amazonLink.titlePlaceholder": "Optional link text… (supports {asin})",
    "tool.amazonLink.domain": "Domain:",
    "tool.amazonLink.tag": "Tag:",
    "tool.amazonLink.format": "Format:",
    "tool.amazonLink.format.plain": "Plain",
    "tool.amazonLink.format.markdown": "Markdown",
    "tool.amazonLink.format.html": "HTML",
    "tool.amazonLink.generate": "Generate",
    "tool.amazonLink.openGo": "Open /go",
    "tool.amazonLink.openAmazon": "Open Amazon",
    "tool.amazonLink.out.go": "Go:",
    "tool.amazonLink.out.amazon": "Amazon:",
    "tool.amazonLink.status.done": "Generated {count} item(s)",
    "tool.amazonLink.error.asin": "Please paste a valid ASIN or Amazon URL",
    "tool.amazonLink.note.go":
      "Note: “/go” only works for ASINs configured in your Shop list.",

    "tools.item.image-compress.title": "Image Compress/Resize",
    "tools.item.image-compress.desc":
      "Compress, resize, and convert images locally in your browser.",
    "tools.item.image-base64.title": "Image → Base64",
    "tools.item.image-base64.desc":
      "Convert images to Data URL / Base64 / HTML / Markdown locally.",
    "tools.item.image-watermark.title": "Image Watermark",
    "tools.item.image-watermark.desc":
      "Add a text watermark to images locally in your browser.",
    "tools.item.image-crop.title": "Image Crop/Round",
    "tools.item.image-crop.desc":
      "Center-crop images (aspect ratios) and export with rounded corners locally.",
    "tools.item.qr-code.title": "QR Code Generator",
    "tools.item.qr-code.desc":
      "Generate QR codes locally (PNG/SVG) with colors and error correction.",
    "tools.item.qr-scan.title": "QR Code Scanner",
    "tools.item.qr-scan.desc": "Scan QR codes from an image or camera locally in your browser.",

    "tool.imageCompress.file": "Image file",
    "tool.imageCompress.format": "Format:",
    "tool.imageCompress.format.keep": "Keep",
    "tool.imageCompress.format.jpeg": "JPEG",
    "tool.imageCompress.format.webp": "WebP",
    "tool.imageCompress.format.png": "PNG",
    "tool.imageCompress.autoPlaceholder": "Auto",
    "tool.imageCompress.maxWidth": "Max width:",
    "tool.imageCompress.maxHeight": "Max height:",
    "tool.imageCompress.quality": "Quality:",
    "tool.imageCompress.run": "Convert",
    "tool.imageCompress.download": "Download",
    "tool.imageCompress.original": "Original",
    "tool.imageCompress.output": "Output",
    "tool.imageCompress.status.working": "Working…",
    "tool.imageCompress.status.done": "Done (saved ~{saved}%)",
    "tool.imageCompress.error.noFile": "Please choose an image file",
    "tool.imageCompress.error.decode": "Failed to read image",
    "tool.imageCompress.error.unsupported": "Image conversion is not supported in this browser",

    "tool.imageBase64.file": "Image file",
    "tool.imageBase64.mode": "Output:",
    "tool.imageBase64.mode.dataUrl": "Data URL",
    "tool.imageBase64.mode.base64": "Base64",
    "tool.imageBase64.mode.html": "HTML <img>",
    "tool.imageBase64.mode.markdown": "Markdown",
    "tool.imageBase64.mode.css": "CSS url()",
    "tool.imageBase64.alt": "Alt text:",
    "tool.imageBase64.altPlaceholder": "Optional",
    "tool.imageBase64.generate": "Generate",
    "tool.imageBase64.preview": "Preview",
    "tool.imageBase64.status.working": "Working…",
	    "tool.imageBase64.status.done": "Generated ({len} chars)",
	    "tool.imageBase64.error.noFile": "Please choose an image file",
	    "tool.imageBase64.error.read": "Failed to read file",
	
	    "tool.imageWatermark.file": "Image file",
	    "tool.imageWatermark.text": "Watermark:",
	    "tool.imageWatermark.textPlaceholder": "Watermark text…",
	    "tool.imageWatermark.position": "Position:",
	    "tool.imageWatermark.position.br": "Bottom right",
	    "tool.imageWatermark.position.bl": "Bottom left",
	    "tool.imageWatermark.position.tr": "Top right",
	    "tool.imageWatermark.position.tl": "Top left",
	    "tool.imageWatermark.position.center": "Center",
	    "tool.imageWatermark.size": "Font size:",
	    "tool.imageWatermark.opacity": "Opacity:",
	    "tool.imageWatermark.color": "Color:",
	    "tool.imageWatermark.margin": "Margin:",
	    "tool.imageWatermark.outline": "Outline",
	    "tool.imageWatermark.format": "Format:",
	    "tool.imageWatermark.format.keep": "Keep",
	    "tool.imageWatermark.format.jpeg": "JPEG",
	    "tool.imageWatermark.format.webp": "WebP",
	    "tool.imageWatermark.format.png": "PNG",
	    "tool.imageWatermark.autoPlaceholder": "Auto",
	    "tool.imageWatermark.maxWidth": "Max width:",
	    "tool.imageWatermark.maxHeight": "Max height:",
	    "tool.imageWatermark.quality": "Quality:",
	    "tool.imageWatermark.run": "Apply",
	    "tool.imageWatermark.download": "Download",
	    "tool.imageWatermark.original": "Original",
	    "tool.imageWatermark.output": "Output",
	    "tool.imageWatermark.status.working": "Working…",
	    "tool.imageWatermark.status.done": "Done",
	    "tool.imageWatermark.error.noFile": "Please choose an image file",
	    "tool.imageWatermark.error.decode": "Failed to read image",
	    "tool.imageWatermark.error.color": "Invalid color (use #RRGGBB)",
	    "tool.imageWatermark.error.unsupported": "Image conversion is not supported in this browser",

    "tool.imageCrop.file": "Image file",
    "tool.imageCrop.mode": "Mode:",
    "tool.imageCrop.mode.full": "Full image",
    "tool.imageCrop.mode.center": "Center crop",
    "tool.imageCrop.mode.manual": "Manual crop",
    "tool.imageCrop.ratio": "Aspect:",
    "tool.imageCrop.ratio.free": "Free",
    "tool.imageCrop.ratio.1x1": "1:1",
    "tool.imageCrop.ratio.4x3": "4:3",
    "tool.imageCrop.ratio.16x9": "16:9",
    "tool.imageCrop.ratio.3x4": "3:4",
    "tool.imageCrop.ratio.9x16": "9:16",
    "tool.imageCrop.ratio.custom": "Custom",
    "tool.imageCrop.ratioW": "W:",
    "tool.imageCrop.ratioH": "H:",
    "tool.imageCrop.x": "X:",
    "tool.imageCrop.y": "Y:",
    "tool.imageCrop.w": "W:",
    "tool.imageCrop.h": "H:",
    "tool.imageCrop.radius": "Radius:",
    "tool.imageCrop.format": "Format:",
    "tool.imageCrop.format.keep": "Keep",
    "tool.imageCrop.format.jpeg": "JPEG",
    "tool.imageCrop.format.webp": "WebP",
    "tool.imageCrop.format.png": "PNG",
    "tool.imageCrop.autoPlaceholder": "Auto",
    "tool.imageCrop.maxWidth": "Max width:",
    "tool.imageCrop.maxHeight": "Max height:",
    "tool.imageCrop.quality": "Quality:",
    "tool.imageCrop.bg": "Background:",
    "tool.imageCrop.run": "Apply",
    "tool.imageCrop.download": "Download",
    "tool.imageCrop.original": "Original",
    "tool.imageCrop.output": "Output",
    "tool.imageCrop.status.working": "Working…",
    "tool.imageCrop.status.done": "Done",
    "tool.imageCrop.error.noFile": "Please choose an image file",
    "tool.imageCrop.error.decode": "Failed to read image",
    "tool.imageCrop.error.manual": "Invalid manual crop values",
    "tool.imageCrop.error.color": "Invalid color (use #RRGGBB)",
    "tool.imageCrop.error.unsupported": "Image conversion is not supported in this browser",

    "tool.qrCode.text": "Text",
    "tool.qrCode.textPlaceholder": "Type text or URL…",
    "tool.qrCode.preview": "Preview",
    "tool.qrCode.generate": "Generate",
    "tool.qrCode.download": "Download",
    "tool.qrCode.ecc": "Error correction:",
    "tool.qrCode.ecc.l": "L (7%)",
    "tool.qrCode.ecc.m": "M (15%)",
    "tool.qrCode.ecc.q": "Q (25%)",
    "tool.qrCode.ecc.h": "H (30%)",
    "tool.qrCode.format": "Format:",
    "tool.qrCode.format.png": "PNG",
    "tool.qrCode.format.svg": "SVG",
    "tool.qrCode.size": "Size (px):",
    "tool.qrCode.margin": "Margin:",
    "tool.qrCode.fg": "Foreground:",
    "tool.qrCode.bg": "Background:",
    "tool.qrCode.status.working": "Working…",
    "tool.qrCode.status.done": "Generated ({meta})",
    "tool.qrCode.error.noText": "Please enter text or a URL",
    "tool.qrCode.error.color": "Invalid color (use #RRGGBB)",
    "tool.qrCode.error.size": "Invalid size",
    "tool.qrCode.error.margin": "Invalid margin",
    "tool.qrCode.error.tooLong": "Input is too long for a QR code",
    "tool.qrCode.error.unsupported": "Canvas is not supported in this browser",
    "tool.qrCode.error.vendor": "QR library failed to load",

    "tool.qrScan.file": "Image file",
    "tool.qrScan.preview": "Preview",
    "tool.qrScan.scan": "Scan",
    "tool.qrScan.startCamera": "Start camera",
    "tool.qrScan.stopCamera": "Stop camera",
    "tool.qrScan.open": "Open link",
    "tool.qrScan.multi": "Detect multiple codes",
    "tool.qrScan.note": "Tip: scanning from camera may require HTTPS and permission.",
    "tool.qrScan.status.working": "Working…",
    "tool.qrScan.status.none": "No QR code found",
    "tool.qrScan.status.done": "Found {count} code(s)",
    "tool.qrScan.status.camera": "Camera scanning…",
    "tool.qrScan.status.stopped": "Camera stopped",
    "tool.qrScan.error.noFile": "Please choose an image file",
    "tool.qrScan.error.decode": "Failed to read image",
    "tool.qrScan.error.vendor": "QR scanning library failed to load",
    "tool.qrScan.error.canvas": "Canvas is not supported in this browser",
    "tool.qrScan.error.unsupported": "QR scanning is not supported in this browser",
    "tool.qrScan.error.camera": "Camera access is not supported in this browser",
    "tool.qrScan.error.cameraUnsupported":
      "Camera scanning is not available (use an image file instead)",
    "tool.qrScan.error.generic": "Scan failed",

    "tools.item.unit-converter.title": "Unit Converter",
    "tools.item.unit-converter.desc":
      "Convert between common units (length, mass, temperature, data size…).",
    "tools.item.percentage.title": "Percentage Calculator",
    "tools.item.percentage.desc":
      "Quick percent calculations: X% of Y, change, increase/decrease.",
    "tools.item.bmi.title": "BMI Calculator",
    "tools.item.bmi.desc": "Calculate BMI (Body Mass Index) locally and show the healthy range.",
    "tools.item.date-diff.title": "Date Difference",
    "tools.item.date-diff.desc":
      "Compute time differences between two dates (days, hours, minutes).",
    "tools.item.time-zone.title": "Time Zone Converter",
    "tools.item.time-zone.desc": "Convert date/time between time zones (DST-aware).",
    "tools.item.tip.title": "Tip Calculator",
    "tools.item.tip.desc": "Calculate tip, total, and split per person.",
    "tools.item.sales-tax.title": "Sales Tax Calculator",
    "tools.item.sales-tax.desc": "Compute sales tax and totals (add tax or tax-included).",
    "tools.item.mortgage.title": "Mortgage Calculator",
    "tools.item.mortgage.desc": "Estimate payment, totals, and payoff with extra payments.",
    "tools.item.loan.title": "Loan Calculator",
    "tools.item.loan.desc": "Calculate loan payments, totals, and payoff with extra payments.",
    "tools.item.salary.title": "Salary Calculator",
    "tools.item.salary.desc":
      "Convert between annual salary and hourly pay (monthly/biweekly/weekly).",
    "tools.item.gas-cost.title": "Gas Cost Calculator",
    "tools.item.gas-cost.desc":
      "Estimate fuel needed and total gas cost for a trip (miles, MPG, $/gal).",
    "tools.item.credit-card-payoff.title": "Credit Card Payoff Calculator",
    "tools.item.credit-card-payoff.desc": "Estimate payoff time and interest for a credit card balance.",
    "tools.item.compound-interest.title": "Compound Interest Calculator",
    "tools.item.compound-interest.desc":
      "Estimate future value with monthly contributions and compounding.",
    "tools.item.horoscope.title": "Daily Horoscope",
    "tools.item.horoscope.desc": "Daily horoscope by zodiac sign (for entertainment only).",

    "tool.timeZone.datetime": "Date & time",
    "tool.timeZone.from": "From time zone",
    "tool.timeZone.to": "To time zone",
    "tool.timeZone.convert": "Convert",
    "tool.timeZone.now": "Now",
    "tool.timeZone.status.done": "Converted",
    "tool.timeZone.status.adjusted": "Converted (adjusted)",
    "tool.timeZone.note.adjusted":
      "Note: this local time may be ambiguous or invalid due to DST, so the result was adjusted.",
    "tool.timeZone.error.datetime": "Please select a valid date/time",
    "tool.timeZone.error.fromZone": "Invalid “From” time zone",
    "tool.timeZone.error.toZone": "Invalid “To” time zone",
    "tool.timeZone.out.from": "From:",
    "tool.timeZone.out.utc": "UTC:",
    "tool.timeZone.out.to": "To:",
    "tool.timeZone.out.timestamp": "Timestamp:",

    "tool.tip.bill": "Bill amount",
    "tool.tip.billPlaceholder": "e.g. 48.50",
    "tool.tip.tipPercent": "Tip %",
    "tool.tip.people": "People",
    "tool.tip.round": "Round up per-person total",
    "tool.tip.presets": "Presets:",
    "tool.tip.calculate": "Calculate",
    "tool.tip.status.done": "Calculated",
    "tool.tip.error.bill": "Please enter a valid bill amount",
    "tool.tip.out.bill": "Bill",
    "tool.tip.out.tip": "Tip",
    "tool.tip.out.total": "Total",
    "tool.tip.out.split": "Split",
    "tool.tip.out.perPersonBill": "Per person (bill)",
    "tool.tip.out.perPersonTip": "Per person (tip)",
    "tool.tip.out.perPersonTotal": "Per person (total)",

    "tool.horoscope.disclaimer": "For entertainment only. Not advice.",
    "tool.horoscope.sign": "Zodiac sign",
    "tool.horoscope.date": "Date",
    "tool.horoscope.generate": "Generate",
    "tool.horoscope.today": "Today",
    "tool.horoscope.status.done": "Generated",
    "tool.horoscope.out.sign": "Sign",
    "tool.horoscope.out.date": "Date",
    "tool.horoscope.out.general": "Overall",
    "tool.horoscope.out.love": "Love",
    "tool.horoscope.out.career": "Career",
    "tool.horoscope.out.money": "Money",
    "tool.horoscope.out.health": "Health",
    "tool.horoscope.out.luckyColor": "Lucky color",
    "tool.horoscope.out.luckyNumber": "Lucky number",

    "tool.salesTax.amount": "Amount",
    "tool.salesTax.amountPlaceholder": "e.g. 19.99",
    "tool.salesTax.mode": "Mode",
    "tool.salesTax.mode.add": "Add tax",
    "tool.salesTax.mode.included": "Tax included",
    "tool.salesTax.rate": "Tax rate %",
    "tool.salesTax.qty": "Qty",
    "tool.salesTax.presets": "Presets:",
    "tool.salesTax.calculate": "Calculate",
    "tool.salesTax.status.done": "Calculated",
    "tool.salesTax.error.amount": "Please enter a valid amount",
    "tool.salesTax.error.rate": "Please enter a valid tax rate",
    "tool.salesTax.out.mode": "Mode",
    "tool.salesTax.out.rate": "Tax rate",
    "tool.salesTax.out.qty": "Qty",
    "tool.salesTax.out.subtotal": "Subtotal",
    "tool.salesTax.out.tax": "Tax",
    "tool.salesTax.out.total": "Total",
    "tool.salesTax.out.perItem": "Per item",

    "tool.mortgage.disclaimer": "Estimates only. Not financial advice.",
    "tool.mortgage.homePrice": "Home price",
    "tool.mortgage.homePricePlaceholder": "e.g. 450000",
    "tool.mortgage.downMode": "Down payment",
    "tool.mortgage.downMode.percent": "Percent",
    "tool.mortgage.downMode.amount": "Amount",
    "tool.mortgage.downPlaceholder": "e.g. 20",
    "tool.mortgage.apr": "APR %",
    "tool.mortgage.termYears": "Term",
    "tool.mortgage.years": "years",
    "tool.mortgage.months": "months",
    "tool.mortgage.propertyTax": "Property tax / year",
    "tool.mortgage.taxPlaceholder": "e.g. 6000",
    "tool.mortgage.insurance": "Insurance / year",
    "tool.mortgage.insurancePlaceholder": "e.g. 1200",
    "tool.mortgage.hoa": "HOA / month",
    "tool.mortgage.hoaPlaceholder": "e.g. 0",
    "tool.mortgage.pmi": "PMI / month",
    "tool.mortgage.pmiPlaceholder": "e.g. 0",
    "tool.mortgage.extra": "Extra payment / month",
    "tool.mortgage.extraPlaceholder": "e.g. 200",
    "tool.mortgage.showSchedule": "Show first 12 payments",
    "tool.mortgage.calculate": "Calculate",
    "tool.mortgage.status.done": "Calculated",
    "tool.mortgage.error.homePrice": "Please enter a valid home price",
    "tool.mortgage.error.down": "Please enter a valid down payment",
    "tool.mortgage.error.generic": "Calculation failed. Please check your inputs.",
    "tool.mortgage.out.homePrice": "Home price",
    "tool.mortgage.out.downPayment": "Down payment",
    "tool.mortgage.out.loanAmount": "Loan amount",
    "tool.mortgage.out.apr": "APR",
    "tool.mortgage.out.term": "Term",
    "tool.mortgage.out.pi": "P&I",
    "tool.mortgage.out.escrow": "Extras",
    "tool.mortgage.out.monthlyTotal": "Monthly total",
    "tool.mortgage.out.totalInterest": "Total interest",
    "tool.mortgage.out.totalPaid": "Total paid (P&I)",
    "tool.mortgage.out.extra": "Extra payment",
    "tool.mortgage.out.monthlyTotalExtra": "Monthly total (with extra)",
    "tool.mortgage.out.payoffTime": "Payoff time",
    "tool.mortgage.out.payoffDate": "Estimated payoff date",
    "tool.mortgage.out.totalInterestExtra": "Total interest (with extra)",
    "tool.mortgage.out.interestSaved": "Interest saved",
    "tool.mortgage.out.firstPayments": "First 12 payments",
    "tool.mortgage.out.interest": "Interest",
    "tool.mortgage.out.principal": "Principal",
    "tool.mortgage.out.balance": "Balance",

    "tool.loan.disclaimer": "Estimates only. Not financial advice.",
    "tool.loan.amount": "Loan amount",
    "tool.loan.amountPlaceholder": "e.g. 15000",
    "tool.loan.apr": "APR %",
    "tool.loan.termMonths": "Term",
    "tool.loan.termPresets": "Presets:",
    "tool.loan.months": "months",
    "tool.loan.years": "years",
    "tool.loan.extra": "Extra payment / month",
    "tool.loan.extraPlaceholder": "e.g. 50",
    "tool.loan.showSchedule": "Show first 12 payments",
    "tool.loan.calculate": "Calculate",
    "tool.loan.status.done": "Calculated",
    "tool.loan.error.amount": "Please enter a valid loan amount",
    "tool.loan.error.generic": "Calculation failed. Please check your inputs.",
    "tool.loan.out.amount": "Loan amount",
    "tool.loan.out.apr": "APR",
    "tool.loan.out.term": "Term",
    "tool.loan.out.payment": "Monthly payment",
    "tool.loan.out.totalInterest": "Total interest",
    "tool.loan.out.totalPaid": "Total paid",
    "tool.loan.out.extra": "Extra payment",
    "tool.loan.out.paymentExtra": "Monthly payment (with extra)",
    "tool.loan.out.payoffTime": "Payoff time",
    "tool.loan.out.payoffDate": "Estimated payoff date",
    "tool.loan.out.totalInterestExtra": "Total interest (with extra)",
    "tool.loan.out.interestSaved": "Interest saved",
    "tool.loan.out.firstPayments": "First 12 payments",
    "tool.loan.out.interest": "Interest",
    "tool.loan.out.principal": "Principal",
    "tool.loan.out.balance": "Balance",

    "tool.salary.amount": "Amount",
    "tool.salary.amountPlaceholder": "e.g. 75000",
    "tool.salary.mode": "Mode",
    "tool.salary.mode.salary": "Salary (annual)",
    "tool.salary.mode.hourly": "Hourly",
    "tool.salary.hoursPerWeek": "Hours / week",
    "tool.salary.weeksPerYear": "Weeks / year",
    "tool.salary.calculate": "Calculate",
    "tool.salary.status.done": "Calculated",
    "tool.salary.error.amount": "Please enter a valid amount",
    "tool.salary.error.hours": "Please enter valid hours per week",
    "tool.salary.error.weeks": "Please enter valid weeks per year",
    "tool.salary.out.mode": "Mode",
    "tool.salary.out.hoursPerWeek": "Hours / week",
    "tool.salary.out.weeksPerYear": "Weeks / year",
    "tool.salary.out.annual": "Annual",
    "tool.salary.out.monthly": "Monthly",
    "tool.salary.out.semiMonthly": "Semi-monthly",
    "tool.salary.out.biweekly": "Biweekly",
    "tool.salary.out.weekly": "Weekly",
    "tool.salary.out.hourly": "Hourly",

    "tool.gasCost.distance": "Distance (miles)",
    "tool.gasCost.distancePlaceholder": "e.g. 120",
    "tool.gasCost.mpg": "Fuel economy (MPG)",
    "tool.gasCost.price": "Gas price ($/gal)",
    "tool.gasCost.pricePlaceholder": "e.g. 3.79",
    "tool.gasCost.trips": "Trips",
    "tool.gasCost.roundTrip": "Round trip (×2)",
    "tool.gasCost.calculate": "Calculate",
    "tool.gasCost.status.done": "Calculated",
    "tool.gasCost.error.distance": "Please enter a valid distance",
    "tool.gasCost.error.mpg": "Please enter a valid MPG",
    "tool.gasCost.error.price": "Please enter a valid gas price",
    "tool.gasCost.out.distance": "Distance",
    "tool.gasCost.out.mpg": "Fuel economy",
    "tool.gasCost.out.price": "Gas price",
    "tool.gasCost.out.trips": "Trips",
    "tool.gasCost.out.roundTrip": "round trip",
    "tool.gasCost.out.totalDistance": "Total distance",
    "tool.gasCost.out.gallons": "Fuel needed",
    "tool.gasCost.out.totalCost": "Total cost",
    "tool.gasCost.out.costPerMile": "Cost per mile",

    "tool.creditCardPayoff.disclaimer": "Estimates only. Not financial advice.",
    "tool.creditCardPayoff.balance": "Balance",
    "tool.creditCardPayoff.balancePlaceholder": "e.g. 3500",
    "tool.creditCardPayoff.apr": "APR %",
    "tool.creditCardPayoff.payment": "Monthly payment",
    "tool.creditCardPayoff.paymentPlaceholder": "e.g. 150",
    "tool.creditCardPayoff.extra": "Extra payment / month",
    "tool.creditCardPayoff.extraPlaceholder": "e.g. 25",
    "tool.creditCardPayoff.showSchedule": "Show first 12 payments",
    "tool.creditCardPayoff.calculate": "Calculate",
    "tool.creditCardPayoff.status.done": "Calculated",
    "tool.creditCardPayoff.months": "months",
    "tool.creditCardPayoff.years": "years",
    "tool.creditCardPayoff.error.balance": "Please enter a valid balance",
    "tool.creditCardPayoff.error.payment": "Please enter a valid monthly payment",
    "tool.creditCardPayoff.error.paymentTooLow": "Payment is too low to cover interest (balance will grow)",
    "tool.creditCardPayoff.error.generic": "Calculation failed. Please check your inputs.",
    "tool.creditCardPayoff.error.extraTooLow":
      "Extra payment is still too low to pay down this balance.",
    "tool.creditCardPayoff.out.balance": "Balance",
    "tool.creditCardPayoff.out.apr": "APR",
    "tool.creditCardPayoff.out.payment": "Monthly payment",
    "tool.creditCardPayoff.out.payoffTime": "Payoff time",
    "tool.creditCardPayoff.out.payoffDate": "Estimated payoff date",
    "tool.creditCardPayoff.out.totalInterest": "Total interest",
    "tool.creditCardPayoff.out.totalPaid": "Total paid",
    "tool.creditCardPayoff.out.extra": "Extra payment",
    "tool.creditCardPayoff.out.paymentExtra": "Monthly payment (with extra)",
    "tool.creditCardPayoff.out.payoffTimeExtra": "Payoff time (with extra)",
    "tool.creditCardPayoff.out.payoffDateExtra": "Estimated payoff date (with extra)",
    "tool.creditCardPayoff.out.totalInterestExtra": "Total interest (with extra)",
    "tool.creditCardPayoff.out.totalPaidExtra": "Total paid (with extra)",
    "tool.creditCardPayoff.out.interestSaved": "Interest saved",
    "tool.creditCardPayoff.out.firstPayments": "First 12 payments",
    "tool.creditCardPayoff.out.interest": "Interest",
    "tool.creditCardPayoff.out.principal": "Principal",

    "tool.compoundInterest.disclaimer": "Estimates only. Not financial advice.",
    "tool.compoundInterest.principal": "Initial amount",
    "tool.compoundInterest.principalPlaceholder": "e.g. 10000",
    "tool.compoundInterest.contribution": "Contribution / month",
    "tool.compoundInterest.contributionPlaceholder": "e.g. 200",
    "tool.compoundInterest.rate": "Annual rate %",
    "tool.compoundInterest.yearsInput": "Years",
    "tool.compoundInterest.timing": "Contribution timing",
    "tool.compoundInterest.timing.end": "End of month",
    "tool.compoundInterest.timing.start": "Start of month",
    "tool.compoundInterest.showBreakdown": "Show yearly breakdown",
    "tool.compoundInterest.calculate": "Calculate",
    "tool.compoundInterest.status.done": "Calculated",
    "tool.compoundInterest.error.principal": "Please enter a valid initial amount",
    "tool.compoundInterest.error.contribution": "Please enter a valid monthly contribution",
    "tool.compoundInterest.months": "months",
    "tool.compoundInterest.years": "years",
    "tool.compoundInterest.out.principal": "Initial amount",
    "tool.compoundInterest.out.contribution": "Contribution / month",
    "tool.compoundInterest.out.rate": "Annual rate",
    "tool.compoundInterest.out.duration": "Duration",
    "tool.compoundInterest.out.timing": "Contribution timing",
    "tool.compoundInterest.out.final": "Final balance",
    "tool.compoundInterest.out.totalContributions": "Total contributions",
    "tool.compoundInterest.out.totalInterest": "Total interest",
    "tool.compoundInterest.out.breakdownTitle": "Yearly breakdown",
    "tool.compoundInterest.out.breakdownLine":
      "Year {year}: {balance} (contrib: {contrib}, interest: {interest})",

    "tool.unit.value": "Value",
    "tool.unit.valuePlaceholder": "e.g. 123.45",
    "tool.unit.category": "Category:",
    "tool.unit.category.length": "Length",
    "tool.unit.category.mass": "Mass",
    "tool.unit.category.temperature": "Temperature",
    "tool.unit.category.area": "Area",
    "tool.unit.category.volume": "Volume",
    "tool.unit.category.speed": "Speed",
    "tool.unit.category.data": "Data size",
    "tool.unit.from": "From:",
    "tool.unit.to": "To:",
    "tool.unit.precision": "Precision:",
    "tool.unit.trim": "Trim zeros",
    "tool.unit.convert": "Convert",
    "tool.unit.status.done": "Converted",
    "tool.unit.error.value": "Please enter a valid number",
    "tool.unit.error.unit": "Invalid unit selection",

    "tool.percentage.base": "Base value (Y)",
    "tool.percentage.basePlaceholder": "e.g. 100",
    "tool.percentage.percent": "Percent (X)",
    "tool.percentage.percentPlaceholder": "e.g. 15",
    "tool.percentage.compare": "Compare value (Z)",
    "tool.percentage.comparePlaceholder": "e.g. 120",
    "tool.percentage.precision": "Precision:",
    "tool.percentage.trim": "Trim zeros",
    "tool.percentage.calculate": "Calculate",
    "tool.percentage.status.done": "Calculated",
    "tool.percentage.error.base": "Please enter a valid base value",
    "tool.percentage.error.percent": "Please enter a valid percent",
    "tool.percentage.error.compare": "Please enter a valid compare value",
    "tool.percentage.out.percentOf": "X% of Y",
    "tool.percentage.out.increase": "Y + X%",
    "tool.percentage.out.decrease": "Y - X%",
    "tool.percentage.out.whatPercent": "Z is what % of Y",
    "tool.percentage.out.change": "Change Y → Z",

    "tool.bmi.unit": "Units",
    "tool.bmi.unit.metric": "Metric (cm/kg)",
    "tool.bmi.unit.imperial": "Imperial (ft/in/lb)",
    "tool.bmi.heightCm": "Height (cm)",
    "tool.bmi.heightCmPlaceholder": "e.g. 175",
    "tool.bmi.weightKg": "Weight (kg)",
    "tool.bmi.weightKgPlaceholder": "e.g. 70",
    "tool.bmi.heightFt": "Height (ft)",
    "tool.bmi.heightFtPlaceholder": "e.g. 5",
    "tool.bmi.heightIn": "Height (in)",
    "tool.bmi.heightInPlaceholder": "e.g. 9",
    "tool.bmi.weightLb": "Weight (lb)",
    "tool.bmi.weightLbPlaceholder": "e.g. 154",
    "tool.bmi.calculate": "Calculate",
    "tool.bmi.status.done": "Calculated",
    "tool.bmi.error.height": "Please enter a valid height",
    "tool.bmi.error.weight": "Please enter a valid weight",
    "tool.bmi.error.generic": "Calculate failed",
    "tool.bmi.category.unknown": "Unknown",
    "tool.bmi.category.underweight": "Underweight",
    "tool.bmi.category.normal": "Normal",
    "tool.bmi.category.overweight": "Overweight",
    "tool.bmi.category.obese": "Obese",
    "tool.bmi.out.bmi": "BMI",
    "tool.bmi.out.category": "Category",
    "tool.bmi.out.healthyRange": "Healthy weight range",

    "tool.dateDiff.start": "Start",
    "tool.dateDiff.end": "End",
    "tool.dateDiff.now": "Now",
    "tool.dateDiff.swap": "Swap",
    "tool.dateDiff.calculate": "Calculate",
    "tool.dateDiff.status.done": "Calculated",
    "tool.dateDiff.error.missing": "Please select both dates",
    "tool.dateDiff.out.start": "Start:",
    "tool.dateDiff.out.end": "End:",
    "tool.dateDiff.out.diff": "Difference:",
    "tool.dateDiff.out.totalDays": "Total days:",
    "tool.dateDiff.out.totalHours": "Total hours:",
    "tool.dateDiff.out.totalMinutes": "Total minutes:",
    "tool.dateDiff.out.totalSeconds": "Total seconds:",

    "tool.morse.encode": "Encode →",
    "tool.morse.decode": "← Decode",
    "tool.morse.useSlash": "Use “/” between words",
    "tool.morse.uppercase": "Uppercase decoded text",
    "tool.morse.status.encoded": "Encoded ({len} chars)",
    "tool.morse.status.encodedUnknown": "Encoded ({len} chars, {unknown} unknown)",
    "tool.morse.status.decoded": "Decoded ({len} chars)",
    "tool.morse.status.decodedUnknown": "Decoded ({len} chars, {unknown} unknown)",

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

    "tool.querystring.parse": "Parse →",
    "tool.querystring.build": "← Build",
    "tool.querystring.plusForSpace": "Treat “+” as space",
    "tool.querystring.sortKeys": "Sort keys",
    "tool.querystring.leadingQuestionMark": "Leading “?”",
    "tool.querystring.status.parsed": "Parsed ({count} keys)",
    "tool.querystring.status.built": "Built ({len} chars)",
    "tool.querystring.error.empty": "Please paste a URL/querystring or JSON",
    "tool.querystring.error.parse": "Parse failed: please check if the input is a valid query string",
    "tool.querystring.error.json": "Build failed: please paste valid JSON (object or array)",

    "tool.regex.text": "Text",
    "tool.regex.find": "Find matches",
    "tool.regex.replace": "Replace",
    "tool.regex.pattern": "Pattern:",
    "tool.regex.patternPlaceholder": "e.g. (\\\\w+)=(\\\\w+)",
    "tool.regex.flags": "Flags:",
    "tool.regex.replacement": "Replacement:",
    "tool.regex.replacementPlaceholder": "e.g. $2=$1",
    "tool.regex.prettyJson": "Pretty JSON output",
    "tool.regex.status.done": "Done ({count} match(es))",
    "tool.regex.status.replaced": "Replaced ({len} chars)",
    "tool.regex.error.pattern": "Please enter a pattern",
    "tool.regex.error.compile": "Invalid RegExp (pattern/flags)",

    "tool.aes.passphrase": "Passphrase",
    "tool.aes.passphrasePlaceholder": "Passphrase…",
    "tool.aes.iterations": "PBKDF2 iterations:",
    "tool.aes.encrypt": "Encrypt →",
    "tool.aes.decrypt": "← Decrypt",
    "tool.aes.status.encrypted": "Encrypted ({len} chars)",
    "tool.aes.status.decrypted": "Decrypted ({len} chars)",
    "tool.aes.error.unsupported": "This browser does not support WebCrypto (PBKDF2/AES-GCM)",
    "tool.aes.error.passphrase": "Please enter a passphrase",
    "tool.aes.error.empty": "Please paste an encrypted payload (JSON)",
    "tool.aes.error.payload": "Invalid payload: expected JSON from this tool",
    "tool.aes.error.decrypt": "Decrypt failed: wrong passphrase or corrupted payload",

    "tool.rsa.publicKey": "Public key (PEM)",
    "tool.rsa.privateKey": "Private key (PEM)",
    "tool.rsa.publicKeyPlaceholder": "-----BEGIN PUBLIC KEY-----\\n...\\n-----END PUBLIC KEY-----",
    "tool.rsa.privateKeyPlaceholder": "-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----",
    "tool.rsa.generate": "Generate keypair",
    "tool.rsa.encrypt": "Encrypt → (public)",
    "tool.rsa.decrypt": "← Decrypt (private)",
    "tool.rsa.keySize": "Key size:",
    "tool.rsa.inputPlaceholder": "Paste text (encrypt) or payload JSON (decrypt)…",
    "tool.rsa.status.generated": "Generated {size}-bit keypair",
    "tool.rsa.status.encrypted": "Encrypted ({len} chars)",
    "tool.rsa.status.decrypted": "Decrypted ({len} chars)",
    "tool.rsa.error.unsupported": "This browser does not support WebCrypto (RSA/AES-GCM)",
    "tool.rsa.error.keyMissing": "Please paste a PEM key",
    "tool.rsa.error.keySize": "Invalid key size",
    "tool.rsa.error.payload": "Invalid payload: expected JSON from this tool",
    "tool.rsa.error.utf8": "UTF-8 decode failed: the decrypted bytes are not valid UTF-8",

    "tool.timestamp.input": "Input",
    "tool.timestamp.placeholder": "e.g. 1735200000 or 2025-01-01T00:00:00Z",
    "tool.timestamp.convert": "Convert",
    "tool.timestamp.now": "Now",
    "tool.timestamp.unit": "Unit:",
    "tool.timestamp.unit.auto": "Auto",
    "tool.timestamp.unit.seconds": "Seconds",
    "tool.timestamp.unit.milliseconds": "Milliseconds",
    "tool.timestamp.status.done": "Converted",
    "tool.timestamp.error.empty": "Please paste a timestamp or date",
    "tool.timestamp.error.invalid": "Invalid timestamp/date",

    "tool.numberBase.inputLabel": "Number",
    "tool.numberBase.placeholder": "e.g. 0xff or 101010 or -42",
    "tool.numberBase.convert": "Convert",
    "tool.numberBase.fromBase": "From:",
    "tool.numberBase.toBase": "To:",
    "tool.numberBase.base.auto": "Auto",
    "tool.numberBase.uppercase": "Uppercase output",
    "tool.numberBase.prefix": "Add prefix (0x/0b/0o)",
    "tool.numberBase.status.done": "Converted ({len} chars)",
    "tool.numberBase.error.empty": "Please paste a number",
    "tool.numberBase.error.base": "Invalid base (2-36)",
    "tool.numberBase.error.invalid": "Invalid number for the selected base",

    "tool.ip.inputLabel": "IPv4 / CIDR",
    "tool.ip.placeholder": "e.g. 192.168.1.10/24",
    "tool.ip.calculate": "Calculate",
    "tool.ip.prefix": "Prefix:",
    "tool.ip.status.done": "Calculated",
    "tool.ip.error.empty": "Please paste an IPv4 address (optionally with /prefix)",
    "tool.ip.error.prefix": "Invalid prefix (0-32)",
    "tool.ip.error.ip": "Invalid IPv4 address",
    "tool.ip.out.cidr": "CIDR",
    "tool.ip.out.ip": "IP",
    "tool.ip.out.ipBinary": "IP (binary)",
    "tool.ip.out.netmask": "Netmask",
    "tool.ip.out.wildcard": "Wildcard",
    "tool.ip.out.network": "Network",
    "tool.ip.out.broadcast": "Broadcast",
    "tool.ip.out.range": "Host range",
    "tool.ip.out.total": "Total addresses",
    "tool.ip.out.usable": "Usable addresses",
    "tool.ip.note.31": "Note: /31 typically has 2 usable addresses (point-to-point links).",
    "tool.ip.note.32": "Note: /32 represents a single host route.",

    "tool.fileHash.file": "File",
    "tool.fileHash.compute": "Compute",
    "tool.fileHash.algorithm": "Algorithm:",
    "tool.fileHash.format": "Format:",
    "tool.fileHash.format.hex": "HEX",
    "tool.fileHash.format.base64": "Base64",
    "tool.fileHash.format.both": "Both",
    "tool.fileHash.uppercase": "Uppercase HEX",
    "tool.fileHash.status.working": "Computing…",
    "tool.fileHash.status.done": "Done: {alg}",
    "tool.fileHash.error.noFile": "Please choose a file",
    "tool.fileHash.error.unsupported": "This browser does not support WebCrypto (crypto.subtle.digest)",

    "tool.color.input": "Color",
    "tool.color.placeholder": "#38bdf8 or rgb(56,189,248) or hsl(199,93%,59%)",
    "tool.color.convert": "Convert",
    "tool.color.status.done": "Converted",
    "tool.color.error.empty": "Please paste a color value",
    "tool.color.error.invalid": "Invalid color (supported: HEX, rgb(), hsl())",
    "tool.color.hex": "HEX",
    "tool.color.rgb": "RGB",
    "tool.color.rgba": "RGBA",
    "tool.color.hsl": "HSL",
    "tool.color.hsla": "HSLA",

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
    "nav.skip": "跳到正文",
    "nav.top": "返回顶部",
    "nav.home": "首页",
    "nav.shop": "购物",
    "nav.news": "新闻",
    "nav.tools": "工具",
    "nav.toolsAll": "全部工具",
    "nav.categories": "分类",
    "nav.language": "语言",
    "nav.search": "搜索",
    "nav.about": "关于",
    "nav.privacy": "隐私政策",
    "nav.disclosure": "返利声明",
    "nav.contact": "联系",
    "nav.terms": "使用条款",
    "nav.rss": "RSS",
    "nav.theme": "主题",
    "nav.library": "收藏",

    "theme.auto": "跟随系统",
    "theme.light": "浅色",
    "theme.dark": "深色",

    "library.title": "收藏",
    "library.subtitle": "收藏与最近浏览仅保存在你的浏览器本地，不会上传。",
    "library.favorites": "我的收藏",
    "library.recent": "最近浏览",
    "library.clear": "清空",
    "library.emptyFavorites": "暂无收藏。",
    "library.emptyRecent": "暂无最近浏览。",
    "library.remove": "移除",
    "library.toolsFavorites": "收藏的工具",
    "library.toolsRecent": "最近使用的工具",
    "library.emptyToolsFavorites": "暂无收藏工具。",
    "library.emptyToolsRecent": "暂无最近使用的工具。",
    "library.shopFavorites": "收藏的商品",
    "library.emptyShopFavorites": "暂无收藏商品。",
    "library.search.label": "筛选",
    "library.search.placeholder": "筛选…",
    "library.sort.label": "排序",
    "library.sort.recent": "最近",
    "library.sort.titleAsc": "标题 A→Z",
    "library.sort.titleDesc": "标题 Z→A",
    "library.export": "导出",
    "library.import": "导入",
    "library.backupNote": "导入/导出仅影响本地收藏（JSON），不会上传。",
    "library.status.filtered": "“{q}” 共匹配 {count} 条",
    "library.status.noResults": "没有匹配 “{q}” 的内容。",
    "library.status.exported": "已导出。",
    "library.importSuccess": "导入完成：{articles} 篇文章、{tools} 个工具、{shop} 个商品。",
    "library.importFailed": "导入失败，请检查 JSON 文件。",

    "search.label": "搜索",
    "search.title": "搜索",
    "search.placeholder": "搜索…（/）",
    "search.go": "搜索",
    "search.notice1": "搜索仅在部署后可用（Pagefind 索引会在运行",
    "search.notice2": "时生成）。",

    "home.tools": "工具",
    "home.start": "开始",
    "home.latest": "最新",
    "home.shopFeatured": "精选",
    "home.shopAll": "查看全部",
    "home.shopBrowse": "快速浏览：",

    "article.copy": "复制链接",
    "article.share": "分享",
    "article.related": "同类推荐",
    "article.openOriginal": "打开原文 →",
    "article.readOriginal": "查看原文",
    "article.fromRss": "来自 RSS",
    "article.fromRssNote": "内容来自 RSS 源提取的节选（可能被截断）。官方版本请点击「打开原文」。",
    "article.keyPoints": "要点",
    "article.moreIn": "更多",
    "article.moreFromSource": "更多来自 {source}",
    "article.moreFromSourceAll": "查看该来源全部",
    "article.save": "收藏",
    "article.unsave": "取消收藏",

    "common.copied": "已复制",
    "common.copyFailed": "复制失败",

    "breadcrumbs.home": "首页",
    "pager.prev": "← 上一页",
    "pager.next": "下一页 →",
    "pager.meta": "第 {current} / {total} 页",

    "languages.title": "语言",
    "languages.empty": "暂无语言。",

    "sources.title": "来源",

    "shop.title": "购物",
    "shop.subtitle": "亚马逊精选商品。通过我们的链接购买，我们可能会获得佣金。",
    "shop.filter": "筛选：",
    "shop.tag.all": "全部",
    "shop.filterStatus": "已筛选：{tag} · {count} 个商品",
    "shop.filterStatusBoth": "已筛选：{tag} · {q} · {count} 个商品",
    "shop.search.label": "搜索商品",
    "shop.search.placeholder": "搜索商品…",
    "shop.search.clear": "清除",
    "shop.searchStatus": "搜索：{q} · {count} 个商品",
    "shop.reset": "重置筛选",
    "shop.featured": "精选",
    "shop.sort.label": "排序：",
    "shop.sort.default": "默认",
    "shop.sort.rating": "评分",
    "shop.sort.reviews": "评价数",
    "shop.sort.priceAsc": "价格 ↑",
    "shop.sort.priceDesc": "价格 ↓",
    "shop.sort.titleAsc": "标题 A→Z",
    "shop.sort.titleDesc": "标题 Z→A",
    "shop.noResults": "没有匹配的商品。",
    "shop.cta": "去亚马逊查看",
    "shop.savedOnly": "仅收藏",
    "shop.savedStatus": "仅收藏 · {count} 个商品",
    "shop.savedFilterStatus": "仅收藏：{tag} · {count} 个商品",
    "shop.savedFilterStatusBoth": "仅收藏：{tag} · {q} · {count} 个商品",
    "shop.savedSearchStatus": "仅收藏：{q} · {count} 个商品",
    "shop.savedBanner": "已收藏 {count} 个商品 →",
    "shop.updatedAt": "更新时间",
    "shop.disclaimer": "作为亚马逊联盟会员，我们可能会从符合条件的购买中获得佣金。",
    "shop.empty": "暂无商品。",
    "shop.disabled": "未启用。请配置",
    "shop.disabled2": "然后运行",

    "tools.title": "工具",
    "tools.subtitle": "所有工具均在浏览器本地运行，不会上传内容。",
    "tools.localNotice": "纯前端运行，内容不会上传。",
    "tools.nav.jump": "快速跳转",
    "tools.filter.label": "筛选工具",
    "tools.filter.placeholder": "筛选工具…",
    "tools.filter.clear": "清除",
    "tools.filter.status": "“{q}” 共 {count} 个工具",
    "tools.filter.empty": "没有匹配的工具。",
    "tools.quick.options": "选项",
    "tools.related": "同类工具推荐",

    "tools.group.dev": "开发工具类",
    "tools.group.encoding": "编解码转换类",
    "tools.group.image": "图像处理类",
    "tools.group.efficiency": "效率工具类",
    "tools.group.calculators": "计算工具类",
    "tools.group.other": "其他工具",

    "tools.item.base64.title": "Base64 编码/解码",
    "tools.item.base64.desc": "UTF-8 文本、URL-safe 变体、可选去掉 padding。",
    "tools.item.base32.title": "Base32 编码/解码",
    "tools.item.base32.desc": "RFC 4648 Base32（UTF-8 文本），可选去掉 padding。",
    "tools.item.url.title": "URL 编码/解码",
    "tools.item.url.desc": "encodeURIComponent / decodeURIComponent 辅助。",
    "tools.item.unicode.title": "Unicode 转义/反转义",
    "tools.item.unicode.desc": "Unicode 序列：\\uXXXX / \\u{...} / \\xNN 的转义与反转义。",
    "tools.item.hex.title": "HEX 编码/解码",
    "tools.item.hex.desc": "UTF-8 文本 ↔ HEX 字节（可选分隔符）。",
    "tools.item.html.title": "HTML 转义/反转义",
    "tools.item.html.desc": "HTML 实体转义/反转义：&lt; &gt; &amp; &quot; &#39; 等。",
    "tools.item.morse.title": "摩斯电码编码/解码",
    "tools.item.morse.desc": "国际摩斯电码编码与解码。",
    "tools.item.base58.title": "Base58 编码/解码",
    "tools.item.base58.desc": "Bitcoin 字母表 Base58（UTF-8 文本）。",
    "tools.item.base85.title": "Base85（Ascii85）编码/解码",
    "tools.item.base85.desc": "UTF-8 文本 Ascii85/Base85（可选使用 “z” 压缩）。",
    "tools.item.rot13.title": "ROT13",
    "tools.item.rot13.desc": "A-Z / a-z 的 ROT13 变换。",
    "tools.item.escape.title": "Escape/Unescape（JS）",
    "tools.item.escape.desc": "JavaScript 的 escape()/unescape()（兼容旧编码）。",
    "tools.item.json.title": "JSON 格式化/压缩",
    "tools.item.json.desc": "格式化、压缩、可选 key 排序（稳定输出）。",
    "tools.item.csv.title": "CSV ↔ JSON",
    "tools.item.csv.desc": "CSV 与 JSON 互转（表头、分隔符等选项）。",
    "tools.item.diff.title": "文本/JSON 对比",
    "tools.item.diff.desc": "对比两段文本（或 JSON）并生成 unified diff，本地运行。",
    "tools.item.xml.title": "XML 格式化/压缩",
    "tools.item.xml.desc": "本地将 XML 格式化或压缩（不上传内容）。",
    "tools.item.case.title": "大小写风格转换",
    "tools.item.case.desc": "常见命名风格转换：camel/snake/kebab/title 等。",
    "tools.item.lines.title": "文本行工具",
    "tools.item.lines.desc": "对文本按行排序、去重与清洗。",
    "tools.item.hash.title": "SHA 哈希",
    "tools.item.hash.desc": "WebCrypto：SHA-256 / SHA-1 / SHA-384 / SHA-512。",
    "tools.item.crc32.title": "CRC32 校验",
    "tools.item.crc32.desc": "UTF-8 文本 CRC32 校验（hex + 十进制）。",
    "tools.item.hmac.title": "HMAC",
    "tools.item.hmac.desc": "WebCrypto HMAC：SHA-256 / SHA-1 / SHA-384 / SHA-512。",
    "tools.item.md5.title": "MD5 哈希",
    "tools.item.md5.desc": "UTF-8 文本 MD5（hex 或 base64）。",
    "tools.item.md4.title": "MD4 哈希",
    "tools.item.md4.desc": "UTF-8 文本 MD4（hex 或 base64）。",
    "tools.item.md2.title": "MD2 哈希",
    "tools.item.md2.desc": "UTF-8 文本 MD2（hex 或 base64）。",
    "tools.item.file-hash.title": "文件哈希",
    "tools.item.file-hash.desc": "本地计算文件哈希（SHA + CRC32）。",
    "tools.item.uuid.title": "UUID 生成器",
    "tools.item.uuid.desc": "在浏览器本地生成 UUID v4。",
    "tools.item.uuid-v7.title": "UUID v7 生成器",
    "tools.item.uuid-v7.desc": "在浏览器本地生成可排序的 UUID v7。",
    "tools.item.password.title": "随机密码生成器",
    "tools.item.password.desc": "在浏览器本地生成强随机密码。",
    "tools.item.nanoid.title": "Nano ID 生成器",
    "tools.item.nanoid.desc": "本地生成短的 URL-safe ID。",
    "tools.item.lorem.title": "Lorem Ipsum 生成器",
    "tools.item.lorem.desc": "本地生成 lorem ipsum 测试文本。",
    "tools.item.ulid.title": "ULID 生成器",
    "tools.item.ulid.desc": "在浏览器本地生成可排序的 ULID。",
    "tools.item.random-bytes.title": "随机字节生成器",
    "tools.item.random-bytes.desc": "在浏览器本地生成随机字节/Token（HEX/Base64/Base64URL）。",
    "tools.item.utm.title": "UTM 链接生成器",
    "tools.item.utm.desc": "在浏览器本地生成带 UTM 参数的跟踪链接。",
    "tools.item.amazon-link.title": "Amazon 联盟链接生成器",
    "tools.item.amazon-link.desc": "在浏览器本地生成 /go 链接与联盟链接。",
    "tools.item.jwt.title": "JWT 解析",
    "tools.item.jwt.desc": "本地解析 JWT 头部与载荷（不做签名校验）。",
    "tools.item.querystring.title": "QueryString 解析/生成",
    "tools.item.querystring.desc": "把 URL/querystring 解析为 JSON，或从 JSON 生成 querystring。",
    "tools.item.regex.title": "正则测试器",
    "tools.item.regex.desc": "测试匹配或做替换（JavaScript RegExp）。",
    "tools.item.aes.title": "AES-GCM 加密/解密",
    "tools.item.aes.desc": "浏览器本地 AES-GCM + PBKDF2（口令）。",
    "tools.item.rsa.title": "RSA 混合加密/解密",
    "tools.item.rsa.desc": "RSA-OAEP + AES-GCM 的混合加密方案（更实用）。",
    "tools.item.timestamp.title": "时间戳转换",
    "tools.item.timestamp.desc": "Unix 时间戳与日期时间互转。",
    "tools.item.number-base.title": "进制转换",
    "tools.item.number-base.desc": "数字在不同进制间转换（2-36）。",
    "tools.item.ip.title": "IPv4 CIDR 计算器",
    "tools.item.ip.desc": "从 CIDR 计算掩码、网络号、广播地址与可用范围。",
    "tools.item.color.title": "颜色转换",
    "tools.item.color.desc": "HEX/RGB/HSL 颜色格式互转。",

    "tool.common.input": "输入",
    "tool.common.output": "输出",
    "tool.common.placeholder": "在这里粘贴文本…",
    "tool.common.resultPlaceholder": "结果会显示在这里…",
    "tool.common.swap": "交换",
    "tool.common.copyOutput": "复制输出",
    "tool.common.clear": "清空",
    "tool.state.clearSaved": "重置设置",
    "tool.state.cleared": "已重置已保存的设置",

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

    "tool.base58.encode": "编码 →",
    "tool.base58.decode": "← 解码",
    "tool.base58.status.encoded": "编码完成（{len} 个字符）",
    "tool.base58.status.decoded": "解码完成（{len} 个字符）",
    "tool.base58.error.invalid": "解码失败：请检查输入是否为合法 Base58",
    "tool.base58.error.utf8": "UTF-8 解码失败：解码结果不是合法 UTF-8",

    "tool.base85.encode": "编码 →",
    "tool.base85.decode": "← 解码",
    "tool.base85.useZ": "4 个 0 字节使用 “z”",
    "tool.base85.delimiters": "使用 <~ ~> 包裹",
    "tool.base85.status.encoded": "编码完成（{len} 个字符）",
    "tool.base85.status.decoded": "解码完成（{len} 个字符）",
    "tool.base85.error.decode": "解码失败：请检查输入是否为合法 Ascii85/Base85",
    "tool.base85.error.utf8": "UTF-8 解码失败：解码结果不是合法 UTF-8",

    "tool.rot13.convert": "转换",
    "tool.rot13.status.done": "转换完成（{len} 个字符）",

    "tool.escape.encode": "转义 →",
    "tool.escape.decode": "← 反转义",
    "tool.escape.uppercase": "十六进制大写",
    "tool.escape.status.encoded": "已转义（{len} 个字符）",
    "tool.escape.status.decoded": "已反转义（{len} 个字符）",

    "tool.hex.encode": "编码 →",
    "tool.hex.decode": "← 解码",
    "tool.hex.uppercase": "大写",
    "tool.hex.spaces": "字节用空格分隔",
    "tool.hex.prefix": "前缀 0x",
    "tool.hex.status.encoded": "编码完成（{len} 个字符）",
    "tool.hex.status.decoded": "解码完成（{len} 个字符）",
    "tool.hex.error.invalid": "HEX 输入不合法",
    "tool.hex.error.oddLength": "HEX 长度不合法（必须是偶数位）",
    "tool.hex.error.utf8": "UTF-8 解码失败：字节不是合法 UTF-8",

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

    "tool.csv.placeholder": "例如：name,age\\nAlice,30\\nBob,25",
    "tool.csv.parse": "CSV → JSON",
    "tool.csv.build": "JSON → CSV",
    "tool.csv.delimiter": "分隔符：",
    "tool.csv.delimiter.comma": "逗号 (,)",
    "tool.csv.delimiter.tab": "制表符 (\\t)",
    "tool.csv.delimiter.semicolon": "分号 (;)",
    "tool.csv.headerRow": "首行作为表头",
    "tool.csv.trim": "去掉两侧空格",
    "tool.csv.skipEmpty": "跳过空行",
    "tool.csv.quoteAll": "所有字段加引号",
    "tool.csv.sortKeys": "key 排序",
    "tool.csv.prettyJson": "美化 JSON",
    "tool.csv.status.parsed": "已解析（{rows} 行）",
    "tool.csv.status.built": "已生成（{rows} 行）",
    "tool.csv.error.empty": "请输入 CSV 或 JSON",
    "tool.csv.error.noRows": "没有可用的行",
    "tool.csv.error.json": "JSON 不合法（期望：对象数组或二维数组）",

    "tool.diff.left": "左侧",
    "tool.diff.right": "右侧",
    "tool.diff.leftPlaceholder": "粘贴左侧文本…",
    "tool.diff.rightPlaceholder": "粘贴右侧文本…",
    "tool.diff.compare": "对比",
    "tool.diff.mode": "模式：",
    "tool.diff.mode.auto": "自动",
    "tool.diff.mode.text": "文本",
    "tool.diff.mode.json": "JSON",
    "tool.diff.ignoreWs": "忽略空白",
    "tool.diff.ignoreCase": "忽略大小写",
    "tool.diff.status.done": "对比完成：+{adds} -{dels} · 相同 {same} · 共 {lines} 行",
    "tool.diff.status.swapped": "已交换左右",
    "tool.diff.error.generic": "对比失败",
    "tool.diff.error.json": "JSON 不合法（{side}）",
    "tool.diff.error.jsonEmpty": "请输入 JSON（{side}）",
    "tool.diff.error.tooLarge": "行数过多（{count}），请减少输入内容。",

    "tool.xml.placeholder": "<root><item id='1'>hello</item></root>",
    "tool.xml.format": "格式化",
    "tool.xml.minify": "压缩",
    "tool.xml.indent": "缩进：",
    "tool.xml.indent.tab": "Tab",
    "tool.xml.status.formatted": "已格式化（{len} 字符）",
    "tool.xml.status.minified": "已压缩（{len} 字符）",
    "tool.xml.error.empty": "请输入 XML",
    "tool.xml.error.parse": "解析失败：请检查 XML 语法",

    "tool.case.convert": "转换",
    "tool.case.mode": "模式：",
    "tool.case.mode.camel": "camelCase",
    "tool.case.mode.pascal": "PascalCase",
    "tool.case.mode.snake": "snake_case",
    "tool.case.mode.kebab": "kebab-case",
    "tool.case.mode.constant": "CONSTANT_CASE",
    "tool.case.mode.title": "Title Case",
    "tool.case.mode.lower": "小写",
    "tool.case.mode.upper": "大写",
    "tool.case.status.done": "转换完成（{len} 个字符）",

    "tool.lines.placeholder": "例如：one\\ntwo\\ntwo\\nthree",
    "tool.lines.run": "应用",
    "tool.lines.trim": "去掉两侧空格",
    "tool.lines.removeEmpty": "移除空行",
    "tool.lines.unique": "去重",
    "tool.lines.sort": "排序：",
    "tool.lines.sort.none": "不排序",
    "tool.lines.sort.asc": "正序（A→Z）",
    "tool.lines.sort.desc": "倒序（Z→A）",
    "tool.lines.reverse": "反转",
    "tool.lines.number": "添加行号",
    "tool.lines.status.done": "完成（{before} → {after} 行）",

    "tool.html.escape": "转义 →",
    "tool.html.unescape": "← 反转义",
    "tool.html.escapeQuotes": "转义引号",
    "tool.html.status.escaped": "转义完成（{len} 个字符）",
    "tool.html.status.unescaped": "反转义完成（{len} 个字符）",

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

    "tool.md5.compute": "计算",
    "tool.md5.format": "格式：",
    "tool.md5.format.hex": "HEX",
    "tool.md5.format.base64": "Base64",
    "tool.md5.uppercase": "大写 HEX",
    "tool.md5.status.done": "完成（{len} 个字符）",
    "tool.md5.error.generic": "计算失败",

    "tool.md4.compute": "计算",
    "tool.md4.format": "格式：",
    "tool.md4.format.hex": "HEX",
    "tool.md4.format.base64": "Base64",
    "tool.md4.uppercase": "大写 HEX",
    "tool.md4.status.done": "完成（{len} 个字符）",
    "tool.md4.error.generic": "计算失败",

    "tool.md2.compute": "计算",
    "tool.md2.format": "格式：",
    "tool.md2.format.hex": "HEX",
    "tool.md2.format.base64": "Base64",
    "tool.md2.uppercase": "大写 HEX",
    "tool.md2.status.done": "完成（{len} 个字符）",
    "tool.md2.error.generic": "计算失败",

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

    "tool.uuid7.generate": "生成",
    "tool.uuid7.count": "数量：",
    "tool.uuid7.monotonic": "单调递增（同一毫秒）",
    "tool.uuid7.uppercase": "大写",
    "tool.uuid7.noHyphens": "去掉连字符",
    "tool.uuid7.braces": "用大括号包裹 {}",
    "tool.uuid7.status.done": "已生成 {count} 个 UUID",
    "tool.uuid7.error.unsupported": "当前浏览器不支持 crypto.getRandomValues",

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

    "tool.nanoid.generate": "生成",
    "tool.nanoid.length": "长度：",
    "tool.nanoid.count": "数量：",
    "tool.nanoid.preset": "字符集：",
    "tool.nanoid.preset.url": "URL-safe",
    "tool.nanoid.preset.alnum": "字母数字",
    "tool.nanoid.preset.hex": "HEX",
    "tool.nanoid.preset.numeric": "纯数字",
    "tool.nanoid.preset.custom": "自定义",
    "tool.nanoid.custom": "自定义：",
    "tool.nanoid.customPlaceholder": "粘贴自定义字符集…",
    "tool.nanoid.status.done": "已生成 {count} 个 ID · 长度 {length}",
    "tool.nanoid.error.unsupported": "当前浏览器不支持 crypto.getRandomValues",
    "tool.nanoid.error.length": "长度不合法（4-128）",
    "tool.nanoid.error.count": "数量不合法（1-50）",
    "tool.nanoid.error.alphabet": "字符集至少需要 2 个不同字符",

    "tool.lorem.generate": "生成",
    "tool.lorem.paragraphs": "段落数：",
    "tool.lorem.sentences": "每段句子数：",
    "tool.lorem.words": "每句单词数：",
    "tool.lorem.startWithLorem": "以 “Lorem ipsum…” 开头",
    "tool.lorem.status.done": "已生成 {paragraphs} 段",
    "tool.lorem.error.paragraphs": "段落数不合法（1-20）",
    "tool.lorem.error.sentences": "句子数不合法（1-40）",
    "tool.lorem.error.words": "单词数不合法（3-60）",

    "tool.ulid.generate": "生成",
    "tool.ulid.count": "数量：",
    "tool.ulid.monotonic": "单调递增（同一毫秒）",
    "tool.ulid.lowercase": "小写",
    "tool.ulid.status.done": "已生成 {count} 个 ULID",
    "tool.ulid.error.unsupported": "当前浏览器不支持 crypto.getRandomValues",

    "tool.randomBytes.generate": "生成",
    "tool.randomBytes.bytes": "字节数：",
    "tool.randomBytes.count": "数量：",
    "tool.randomBytes.encoding": "编码：",
    "tool.randomBytes.encoding.hex": "HEX",
    "tool.randomBytes.encoding.base64": "Base64",
    "tool.randomBytes.encoding.base64url": "Base64URL",
    "tool.randomBytes.uppercase": "大写 HEX",
    "tool.randomBytes.prefix": "前缀 0x",
    "tool.randomBytes.status.done": "已生成 {count} 条",
    "tool.randomBytes.error.unsupported": "当前浏览器不支持 crypto.getRandomValues",
    "tool.randomBytes.error.bytes": "字节数不合法",
    "tool.randomBytes.error.count": "数量不合法",
    "tool.randomBytes.error.tooLarge": "输出过大（总字节数最多 {max}）",

    "tool.utm.url": "链接",
    "tool.utm.urlPlaceholder": "粘贴链接…",
    "tool.utm.source": "utm_source：",
    "tool.utm.medium": "utm_medium：",
    "tool.utm.campaign": "utm_campaign：",
    "tool.utm.term": "utm_term：",
    "tool.utm.content": "utm_content：",
    "tool.utm.custom": "自定义：",
    "tool.utm.customPlaceholder": "额外参数…（例如：ref=twitter&foo=bar）",
    "tool.utm.generate": "生成",
    "tool.utm.open": "打开",
    "tool.utm.status.done": "已生成链接",
    "tool.utm.error.url": "链接不合法",

    "tool.amazonLink.asin": "ASIN",
    "tool.amazonLink.asinPlaceholder": "粘贴 ASIN 或亚马逊链接…",
    "tool.amazonLink.title": "标题：",
    "tool.amazonLink.titlePlaceholder": "可选（支持 {asin}）",
    "tool.amazonLink.domain": "站点：",
    "tool.amazonLink.tag": "Tag：",
    "tool.amazonLink.format": "格式：",
    "tool.amazonLink.format.plain": "纯文本",
    "tool.amazonLink.format.markdown": "Markdown",
    "tool.amazonLink.format.html": "HTML",
    "tool.amazonLink.generate": "生成",
    "tool.amazonLink.openGo": "打开 /go",
    "tool.amazonLink.openAmazon": "打开亚马逊",
    "tool.amazonLink.out.go": "Go：",
    "tool.amazonLink.out.amazon": "Amazon：",
    "tool.amazonLink.status.done": "已生成 {count} 条",
    "tool.amazonLink.error.asin": "请输入有效的 ASIN 或亚马逊链接",
    "tool.amazonLink.note.go": "提示：/go 仅对你在 Shop 列表里配置过的 ASIN 有效。",

    "tools.item.image-compress.title": "图片压缩/调整尺寸",
    "tools.item.image-compress.desc": "在浏览器本地压缩、缩放并转换图片格式。",
    "tools.item.image-base64.title": "图片 → Base64",
    "tools.item.image-base64.desc": "将图片转换为 Data URL / Base64 / HTML / Markdown（本地完成）。",
    "tools.item.image-watermark.title": "图片水印",
    "tools.item.image-watermark.desc": "为图片添加文字水印（本地完成）。",
    "tools.item.image-crop.title": "图片裁剪/圆角",
    "tools.item.image-crop.desc": "按比例居中裁剪图片，并可导出圆角效果（本地完成）。",
    "tools.item.qr-code.title": "二维码生成器",
    "tools.item.qr-code.desc": "本地生成二维码（PNG/SVG），支持纠错级别与颜色。",
    "tools.item.qr-scan.title": "二维码识别",
    "tools.item.qr-scan.desc": "从图片或摄像头识别二维码（本地完成）。",

    "tool.imageCompress.file": "图片文件",
    "tool.imageCompress.format": "格式：",
    "tool.imageCompress.format.keep": "保持",
    "tool.imageCompress.format.jpeg": "JPEG",
    "tool.imageCompress.format.webp": "WebP",
    "tool.imageCompress.format.png": "PNG",
    "tool.imageCompress.autoPlaceholder": "自动",
    "tool.imageCompress.maxWidth": "最大宽度：",
    "tool.imageCompress.maxHeight": "最大高度：",
    "tool.imageCompress.quality": "质量：",
    "tool.imageCompress.run": "转换",
    "tool.imageCompress.download": "下载",
    "tool.imageCompress.original": "原图",
    "tool.imageCompress.output": "输出",
    "tool.imageCompress.status.working": "处理中…",
    "tool.imageCompress.status.done": "完成（约节省 {saved}%）",
    "tool.imageCompress.error.noFile": "请选择图片文件",
    "tool.imageCompress.error.decode": "读取图片失败",
    "tool.imageCompress.error.unsupported": "当前浏览器不支持图片转换",

    "tool.imageBase64.file": "图片文件",
    "tool.imageBase64.mode": "输出：",
    "tool.imageBase64.mode.dataUrl": "Data URL",
    "tool.imageBase64.mode.base64": "Base64",
    "tool.imageBase64.mode.html": "HTML <img>",
    "tool.imageBase64.mode.markdown": "Markdown",
    "tool.imageBase64.mode.css": "CSS url()",
    "tool.imageBase64.alt": "替代文本：",
    "tool.imageBase64.altPlaceholder": "可选",
    "tool.imageBase64.generate": "生成",
    "tool.imageBase64.preview": "预览",
    "tool.imageBase64.status.working": "处理中…",
	    "tool.imageBase64.status.done": "已生成（{len} 个字符）",
	    "tool.imageBase64.error.noFile": "请选择图片文件",
	    "tool.imageBase64.error.read": "读取文件失败",
	
	    "tool.imageWatermark.file": "图片文件",
	    "tool.imageWatermark.text": "水印文字：",
	    "tool.imageWatermark.textPlaceholder": "输入水印文字…",
	    "tool.imageWatermark.position": "位置：",
	    "tool.imageWatermark.position.br": "右下",
	    "tool.imageWatermark.position.bl": "左下",
	    "tool.imageWatermark.position.tr": "右上",
	    "tool.imageWatermark.position.tl": "左上",
	    "tool.imageWatermark.position.center": "居中",
	    "tool.imageWatermark.size": "字号：",
	    "tool.imageWatermark.opacity": "透明度：",
	    "tool.imageWatermark.color": "颜色：",
	    "tool.imageWatermark.margin": "边距：",
	    "tool.imageWatermark.outline": "描边",
	    "tool.imageWatermark.format": "格式：",
	    "tool.imageWatermark.format.keep": "保持",
	    "tool.imageWatermark.format.jpeg": "JPEG",
	    "tool.imageWatermark.format.webp": "WebP",
	    "tool.imageWatermark.format.png": "PNG",
	    "tool.imageWatermark.autoPlaceholder": "自动",
	    "tool.imageWatermark.maxWidth": "最大宽度：",
	    "tool.imageWatermark.maxHeight": "最大高度：",
	    "tool.imageWatermark.quality": "质量：",
	    "tool.imageWatermark.run": "应用",
	    "tool.imageWatermark.download": "下载",
	    "tool.imageWatermark.original": "原图",
	    "tool.imageWatermark.output": "输出",
	    "tool.imageWatermark.status.working": "处理中…",
		    "tool.imageWatermark.status.done": "完成",
		    "tool.imageWatermark.error.noFile": "请选择图片文件",
		    "tool.imageWatermark.error.decode": "读取图片失败",
		    "tool.imageWatermark.error.color": "颜色不合法（请用 #RRGGBB）",
		    "tool.imageWatermark.error.unsupported": "当前浏览器不支持图片转换",

    "tool.imageCrop.file": "图片文件",
    "tool.imageCrop.mode": "模式：",
    "tool.imageCrop.mode.full": "完整图片",
    "tool.imageCrop.mode.center": "居中裁剪",
    "tool.imageCrop.mode.manual": "手动裁剪",
    "tool.imageCrop.ratio": "比例：",
    "tool.imageCrop.ratio.free": "自由",
    "tool.imageCrop.ratio.1x1": "1:1",
    "tool.imageCrop.ratio.4x3": "4:3",
    "tool.imageCrop.ratio.16x9": "16:9",
    "tool.imageCrop.ratio.3x4": "3:4",
    "tool.imageCrop.ratio.9x16": "9:16",
    "tool.imageCrop.ratio.custom": "自定义",
    "tool.imageCrop.ratioW": "宽：",
    "tool.imageCrop.ratioH": "高：",
    "tool.imageCrop.x": "X：",
    "tool.imageCrop.y": "Y：",
    "tool.imageCrop.w": "宽：",
    "tool.imageCrop.h": "高：",
    "tool.imageCrop.radius": "圆角：",
    "tool.imageCrop.format": "格式：",
    "tool.imageCrop.format.keep": "保持",
    "tool.imageCrop.format.jpeg": "JPEG",
    "tool.imageCrop.format.webp": "WebP",
    "tool.imageCrop.format.png": "PNG",
    "tool.imageCrop.autoPlaceholder": "自动",
    "tool.imageCrop.maxWidth": "最大宽度：",
    "tool.imageCrop.maxHeight": "最大高度：",
    "tool.imageCrop.quality": "质量：",
    "tool.imageCrop.bg": "背景：",
    "tool.imageCrop.run": "应用",
    "tool.imageCrop.download": "下载",
    "tool.imageCrop.original": "原图",
    "tool.imageCrop.output": "输出",
    "tool.imageCrop.status.working": "处理中…",
    "tool.imageCrop.status.done": "完成",
    "tool.imageCrop.error.noFile": "请选择图片文件",
    "tool.imageCrop.error.decode": "读取图片失败",
    "tool.imageCrop.error.manual": "手动裁剪参数不合法",
    "tool.imageCrop.error.color": "颜色不合法（请用 #RRGGBB）",
    "tool.imageCrop.error.unsupported": "当前浏览器不支持图片转换",

    "tool.qrCode.text": "内容",
    "tool.qrCode.textPlaceholder": "输入文本或链接…",
    "tool.qrCode.preview": "预览",
    "tool.qrCode.generate": "生成",
    "tool.qrCode.download": "下载",
    "tool.qrCode.ecc": "纠错级别：",
    "tool.qrCode.ecc.l": "L（7%）",
    "tool.qrCode.ecc.m": "M（15%）",
    "tool.qrCode.ecc.q": "Q（25%）",
    "tool.qrCode.ecc.h": "H（30%）",
    "tool.qrCode.format": "格式：",
    "tool.qrCode.format.png": "PNG",
    "tool.qrCode.format.svg": "SVG",
    "tool.qrCode.size": "尺寸（px）：",
    "tool.qrCode.margin": "边距：",
    "tool.qrCode.fg": "前景色：",
    "tool.qrCode.bg": "背景色：",
    "tool.qrCode.status.working": "处理中…",
    "tool.qrCode.status.done": "已生成（{meta}）",
    "tool.qrCode.error.noText": "请输入文本或链接",
    "tool.qrCode.error.color": "颜色不合法（请用 #RRGGBB）",
    "tool.qrCode.error.size": "尺寸不合法",
    "tool.qrCode.error.margin": "边距不合法",
    "tool.qrCode.error.tooLong": "内容过长，无法生成二维码",
    "tool.qrCode.error.unsupported": "当前浏览器不支持 Canvas",
    "tool.qrCode.error.vendor": "二维码库加载失败",

    "tool.qrScan.file": "图片文件",
    "tool.qrScan.preview": "预览",
    "tool.qrScan.scan": "识别",
    "tool.qrScan.startCamera": "打开摄像头",
    "tool.qrScan.stopCamera": "停止",
    "tool.qrScan.open": "打开链接",
    "tool.qrScan.multi": "识别多个二维码",
    "tool.qrScan.note": "提示：摄像头识别可能需要 HTTPS 与授权。",
    "tool.qrScan.status.working": "处理中…",
    "tool.qrScan.status.none": "未识别到二维码",
    "tool.qrScan.status.done": "识别到 {count} 个",
    "tool.qrScan.status.camera": "摄像头识别中…",
    "tool.qrScan.status.stopped": "摄像头已停止",
    "tool.qrScan.error.noFile": "请选择图片文件",
    "tool.qrScan.error.decode": "读取图片失败",
    "tool.qrScan.error.vendor": "二维码识别库加载失败",
    "tool.qrScan.error.canvas": "当前浏览器不支持 Canvas",
    "tool.qrScan.error.unsupported": "当前浏览器不支持二维码识别",
    "tool.qrScan.error.camera": "当前浏览器不支持摄像头",
    "tool.qrScan.error.cameraUnsupported": "摄像头识别不可用（请改用图片文件）",
    "tool.qrScan.error.generic": "识别失败",

    "tools.item.unit-converter.title": "单位换算",
    "tools.item.unit-converter.desc": "常用单位换算：长度、质量、温度、数据大小等。",
    "tools.item.percentage.title": "百分比计算器",
    "tools.item.percentage.desc": "快速百分比计算：X% of Y、涨跌幅、增减百分比。",
    "tools.item.bmi.title": "BMI 计算器",
    "tools.item.bmi.desc": "本地计算 BMI（身体质量指数）并给出健康体重区间。",
    "tools.item.date-diff.title": "日期差计算器",
    "tools.item.date-diff.desc": "计算两个时间点的差值（天/小时/分钟）。",
    "tools.item.time-zone.title": "时区转换",
    "tools.item.time-zone.desc": "在不同时区之间转换日期时间（含夏令时）。",
    "tools.item.tip.title": "小费计算器",
    "tools.item.tip.desc": "计算小费、总计并按人数平分。",
    "tools.item.sales-tax.title": "销售税计算器",
    "tools.item.sales-tax.desc": "计算销售税与合计金额（加税/含税模式）。",
    "tools.item.mortgage.title": "房贷计算器",
    "tools.item.mortgage.desc": "估算月供、总利息与额外还款后的还清时间。",
    "tools.item.loan.title": "贷款计算器",
    "tools.item.loan.desc": "计算月供、总利息与额外还款后的还清时间。",
    "tools.item.salary.title": "薪资计算器",
    "tools.item.salary.desc": "年薪与时薪互转，并给出月薪/双周薪/周薪等。",
    "tools.item.gas-cost.title": "油费计算器",
    "tools.item.gas-cost.desc": "按里程、MPG 与油价估算用油量与总油费（本地计算）。",
    "tools.item.credit-card-payoff.title": "信用卡还款计算器",
    "tools.item.credit-card-payoff.desc": "估算信用卡还清时间与利息支出。",
    "tools.item.compound-interest.title": "复利计算器",
    "tools.item.compound-interest.desc": "按月投入并复利增长，估算未来金额。",
    "tools.item.horoscope.title": "每日星座运势",
    "tools.item.horoscope.desc": "按星座生成每日运势（仅供娱乐）。",

    "tool.timeZone.datetime": "日期时间",
    "tool.timeZone.from": "起始时区",
    "tool.timeZone.to": "目标时区",
    "tool.timeZone.convert": "转换",
    "tool.timeZone.now": "现在",
    "tool.timeZone.status.done": "已转换",
    "tool.timeZone.status.adjusted": "已转换（已调整）",
    "tool.timeZone.note.adjusted":
      "提示：该本地时间可能因夏令时产生歧义或不存在，因此结果已自动调整。",
    "tool.timeZone.error.datetime": "请选择合法的日期时间",
    "tool.timeZone.error.fromZone": "起始时区不合法",
    "tool.timeZone.error.toZone": "目标时区不合法",
    "tool.timeZone.out.from": "起始：",
    "tool.timeZone.out.utc": "UTC：",
    "tool.timeZone.out.to": "目标：",
    "tool.timeZone.out.timestamp": "时间戳：",

    "tool.tip.bill": "账单金额",
    "tool.tip.billPlaceholder": "例如：48.50",
    "tool.tip.tipPercent": "小费 %",
    "tool.tip.people": "人数",
    "tool.tip.round": "按人均向上取整",
    "tool.tip.presets": "常用：",
    "tool.tip.calculate": "计算",
    "tool.tip.status.done": "计算完成",
    "tool.tip.error.bill": "请输入合法的账单金额",
    "tool.tip.out.bill": "账单",
    "tool.tip.out.tip": "小费",
    "tool.tip.out.total": "总计",
    "tool.tip.out.split": "分摊人数",
    "tool.tip.out.perPersonBill": "人均（账单）",
    "tool.tip.out.perPersonTip": "人均（小费）",
    "tool.tip.out.perPersonTotal": "人均（总计）",

    "tool.horoscope.disclaimer": "仅供娱乐参考，不构成任何建议。",
    "tool.horoscope.sign": "星座",
    "tool.horoscope.date": "日期",
    "tool.horoscope.generate": "生成",
    "tool.horoscope.today": "今天",
    "tool.horoscope.status.done": "已生成",
    "tool.horoscope.out.sign": "星座",
    "tool.horoscope.out.date": "日期",
    "tool.horoscope.out.general": "综合",
    "tool.horoscope.out.love": "感情",
    "tool.horoscope.out.career": "事业",
    "tool.horoscope.out.money": "财运",
    "tool.horoscope.out.health": "健康",
    "tool.horoscope.out.luckyColor": "幸运色",
    "tool.horoscope.out.luckyNumber": "幸运数字",

    "tool.salesTax.amount": "金额",
    "tool.salesTax.amountPlaceholder": "例如：19.99",
    "tool.salesTax.mode": "模式",
    "tool.salesTax.mode.add": "加税",
    "tool.salesTax.mode.included": "含税",
    "tool.salesTax.rate": "税率 %",
    "tool.salesTax.qty": "数量",
    "tool.salesTax.presets": "常用：",
    "tool.salesTax.calculate": "计算",
    "tool.salesTax.status.done": "计算完成",
    "tool.salesTax.error.amount": "请输入合法金额",
    "tool.salesTax.error.rate": "请输入合法税率",
    "tool.salesTax.out.mode": "模式",
    "tool.salesTax.out.rate": "税率",
    "tool.salesTax.out.qty": "数量",
    "tool.salesTax.out.subtotal": "小计",
    "tool.salesTax.out.tax": "税额",
    "tool.salesTax.out.total": "合计",
    "tool.salesTax.out.perItem": "单件",

    "tool.mortgage.disclaimer": "仅供估算，不构成理财建议。",
    "tool.mortgage.homePrice": "房价",
    "tool.mortgage.homePricePlaceholder": "例如：450000",
    "tool.mortgage.downMode": "首付",
    "tool.mortgage.downMode.percent": "百分比",
    "tool.mortgage.downMode.amount": "金额",
    "tool.mortgage.downPlaceholder": "例如：20",
    "tool.mortgage.apr": "年利率 APR %",
    "tool.mortgage.termYears": "期限",
    "tool.mortgage.years": "年",
    "tool.mortgage.months": "月",
    "tool.mortgage.propertyTax": "房产税 / 年",
    "tool.mortgage.taxPlaceholder": "例如：6000",
    "tool.mortgage.insurance": "保险 / 年",
    "tool.mortgage.insurancePlaceholder": "例如：1200",
    "tool.mortgage.hoa": "HOA / 月",
    "tool.mortgage.hoaPlaceholder": "例如：0",
    "tool.mortgage.pmi": "PMI / 月",
    "tool.mortgage.pmiPlaceholder": "例如：0",
    "tool.mortgage.extra": "额外还款 / 月",
    "tool.mortgage.extraPlaceholder": "例如：200",
    "tool.mortgage.showSchedule": "显示前 12 期明细",
    "tool.mortgage.calculate": "计算",
    "tool.mortgage.status.done": "计算完成",
    "tool.mortgage.error.homePrice": "请输入合法房价",
    "tool.mortgage.error.down": "请输入合法首付",
    "tool.mortgage.error.generic": "计算失败，请检查输入",
    "tool.mortgage.out.homePrice": "房价",
    "tool.mortgage.out.downPayment": "首付",
    "tool.mortgage.out.loanAmount": "贷款金额",
    "tool.mortgage.out.apr": "APR",
    "tool.mortgage.out.term": "期限",
    "tool.mortgage.out.pi": "本息（P&I）",
    "tool.mortgage.out.escrow": "额外费用（月）",
    "tool.mortgage.out.monthlyTotal": "月供合计",
    "tool.mortgage.out.totalInterest": "总利息",
    "tool.mortgage.out.totalPaid": "本息总计",
    "tool.mortgage.out.extra": "额外还款",
    "tool.mortgage.out.monthlyTotalExtra": "月供合计（含额外）",
    "tool.mortgage.out.payoffTime": "还清时间",
    "tool.mortgage.out.payoffDate": "预计还清日期",
    "tool.mortgage.out.totalInterestExtra": "总利息（含额外还款）",
    "tool.mortgage.out.interestSaved": "节省利息",
    "tool.mortgage.out.firstPayments": "前 12 期",
    "tool.mortgage.out.interest": "利息",
    "tool.mortgage.out.principal": "本金",
    "tool.mortgage.out.balance": "剩余本金",

    "tool.loan.disclaimer": "仅供估算，不构成理财建议。",
    "tool.loan.amount": "贷款金额",
    "tool.loan.amountPlaceholder": "例如：15000",
    "tool.loan.apr": "年利率 APR %",
    "tool.loan.termMonths": "期限",
    "tool.loan.termPresets": "常用：",
    "tool.loan.months": "月",
    "tool.loan.years": "年",
    "tool.loan.extra": "额外还款 / 月",
    "tool.loan.extraPlaceholder": "例如：50",
    "tool.loan.showSchedule": "显示前 12 期明细",
    "tool.loan.calculate": "计算",
    "tool.loan.status.done": "计算完成",
    "tool.loan.error.amount": "请输入合法贷款金额",
    "tool.loan.error.generic": "计算失败，请检查输入",
    "tool.loan.out.amount": "贷款金额",
    "tool.loan.out.apr": "APR",
    "tool.loan.out.term": "期限",
    "tool.loan.out.payment": "月供（本息）",
    "tool.loan.out.totalInterest": "总利息",
    "tool.loan.out.totalPaid": "总计",
    "tool.loan.out.extra": "额外还款",
    "tool.loan.out.paymentExtra": "月供合计（含额外）",
    "tool.loan.out.payoffTime": "还清时间",
    "tool.loan.out.payoffDate": "预计还清日期",
    "tool.loan.out.totalInterestExtra": "总利息（含额外还款）",
    "tool.loan.out.interestSaved": "节省利息",
    "tool.loan.out.firstPayments": "前 12 期",
    "tool.loan.out.interest": "利息",
    "tool.loan.out.principal": "本金",
    "tool.loan.out.balance": "剩余本金",

    "tool.salary.amount": "金额",
    "tool.salary.amountPlaceholder": "例如：75000",
    "tool.salary.mode": "模式",
    "tool.salary.mode.salary": "年薪",
    "tool.salary.mode.hourly": "时薪",
    "tool.salary.hoursPerWeek": "每周工时",
    "tool.salary.weeksPerYear": "每年周数",
    "tool.salary.calculate": "计算",
    "tool.salary.status.done": "计算完成",
    "tool.salary.error.amount": "请输入合法金额",
    "tool.salary.error.hours": "请输入合法每周工时",
    "tool.salary.error.weeks": "请输入合法每年周数",
    "tool.salary.out.mode": "模式",
    "tool.salary.out.hoursPerWeek": "每周工时",
    "tool.salary.out.weeksPerYear": "每年周数",
    "tool.salary.out.annual": "年",
    "tool.salary.out.monthly": "月",
    "tool.salary.out.semiMonthly": "半月（24 次/年）",
    "tool.salary.out.biweekly": "双周（26 次/年）",
    "tool.salary.out.weekly": "周",
    "tool.salary.out.hourly": "时",

    "tool.gasCost.distance": "距离（英里）",
    "tool.gasCost.distancePlaceholder": "例如：120",
    "tool.gasCost.mpg": "油耗（MPG）",
    "tool.gasCost.price": "油价（$/加仑）",
    "tool.gasCost.pricePlaceholder": "例如：3.79",
    "tool.gasCost.trips": "次数",
    "tool.gasCost.roundTrip": "往返（×2）",
    "tool.gasCost.calculate": "计算",
    "tool.gasCost.status.done": "计算完成",
    "tool.gasCost.error.distance": "请输入合法距离",
    "tool.gasCost.error.mpg": "请输入合法 MPG",
    "tool.gasCost.error.price": "请输入合法油价",
    "tool.gasCost.out.distance": "单程距离",
    "tool.gasCost.out.mpg": "油耗",
    "tool.gasCost.out.price": "油价",
    "tool.gasCost.out.trips": "次数",
    "tool.gasCost.out.roundTrip": "往返",
    "tool.gasCost.out.totalDistance": "总距离",
    "tool.gasCost.out.gallons": "用油量",
    "tool.gasCost.out.totalCost": "总油费",
    "tool.gasCost.out.costPerMile": "每英里成本",

    "tool.creditCardPayoff.disclaimer": "仅供估算，不构成理财建议。",
    "tool.creditCardPayoff.balance": "余额",
    "tool.creditCardPayoff.balancePlaceholder": "例如：3500",
    "tool.creditCardPayoff.apr": "年利率 APR %",
    "tool.creditCardPayoff.payment": "每月还款",
    "tool.creditCardPayoff.paymentPlaceholder": "例如：150",
    "tool.creditCardPayoff.extra": "额外还款 / 月",
    "tool.creditCardPayoff.extraPlaceholder": "例如：25",
    "tool.creditCardPayoff.showSchedule": "显示前 12 期明细",
    "tool.creditCardPayoff.calculate": "计算",
    "tool.creditCardPayoff.status.done": "计算完成",
    "tool.creditCardPayoff.months": "月",
    "tool.creditCardPayoff.years": "年",
    "tool.creditCardPayoff.error.balance": "请输入合法余额",
    "tool.creditCardPayoff.error.payment": "请输入合法每月还款额",
    "tool.creditCardPayoff.error.paymentTooLow": "每月还款额不足以覆盖利息（余额会增加）",
    "tool.creditCardPayoff.error.generic": "计算失败，请检查输入",
    "tool.creditCardPayoff.error.extraTooLow": "加入额外还款后仍不足以还清此余额",
    "tool.creditCardPayoff.out.balance": "余额",
    "tool.creditCardPayoff.out.apr": "APR",
    "tool.creditCardPayoff.out.payment": "每月还款",
    "tool.creditCardPayoff.out.payoffTime": "还清时间",
    "tool.creditCardPayoff.out.payoffDate": "预计还清日期",
    "tool.creditCardPayoff.out.totalInterest": "总利息",
    "tool.creditCardPayoff.out.totalPaid": "总计",
    "tool.creditCardPayoff.out.extra": "额外还款",
    "tool.creditCardPayoff.out.paymentExtra": "每月还款（含额外）",
    "tool.creditCardPayoff.out.payoffTimeExtra": "还清时间（含额外）",
    "tool.creditCardPayoff.out.payoffDateExtra": "预计还清日期（含额外）",
    "tool.creditCardPayoff.out.totalInterestExtra": "总利息（含额外还款）",
    "tool.creditCardPayoff.out.totalPaidExtra": "总计（含额外还款）",
    "tool.creditCardPayoff.out.interestSaved": "节省利息",
    "tool.creditCardPayoff.out.firstPayments": "前 12 期",
    "tool.creditCardPayoff.out.interest": "利息",
    "tool.creditCardPayoff.out.principal": "本金",

    "tool.compoundInterest.disclaimer": "仅供估算，不构成理财建议。",
    "tool.compoundInterest.principal": "初始金额",
    "tool.compoundInterest.principalPlaceholder": "例如：10000",
    "tool.compoundInterest.contribution": "每月投入",
    "tool.compoundInterest.contributionPlaceholder": "例如：200",
    "tool.compoundInterest.rate": "年化收益率 %",
    "tool.compoundInterest.yearsInput": "年数",
    "tool.compoundInterest.timing": "投入时间",
    "tool.compoundInterest.timing.end": "每月末",
    "tool.compoundInterest.timing.start": "每月初",
    "tool.compoundInterest.showBreakdown": "显示年度明细",
    "tool.compoundInterest.calculate": "计算",
    "tool.compoundInterest.status.done": "计算完成",
    "tool.compoundInterest.error.principal": "请输入合法初始金额",
    "tool.compoundInterest.error.contribution": "请输入合法每月投入金额",
    "tool.compoundInterest.months": "月",
    "tool.compoundInterest.years": "年",
    "tool.compoundInterest.out.principal": "初始金额",
    "tool.compoundInterest.out.contribution": "每月投入",
    "tool.compoundInterest.out.rate": "年化收益率",
    "tool.compoundInterest.out.duration": "期限",
    "tool.compoundInterest.out.timing": "投入时间",
    "tool.compoundInterest.out.final": "最终金额",
    "tool.compoundInterest.out.totalContributions": "累计投入",
    "tool.compoundInterest.out.totalInterest": "收益（利息）",
    "tool.compoundInterest.out.breakdownTitle": "年度明细",
    "tool.compoundInterest.out.breakdownLine":
      "第 {year} 年：{balance}（投入：{contrib}，收益：{interest}）",

    "tool.unit.value": "数值",
    "tool.unit.valuePlaceholder": "例如：123.45",
    "tool.unit.category": "类别：",
    "tool.unit.category.length": "长度",
    "tool.unit.category.mass": "质量",
    "tool.unit.category.temperature": "温度",
    "tool.unit.category.area": "面积",
    "tool.unit.category.volume": "体积",
    "tool.unit.category.speed": "速度",
    "tool.unit.category.data": "数据大小",
    "tool.unit.from": "从：",
    "tool.unit.to": "到：",
    "tool.unit.precision": "精度：",
    "tool.unit.trim": "去掉末尾 0",
    "tool.unit.convert": "转换",
    "tool.unit.status.done": "转换完成",
    "tool.unit.error.value": "请输入合法数字",
    "tool.unit.error.unit": "单位选择不合法",

    "tool.percentage.base": "基准值（Y）",
    "tool.percentage.basePlaceholder": "例如：100",
    "tool.percentage.percent": "百分比（X）",
    "tool.percentage.percentPlaceholder": "例如：15",
    "tool.percentage.compare": "对比值（Z）",
    "tool.percentage.comparePlaceholder": "例如：120",
    "tool.percentage.precision": "精度：",
    "tool.percentage.trim": "去掉末尾 0",
    "tool.percentage.calculate": "计算",
    "tool.percentage.status.done": "计算完成",
    "tool.percentage.error.base": "请输入合法的基准值",
    "tool.percentage.error.percent": "请输入合法的百分比",
    "tool.percentage.error.compare": "请输入合法的对比值",
    "tool.percentage.out.percentOf": "X% × Y",
    "tool.percentage.out.increase": "Y + X%",
    "tool.percentage.out.decrease": "Y - X%",
    "tool.percentage.out.whatPercent": "Z 占 Y 的百分比",
    "tool.percentage.out.change": "Y → Z 的变化幅度",

    "tool.bmi.unit": "单位",
    "tool.bmi.unit.metric": "公制（cm/kg）",
    "tool.bmi.unit.imperial": "英制（ft/in/lb）",
    "tool.bmi.heightCm": "身高（cm）",
    "tool.bmi.heightCmPlaceholder": "例如：175",
    "tool.bmi.weightKg": "体重（kg）",
    "tool.bmi.weightKgPlaceholder": "例如：70",
    "tool.bmi.heightFt": "身高（ft）",
    "tool.bmi.heightFtPlaceholder": "例如：5",
    "tool.bmi.heightIn": "身高（in）",
    "tool.bmi.heightInPlaceholder": "例如：9",
    "tool.bmi.weightLb": "体重（lb）",
    "tool.bmi.weightLbPlaceholder": "例如：154",
    "tool.bmi.calculate": "计算",
    "tool.bmi.status.done": "计算完成",
    "tool.bmi.error.height": "请输入合法的身高",
    "tool.bmi.error.weight": "请输入合法的体重",
    "tool.bmi.error.generic": "计算失败",
    "tool.bmi.category.unknown": "未知",
    "tool.bmi.category.underweight": "偏瘦",
    "tool.bmi.category.normal": "正常",
    "tool.bmi.category.overweight": "超重",
    "tool.bmi.category.obese": "肥胖",
    "tool.bmi.out.bmi": "BMI",
    "tool.bmi.out.category": "分类",
    "tool.bmi.out.healthyRange": "健康体重区间",

    "tool.dateDiff.start": "开始",
    "tool.dateDiff.end": "结束",
    "tool.dateDiff.now": "当前时间",
    "tool.dateDiff.swap": "交换",
    "tool.dateDiff.calculate": "计算",
    "tool.dateDiff.status.done": "计算完成",
    "tool.dateDiff.error.missing": "请填写开始和结束时间",
    "tool.dateDiff.out.start": "开始：",
    "tool.dateDiff.out.end": "结束：",
    "tool.dateDiff.out.diff": "差值：",
    "tool.dateDiff.out.totalDays": "总天数：",
    "tool.dateDiff.out.totalHours": "总小时：",
    "tool.dateDiff.out.totalMinutes": "总分钟：",
    "tool.dateDiff.out.totalSeconds": "总秒数：",

    "tool.morse.encode": "编码 →",
    "tool.morse.decode": "← 解码",
    "tool.morse.useSlash": "单词间使用 “/”",
    "tool.morse.uppercase": "解码文本大写",
    "tool.morse.status.encoded": "编码完成（{len} 个字符）",
    "tool.morse.status.encodedUnknown": "编码完成（{len} 个字符，未知 {unknown} 个）",
    "tool.morse.status.decoded": "解码完成（{len} 个字符）",
    "tool.morse.status.decodedUnknown": "解码完成（{len} 个字符，未知 {unknown} 个）",

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

    "tool.querystring.parse": "解析 →",
    "tool.querystring.build": "← 生成",
    "tool.querystring.plusForSpace": "把 “+” 当作空格",
    "tool.querystring.sortKeys": "key 排序",
    "tool.querystring.leadingQuestionMark": "前缀 “?”",
    "tool.querystring.status.parsed": "解析完成（{count} 个 key）",
    "tool.querystring.status.built": "生成完成（{len} 个字符）",
    "tool.querystring.error.empty": "请输入 URL/querystring 或 JSON",
    "tool.querystring.error.parse": "解析失败：请检查是否为合法 querystring",
    "tool.querystring.error.json": "生成失败：请粘贴合法 JSON（对象或数组）",

    "tool.regex.text": "文本",
    "tool.regex.find": "查找匹配",
    "tool.regex.replace": "替换",
    "tool.regex.pattern": "模式：",
    "tool.regex.patternPlaceholder": "例如：(\\\\w+)=(\\\\w+)",
    "tool.regex.flags": "标志：",
    "tool.regex.replacement": "替换为：",
    "tool.regex.replacementPlaceholder": "例如：$2=$1",
    "tool.regex.prettyJson": "美化 JSON 输出",
    "tool.regex.status.done": "完成（{count} 个匹配）",
    "tool.regex.status.replaced": "已替换（{len} 字符）",
    "tool.regex.error.pattern": "请输入正则模式",
    "tool.regex.error.compile": "正则不合法（模式/标志）",

    "tool.aes.passphrase": "口令",
    "tool.aes.passphrasePlaceholder": "口令…",
    "tool.aes.iterations": "PBKDF2 迭代次数：",
    "tool.aes.encrypt": "加密 →",
    "tool.aes.decrypt": "← 解密",
    "tool.aes.status.encrypted": "加密完成（{len} 个字符）",
    "tool.aes.status.decrypted": "解密完成（{len} 个字符）",
    "tool.aes.error.unsupported": "当前浏览器不支持 WebCrypto（PBKDF2/AES-GCM）",
    "tool.aes.error.passphrase": "请输入口令",
    "tool.aes.error.empty": "请粘贴加密后的 JSON payload",
    "tool.aes.error.payload": "payload 不合法：需要使用本工具生成的 JSON",
    "tool.aes.error.decrypt": "解密失败：口令错误或 payload 已损坏",

    "tool.rsa.publicKey": "公钥（PEM）",
    "tool.rsa.privateKey": "私钥（PEM）",
    "tool.rsa.publicKeyPlaceholder": "-----BEGIN PUBLIC KEY-----\\n...\\n-----END PUBLIC KEY-----",
    "tool.rsa.privateKeyPlaceholder": "-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----",
    "tool.rsa.generate": "生成密钥对",
    "tool.rsa.encrypt": "加密 →（公钥）",
    "tool.rsa.decrypt": "← 解密（私钥）",
    "tool.rsa.keySize": "密钥长度：",
    "tool.rsa.inputPlaceholder": "加密粘贴明文；解密粘贴本工具生成的 JSON…",
    "tool.rsa.status.generated": "已生成 {size} 位密钥对",
    "tool.rsa.status.encrypted": "加密完成（{len} 字符）",
    "tool.rsa.status.decrypted": "解密完成（{len} 字符）",
    "tool.rsa.error.unsupported": "当前浏览器不支持 WebCrypto（RSA/AES-GCM）",
    "tool.rsa.error.keyMissing": "请粘贴 PEM 密钥",
    "tool.rsa.error.keySize": "密钥长度不合法",
    "tool.rsa.error.payload": "payload 不合法：需要使用本工具生成的 JSON",
    "tool.rsa.error.utf8": "UTF-8 解码失败：解密结果不是合法 UTF-8",

    "tool.timestamp.input": "输入",
    "tool.timestamp.placeholder": "例如：1735200000 或 2025-01-01T00:00:00Z",
    "tool.timestamp.convert": "转换",
    "tool.timestamp.now": "现在",
    "tool.timestamp.unit": "单位：",
    "tool.timestamp.unit.auto": "自动",
    "tool.timestamp.unit.seconds": "秒",
    "tool.timestamp.unit.milliseconds": "毫秒",
    "tool.timestamp.status.done": "转换完成",
    "tool.timestamp.error.empty": "请输入时间戳或日期时间",
    "tool.timestamp.error.invalid": "时间戳/日期时间不合法",

    "tool.numberBase.inputLabel": "数字",
    "tool.numberBase.placeholder": "例如：0xff 或 101010 或 -42",
    "tool.numberBase.convert": "转换",
    "tool.numberBase.fromBase": "从：",
    "tool.numberBase.toBase": "到：",
    "tool.numberBase.base.auto": "自动",
    "tool.numberBase.uppercase": "输出大写",
    "tool.numberBase.prefix": "添加前缀（0x/0b/0o）",
    "tool.numberBase.status.done": "转换完成（{len} 字符）",
    "tool.numberBase.error.empty": "请输入数字",
    "tool.numberBase.error.base": "进制不合法（2-36）",
    "tool.numberBase.error.invalid": "数字不合法（或与所选进制不匹配）",

    "tool.ip.inputLabel": "IPv4 / CIDR",
    "tool.ip.placeholder": "例如：192.168.1.10/24",
    "tool.ip.calculate": "计算",
    "tool.ip.prefix": "前缀：",
    "tool.ip.status.done": "计算完成",
    "tool.ip.error.empty": "请输入 IPv4（可选 /前缀）",
    "tool.ip.error.prefix": "前缀不合法（0-32）",
    "tool.ip.error.ip": "IPv4 地址不合法",
    "tool.ip.out.cidr": "CIDR",
    "tool.ip.out.ip": "IP",
    "tool.ip.out.ipBinary": "IP（二进制）",
    "tool.ip.out.netmask": "子网掩码",
    "tool.ip.out.wildcard": "反掩码",
    "tool.ip.out.network": "网络地址",
    "tool.ip.out.broadcast": "广播地址",
    "tool.ip.out.range": "可用地址范围",
    "tool.ip.out.total": "总地址数",
    "tool.ip.out.usable": "可用地址数",
    "tool.ip.note.31": "说明：/31 通常用于点对点链路，两端均可用。",
    "tool.ip.note.32": "说明：/32 表示单个主机路由。",

    "tool.fileHash.file": "文件",
    "tool.fileHash.compute": "计算",
    "tool.fileHash.algorithm": "算法：",
    "tool.fileHash.format": "格式：",
    "tool.fileHash.format.hex": "HEX",
    "tool.fileHash.format.base64": "Base64",
    "tool.fileHash.format.both": "两者",
    "tool.fileHash.uppercase": "大写 HEX",
    "tool.fileHash.status.working": "计算中…",
    "tool.fileHash.status.done": "完成：{alg}",
    "tool.fileHash.error.noFile": "请选择文件",
    "tool.fileHash.error.unsupported": "当前浏览器不支持 WebCrypto（crypto.subtle.digest）",

    "tool.color.input": "颜色",
    "tool.color.placeholder": "#38bdf8 或 rgb(56,189,248) 或 hsl(199,93%,59%)",
    "tool.color.convert": "转换",
    "tool.color.status.done": "转换完成",
    "tool.color.error.empty": "请输入颜色值",
    "tool.color.error.invalid": "颜色不合法（支持：HEX、rgb()、hsl()）",
    "tool.color.hex": "HEX",
    "tool.color.rgb": "RGB",
    "tool.color.rgba": "RGBA",
    "tool.color.hsl": "HSL",
    "tool.color.hsla": "HSLA",

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

const THEME_STORAGE_KEY = "site_theme";
const LANG_STORAGE_KEY = "site_lang";
const FAVORITES_ARTICLES_KEY = "site_favorite_articles";
const RECENT_ARTICLES_KEY = "site_recent_articles";
const READ_ARTICLES_KEY = "site_read_articles";
const MAX_RECENT_ARTICLES = 60;
const MAX_READ_ARTICLES = 800;
const FAVORITES_TOOLS_KEY = "site_favorite_tools";
const RECENT_TOOLS_KEY = "site_recent_tools";
const MAX_RECENT_TOOLS = 60;
const FAVORITES_SHOP_KEY = "site_favorite_shop";
const SHOP_FAVORITES_EVENT = "site:shop-favorites";
const TOOL_STATE_PREFIX = "site_tool_state:";
const MAX_TOOL_STATE_CHARS = 200000;

function storageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (_error) {
    return null;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (_error) {
    // ignore
  }
}

function storageRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch (_error) {
    // ignore
  }
}

function storageGetJson(key, fallback) {
  const raw = storageGet(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (_error) {
    return fallback;
  }
}

function storageSetJson(key, value) {
  try {
    storageSet(key, JSON.stringify(value));
  } catch (_error) {
    // ignore
  }
}

function normalizeTheme(input) {
  const raw = String(input || "").trim().toLowerCase();
  if (raw === "auto" || raw === "light" || raw === "dark") return raw;
  return "";
}

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
  const stored = normalizeLang(storageGet(LANG_STORAGE_KEY));
  if (stored && supported.includes(stored)) return stored;
  const def = getDefaultLang();
  if (def && supported.includes(def)) return def;
  return supported[0] || "en";
}

function getTheme() {
  return normalizeTheme(storageGet(THEME_STORAGE_KEY)) || "auto";
}

function applyTheme(theme) {
  const resolved = normalizeTheme(theme) || "auto";
  if (resolved === "light" || resolved === "dark") {
    document.documentElement.setAttribute("data-theme", resolved);
  } else {
    document.documentElement.removeAttribute("data-theme");
  }

  document.querySelectorAll("[data-set-theme]").forEach((el) => {
    const target = normalizeTheme(el.getAttribute("data-set-theme"));
    el.setAttribute("aria-current", target === resolved ? "true" : "false");
  });
}

function applyI18n(lang) {
  const activeLang = normalizeLang(lang) || "en";
  document.documentElement.lang = activeLang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!key) return;
    el.textContent = t(key, null, activeLang);
  });

  function parseJsonObject(value) {
    try {
      const parsed = JSON.parse(String(value || "{}"));
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
      return parsed;
    } catch (_error) {
      return {};
    }
  }

  document.querySelectorAll("[data-i18n-template]").forEach((el) => {
    const key = el.getAttribute("data-i18n-template");
    if (!key) return;
    const vars = parseJsonObject(el.getAttribute("data-i18n-vars"));
    el.textContent = t(key, vars, activeLang);
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
  storageSet(LANG_STORAGE_KEY, resolved);
  applyI18n(resolved);
  window.dispatchEvent(new CustomEvent("site:lang", { detail: { lang: resolved } }));
}

function setTheme(next) {
  const resolved = normalizeTheme(next) || "auto";
  storageSet(THEME_STORAGE_KEY, resolved);
  applyTheme(resolved);
  window.dispatchEvent(new CustomEvent("site:theme", { detail: { theme: resolved } }));
}

function setupLangSwitch() {
  document.querySelectorAll("[data-set-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-set-lang");
      setLang(lang);
    });
  });
}

function setupThemeSwitch() {
  document.querySelectorAll("[data-set-theme]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const theme = btn.getAttribute("data-set-theme");
      setTheme(theme);
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
    if (target.closest("[data-set-theme]")) setNavOpen(false);
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

function normalizePathname(pathname) {
  const raw = String(pathname || "/");
  let value = raw.replace(/index\.html$/i, "");
  if (value !== "/" && value.endsWith("/")) value = value.slice(0, -1);
  return value || "/";
}

function setupActiveLinks() {
  const current = normalizePathname(window.location.pathname);

  const links = Array.from(
    document.querySelectorAll(".nav a[href], .footer-links a[href]")
  );

  const entries = links
    .map((el) => {
      const href = el.getAttribute("href");
      if (!href) return null;
      let url;
      try {
        url = new URL(href, window.location.origin);
      } catch {
        return null;
      }
      if (url.origin !== window.location.origin) return null;
      return { el, path: normalizePathname(url.pathname) };
    })
    .filter(Boolean);

  let best = null;
  for (const entry of entries) {
    const target = entry.path;
    if (!target) continue;
    if (target === "/") {
      if (current === "/") best = best && best.length > 1 ? best : { path: target, length: 1 };
      continue;
    }
    if (current === target || current.startsWith(target + "/")) {
      const length = target.length;
      if (!best || length > best.length) best = { path: target, length };
    }
  }

  const bestPath = best ? best.path : null;
  for (const entry of entries) {
    if (bestPath && entry.path === bestPath) entry.el.setAttribute("aria-current", "page");
    else entry.el.removeAttribute("aria-current");
  }

  const activeSections = new Set();
  if (/(^|\/)tools(\/|$)/.test(current)) activeSections.add("tools");
  if (/(^|\/)(category|lang)(\/|$)/.test(current)) activeSections.add("news");

  document.querySelectorAll(".nav-dropdown[data-nav-section]").forEach((details) => {
    const section = details.getAttribute("data-nav-section");
    if (section && activeSections.has(section)) details.setAttribute("data-active", "true");
    else details.removeAttribute("data-active");
  });
}

function isTypingInField(target) {
  if (!(target instanceof Element)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

function getHeaderSearchForm() {
  const form = document.querySelector("[data-header-search]");
  return form instanceof HTMLFormElement ? form : null;
}

function getHeaderSearchInput() {
  const input = document.querySelector("[data-header-search-input]");
  return input instanceof HTMLInputElement ? input : null;
}

function getPagefindSearchInput() {
  const input = document.querySelector(".pagefind-ui__search-input");
  return input instanceof HTMLInputElement ? input : null;
}

function focusHeaderSearch() {
  const input = getHeaderSearchInput();
  if (!input) return false;
  input.focus({ preventScroll: true });
  try {
    input.select();
  } catch {
    // ignore
  }
  return true;
}

function focusPagefindSearch() {
  const input = getPagefindSearchInput();
  if (!input) return false;
  input.focus({ preventScroll: true });
  try {
    input.select();
  } catch {
    // ignore
  }
  return true;
}

function setupSearchShortcuts() {
  document.addEventListener("keydown", (event) => {
    if (event.defaultPrevented) return;
    if (isTypingInField(event.target)) return;

    const key = event.key || "";
    const lower = key.toLowerCase();

    const isSlash =
      key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey;
    const isCmdK =
      lower === "k" && (event.metaKey || event.ctrlKey) && !event.altKey;

    if (!isSlash && !isCmdK) return;
    event.preventDefault();

    if (focusHeaderSearch()) return;
    if (focusPagefindSearch()) return;

    const form = getHeaderSearchForm();
    if (form && form.action) window.location.href = form.action;
  });
}

function setupHeaderSearchPrefill() {
  const input = getHeaderSearchInput();
  if (!input) return;
  const q = new URLSearchParams(window.location.search).get("q");
  if (q && !input.value) input.value = q;
}

function setupToolJump() {
  document.querySelectorAll("[data-tool-jump]").forEach((el) => {
    if (!(el instanceof HTMLSelectElement)) return;
    el.addEventListener("change", () => {
      const target = el.value;
      if (target) window.location.href = target;
    });
  });
}

function setupToolQuickJumps() {
  const nav = document.querySelector(".tool-nav");
  if (!nav) return;

  const buttons = Array.from(nav.querySelectorAll("[data-tool-focus]"));
  if (!buttons.length) return;

  const reduce =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function focusEl(el) {
    if (!(el instanceof HTMLElement)) return;
    try {
      el.focus({ preventScroll: true });
    } catch (_error) {
      try {
        el.focus();
      } catch (_error2) {
        // ignore
      }
    }
  }

  function scrollEl(el) {
    if (!(el instanceof HTMLElement)) return;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  function resolveTarget(kind) {
    const type = String(kind || "").trim();
    if (type === "input") {
      const input =
        document.getElementById("tool-input") ||
        document.getElementById("tool-file") ||
        document.querySelector(".tool-shell textarea:not([readonly])");
      return input ? { scroll: input, focus: input } : null;
    }

    if (type === "output") {
      const output =
        document.getElementById("tool-output") ||
        document.querySelector(".tool-shell textarea[readonly]");
      return output ? { scroll: output, focus: output } : null;
    }

    if (type === "options") {
      const options = document.querySelector(".tool-options");
      if (!options) return null;
      const focus =
        options.querySelector("input, select, textarea, button") || options;
      return { scroll: options, focus };
    }

    return null;
  }

  for (const btn of buttons) {
    if (!(btn instanceof HTMLButtonElement)) continue;
    const kind = btn.getAttribute("data-tool-focus") || "";
    const target = resolveTarget(kind);
    if (!target) {
      btn.hidden = true;
      continue;
    }

    btn.addEventListener("click", () => {
      scrollEl(target.scroll);
      window.setTimeout(() => focusEl(target.focus), 0);
    });
  }
}

function toolStateKey(slug) {
  const normalized = String(slug || "").trim();
  if (!normalized) return "";
  return `${TOOL_STATE_PREFIX}${normalized}`;
}

function isPersistableToolControl(el) {
  if (
    !(
      el instanceof HTMLInputElement ||
      el instanceof HTMLTextAreaElement ||
      el instanceof HTMLSelectElement
    )
  ) {
    return false;
  }
  if (!el.id) return false;
  if (!el.id.startsWith("opt-")) return false;
  if (el.hasAttribute("readonly")) return false;
  if (el.getAttribute("data-no-persist") !== null) return false;

  if (el instanceof HTMLInputElement) {
    const type = String(el.type || "").toLowerCase();
    if (type === "file" || type === "password") return false;
  }

  return true;
}

function snapshotToolControls(controls) {
  const snapshot = {};
  for (const el of controls) {
    if (el instanceof HTMLInputElement) {
      const type = String(el.type || "").toLowerCase();
      if (type === "checkbox" || type === "radio") snapshot[el.id] = el.checked;
      else snapshot[el.id] = el.value;
      continue;
    }
    snapshot[el.id] = el.value;
  }
  return snapshot;
}

function applyToolControlsSnapshot(controls, snapshot, fireEvents) {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) return;

  for (const el of controls) {
    if (!Object.prototype.hasOwnProperty.call(snapshot, el.id)) continue;
    const value = snapshot[el.id];

    if (el instanceof HTMLInputElement) {
      const type = String(el.type || "").toLowerCase();
      if (type === "checkbox" || type === "radio") el.checked = Boolean(value);
      else el.value = String(value ?? "");
    } else if (el instanceof HTMLSelectElement) {
      const next = String(value ?? "");
      if (Array.from(el.options).some((opt) => opt.value === next)) el.value = next;
    } else {
      el.value = String(value ?? "");
    }

    if (fireEvents) {
      try {
        el.dispatchEvent(new Event("input", { bubbles: true }));
      } catch (_error) {
        // ignore
      }
      try {
        el.dispatchEvent(new Event("change", { bubbles: true }));
      } catch (_error) {
        // ignore
      }
    }
  }
}

function setToolStatusMessage(message, isError) {
  const el = document.getElementById("tool-status");
  if (!(el instanceof HTMLElement)) return;
  el.textContent = String(message || "");
  el.classList.toggle("tool-status-error", Boolean(isError));
}

function clearToolCommonOutputs() {
  const output = document.getElementById("tool-output");
  if (output instanceof HTMLTextAreaElement || output instanceof HTMLInputElement) {
    try {
      output.value = "";
    } catch (_error) {
      // ignore
    }
  }

  const fileInput = document.getElementById("tool-file");
  if (fileInput instanceof HTMLInputElement && fileInput.type === "file") {
    fileInput.value = "";
  }
}

function setupToolStatePersistence() {
  const meta = getToolMetaFromPage();
  if (!meta || !meta.slug) return;

  const shell = document.querySelector(".tool-shell");
  if (!shell) return;

  const controls = Array.from(shell.querySelectorAll("input, textarea, select")).filter(
    isPersistableToolControl
  );
  if (!controls.length) return;

  const key = toolStateKey(meta.slug);
  if (!key) return;

  const defaults = snapshotToolControls(controls);
  const saved = storageGetJson(key, null);
  if (saved && typeof saved === "object" && !Array.isArray(saved)) {
    applyToolControlsSnapshot(controls, saved, false);
  }

  let scheduled = 0;
  let suspend = false;

  function saveNow() {
    if (suspend) return;
    const snapshot = snapshotToolControls(controls);
    const json = JSON.stringify(snapshot);
    if (json.length > MAX_TOOL_STATE_CHARS) return;
    storageSet(key, json);
  }

  function scheduleSave() {
    if (suspend) return;
    if (scheduled) window.clearTimeout(scheduled);
    scheduled = window.setTimeout(() => {
      scheduled = 0;
      saveNow();
    }, 250);
  }

  for (const el of controls) {
    el.addEventListener("input", scheduleSave);
    el.addEventListener("change", scheduleSave);
  }

  const clearBtn = document.querySelector("[data-tool-clear-state]");
  if (clearBtn instanceof HTMLButtonElement) {
    clearBtn.addEventListener("click", () => {
      suspend = true;
      if (scheduled) window.clearTimeout(scheduled);
      scheduled = 0;

      storageRemove(key);
      applyToolControlsSnapshot(controls, defaults, true);
      clearToolCommonOutputs();

      setToolStatusMessage(t("tool.state.cleared", null, getLang()), false);
      window.setTimeout(() => {
        suspend = false;
      }, 0);
    });
  }
}

function normalizeText(value) {
  return String(value || "").toLowerCase().trim();
}

function getToolsFilterValue() {
  const input = document.querySelector("[data-tools-filter-input]");
  if (!(input instanceof HTMLInputElement)) return "";
  return input.value || "";
}

function setToolsFilterValue(next) {
  const input = document.querySelector("[data-tools-filter-input]");
  if (!(input instanceof HTMLInputElement)) return;
  input.value = String(next || "");
}

function setToolsFilterQueryParam(next) {
  const url = new URL(window.location.href);
  const normalized = String(next || "").trim();
  if (normalized) url.searchParams.set("q", normalized);
  else url.searchParams.delete("q");
  window.history.replaceState(null, "", url.pathname + url.search + url.hash);
}

function setupToolsIndexFilter() {
  const input = document.querySelector("[data-tools-filter-input]");
  if (!(input instanceof HTMLInputElement)) return;

  const clear = document.querySelector("[data-tools-filter-clear]");
  const status = document.querySelector("[data-tools-filter-status]");
  const empty = document.querySelector("[data-tools-filter-empty]");
  const cards = Array.from(document.querySelectorAll("[data-tools-card]"));
  const groups = Array.from(document.querySelectorAll("[data-tools-group]"));

  function applyFilter(raw) {
    const q = normalizeText(raw);
    let visibleCount = 0;

    for (const el of cards) {
      if (!(el instanceof HTMLElement)) continue;
      const text = normalizeText(el.textContent);
      const show = !q || text.includes(q);
      el.hidden = !show;
      if (show) visibleCount += 1;
    }

    for (const group of groups) {
      if (!(group instanceof HTMLElement)) continue;
      const anyVisible = group.querySelector("[data-tools-card]:not([hidden])");
      group.hidden = !anyVisible;
    }

    if (empty) empty.hidden = visibleCount > 0;

    if (status) {
      if (!q) {
        status.hidden = true;
        status.textContent = "";
      } else {
        status.hidden = false;
        status.textContent = window.SiteI18n
          ? window.SiteI18n.t("tools.filter.status", { q: raw, count: visibleCount })
          : `Showing ${visibleCount}`;
      }
    }
  }

  const initial = new URLSearchParams(window.location.search).get("q") || "";
  if (initial) {
    setToolsFilterValue(initial);
    applyFilter(initial);
  } else {
    applyFilter("");
  }

  input.addEventListener("input", () => {
    const value = getToolsFilterValue();
    setToolsFilterQueryParam(value);
    applyFilter(value);
  });

  if (clear instanceof HTMLButtonElement) {
    clear.addEventListener("click", () => {
      setToolsFilterValue("");
      setToolsFilterQueryParam("");
      applyFilter("");
      input.focus({ preventScroll: true });
    });
  }

  window.addEventListener("popstate", () => {
    const q = new URLSearchParams(window.location.search).get("q") || "";
    setToolsFilterValue(q);
    applyFilter(q);
  });

  window.addEventListener("site:lang", () => {
    const value = getToolsFilterValue();
    if (!normalizeText(value)) return;
    applyFilter(value);
  });
}

const SCHEME_RE = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;
let SITE_BASE_PATH = null;

function getSiteBasePath() {
  if (SITE_BASE_PATH) return SITE_BASE_PATH;
  const brand = document.querySelector("a.brand[href]");
  if (brand) {
    const href = brand.getAttribute("href");
    if (href) {
      try {
        const url = new URL(href, window.location.origin);
        let pathname = url.pathname || "/";
        if (!pathname.endsWith("/")) pathname += "/";
        SITE_BASE_PATH = pathname;
        return pathname;
      } catch (_error) {
        // ignore
      }
    }
  }
  SITE_BASE_PATH = "/";
  return SITE_BASE_PATH;
}

function resolveSitePath(pathname) {
  const value = String(pathname || "").trim();
  if (!value) return "";
  if (SCHEME_RE.test(value)) return value;
  if (!value.startsWith("/")) return value;

  const base = getSiteBasePath();
  if (value === "/") return base;
  if (base === "/" || value.startsWith(base)) return value;

  const baseTrimmed = base.replace(/\/$/, "");
  const knownRoots = [
    "/p/",
    "/tools/",
    "/go/",
    "/shop/",
    "/category/",
    "/language/",
    "/search/",
    "/library/",
    "/about/",
    "/privacy/",
    "/terms/",
    "/contact/",
    "/affiliate-disclosure/",
    "/takedown/",
    "/assets/",
    "/feed.xml",
    "/sitemap.xml",
  ];

  for (const root of knownRoots) {
    if (value.startsWith(root)) return baseTrimmed + value;
  }

  for (const root of knownRoots) {
    const idx = value.indexOf(root, 1);
    if (idx > 0) return baseTrimmed + value.slice(idx);
  }

  return baseTrimmed + value;
}

function normalizeArticleMeta(input) {
  if (!input || typeof input !== "object") return null;
  const id = String(input.id || "").trim();
  const title = String(input.title || "").trim();
  const path = resolveSitePath(String(input.path || "").trim() || (id ? `/p/${id}/` : ""));
  if (!id || !title || !path) return null;

  const category = String(input.category || "").trim();
  const publishedAt = String(input.publishedAt || "").trim();
  const sourceName = String(input.sourceName || "").trim();
  return { id, title, path, category, publishedAt, sourceName };
}

function readFavoriteArticles() {
  const raw = storageGetJson(FAVORITES_ARTICLES_KEY, []);
  if (!Array.isArray(raw)) return [];
  const seen = new Set();
  const list = [];
  for (const item of raw) {
    const meta = normalizeArticleMeta(item);
    if (!meta || seen.has(meta.id)) continue;
    seen.add(meta.id);
    list.push({ ...meta, savedAt: Number(item.savedAt) || 0 });
  }
  return list;
}

function writeFavoriteArticles(list) {
  storageSetJson(FAVORITES_ARTICLES_KEY, Array.isArray(list) ? list : []);
}

function isFavoriteArticle(id, favorites) {
  const target = String(id || "").trim();
  if (!target) return false;
  const list = Array.isArray(favorites) ? favorites : readFavoriteArticles();
  return list.some((item) => item && item.id === target);
}

function toggleFavoriteArticle(meta) {
  const normalized = normalizeArticleMeta(meta);
  if (!normalized) return false;

  const favorites = readFavoriteArticles();
  const exists = favorites.some((item) => item && item.id === normalized.id);
  const next = exists
    ? favorites.filter((item) => item && item.id !== normalized.id)
    : [{ ...normalized, savedAt: Date.now() }, ...favorites];

  writeFavoriteArticles(next);
  return !exists;
}

function readRecentArticles() {
  const raw = storageGetJson(RECENT_ARTICLES_KEY, []);
  if (!Array.isArray(raw)) return [];
  const seen = new Set();
  const list = [];
  for (const item of raw) {
    const meta = normalizeArticleMeta(item);
    if (!meta || seen.has(meta.id)) continue;
    seen.add(meta.id);
    list.push({ ...meta, viewedAt: Number(item.viewedAt) || 0 });
  }
  return list;
}

function writeRecentArticles(list) {
  storageSetJson(RECENT_ARTICLES_KEY, Array.isArray(list) ? list : []);
}

function addRecentArticle(meta) {
  const normalized = normalizeArticleMeta(meta);
  if (!normalized) return;

  const recents = readRecentArticles();
  const next = [
    { ...normalized, viewedAt: Date.now() },
    ...recents.filter((item) => item && item.id !== normalized.id),
  ];

  writeRecentArticles(next.slice(0, MAX_RECENT_ARTICLES));
}

function readReadArticles() {
  const raw = storageGetJson(READ_ARTICLES_KEY, {});
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const list = {};
  for (const [key, value] of Object.entries(raw)) {
    const id = String(key || "").trim();
    if (!id) continue;
    list[id] = Number(value) || 0;
  }
  return list;
}

function writeReadArticles(map) {
  const value = map && typeof map === "object" && !Array.isArray(map) ? map : {};
  storageSetJson(READ_ARTICLES_KEY, value);
}

function isArticleRead(id, readMap) {
  const target = String(id || "").trim();
  if (!target) return false;
  const map = readMap && typeof readMap === "object" ? readMap : readReadArticles();
  return Boolean(map && Object.prototype.hasOwnProperty.call(map, target));
}

function markArticleRead(id) {
  const target = String(id || "").trim();
  if (!target) return;

  const map = readReadArticles();
  if (Object.prototype.hasOwnProperty.call(map, target)) return;

  map[target] = Date.now();

  const ids = Object.keys(map);
  if (ids.length > MAX_READ_ARTICLES) {
    ids.sort((a, b) => (Number(map[a]) || 0) - (Number(map[b]) || 0));
    for (let i = 0; i < ids.length - MAX_READ_ARTICLES; i += 1) {
      delete map[ids[i]];
    }
  }

  writeReadArticles(map);
}

function applyReadMarkers() {
  const map = readReadArticles();
  document.querySelectorAll("[data-article-id]").forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    const id = el.getAttribute("data-article-id") || "";
    if (isArticleRead(id, map)) el.setAttribute("data-read", "true");
    else el.removeAttribute("data-read");
  });
}

function setupArticleReadMarkers() {
  const any = document.querySelector("[data-article-id]");
  if (!any) return;
  applyReadMarkers();
  window.addEventListener("pageshow", applyReadMarkers);
}

function getArticleMetaFromPage() {
  const el = document.querySelector("[data-article-meta]");
  if (!el) return null;
  try {
    const parsed = JSON.parse(el.textContent || "");
    return normalizeArticleMeta(parsed);
  } catch (_error) {
    return null;
  }
}

function updateFavoriteButton(btn, isFavorite) {
  if (!(btn instanceof HTMLButtonElement)) return;
  const on = Boolean(isFavorite);
  btn.setAttribute("aria-pressed", on ? "true" : "false");
  btn.textContent = t(on ? "article.unsave" : "article.save", null, getLang());
}

function setupArticleLibrary() {
  const meta = getArticleMetaFromPage();
  if (!meta) return;

  addRecentArticle(meta);
  markArticleRead(meta.id);

  const btn = document.querySelector("[data-favorite-article]");
  if (!(btn instanceof HTMLButtonElement)) return;

  const refresh = () => updateFavoriteButton(btn, isFavoriteArticle(meta.id));

  refresh();
  btn.addEventListener("click", (event) => {
    event.preventDefault();
    const nextState = toggleFavoriteArticle(meta);
    updateFavoriteButton(btn, nextState);
  });

  window.addEventListener("site:lang", refresh);
}

function getArticleMetaFromCard(button) {
  const wrap = button instanceof Element ? button.closest("[data-article-id]") : null;
  if (!wrap) return null;
  return normalizeArticleMeta({
    id: wrap.getAttribute("data-article-id"),
    title: wrap.getAttribute("data-article-title"),
    category: wrap.getAttribute("data-article-category"),
    publishedAt: wrap.getAttribute("data-article-published-at"),
    sourceName: wrap.getAttribute("data-article-source-name"),
    path: wrap.getAttribute("data-article-path"),
  });
}

function setupArticleCardFavorites() {
  const buttons = Array.from(document.querySelectorAll("[data-favorite-article-card]"));
  if (!buttons.length) return;

  for (const el of buttons) {
    if (!(el instanceof HTMLButtonElement)) continue;
    const meta = getArticleMetaFromCard(el);
    if (!meta) continue;

    const refresh = () => updateFavoriteButton(el, isFavoriteArticle(meta.id));
    refresh();

    el.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const nextState = toggleFavoriteArticle(meta);
      updateFavoriteButton(el, nextState);
    });

    window.addEventListener("site:lang", refresh);
  }
}

function normalizeToolMeta(input) {
  if (!input || typeof input !== "object") return null;
  const slug = String(input.slug || "").trim();
  const title = String(input.title || input.label || "").trim();
  const path = resolveSitePath(String(input.path || "").trim() || (slug ? `/tools/${slug}/` : ""));
  if (!slug || !title || !path) return null;

  const group = String(input.group || "").trim();
  const groupLabel = String(input.groupLabel || "").trim();
  return { slug, title, path, group, groupLabel };
}

function readFavoriteTools() {
  const raw = storageGetJson(FAVORITES_TOOLS_KEY, []);
  if (!Array.isArray(raw)) return [];
  const seen = new Set();
  const list = [];
  for (const item of raw) {
    const meta = normalizeToolMeta(item);
    if (!meta || seen.has(meta.slug)) continue;
    seen.add(meta.slug);
    list.push({ ...meta, savedAt: Number(item.savedAt) || 0 });
  }
  return list;
}

function writeFavoriteTools(list) {
  storageSetJson(FAVORITES_TOOLS_KEY, Array.isArray(list) ? list : []);
}

function isFavoriteTool(slug, favorites) {
  const target = String(slug || "").trim();
  if (!target) return false;
  const list = Array.isArray(favorites) ? favorites : readFavoriteTools();
  return list.some((item) => item && item.slug === target);
}

function toggleFavoriteTool(meta) {
  const normalized = normalizeToolMeta(meta);
  if (!normalized) return false;

  const favorites = readFavoriteTools();
  const exists = favorites.some((item) => item && item.slug === normalized.slug);
  const next = exists
    ? favorites.filter((item) => item && item.slug !== normalized.slug)
    : [{ ...normalized, savedAt: Date.now() }, ...favorites];

  writeFavoriteTools(next);
  return !exists;
}

function readRecentTools() {
  const raw = storageGetJson(RECENT_TOOLS_KEY, []);
  if (!Array.isArray(raw)) return [];
  const seen = new Set();
  const list = [];
  for (const item of raw) {
    const meta = normalizeToolMeta(item);
    if (!meta || seen.has(meta.slug)) continue;
    seen.add(meta.slug);
    list.push({ ...meta, viewedAt: Number(item.viewedAt) || 0 });
  }
  return list;
}

function writeRecentTools(list) {
  storageSetJson(RECENT_TOOLS_KEY, Array.isArray(list) ? list : []);
}

function addRecentTool(meta) {
  const normalized = normalizeToolMeta(meta);
  if (!normalized) return;

  const recents = readRecentTools();
  const next = [
    { ...normalized, viewedAt: Date.now() },
    ...recents.filter((item) => item && item.slug !== normalized.slug),
  ];

  writeRecentTools(next.slice(0, MAX_RECENT_TOOLS));
}

function getToolMetaFromPage() {
  const el = document.querySelector("[data-tool-meta]");
  if (!el) return null;
  try {
    const parsed = JSON.parse(el.textContent || "");
    return normalizeToolMeta(parsed);
  } catch (_error) {
    return null;
  }
}

function setupToolLibrary() {
  const meta = getToolMetaFromPage();
  if (!meta) return;

  addRecentTool(meta);

  const btn = document.querySelector("[data-favorite-tool]");
  if (!(btn instanceof HTMLButtonElement)) return;

  const refresh = () => updateFavoriteButton(btn, isFavoriteTool(meta.slug));

  refresh();
  btn.addEventListener("click", (event) => {
    event.preventDefault();
    const nextState = toggleFavoriteTool(meta);
    updateFavoriteButton(btn, nextState);
  });

  window.addEventListener("site:lang", refresh);
}

function getToolMetaFromCard(button) {
  const wrap = button instanceof Element ? button.closest("[data-tool-slug]") : null;
  if (!wrap) return null;
  const slug = wrap.getAttribute("data-tool-slug");
  const group = wrap.getAttribute("data-tool-group");
  const path = wrap.getAttribute("data-tool-path");
  const titleEl = wrap.querySelector(".tool-card-title");
  const title = titleEl ? String(titleEl.textContent || "").trim() : "";
  return normalizeToolMeta({ slug, title, group, path });
}

function setupToolCardFavorites() {
  const buttons = Array.from(document.querySelectorAll("[data-favorite-tool-card]"));
  if (!buttons.length) return;

  for (const el of buttons) {
    if (!(el instanceof HTMLButtonElement)) continue;
    const meta = getToolMetaFromCard(el);
    if (!meta) continue;

    const refresh = () => updateFavoriteButton(el, isFavoriteTool(meta.slug));
    refresh();

    el.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const nextState = toggleFavoriteTool(meta);
      updateFavoriteButton(el, nextState);
    });

    window.addEventListener("site:lang", refresh);
  }
}

function normalizeShopMeta(input) {
  if (!input || typeof input !== "object") return null;
  const asin = String(input.asin || input.id || "").trim();
  const title = String(input.title || "").trim();
  const path = resolveSitePath(
    String(input.path || input.url || "").trim() || (asin ? `/go/${asin}/` : "")
  );
  if (!asin || !title || !path) return null;

  const image = String(input.image || "").trim();
  const price = String(input.price || "").trim();
  const rating = String(input.rating || "").trim();
  const reviewCount = String(input.reviewCount || "").trim();
  return { asin, title, path, image, price, rating, reviewCount };
}

function emitShopFavoritesChanged(count) {
  const normalizedCount = Number.isFinite(count) ? count : readFavoriteShopItems().length;
  try {
    window.dispatchEvent(
      new CustomEvent(SHOP_FAVORITES_EVENT, { detail: { count: normalizedCount } })
    );
  } catch (_error) {
    window.dispatchEvent(new Event(SHOP_FAVORITES_EVENT));
  }
}

function readFavoriteShopItems() {
  const raw = storageGetJson(FAVORITES_SHOP_KEY, []);
  if (!Array.isArray(raw)) return [];
  const seen = new Set();
  const list = [];
  for (const item of raw) {
    const meta = normalizeShopMeta(item);
    if (!meta || seen.has(meta.asin)) continue;
    seen.add(meta.asin);
    list.push({ ...meta, savedAt: Number(item.savedAt) || 0 });
  }
  return list;
}

function writeFavoriteShopItems(list) {
  const items = Array.isArray(list) ? list : [];
  storageSetJson(FAVORITES_SHOP_KEY, items);
  emitShopFavoritesChanged(items.length);
}

function isFavoriteShopItem(asin, favorites) {
  const target = String(asin || "").trim();
  if (!target) return false;
  const list = Array.isArray(favorites) ? favorites : readFavoriteShopItems();
  return list.some((item) => item && item.asin === target);
}

function toggleFavoriteShopItem(meta) {
  const normalized = normalizeShopMeta(meta);
  if (!normalized) return false;

  const favorites = readFavoriteShopItems();
  const exists = favorites.some((item) => item && item.asin === normalized.asin);
  const next = exists
    ? favorites.filter((item) => item && item.asin !== normalized.asin)
    : [{ ...normalized, savedAt: Date.now() }, ...favorites];

  writeFavoriteShopItems(next);
  return !exists;
}

function getShopMetaFromCard(card) {
  if (!(card instanceof Element)) return null;
  return normalizeShopMeta({
    asin: card.getAttribute("data-shop-asin"),
    title: card.getAttribute("data-shop-title"),
    path: card.getAttribute("data-shop-path"),
    image: card.getAttribute("data-shop-image"),
    price: card.getAttribute("data-shop-price"),
    rating: card.getAttribute("data-shop-rating"),
    reviewCount: card.getAttribute("data-shop-review-count"),
  });
}

function setupShopFavorites() {
  const buttons = Array.from(document.querySelectorAll("[data-favorite-shop]"));
  if (!buttons.length) return;

  for (const el of buttons) {
    if (!(el instanceof HTMLButtonElement)) continue;
    const card = el.closest("[data-shop-item]");
    const meta = getShopMetaFromCard(card);
    if (!meta) continue;

    const refresh = () => updateFavoriteButton(el, isFavoriteShopItem(meta.asin));
    refresh();

    el.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const nextState = toggleFavoriteShopItem(meta);
      updateFavoriteButton(el, nextState);
    });

    window.addEventListener("site:lang", refresh);
  }
}

function setupShopSavedCtas() {
  const wrappers = Array.from(document.querySelectorAll("[data-shop-saved]")).filter((el) =>
    el instanceof HTMLElement
  );
  if (!wrappers.length) return;

  function update() {
    const count = readFavoriteShopItems().length;
    const label = t("shop.savedBanner", { count }, getLang());

    for (const wrapper of wrappers) {
      wrapper.hidden = count <= 0;
      const text =
        wrapper.querySelector("[data-shop-saved-text]") ||
        (wrapper.hasAttribute("data-shop-saved-text") ? wrapper : null);
      if (text instanceof HTMLElement) text.textContent = label;
    }
  }

  update();
  window.addEventListener(SHOP_FAVORITES_EVENT, update);
  window.addEventListener("pageshow", update);
  window.addEventListener("site:lang", update);
}

function titleCaseText(value) {
  return String(value || "")
    .trim()
    .split(/[\s_-]+/g)
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatYmd(value) {
  const date = new Date(String(value || ""));
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function setupLibraryPage() {
  const articleFavList = document.querySelector('[data-library-list="favorites"]');
  const articleRecentList = document.querySelector('[data-library-list="recent"]');
  const toolFavList = document.querySelector('[data-library-list="tools-favorites"]');
  const toolRecentList = document.querySelector('[data-library-list="tools-recent"]');
  const shopFavList = document.querySelector('[data-library-list="shop-favorites"]');

  const hasAny =
    articleFavList instanceof HTMLUListElement ||
    articleRecentList instanceof HTMLUListElement ||
    toolFavList instanceof HTMLUListElement ||
    toolRecentList instanceof HTMLUListElement ||
    shopFavList instanceof HTMLUListElement;
  if (!hasAny) return;

  const filterInput = document.querySelector("[data-library-filter-input]");
  const sortSelect = document.querySelector("[data-library-sort]");
  const exportBtn = document.querySelector("[data-library-export]");
  const importInput = document.querySelector("[data-library-import-input]");
  const importBtn = document.querySelector("[data-library-import]");
  const status = document.querySelector("[data-library-status]");

  let statusOverride = null;
  let lastStatusQuery = "";
  let lastStatusCount = 0;

  function normalizeLibrarySort(input) {
    const raw = String(input || "").trim();
    if (raw === "recent" || raw === "title-asc" || raw === "title-desc") return raw;
    return "recent";
  }

  function getLibraryFilterValue() {
    if (!(filterInput instanceof HTMLInputElement)) return "";
    return filterInput.value || "";
  }

  function getLibrarySortValue() {
    if (!(sortSelect instanceof HTMLSelectElement)) return "recent";
    return normalizeLibrarySort(sortSelect.value);
  }

  function setLibraryFilterValue(next) {
    if (!(filterInput instanceof HTMLInputElement)) return;
    filterInput.value = String(next || "");
  }

  function setLibrarySortValue(next) {
    if (!(sortSelect instanceof HTMLSelectElement)) return;
    sortSelect.value = normalizeLibrarySort(next);
  }

  function getLibraryStateFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return {
      q: params.get("q") || "",
      sort: normalizeLibrarySort(params.get("sort") || "recent"),
    };
  }

  function setLibraryQueryParams({ q, sort }) {
    const url = new URL(window.location.href);
    const rawQ = String(q || "").trim();
    const normalizedSort = normalizeLibrarySort(sort);

    if (rawQ) url.searchParams.set("q", rawQ);
    else url.searchParams.delete("q");

    if (normalizedSort && normalizedSort !== "recent") url.searchParams.set("sort", normalizedSort);
    else url.searchParams.delete("sort");

    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }

  function syncControlsFromUrl() {
    const state = getLibraryStateFromUrl();
    setLibraryFilterValue(state.q);
    setLibrarySortValue(state.sort);
    return state;
  }

  function setSectionHidden(type, hidden) {
    const el = document.querySelector(`[data-library-section="${type}"]`);
    if (el) el.hidden = Boolean(hidden);
  }

  function setStatusOverrideMessage(key, vars, timeoutMs = 2600) {
    statusOverride = { key, vars: vars || null, expiresAt: Date.now() + timeoutMs };
    updateStatus(lastStatusQuery, lastStatusCount);
  }

  function updateStatus(rawQuery, visibleCount) {
    lastStatusQuery = String(rawQuery || "");
    lastStatusCount = Number(visibleCount) || 0;

    if (!status) return;

    const now = Date.now();
    if (statusOverride && now < statusOverride.expiresAt) {
      status.hidden = false;
      status.textContent = t(statusOverride.key, statusOverride.vars, getLang());
      return;
    }

    statusOverride = null;
    const q = normalizeText(rawQuery);
    if (!q) {
      status.hidden = true;
      status.textContent = "";
      return;
    }

    status.hidden = false;
    status.textContent =
      visibleCount > 0
        ? t("library.status.filtered", { q: rawQuery, count: visibleCount }, getLang())
        : t("library.status.noResults", { q: rawQuery }, getLang());
  }

  function stripSiteBasePath(pathname) {
    const value = String(pathname || "").trim();
    if (!value.startsWith("/")) return value;
    const base = getSiteBasePath();
    if (base === "/") return value;

    const baseTrimmed = base.replace(/\/$/, "");
    if (!baseTrimmed) return value;
    if (!value.startsWith(baseTrimmed + "/") && value !== baseTrimmed) return value;

    const rest = value.slice(baseTrimmed.length);
    return rest ? rest : "/";
  }

  function downloadJson(payload, filename) {
    const name = String(filename || "export.json").trim() || "export.json";
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportFavorites() {
    const articles = readFavoriteArticles().map((item) => ({
      ...item,
      path: stripSiteBasePath(item.path),
    }));
    const tools = readFavoriteTools().map((item) => ({
      ...item,
      path: stripSiteBasePath(item.path),
    }));
    const shop = readFavoriteShopItems().map((item) => ({
      ...item,
      path: stripSiteBasePath(item.path),
    }));

    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      favorites: { articles, tools, shop },
    };

    const date = new Date().toISOString().slice(0, 10);
    downloadJson(payload, `library-favorites-${date}.json`);
    setStatusOverrideMessage("library.status.exported");
  }

  async function importFavoritesFromFile(file) {
    const input = file instanceof File ? file : null;
    if (!input) throw new Error("Invalid file");
    const text = await input.text();
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== "object") throw new Error("Invalid JSON");

    const container =
      parsed.favorites && typeof parsed.favorites === "object" ? parsed.favorites : parsed;

    const incomingArticles = Array.isArray(container.articles) ? container.articles : [];
    const incomingTools = Array.isArray(container.tools) ? container.tools : [];
    const incomingShop = Array.isArray(container.shop) ? container.shop : [];

    const mergedArticles = new Map(readFavoriteArticles().map((item) => [item.id, item]));
    for (const raw of incomingArticles) {
      const meta = normalizeArticleMeta(raw);
      if (!meta) continue;
      const savedAt = Number(raw && raw.savedAt) || 0;
      const existing = mergedArticles.get(meta.id);
      mergedArticles.set(meta.id, {
        ...meta,
        savedAt: Math.max(existing?.savedAt || 0, savedAt),
      });
    }

    const mergedTools = new Map(readFavoriteTools().map((item) => [item.slug, item]));
    for (const raw of incomingTools) {
      const meta = normalizeToolMeta(raw);
      if (!meta) continue;
      const savedAt = Number(raw && raw.savedAt) || 0;
      const existing = mergedTools.get(meta.slug);
      mergedTools.set(meta.slug, {
        ...meta,
        savedAt: Math.max(existing?.savedAt || 0, savedAt),
      });
    }

    const mergedShop = new Map(readFavoriteShopItems().map((item) => [item.asin, item]));
    for (const raw of incomingShop) {
      const meta = normalizeShopMeta(raw);
      if (!meta) continue;
      const savedAt = Number(raw && raw.savedAt) || 0;
      const existing = mergedShop.get(meta.asin);
      mergedShop.set(meta.asin, {
        ...meta,
        savedAt: Math.max(existing?.savedAt || 0, savedAt),
      });
    }

    const nextArticles = Array.from(mergedArticles.values()).sort((a, b) => b.savedAt - a.savedAt);
    const nextTools = Array.from(mergedTools.values()).sort((a, b) => b.savedAt - a.savedAt);
    const nextShop = Array.from(mergedShop.values()).sort((a, b) => b.savedAt - a.savedAt);

    writeFavoriteArticles(nextArticles);
    writeFavoriteTools(nextTools);
    writeFavoriteShopItems(nextShop);

    setStatusOverrideMessage("library.importSuccess", {
      articles: nextArticles.length,
      tools: nextTools.length,
      shop: nextShop.length,
    });
  }

  function setEmpty(type, show) {
    const el = document.querySelector(`[data-library-empty="${type}"]`);
    if (el) el.hidden = !show;
  }

  function clearList(type) {
    if (type === "favorites") storageRemove(FAVORITES_ARTICLES_KEY);
    if (type === "recent") storageRemove(RECENT_ARTICLES_KEY);
    if (type === "tools-favorites") storageRemove(FAVORITES_TOOLS_KEY);
    if (type === "tools-recent") storageRemove(RECENT_TOOLS_KEY);
    if (type === "shop-favorites") {
      storageRemove(FAVORITES_SHOP_KEY);
      emitShopFavoritesChanged(0);
    }
  }

  function renderList(
    listEl,
    items,
    normalizeMeta,
    metaPartsFn,
    actions,
    linkOptions,
    renderThumb
  ) {
    if (!(listEl instanceof HTMLUListElement)) return;
    listEl.innerHTML = "";

    for (const item of items) {
      const meta = normalizeMeta(item);
      if (!meta) continue;

      const li = document.createElement("li");
      const card = document.createElement("div");
      card.className = "library-card";

      const left = document.createElement("div");
      left.className = "library-card-left";

      const main = document.createElement("div");
      main.className = "library-main";

      const title = document.createElement("div");
      title.className = "library-card-title";
      const link = document.createElement("a");
      link.href = meta.path;
      link.textContent = meta.title;
      if (linkOptions && linkOptions.target) link.target = linkOptions.target;
      if (linkOptions && linkOptions.rel) link.rel = linkOptions.rel;
      title.appendChild(link);

      const metaLine = document.createElement("div");
      metaLine.className = "library-meta";
      const parts = metaPartsFn(meta, item).filter(Boolean);
      metaLine.textContent = parts.join(" · ");

      main.appendChild(title);
      if (metaLine.textContent) main.appendChild(metaLine);

      if (typeof renderThumb === "function") {
        const thumb = renderThumb(meta, item, linkOptions);
        if (thumb) left.appendChild(thumb);
      }

      left.appendChild(main);

      const right = document.createElement("div");
      right.className = "library-actions";
      for (const action of actions) {
        const btn = action(meta, item);
        if (btn) right.appendChild(btn);
      }

      card.appendChild(left);
      if (right.childNodes.length) card.appendChild(right);
      li.appendChild(card);
      listEl.appendChild(li);
    }
  }

  function render() {
    const state = {
      q: getLibraryFilterValue(),
      sort: getLibrarySortValue(),
    };
    const q = normalizeText(state.q);

    function matches(parts) {
      if (!q) return true;
      const text = normalizeText(parts.filter(Boolean).join(" "));
      return text.includes(q);
    }

    const locale = getLang();
    const sortMode = normalizeLibrarySort(state.sort);

    function sortItems(items, titleFn, timeFn) {
      const decorated = items.map((item, idx) => ({
        item,
        idx,
        title: String(titleFn(item) || ""),
        time: Number(timeFn(item)) || 0,
      }));

      decorated.sort((a, b) => {
        if (sortMode === "title-asc" || sortMode === "title-desc") {
          const cmp = a.title.localeCompare(b.title, locale, {
            numeric: true,
            sensitivity: "base",
          });
          if (cmp) return sortMode === "title-desc" ? -cmp : cmp;
          if (b.time !== a.time) return b.time - a.time;
        } else if (b.time !== a.time) {
          return b.time - a.time;
        }
        return a.idx - b.idx;
      });

      return decorated.map((d) => d.item);
    }

    const articleFavorites = readFavoriteArticles();
    const articleRecents = readRecentArticles();
    const articleFavoritesSet = new Set(articleFavorites.map((item) => item.id));

    const articleFavoritesView = sortItems(
      q
        ? articleFavorites.filter((item) =>
            matches([item.title, item.category, item.sourceName, item.id])
          )
        : articleFavorites,
      (item) => item.title,
      (item) => item.savedAt
    );

    renderList(
      articleFavList,
      articleFavoritesView,
      normalizeArticleMeta,
      (meta) => {
        const parts = [];
        if (meta.category) parts.push(titleCaseText(meta.category));
        const dateText = formatYmd(meta.publishedAt);
        if (dateText) parts.push(dateText);
        if (meta.sourceName) parts.push(meta.sourceName);
        return parts;
      },
      [
        (meta) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "button button-secondary";
          btn.textContent = t("library.remove", null, getLang());
          btn.addEventListener("click", () => {
            writeFavoriteArticles(articleFavorites.filter((item) => item && item.id !== meta.id));
            render();
          });
          return btn;
        },
      ],
      null,
      null
    );

    const articleRecentsView = sortItems(
      q
        ? articleRecents.filter((item) =>
            matches([item.title, item.category, item.sourceName, item.id])
          )
        : articleRecents,
      (item) => item.title,
      (item) => item.viewedAt
    );

    renderList(
      articleRecentList,
      articleRecentsView,
      normalizeArticleMeta,
      (meta) => {
        const parts = [];
        if (meta.category) parts.push(titleCaseText(meta.category));
        const dateText = formatYmd(meta.publishedAt);
        if (dateText) parts.push(dateText);
        if (meta.sourceName) parts.push(meta.sourceName);
        return parts;
      },
      [
        (meta) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "button button-secondary";
          btn.textContent = t(
            articleFavoritesSet.has(meta.id) ? "article.unsave" : "article.save",
            null,
            getLang()
          );
          btn.addEventListener("click", () => {
            toggleFavoriteArticle(meta);
            render();
          });
          return btn;
        },
      ],
      null,
      null
    );

    const hasFilter = Boolean(q);
    setSectionHidden("favorites", hasFilter && articleFavoritesView.length === 0);
    setSectionHidden("recent", hasFilter && articleRecentsView.length === 0);
    setEmpty("favorites", !hasFilter && articleFavorites.length === 0);
    setEmpty("recent", !hasFilter && articleRecents.length === 0);

    const toolFavorites = readFavoriteTools();
    const toolRecents = readRecentTools();
    const toolFavoritesSet = new Set(toolFavorites.map((item) => item.slug));
    const toolMetaCache = new Map();

    function normalizeToolMetaForDisplay(input) {
      const meta = normalizeToolMeta(input);
      if (!meta) return null;

      const titleKey = `tools.item.${meta.slug}.title`;
      const titleValue = t(titleKey, null, getLang());
      if (titleValue && titleValue !== titleKey) meta.title = titleValue;

      if (meta.group) {
        const groupKey = `tools.group.${meta.group}`;
        const groupValue = t(groupKey, null, getLang());
        if (groupValue && groupValue !== groupKey) meta.groupLabel = groupValue;
      }

      if (!meta.groupLabel) meta.groupLabel = meta.group;
      return meta;
    }

    function getToolMetaForFilter(item) {
      const slug = item && item.slug ? String(item.slug) : "";
      if (slug && toolMetaCache.has(slug)) return toolMetaCache.get(slug);
      const meta = normalizeToolMetaForDisplay(item);
      if (slug) toolMetaCache.set(slug, meta);
      return meta;
    }

    const toolFavoritesView = sortItems(
      q
        ? toolFavorites.filter((item) => {
            const meta = getToolMetaForFilter(item);
            if (!meta) return false;
            return matches([meta.title, meta.groupLabel, meta.slug]);
          })
        : toolFavorites,
      (item) => getToolMetaForFilter(item)?.title || "",
      (item) => item.savedAt
    );

    renderList(
      toolFavList,
      toolFavoritesView,
      normalizeToolMetaForDisplay,
      (meta) => (meta.groupLabel ? [meta.groupLabel] : []),
      [
        (meta) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "button button-secondary";
          btn.textContent = t("library.remove", null, getLang());
          btn.addEventListener("click", () => {
            writeFavoriteTools(toolFavorites.filter((item) => item && item.slug !== meta.slug));
            render();
          });
          return btn;
        },
      ],
      null,
      null
    );

    const toolRecentsView = sortItems(
      q
        ? toolRecents.filter((item) => {
            const meta = getToolMetaForFilter(item);
            if (!meta) return false;
            return matches([meta.title, meta.groupLabel, meta.slug]);
          })
        : toolRecents,
      (item) => getToolMetaForFilter(item)?.title || "",
      (item) => item.viewedAt
    );

    renderList(
      toolRecentList,
      toolRecentsView,
      normalizeToolMetaForDisplay,
      (meta) => (meta.groupLabel ? [meta.groupLabel] : []),
      [
        (meta) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "button button-secondary";
          btn.textContent = t(
            toolFavoritesSet.has(meta.slug) ? "article.unsave" : "article.save",
            null,
            getLang()
          );
          btn.addEventListener("click", () => {
            toggleFavoriteTool(meta);
            render();
          });
          return btn;
        },
      ],
      null,
      null
    );

    setSectionHidden("tools-favorites", hasFilter && toolFavoritesView.length === 0);
    setSectionHidden("tools-recent", hasFilter && toolRecentsView.length === 0);
    setEmpty("tools-favorites", !hasFilter && toolFavorites.length === 0);
    setEmpty("tools-recent", !hasFilter && toolRecents.length === 0);

    const shopFavorites = readFavoriteShopItems();

    const shopFavoritesView = sortItems(
      q
        ? shopFavorites.filter((item) =>
            matches([
              item.title,
              item.asin,
              item.price,
              item.rating,
              item.reviewCount,
            ])
          )
        : shopFavorites,
      (item) => item.title,
      (item) => item.savedAt
    );

    renderList(
      shopFavList,
      shopFavoritesView,
      normalizeShopMeta,
      (meta) => {
        const parts = [];
        if (meta.price) parts.push(meta.price);
        if (meta.rating) {
          const count = meta.reviewCount ? ` (${meta.reviewCount})` : "";
          parts.push(`★ ${meta.rating}${count}`);
        }
        parts.push(`ASIN ${meta.asin}`);
        return parts;
      },
      [
        (meta) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "button button-secondary";
          btn.setAttribute("data-i18n", "article.copy");
          btn.textContent = t("article.copy", null, getLang());
          btn.addEventListener("click", async () => {
            try {
              const url = new URL(meta.path, window.location.origin).toString();
              const ok = await copyToClipboard(url);
              flashButtonLabel(btn, ok ? "common.copied" : "common.copyFailed");
            } catch (_error) {
              flashButtonLabel(btn, "common.copyFailed");
            }
          });
          return btn;
        },
        (meta) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "button button-secondary";
          btn.textContent = t("library.remove", null, getLang());
          btn.addEventListener("click", () => {
            writeFavoriteShopItems(
              shopFavorites.filter((item) => item && item.asin !== meta.asin)
            );
            render();
          });
          return btn;
        },
      ],
      { target: "_blank", rel: "nofollow sponsored noopener noreferrer" },
      (meta, _item, linkOptions) => {
        if (!meta.image) return null;
        const a = document.createElement("a");
        a.className = "library-thumb";
        a.href = meta.path;
        if (linkOptions && linkOptions.target) a.target = linkOptions.target;
        if (linkOptions && linkOptions.rel) a.rel = linkOptions.rel;

        const img = document.createElement("img");
        img.loading = "lazy";
        img.decoding = "async";
        img.alt = meta.title;
        img.src = meta.image;
        a.appendChild(img);
        return a;
      }
    );

    setSectionHidden("shop-favorites", hasFilter && shopFavoritesView.length === 0);
    setEmpty("shop-favorites", !hasFilter && shopFavorites.length === 0);

    updateStatus(
      state.q,
      articleFavoritesView.length +
        articleRecentsView.length +
        toolFavoritesView.length +
        toolRecentsView.length +
        shopFavoritesView.length
    );
  }

  document.querySelectorAll("[data-library-clear]").forEach((btn) => {
    if (!(btn instanceof HTMLButtonElement)) return;
    btn.addEventListener("click", () => {
      const type = btn.getAttribute("data-library-clear") || "";
      if (
        type !== "favorites" &&
        type !== "recent" &&
        type !== "tools-favorites" &&
        type !== "tools-recent" &&
        type !== "shop-favorites"
      )
        return;
      clearList(type);
      render();
    });
  });

  if (filterInput instanceof HTMLInputElement) {
    filterInput.addEventListener("input", () => {
      const state = { q: getLibraryFilterValue(), sort: getLibrarySortValue() };
      setLibraryQueryParams(state);
      render();
    });
  }

  if (sortSelect instanceof HTMLSelectElement) {
    sortSelect.addEventListener("change", () => {
      const state = { q: getLibraryFilterValue(), sort: getLibrarySortValue() };
      setLibraryQueryParams(state);
      render();
    });
  }

  if (exportBtn instanceof HTMLButtonElement) {
    exportBtn.addEventListener("click", () => {
      exportFavorites();
    });
  }

  if (importBtn instanceof HTMLButtonElement && importInput instanceof HTMLInputElement) {
    importBtn.addEventListener("click", () => {
      importInput.click();
    });

    importInput.addEventListener("change", async () => {
      const file = importInput.files && importInput.files[0];
      importInput.value = "";
      if (!file) return;

      try {
        await importFavoritesFromFile(file);
        render();
      } catch (_error) {
        setStatusOverrideMessage("library.importFailed", null, 3200);
      }
    });
  }

  window.addEventListener("popstate", () => {
    const state = syncControlsFromUrl();
    setLibraryQueryParams(state);
    render();
  });

  window.addEventListener("site:lang", render);

  const initialState = syncControlsFromUrl();
  setLibraryQueryParams(initialState);
  render();
}

async function copyToClipboard(text) {
  const value = String(text || "");
  if (!value) return false;

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // fallthrough
    }
  }

  try {
    const el = document.createElement("textarea");
    el.value = value;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.left = "-9999px";
    el.style.top = "-9999px";
    document.body.appendChild(el);
    el.select();
    el.setSelectionRange(0, el.value.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

function flashButtonLabel(button, messageKey, timeoutMs = 1400) {
  if (!(button instanceof HTMLButtonElement)) return;
  const key = button.getAttribute("data-i18n");
  const original = key ? t(key, null, getLang()) : button.textContent;

  button.disabled = true;
  button.textContent = t(messageKey, null, getLang());

  window.setTimeout(() => {
    button.disabled = false;
    button.textContent = key ? t(key, null, getLang()) : original;
  }, timeoutMs);
}

function setupCopyShareButtons() {
  document.querySelectorAll("[data-copy-link]").forEach((el) => {
    if (!(el instanceof HTMLButtonElement)) return;
    el.addEventListener("click", async () => {
      const ok = await copyToClipboard(window.location.href);
      flashButtonLabel(el, ok ? "common.copied" : "common.copyFailed");
    });
  });

  const canShare = typeof navigator.share === "function";
  document.querySelectorAll("[data-share-link]").forEach((el) => {
    if (!(el instanceof HTMLButtonElement)) return;
    if (!canShare) {
      el.hidden = true;
      return;
    }
    el.addEventListener("click", async () => {
      try {
        await navigator.share({ title: document.title, url: window.location.href });
      } catch {
        // ignore (cancelled / not allowed)
      }
    });
  });
}

function setupToTopButton() {
  const btn = document.querySelector("[data-to-top]");
  if (!(btn instanceof HTMLButtonElement)) return;

  const threshold = 600;
  let ticking = false;

  function update() {
    ticking = false;
    btn.hidden = window.scrollY < threshold;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  btn.addEventListener("click", () => {
    const reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  });

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
}

document.addEventListener("DOMContentLoaded", () => {
  setupNav();
  applyTheme(getTheme());
  setupThemeSwitch();
  setupLangSwitch();
  applyI18n(getLang());
  setupHeaderSearchPrefill();
  setupSearchShortcuts();
  setupToolJump();
  setupToolQuickJumps();
  setupToolStatePersistence();
  setupToolsIndexFilter();
  setupActiveLinks();
  setupCopyShareButtons();
  setupArticleLibrary();
  setupArticleCardFavorites();
  setupArticleReadMarkers();
  setupToolLibrary();
  setupToolCardFavorites();
  setupShopFavorites();
  setupShopSavedCtas();
  setupLibraryPage();
  setupToTopButton();
});
