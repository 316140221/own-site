(function () {
  function t(key, vars) {
    if (window.SiteI18n && typeof window.SiteI18n.t === "function") return window.SiteI18n.t(key, vars);
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

  function clampFloat(value, min, max, fallback) {
    const n = Number(String(value ?? ""));
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }

  const LIMIT_2024 = {
    single: 4150,
    family: 8300,
    catchup: 1000,
  };

  function formatMoney(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "";
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);
    } catch (_e) {
      return `$${n.toFixed(2)}`;
    }
  }

  function formatPercent(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "";
    return `${n.toFixed(3).replace(/\.?0+$/g, "")}%`;
  }

  function calculate() {
    const status = $("opt-status").value === "family" ? "family" : "single";
    const contrib = normalizeNumber($("opt-contrib").value);
    const employer = normalizeNumber($("opt-employer").value) ?? 0;
    const customLimit = normalizeNumber($("opt-limit").value);
    const catchup = Boolean($("opt-catchup").checked);
    const taxRate = clampFloat($("opt-tax").value, 0, 70, 0) / 100;

    if (contrib == null || !Number.isFinite(contrib) || contrib < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.hsa.error.contrib"), true);
      return null;
    }

    if (!Number.isFinite(employer) || employer < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.hsa.error.employer"), true);
      return null;
    }

    const baseLimit = Number.isFinite(customLimit) && customLimit >= 0 ? customLimit : LIMIT_2024[status];
    const totalLimit = baseLimit + (catchup ? LIMIT_2024.catchup : 0);
    const intended = contrib + employer;
    const allowedTotal = Math.min(intended, totalLimit);
    const allowedEmployee = Math.max(0, allowedTotal - employer);
    const excess = Math.max(0, intended - totalLimit);

    const taxSavings = allowedEmployee * taxRate;
    const afterTaxCost = allowedEmployee - taxSavings;

    const lines = [
      `${t("tool.hsa.out.status")}: ${t(status === "family" ? "tool.hsa.status.family" : "tool.hsa.status.single")}`,
      `${t("tool.hsa.out.limit")}: ${formatMoney(totalLimit)} (${t("tool.hsa.out.base")}: ${formatMoney(
        baseLimit
      )}${catchup ? ` + ${formatMoney(LIMIT_2024.catchup)}` : ""})`,
      "",
      `${t("tool.hsa.out.you")}: ${formatMoney(contrib)}`,
      `${t("tool.hsa.out.employer")}: ${formatMoney(employer)}`,
      `${t("tool.hsa.out.totalPlanned")}: ${formatMoney(intended)}`,
      `${t("tool.hsa.out.allowedEmployee")}: ${formatMoney(allowedEmployee)}`,
      `${t("tool.hsa.out.allowedTotal")}: ${formatMoney(allowedTotal)}`,
      `${t("tool.hsa.out.excess")}: ${formatMoney(excess)}`,
      "",
      `${t("tool.hsa.out.taxRate")}: ${formatPercent(taxRate)}`,
      `${t("tool.hsa.out.savings")}: ${formatMoney(taxSavings)}`,
      `${t("tool.hsa.out.afterTaxCost")}: ${formatMoney(afterTaxCost)}`,
    ];

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.hsa.status.done"), false);
    return { taxSavings, afterTaxCost };
  }

  function clearAll() {
    $("opt-contrib").value = "";
    $("opt-employer").value = "";
    $("opt-limit").value = "";
    $("opt-catchup").checked = false;
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
          }, 120);
        };
      })();

      ["opt-status", "opt-contrib", "opt-employer", "opt-limit", "opt-catchup", "opt-tax"].forEach((id) => {
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
        } catch (_err) {
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
