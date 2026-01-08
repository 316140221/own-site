(function () {
  function t(key, vars) {
    if (window.SiteI18n && typeof window.SiteI18n.t === "function") {
      return window.SiteI18n.t(key, vars);
    }
    return String(key || "");
  }

  function $(id) {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Missing element: #${id}`);
    return el;
  }

  function setStatus(message, isError) {
    const status = $("tool-status");
    status.textContent = message || "";
    status.classList.toggle("tool-status-error", Boolean(isError));
  }

  async function copyToClipboard(text) {
    const value = String(text || "");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  const ASIN_RE = /^[A-Z0-9]{10}$/;
  const SCHEME_RE = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

  function normalizeDomain(raw, fallback) {
    const input = String(raw || "").trim();
    if (!input) return String(fallback || "www.amazon.com");

    if (SCHEME_RE.test(input) || input.startsWith("//")) {
      try {
        const url = new URL(input.startsWith("//") ? `https:${input}` : input);
        return (url.hostname || "").toLowerCase() || String(fallback || "www.amazon.com");
      } catch (_error) {
        // fallthrough
      }
    }

    const first = input.split("/")[0];
    return String(first || fallback || "www.amazon.com").trim().toLowerCase();
  }

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

  function buildGoUrl(asin) {
    const base = getSiteBasePath();
    const baseTrimmed = base.replace(/\/$/, "");
    const path = `${baseTrimmed}/go/${String(asin).toLowerCase()}/`.replace(/^\/\//, "/");
    return new URL(path, window.location.origin).toString();
  }

  function buildAmazonUrl({ domain, asin, tag }) {
    const normalizedAsin = String(asin || "").trim().toUpperCase();
    if (!domain || !normalizedAsin) return "";
    const url = new URL(`https://${domain}/dp/${normalizedAsin}/`);
    const partnerTag = String(tag || "").trim();
    if (partnerTag) url.searchParams.set("tag", partnerTag);
    return url.toString();
  }

  function extractAsins(text) {
    const raw = String(text || "");
    const matches = [];

    for (const m of raw.matchAll(/\/dp\/([A-Z0-9]{10})/gi)) matches.push(m[1]);
    for (const m of raw.matchAll(/\/gp\/product\/([A-Z0-9]{10})/gi)) matches.push(m[1]);
    for (const m of raw.matchAll(/\b([A-Z0-9]{10})\b/gi)) matches.push(m[1]);

    const seen = new Set();
    const out = [];
    for (const asin of matches) {
      const normalized = String(asin || "").trim().toUpperCase();
      if (!normalized || !ASIN_RE.test(normalized)) continue;
      if (seen.has(normalized)) continue;
      seen.add(normalized);
      out.push(normalized);
    }
    return out;
  }

  function readTitleTemplate() {
    const value = String($("opt-title").value || "").trim();
    return value;
  }

  function getTitleForAsin(template, asin, index, total) {
    if (!template) return total === 1 ? asin : asin;
    if (template.includes("{asin}")) return template.replaceAll("{asin}", asin);
    if (total === 1) return template;
    return `${template} (${index + 1})`;
  }

  function formatOutput({ format, title, goUrl, amazonUrl }) {
    if (format === "markdown") {
      const text = title || "Link";
      const line1 = `- [${text}](${goUrl})`;
      const line2 = amazonUrl ? `  ${amazonUrl}` : "";
      return [line1, line2].filter(Boolean).join("\n");
    }

    if (format === "html") {
      const text = escapeHtml(title || "Link");
      const go = escapeHtml(goUrl);
      const amazon = escapeHtml(amazonUrl);
      const goTag = `<a href="${go}" target="_blank" rel="noopener noreferrer" referrerpolicy="strict-origin-when-cross-origin">${text}</a>`;
      if (!amazonUrl) return goTag;
      const amazonTag = `<a href="${amazon}" target="_blank" rel="nofollow sponsored noopener noreferrer" referrerpolicy="strict-origin-when-cross-origin">Amazon</a>`;
      return `${goTag}\n${amazonTag}`;
    }

    const goLabel = t("tool.amazonLink.out.go");
    const amazonLabel = t("tool.amazonLink.out.amazon");
    return amazonUrl ? `${goLabel} ${goUrl}\n${amazonLabel} ${amazonUrl}` : `${goLabel} ${goUrl}`;
  }

  function buildOutput() {
    const input = String($("tool-input").value || "").trim();
    const asins = extractAsins(input);
    if (!asins.length) {
      $("tool-output").value = "";
      if (!input) setStatus("", false);
      else setStatus(t("tool.amazonLink.error.asin"), true);
      return null;
    }

    const domain = normalizeDomain($("opt-domain").value, "www.amazon.com");
    const tag = String($("opt-tag").value || "").trim();
    const format = String($("opt-format").value || "plain");

    const template = readTitleTemplate();
    const blocks = [];

    for (let i = 0; i < asins.length; i += 1) {
      const asin = asins[i];
      const title = getTitleForAsin(template, asin, i, asins.length);
      const goUrl = buildGoUrl(asin);
      const amazonUrl = buildAmazonUrl({ domain, asin, tag });
      blocks.push(formatOutput({ format, title, goUrl, amazonUrl }));
    }

    const out = blocks.join("\n\n");
    $("tool-output").value = out;
    setStatus(t("tool.amazonLink.status.done", { count: asins.length }), false);
    return { asins, domain, tag };
  }

  function clearAll() {
    $("tool-input").value = "";
    $("tool-output").value = "";
    $("opt-title").value = "";
    setStatus("", false);
  }

  function main() {
    try {
      const debounced = (() => {
        let handle = 0;
        return () => {
          if (handle) window.clearTimeout(handle);
          handle = window.setTimeout(() => {
            handle = 0;
            buildOutput();
          }, 60);
        };
      })();

      $("btn-generate").addEventListener("click", () => {
        try {
          buildOutput();
        } catch (error) {
          setStatus(error instanceof Error ? error.message : String(error), true);
        }
      });

      $("btn-clear").addEventListener("click", clearAll);

      $("btn-copy").addEventListener("click", async () => {
        try {
          const out = $("tool-output").value || "";
          if (!out.trim()) return;
          await copyToClipboard(out);
          setStatus(t("tool.common.status.copied"), false);
        } catch (_error) {
          setStatus(t("tool.common.error.copy"), true);
        }
      });

      function openFirst(kind) {
        const meta = buildOutput();
        if (!meta || !meta.asins || !meta.asins.length) return;
        const asin = meta.asins[0];
        if (!ASIN_RE.test(asin)) return;

        if (kind === "go") {
          window.open(buildGoUrl(asin), "_blank", "noopener,noreferrer");
          return;
        }

        const url = buildAmazonUrl({ domain: meta.domain, asin, tag: meta.tag });
        if (!url) return;
        window.open(url, "_blank", "noopener,noreferrer");
      }

      $("btn-open-go").addEventListener("click", () => openFirst("go"));
      $("btn-open-amazon").addEventListener("click", () => openFirst("amazon"));

      ["tool-input", "opt-title", "opt-domain", "opt-tag", "opt-format"].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("input", debounced);
        el.addEventListener("change", debounced);
      });

      buildOutput();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  window.addEventListener("DOMContentLoaded", main);
})();
