function intFromEnv(envKey, fallback, options = {}) {
  const raw = process.env[envKey];
  const parsed = Number.parseInt(String(raw ?? ""), 10);
  const base = Number.isFinite(parsed) ? parsed : fallback;

  const min = Number.isFinite(options.min) ? options.min : null;
  const max = Number.isFinite(options.max) ? options.max : null;

  if (min != null && base < min) return min;
  if (max != null && base > max) return max;
  return base;
}

function stringFromEnv(envKey, fallback = "") {
  const raw = process.env[envKey];
  const value = String(raw ?? "").trim();
  if (value) return value;
  return String(fallback ?? "").trim();
}

function firstStringFromEnv(envKeys, fallback = "") {
  const keys = Array.isArray(envKeys) ? envKeys : [];
  for (const key of keys) {
    const value = stringFromEnv(key, "");
    if (value) return value;
  }
  return String(fallback ?? "").trim();
}

function boolFromEnv(envKey, fallback = false) {
  const raw = stringFromEnv(envKey, "").toLowerCase();
  if (!raw) return fallback;
  if (["1", "true", "yes", "y", "on"].includes(raw)) return true;
  if (["0", "false", "no", "n", "off"].includes(raw)) return false;
  return fallback;
}

module.exports = { boolFromEnv, firstStringFromEnv, intFromEnv, stringFromEnv };
