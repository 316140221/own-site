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
        slug: "url",
        label: "URL Encode/Decode",
        description: "encodeURIComponent / decodeURIComponent helpers.",
      },
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

const featuredSlugs = new Set(["base64", "url", "json", "hash"]);
const featured = all.filter((tool) => featuredSlugs.has(tool.slug));

module.exports = {
  groups,
  all,
  featured,
};
