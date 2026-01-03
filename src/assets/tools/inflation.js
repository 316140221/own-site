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

  function normalizeNumber(value) {
    const raw = normalizeText(value);
    if (!raw) return null;
    const cleaned = raw.replace(/[$,]/g, "").replace(/\s+/g, "");
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }

  function clampInt(value, min, max, fallback) {
    const n = Number.parseInt(String(value ?? ""), 10);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }

  function clampFloat(value, min, max, fallback) {
    const n = Number(String(value ?? ""));
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
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
    const amountRaw = normalizeText($("opt-amount").value);
    const amount = normalizeNumber(amountRaw);
    const mode = String($("opt-mode").value || "inflate");
    const rate = clampFloat($("opt-rate").value, 0, 100, 0);
    const years = clampInt($("opt-years").value, 0, 200, 0);
    const showBreakdown = Boolean($("opt-show-breakdown").checked);

    if (!amountRaw) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    if (amount == null || !Number.isFinite(amount) || amount <= 0) {
      $("tool-output").value = "";
      setStatus(t("tool.inflation.error.amount"), true);
      return null;
    }

    const factor = Math.pow(1 + rate / 100, years);
    if (!Number.isFinite(factor) || factor <= 0) {
      $("tool-output").value = "";
      setStatus(t("tool.inflation.error.generic"), true);
      return null;
    }

    const inflated = amount * factor;
    const deflated = amount / factor;
    const cumulative = (factor - 1) * 100;

    const modeLabel = mode === "deflate" ? t("tool.inflation.mode.deflate") : t("tool.inflation.mode.inflate");
    const result = mode === "deflate" ? deflated : inflated;

    const lines = [
      `${t("tool.inflation.out.amount")}: ${formatMoney(amount)}`,
      `${t("tool.inflation.out.mode")}: ${modeLabel}`,
      `${t("tool.inflation.out.rate")}: ${formatPercent(rate)}`,
      `${t("tool.inflation.out.years")}: ${years}`,
      `${t("tool.inflation.out.cumulative")}: ${formatPercent(cumulative)}`,
      "",
      `${t("tool.inflation.out.result")}: ${formatMoney(result)}`,
      `${t("tool.inflation.out.future")}: ${formatMoney(inflated)}`,
      `${t("tool.inflation.out.today")}: ${formatMoney(deflated)}`,
    ];

    if (showBreakdown && years > 0) {
      lines.push("", t("tool.inflation.out.breakdown"));
      const max = Math.min(50, years);
      for (let y = 1; y <= max; y += 1) {
        const f = Math.pow(1 + rate / 100, y);
        lines.push(
          `${t("tool.inflation.out.year")} ${y}: ${formatMoney(amount * f)}`
        );
      }
      if (years > max) lines.push("…");
    }

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.inflation.status.done"), false);
    return { amount, mode, rate, years, factor, result };
  }

  function clearAll() {
    $("opt-amount").value = "";
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

      ["opt-amount", "opt-mode", "opt-rate", "opt-years", "opt-show-breakdown"].forEach((id) => {
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

