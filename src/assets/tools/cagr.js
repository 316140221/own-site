(function () {
  const STORAGE_YEARS = "tool_cagr_years";

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

  function storageGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (_error) {
      return null;
    }
  }

  function storageSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (_error) {}
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
    return `${n.toFixed(4).replace(/\.?0+$/g, "")}%`;
  }

  function calculate() {
    const start = normalizeNumber($("opt-start").value);
    const end = normalizeNumber($("opt-end").value);
    const years = clampFloat($("opt-years").value, 0.000001, 200, 1);

    const typedAny = [$("opt-start").value, $("opt-end").value].some((v) => normalizeText(v));
    if (!typedAny) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    if (start == null || !Number.isFinite(start) || start <= 0) {
      $("tool-output").value = "";
      setStatus(t("tool.cagr.error.start"), true);
      return null;
    }

    if (end == null || !Number.isFinite(end) || end < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.cagr.error.end"), true);
      return null;
    }

    if (!Number.isFinite(years) || years <= 0) {
      $("tool-output").value = "";
      setStatus(t("tool.cagr.error.years"), true);
      return null;
    }

    const multiple = start === 0 ? NaN : end / start;
    const totalReturn = (multiple - 1) * 100;
    const cagr = multiple <= 0 ? NaN : (Math.pow(multiple, 1 / years) - 1) * 100;
    const monthly = multiple <= 0 ? NaN : (Math.pow(multiple, 1 / (years * 12)) - 1) * 100;

    if (!Number.isFinite(cagr)) {
      $("tool-output").value = "";
      setStatus(t("tool.cagr.error.generic"), true);
      return null;
    }

    const lines = [
      `${t("tool.cagr.out.start")}: ${formatMoney(start)}`,
      `${t("tool.cagr.out.end")}: ${formatMoney(end)}`,
      `${t("tool.cagr.out.years")}: ${years}`,
      "",
      `${t("tool.cagr.out.multiple")}: ${multiple.toFixed(6).replace(/\.?0+$/g, "")}×`,
      `${t("tool.cagr.out.totalReturn")}: ${formatPercent(totalReturn)}`,
      `${t("tool.cagr.out.cagr")}: ${formatPercent(cagr)}`,
      `${t("tool.cagr.out.monthly")}: ${formatPercent(monthly)}`,
    ];

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.cagr.status.done"), false);

    storageSet(STORAGE_YEARS, String(years));
    return { start, end, years, cagr };
  }

  function clearAll() {
    $("opt-start").value = "";
    $("opt-end").value = "";
    $("tool-output").value = "";
    setStatus("", false);
  }

  function applyPreset(value) {
    const y = clampFloat(value, 0.1, 100, 5);
    $("opt-years").value = String(y);
    calculate();
  }

  function restorePrefs() {
    const years = storageGet(STORAGE_YEARS);
    if (years != null) $("opt-years").value = years;
  }

  function main() {
    try {
      restorePrefs();
      setStatus("", false);
      calculate();

      const debounce = (() => {
        let handle = 0;
        return () => {
          if (handle) window.clearTimeout(handle);
          handle = window.setTimeout(() => {
            handle = 0;
            calculate();
          }, 60);
        };
      })();

      ["opt-start", "opt-end", "opt-years"].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("input", debounce);
        el.addEventListener("change", debounce);
      });

      document.querySelectorAll("[data-years-preset]").forEach((el) => {
        el.addEventListener("click", () => {
          applyPreset(el.getAttribute("data-years-preset"));
        });
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

