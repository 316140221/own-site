const { firstStringFromEnv, stringFromEnv } = require("./lib/env.js");

function normalizeProvider(input) {
  const value = String(input ?? "")
    .trim()
    .toLowerCase();

  if (!value) return "";
  if (["cloudflare", "cf", "cloudflare-web-analytics", "cf-web-analytics"].includes(value)) {
    return "cloudflare";
  }
  if (["ga4", "ga", "google", "google-analytics", "google-analytics-4"].includes(value)) {
    return "ga4";
  }
  return value;
}

module.exports = function () {
  const providerInput = stringFromEnv("ANALYTICS_PROVIDER", "");

  const cloudflareToken = firstStringFromEnv(
    ["CLOUDFLARE_WEB_ANALYTICS_TOKEN", "CF_WEB_ANALYTICS_TOKEN"],
    ""
  );

  const gaMeasurementId = firstStringFromEnv(
    ["GA_MEASUREMENT_ID", "GOOGLE_ANALYTICS_ID"],
    ""
  );

  let provider = normalizeProvider(providerInput);
  if (!provider) {
    const hasCloudflare = Boolean(cloudflareToken);
    const hasGa4 = Boolean(gaMeasurementId);
    if (hasCloudflare && !hasGa4) provider = "cloudflare";
    else if (hasGa4 && !hasCloudflare) provider = "ga4";
  }

  const enabled =
    (provider === "cloudflare" && Boolean(cloudflareToken)) ||
    (provider === "ga4" && Boolean(gaMeasurementId));

  return {
    enabled,
    provider,
    cloudflareToken,
    gaMeasurementId,
  };
};

