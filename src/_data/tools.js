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
        slug: "crc32",
        label: "CRC32 Checksum",
        description: "CRC32 checksum for UTF-8 text (hex + decimal).",
      },
      {
        slug: "hmac",
        label: "HMAC",
        description: "WebCrypto HMAC with SHA-256 / SHA-1 / SHA-384 / SHA-512.",
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
