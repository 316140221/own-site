module.exports = {
  name: "Cloud Utility Desk",
  brand: "Cloud Utility Desk",
  tagline: "Cloud-ready, open and use anytime",
  description:
    "Cloud-first utilities and a lightweight info stream — available anywhere, ready when you are.",
  language: "en",
  url: process.env.SITE_URL || "http://localhost:8080",
  googleSiteVerification: String(process.env.GOOGLE_SITE_VERIFICATION || "").trim(),
};
