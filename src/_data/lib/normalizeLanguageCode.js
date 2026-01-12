module.exports = function normalizeLanguageCode(input, fallback = "en") {
  const raw = String(input || fallback).trim().toLowerCase();
  if (!raw) return fallback;
  const base = raw.split("-")[0];
  return base || fallback;
};

