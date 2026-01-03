(function () {
  const STORAGE_MODE = "tool_rentAfford_mode";
  const STORAGE_PERCENT = "tool_rentAfford_percent";

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
    return `${n.toFixed(2).replace(/\.?0+$/g, "")}%`;
  }

  function calculate() {
    const amount = normalizeNumber($("tool-input").value);
    const typed = normalizeText($("tool-input").value);
    const mode = $("opt-mode").value === "rentToIncome" ? "rentToIncome" : "incomeToRent";
    const percent = clampFloat($("opt-percent").value, 0.1, 99, 30);

    if (!typed) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    if (amount == null || !Number.isFinite(amount) || amount <= 0) {
      $("tool-output").value = "";
      setStatus(t("tool.rentAfford.error.amount"), true);
      return null;
    }

    if (!Number.isFinite(percent) || percent <= 0 || percent >= 100) {
      $("tool-output").value = "";
      setStatus(t("tool.rentAfford.error.percent"), true);
      return null;
    }

    const ratio = percent / 100;
    const incomeMultiple = 1 / ratio;

    const lines = [
      `${t("tool.rentAfford.out.mode")}: ${t(mode === "rentToIncome" ? "tool.rentAfford.mode.rentToIncome" : "tool.rentAfford.mode.incomeToRent")}`,
      `${t("tool.rentAfford.out.rule")}: ${t("tool.rentAfford.out.rentAtMost")} ${formatPercent(percent)} (${t("tool.rentAfford.out.incomeAtLeast")} ${incomeMultiple.toFixed(2)}× ${t("tool.rentAfford.out.rent")})`,
      "",
    ];

    if (mode === "rentToIncome") {
      const rent = amount;
      const requiredMonthly = rent / ratio;
      const requiredAnnual = requiredMonthly * 12;
      lines.push(`${t("tool.rentAfford.out.rent")}: ${formatMoney(rent)}`);
      lines.push(`${t("tool.rentAfford.out.requiredMonthlyIncome")}: ${formatMoney(requiredMonthly)}`);
      lines.push(`${t("tool.rentAfford.out.requiredAnnualIncome")}: ${formatMoney(requiredAnnual)}`);
    } else {
      const monthlyIncome = amount;
      const maxRent = monthlyIncome * ratio;
      const maxAnnualRent = maxRent * 12;
      lines.push(`${t("tool.rentAfford.out.monthlyIncome")}: ${formatMoney(monthlyIncome)}`);
      lines.push(`${t("tool.rentAfford.out.maxRent")}: ${formatMoney(maxRent)}`);
      lines.push(`${t("tool.rentAfford.out.maxAnnualRent")}: ${formatMoney(maxAnnualRent)}`);
    }

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.rentAfford.status.done"), false);

    storageSet(STORAGE_MODE, mode);
    storageSet(STORAGE_PERCENT, String(percent));

    return { amount, mode, percent };
  }

  function clearAll() {
    $("tool-input").value = "";
    $("tool-output").value = "";
    setStatus("", false);
  }

  function applyPreset(value) {
    const pct = clampFloat(value, 0.1, 99, 30);
    $("opt-percent").value = String(pct);
    calculate();
  }

  function restorePrefs() {
    const mode = storageGet(STORAGE_MODE);
    if (mode === "incomeToRent" || mode === "rentToIncome") $("opt-mode").value = mode;

    const pct = storageGet(STORAGE_PERCENT);
    if (pct != null) $("opt-percent").value = pct;
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

      ["tool-input", "opt-mode", "opt-percent"].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("input", debounce);
        el.addEventListener("change", debounce);
      });

      document.querySelectorAll("[data-percent-preset]").forEach((el) => {
        el.addEventListener("click", () => {
          applyPreset(el.getAttribute("data-percent-preset"));
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

