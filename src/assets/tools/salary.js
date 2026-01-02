(function () {
  const STORAGE_MODE = "tool_salary_mode";
  const STORAGE_HOURS = "tool_salary_hours";
  const STORAGE_WEEKS = "tool_salary_weeks";

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
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
      });
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

  function calculate() {
    const amount = normalizeNumber($("tool-input").value);
    const typed = normalizeText($("tool-input").value);
    const mode = $("opt-mode").value === "hourly" ? "hourly" : "salary";
    const hoursPerWeek = clampFloat($("opt-hours").value, 1, 168, 40);
    const weeksPerYear = clampFloat($("opt-weeks").value, 1, 53, 52);

    if (!typed) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    if (amount == null || !Number.isFinite(amount) || amount < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.salary.error.amount"), true);
      return null;
    }

    if (!Number.isFinite(hoursPerWeek) || hoursPerWeek <= 0) {
      $("tool-output").value = "";
      setStatus(t("tool.salary.error.hours"), true);
      return null;
    }

    if (!Number.isFinite(weeksPerYear) || weeksPerYear <= 0) {
      $("tool-output").value = "";
      setStatus(t("tool.salary.error.weeks"), true);
      return null;
    }

    const annual = mode === "salary" ? amount : amount * hoursPerWeek * weeksPerYear;
    const hourly = mode === "hourly" ? amount : annual / (hoursPerWeek * weeksPerYear);
    const weekly = annual / weeksPerYear;
    const biweekly = annual / 26;
    const semiMonthly = annual / 24;
    const monthly = annual / 12;

    const lines = [
      `${t("tool.salary.out.mode")}: ${t(mode === "hourly" ? "tool.salary.mode.hourly" : "tool.salary.mode.salary")}`,
      `${t("tool.salary.out.hoursPerWeek")}: ${hoursPerWeek}`,
      `${t("tool.salary.out.weeksPerYear")}: ${weeksPerYear}`,
      "",
      `${t("tool.salary.out.annual")}: ${formatMoney(annual)}`,
      `${t("tool.salary.out.monthly")}: ${formatMoney(monthly)}`,
      `${t("tool.salary.out.semiMonthly")}: ${formatMoney(semiMonthly)}`,
      `${t("tool.salary.out.biweekly")}: ${formatMoney(biweekly)}`,
      `${t("tool.salary.out.weekly")}: ${formatMoney(weekly)}`,
      `${t("tool.salary.out.hourly")}: ${formatMoney(hourly)}`,
    ];

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.salary.status.done"), false);

    storageSet(STORAGE_MODE, mode);
    storageSet(STORAGE_HOURS, String(hoursPerWeek));
    storageSet(STORAGE_WEEKS, String(weeksPerYear));

    return { mode, amount, hoursPerWeek, weeksPerYear };
  }

  function clearAll() {
    $("tool-input").value = "";
    $("tool-output").value = "";
    setStatus("", false);
  }

  function restorePrefs() {
    const mode = storageGet(STORAGE_MODE);
    if (mode === "hourly" || mode === "salary") $("opt-mode").value = mode;

    const hours = storageGet(STORAGE_HOURS);
    if (hours != null) $("opt-hours").value = hours;

    const weeks = storageGet(STORAGE_WEEKS);
    if (weeks != null) $("opt-weeks").value = weeks;
  }

  function main() {
    try {
      restorePrefs();
      setStatus("", false);

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

      ["tool-input", "opt-mode", "opt-hours", "opt-weeks"].forEach((id) => {
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

