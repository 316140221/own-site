function normalizePath(path) {
  const raw = String(path || "").trim();
  if (!raw) return "/";
  return raw.startsWith("/") ? raw : `/${raw}`;
}

const rawGroups = [
  {
    id: "encoding",
    label: "Encoding",
    items: [
      {
        slug: "base64",
        label: "Base64 Encode/Decode",
        description: "UTF-8 text, URL-safe variant, optional padding removal.",
      },
      {
        slug: "base32",
        label: "Base32 Encode/Decode",
        description: "RFC 4648 Base32 for UTF-8 text, optional padding removal.",
      },
      {
        slug: "url",
        label: "URL Encode/Decode",
        description: "encodeURIComponent / decodeURIComponent helpers.",
      },
      {
        slug: "unicode",
        label: "Unicode Escape/Unescape",
        description: "Escape and unescape \\uXXXX / \\u{...} / \\xNN sequences.",
      },
      {
        slug: "hex",
        label: "Hex Encode/Decode",
        description: "UTF-8 text ↔ HEX bytes (with optional separators).",
      },
      {
        slug: "html",
        label: "HTML Escape/Unescape",
        description: "Escape/unescape HTML entities like &lt; &gt; &amp; &quot; &#39;.",
      },
      {
        slug: "morse",
        label: "Morse Encode/Decode",
        description: "Encode and decode International Morse code.",
      },
      {
        slug: "base58",
        label: "Base58 Encode/Decode",
        description: "Bitcoin alphabet Base58 for UTF-8 text.",
      },
      {
        slug: "base85",
        label: "Base85 (Ascii85) Encode/Decode",
        description: "Ascii85/Base85 for UTF-8 text, optional “z” compression.",
      },
      {
        slug: "rot13",
        label: "ROT13",
        description: "ROT13 transform for A-Z / a-z text.",
      },
      {
        slug: "escape",
        label: "Escape/Unescape (JS)",
        description: "Legacy JavaScript escape()/unescape() encoder/decoder.",
      },
    ],
  },
  {
    id: "formatting",
    label: "Formatting",
    items: [
      {
        slug: "json",
        label: "JSON Format/Minify",
        description: "Pretty-print, minify, optional stable key sorting.",
      },
      {
        slug: "csv",
        label: "CSV ↔ JSON",
        description: "Convert between CSV and JSON (headers, delimiter options).",
      },
      {
        slug: "xml",
        label: "XML Format/Minify",
        description: "Pretty-print or minify XML locally in your browser.",
      },
      {
        slug: "case",
        label: "Text Case Converter",
        description: "Convert between common casing styles (camel, snake, kebab, title…).",
      },
      {
        slug: "lines",
        label: "Text Lines Tool",
        description: "Sort, dedupe, and clean up text lines.",
      },
    ],
  },
  {
    id: "hashing",
    label: "Hashing",
    items: [
      {
        slug: "hash",
        label: "SHA Hash",
        description: "WebCrypto: SHA-256 / SHA-1 / SHA-384 / SHA-512.",
      },
      {
        slug: "md5",
        label: "MD5 Hash",
        description: "MD5 hash for UTF-8 text (hex or base64).",
      },
      {
        slug: "md4",
        label: "MD4 Hash",
        description: "MD4 hash for UTF-8 text (hex or base64).",
      },
      {
        slug: "md2",
        label: "MD2 Hash",
        description: "MD2 hash for UTF-8 text (hex or base64).",
      },
      {
        slug: "crc32",
        label: "CRC32 Checksum",
        description: "CRC32 checksum for UTF-8 text (hex + decimal).",
      },
      {
        slug: "hmac",
        label: "HMAC",
        description: "WebCrypto HMAC with SHA-256 / SHA-1 / SHA-384 / SHA-512.",
      },
      {
        slug: "file-hash",
        label: "File Hash",
        description: "Compute file hashes locally (SHA + CRC32).",
      },
    ],
  },
  {
    id: "generators",
    label: "Generators",
    items: [
      {
        slug: "uuid",
        label: "UUID Generator",
        description: "Generate UUID v4 locally in your browser.",
      },
      {
        slug: "password",
        label: "Password Generator",
        description: "Generate strong random passwords locally.",
      },
      {
        slug: "nanoid",
        label: "Nano ID Generator",
        description: "Generate short URL-safe IDs locally.",
      },
      {
        slug: "lorem",
        label: "Lorem Ipsum Generator",
        description: "Generate lorem ipsum text locally.",
      },
    ],
  },
  {
    id: "parsing",
    label: "Parsing",
    items: [
      {
        slug: "jwt",
        label: "JWT Decode",
        description: "Decode JWT header and payload locally (no verification).",
      },
      {
        slug: "querystring",
        label: "Query String Parse/Build",
        description: "Parse a URL/querystring into JSON, or build a querystring from JSON.",
      },
      {
        slug: "regex",
        label: "Regex Tester",
        description: "Test matches or do replacements with JavaScript RegExp.",
      },
    ],
  },
  {
    id: "crypto",
    label: "Crypto",
    items: [
      {
        slug: "aes",
        label: "AES-GCM Encrypt/Decrypt",
        description: "AES-GCM + PBKDF2 (passphrase) in your browser.",
      },
      {
        slug: "rsa",
        label: "RSA Hybrid Encrypt/Decrypt",
        description: "Hybrid RSA-OAEP + AES-GCM for practical encrypt/decrypt.",
      },
    ],
  },
  {
    id: "converters",
    label: "Converters",
    items: [
      {
        slug: "timestamp",
        label: "Timestamp Converter",
        description: "Convert between Unix timestamps and dates.",
      },
      {
        slug: "number-base",
        label: "Number Base Converter",
        description: "Convert numbers between bases (2-36).",
      },
      {
        slug: "ip",
        label: "IPv4 CIDR Calculator",
        description: "Compute netmask, network, broadcast, and host range from CIDR.",
      },
      {
        slug: "color",
        label: "Color Converter",
        description: "Convert between HEX/RGB/HSL color formats.",
      },
    ],
  },
];

const groups = rawGroups.map((group) => ({
  ...group,
  items: group.items.map((tool) => ({
    ...tool,
    group: group.id,
    path: normalizePath(`/tools/${tool.slug}/`),
  })),
}));

const all = groups.flatMap((group) => group.items);

const featuredSlugs = new Set(["base64", "url", "json", "hash", "uuid", "password"]);
const featured = all.filter((tool) => featuredSlugs.has(tool.slug));

module.exports = {
  groups,
  all,
  featured,
};
