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

  function extractLastTwoNumberTokens(line) {
    const raw = normalizeText(line);
    if (!raw) return null;
    const matches = raw.match(/-?\d[\d,]*(?:\.\d+)?/g);
    if (!matches || matches.length < 2) return null;
    const limitToken = matches[matches.length - 1];
    const balanceToken = matches[matches.length - 2];
    return { balanceToken, limitToken };
  }

  function cleanLabel(label) {
    const s = normalizeText(label);
    if (!s) return "";
    return s.replace(/[:\-–—|/]+$/g, "").trim();
  }

  function removeLastOccurrence(text, sub) {
    const str = String(text || "");
    const needle = String(sub || "");
    if (!needle) return str;
    const idx = str.lastIndexOf(needle);
    if (idx < 0) return str;
    return str.slice(0, idx) + str.slice(idx + needle.length);
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

  function utilizationCategory(pct) {
    const p = Number(pct);
    if (!Number.isFinite(p)) return { key: "tool.creditUtil.category.unknown", pct: null };
    if (p < 10) return { key: "tool.creditUtil.category.excellent", pct: p };
    if (p < 30) return { key: "tool.creditUtil.category.good", pct: p };
    if (p < 50) return { key: "tool.creditUtil.category.high", pct: p };
    return { key: "tool.creditUtil.category.veryHigh", pct: p };
  }

  function calculate() {
    const text = String($("opt-cards").value || "");
    const showBreakdown = Boolean($("opt-show-breakdown").checked);

    if (!normalizeText(text)) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    const linesIn = text.split(/\r?\n/);
    const rows = [];
    let invalid = 0;

    for (let i = 0; i < linesIn.length; i += 1) {
      const line = normalizeText(linesIn[i]);
      if (!line) continue;

      const tokens = extractLastTwoNumberTokens(line);
      if (!tokens) {
        invalid += 1;
        continue;
      }

      const balance0 = parseNumberToken(tokens.balanceToken);
      const limit0 = parseNumberToken(tokens.limitToken);
      if (balance0 == null || limit0 == null) {
        invalid += 1;
        continue;
      }

      const balance = Math.max(0, balance0);
      const limit = Math.max(0, limit0);
      if (limit <= 0) {
        invalid += 1;
        continue;
      }

      let label = line;
      label = removeLastOccurrence(label, tokens.limitToken);
      label = removeLastOccurrence(label, tokens.balanceToken);
      label = cleanLabel(label);

      const util = (balance / limit) * 100;
      rows.push({
        label: label || `${t("tool.creditUtil.card")} ${rows.length + 1}`,
        balance,
        limit,
        util,
      });
    }

    if (!rows.length) {
      $("tool-output").value = "";
      setStatus(t("tool.creditUtil.error.noValidLines"), true);
      return null;
    }

    const totalBalance = rows.reduce((sum, r) => sum + r.balance, 0);
    const totalLimit = rows.reduce((sum, r) => sum + r.limit, 0);
    const overall = totalLimit > 0 ? (totalBalance / totalLimit) * 100 : NaN;
    const category = utilizationCategory(overall);

    const lines = [
      `${t("tool.creditUtil.out.totalBalance")}: ${formatMoney(totalBalance)}`,
      `${t("tool.creditUtil.out.totalLimit")}: ${formatMoney(totalLimit)}`,
      `${t("tool.creditUtil.out.utilization")}: ${formatPercent(overall)}`,
      `${t("tool.creditUtil.out.category")}: ${t(category.key)}`,
    ];

    if (showBreakdown) {
      lines.push("", t("tool.creditUtil.out.breakdown"));
      const sorted = rows.slice().sort((a, b) => b.util - a.util);
      for (const row of sorted) {
        lines.push(
          `- ${row.label}: ${formatMoney(row.balance)} / ${formatMoney(row.limit)} = ${formatPercent(row.util)}`
        );
      }
    }

    if (invalid > 0) {
      lines.push("", `${t("tool.creditUtil.out.ignoredLines")}: ${invalid}`);
    }

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.creditUtil.status.done"), false);
    return { totalBalance, totalLimit, overall, invalid };
  }

  function clearAll() {
    $("opt-cards").value = "";
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

      ["opt-cards", "opt-show-breakdown"].forEach((id) => {
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

