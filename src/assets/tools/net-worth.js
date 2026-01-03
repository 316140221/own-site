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

  function normalizeText(value) {
    return String(value || "").trim();
  }

  function parseNumberToken(token) {
    const raw = String(token || "").trim();
    if (!raw) return null;
    const cleaned = raw.replace(/,/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }

  function extractLastNumberToken(line) {
    const raw = normalizeText(line);
    if (!raw) return null;
    const matches = raw.match(/-?\d[\d,]*(?:\.\d+)?/g);
    if (!matches || !matches.length) return null;
    return matches[matches.length - 1];
  }

  function cleanLabel(label) {
    const s = normalizeText(label);
    if (!s) return "";
    return s.replace(/[:\-–—|]+$/g, "").trim();
  }

  function parseItems(text, { absValue } = {}) {
    const lines = String(text || "").split(/\r?\n/);
    const items = [];
    let invalid = 0;

    for (const line of lines) {
      const rawLine = normalizeText(line);
      if (!rawLine) continue;

      const token = extractLastNumberToken(rawLine);
      if (!token) {
        invalid += 1;
        continue;
      }

      const value0 = parseNumberToken(token);
      if (value0 == null) {
        invalid += 1;
        continue;
      }

      const value = absValue ? Math.abs(value0) : value0;
      const idx = rawLine.lastIndexOf(token);
      const labelRaw = idx >= 0 ? rawLine.slice(0, idx) : rawLine;
      const label = cleanLabel(labelRaw) || t("tool.netWorth.item.untitled");

      items.push({ label, value });
    }

    return { items, invalid };
  }

  const currencyFormatter = (() => {
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });
    } catch (_error) {
      return null;
    }
  })();

  function formatMoney(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "";
    if (currencyFormatter) return currencyFormatter.format(n);
    return `$${n.toFixed(2)}`;
  }

  function formatPercent(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "";
    return `${n.toFixed(2).replace(/\.?0+$/g, "")}%`;
  }

  function calculate() {
    const assetsText = String($("opt-assets").value || "");
    const liabilitiesText = String($("opt-liabilities").value || "");
    const showBreakdown = Boolean($("opt-show-breakdown").checked);

    const typedAny = [assetsText, liabilitiesText].some((v) => normalizeText(v));
    if (!typedAny) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    const assets = parseItems(assetsText, { absValue: false });
    const liabilities = parseItems(liabilitiesText, { absValue: true });

    const assetsTotal = assets.items.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
    const liabilitiesTotal = liabilities.items.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
    const netWorth = assetsTotal - liabilitiesTotal;

    const invalid = (assets.invalid || 0) + (liabilities.invalid || 0);

    const lines = [
      `${t("tool.netWorth.out.netWorth")}: ${formatMoney(netWorth)}`,
      `${t("tool.netWorth.out.assetsTotal")}: ${formatMoney(assetsTotal)}`,
      `${t("tool.netWorth.out.liabilitiesTotal")}: ${formatMoney(liabilitiesTotal)}`,
    ];

    if (assetsTotal > 0) {
      lines.push(`${t("tool.netWorth.out.debtToAssets")}: ${formatPercent((liabilitiesTotal / assetsTotal) * 100)}`);
    }

    if (showBreakdown) {
      lines.push("");
      lines.push(`${t("tool.netWorth.out.assets")}:`);
      if (assets.items.length) {
        for (const item of assets.items) {
          lines.push(`- ${item.label}: ${formatMoney(item.value)}`);
        }
      } else {
        lines.push(`- ${t("tool.netWorth.out.none")}`);
      }

      lines.push("");
      lines.push(`${t("tool.netWorth.out.liabilities")}:`);
      if (liabilities.items.length) {
        for (const item of liabilities.items) {
          lines.push(`- ${item.label}: ${formatMoney(item.value)}`);
        }
      } else {
        lines.push(`- ${t("tool.netWorth.out.none")}`);
      }
    }

    if (invalid > 0) {
      lines.push("");
      lines.push(`${t("tool.netWorth.out.ignoredLines")}: ${invalid}`);
    }

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.netWorth.status.done"), false);
    return { assetsTotal, liabilitiesTotal, netWorth, invalid };
  }

  function clearAll() {
    $("opt-assets").value = "";
    $("opt-liabilities").value = "";
    $("tool-output").value = "";
    setStatus("", false);
  }

  function main() {
    try {
      setStatus("", false);
      calculate();

      const debounce = (() => {
        let handle = 0;
        return () => {
          if (handle) window.clearTimeout(handle);
          handle = window.setTimeout(() => {
            handle = 0;
            calculate();
          }, 80);
        };
      })();

      ["opt-assets", "opt-liabilities", "opt-show-breakdown"].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("input", debounce);
        el.addEventListener("change", debounce);
      });

      $("btn-calc").addEventListener("click", calculate);
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
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  window.addEventListener("DOMContentLoaded", main);
})();

