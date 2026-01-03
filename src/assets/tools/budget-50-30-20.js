(function () {
  const STORAGE_NEEDS = "tool_budget503020_needs";
  const STORAGE_WANTS = "tool_budget503020_wants";
  const STORAGE_SAVINGS = "tool_budget503020_savings";

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
    const income = normalizeNumber($("tool-input").value);
    const typed = normalizeText($("tool-input").value);
    const needsPct = clampFloat($("opt-needs").value, 0, 100, 50);
    const wantsPct = clampFloat($("opt-wants").value, 0, 100, 30);
    const savingsPct = clampFloat($("opt-savings").value, 0, 100, 20);

    if (!typed) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    if (income == null || !Number.isFinite(income) || income < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.budget503020.error.income"), true);
      return null;
    }

    const totalPct = needsPct + wantsPct + savingsPct;
    if (!Number.isFinite(totalPct) || Math.abs(totalPct - 100) > 0.01) {
      $("tool-output").value = "";
      setStatus(t("tool.budget503020.error.percentSum", { sum: formatPercent(totalPct) }), true);
      return null;
    }

    const needs = (income * needsPct) / 100;
    const wants = (income * wantsPct) / 100;
    const savings = (income * savingsPct) / 100;

    const monthToWeek = 12 / 52;
    const monthToDay = 12 / 365;

    const lines = [
      `${t("tool.budget503020.out.income")}: ${formatMoney(income)}`,
      `${t("tool.budget503020.out.rule")}: ${formatPercent(needsPct)} / ${formatPercent(wantsPct)} / ${formatPercent(
        savingsPct
      )}`,
      "",
      `${t("tool.budget503020.out.needs")}: ${formatMoney(needs)} (${t("tool.budget503020.out.monthly")})`,
      `${t("tool.budget503020.out.wants")}: ${formatMoney(wants)} (${t("tool.budget503020.out.monthly")})`,
      `${t("tool.budget503020.out.savings")}: ${formatMoney(savings)} (${t("tool.budget503020.out.monthly")})`,
      "",
      `${t("tool.budget503020.out.needs")}: ${formatMoney(needs * monthToWeek)} (${t("tool.budget503020.out.weekly")})`,
      `${t("tool.budget503020.out.wants")}: ${formatMoney(wants * monthToWeek)} (${t("tool.budget503020.out.weekly")})`,
      `${t("tool.budget503020.out.savings")}: ${formatMoney(savings * monthToWeek)} (${t("tool.budget503020.out.weekly")})`,
      "",
      `${t("tool.budget503020.out.needs")}: ${formatMoney(needs * monthToDay)} (${t("tool.budget503020.out.daily")})`,
      `${t("tool.budget503020.out.wants")}: ${formatMoney(wants * monthToDay)} (${t("tool.budget503020.out.daily")})`,
      `${t("tool.budget503020.out.savings")}: ${formatMoney(savings * monthToDay)} (${t("tool.budget503020.out.daily")})`,
    ];

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.budget503020.status.done"), false);

    storageSet(STORAGE_NEEDS, String(needsPct));
    storageSet(STORAGE_WANTS, String(wantsPct));
    storageSet(STORAGE_SAVINGS, String(savingsPct));

    return { income, needsPct, wantsPct, savingsPct };
  }

  function clearAll() {
    $("tool-input").value = "";
    $("tool-output").value = "";
    setStatus("", false);
  }

  function resetRule() {
    $("opt-needs").value = "50";
    $("opt-wants").value = "30";
    $("opt-savings").value = "20";
    calculate();
  }

  function restorePrefs() {
    const needs = storageGet(STORAGE_NEEDS);
    if (needs != null) $("opt-needs").value = needs;
    const wants = storageGet(STORAGE_WANTS);
    if (wants != null) $("opt-wants").value = wants;
    const savings = storageGet(STORAGE_SAVINGS);
    if (savings != null) $("opt-savings").value = savings;
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

      ["tool-input", "opt-needs", "opt-wants", "opt-savings"].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("input", debounce);
        el.addEventListener("change", debounce);
      });

      $("btn-reset").addEventListener("click", resetRule);
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

