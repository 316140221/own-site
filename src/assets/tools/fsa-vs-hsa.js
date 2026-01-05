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

  const DEFAULT_LIMITS = {
    fsa: 3200,
    hsa: 8300,
  };

  function clampFloat(value, min, max, fallback) {
    const n = Number(String(value ?? ""));
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }

  function calculate() {
    const taxRate = clampFloat($("opt-tax").value, 0, 70, 0) / 100;
    const fsa = normalizeNumber($("opt-fsa").value);
    const hsa = normalizeNumber($("opt-hsa").value);
    const employer = normalizeNumber($("opt-employer").value) ?? 0;
    const limitFsa = normalizeNumber($("opt-limit-fsa").value);
    const limitHsa = normalizeNumber($("opt-limit-hsa").value);

    if (fsa == null || !Number.isFinite(fsa) || fsa < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.fsaHsa.error.fsa"), true);
      return null;
    }

    if (hsa == null || !Number.isFinite(hsa) || hsa < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.fsaHsa.error.hsa"), true);
      return null;
    }

    if (!Number.isFinite(employer) || employer < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.fsaHsa.error.employer"), true);
      return null;
    }

    const capFsa = Number.isFinite(limitFsa) && limitFsa > 0 ? limitFsa : DEFAULT_LIMITS.fsa;
    const capHsa = Number.isFinite(limitHsa) && limitHsa > 0 ? limitHsa : DEFAULT_LIMITS.hsa;

    const allowedFsa = Math.min(fsa, capFsa);
    const allowedHsaTotal = Math.min(hsa + employer, capHsa);
    const allowedHsaEmployee = Math.max(0, allowedHsaTotal - employer);

    const fsaTaxSavings = allowedFsa * taxRate;
    const hsaTaxSavings = allowedHsaEmployee * taxRate;

    const fsaExcess = Math.max(0, fsa - capFsa);
    const hsaExcess = Math.max(0, hsa + employer - capHsa);

    const lines = [
      `${t("tool.fsaHsa.out.taxRate")}: ${formatPercent(taxRate)}`,
      `${t("tool.fsaHsa.out.limits")}: FSA ${formatMoney(capFsa)} · HSA ${formatMoney(capHsa)}`,
      "",
      `${t("tool.fsaHsa.out.fsaContribution")}: ${formatMoney(fsa)} (${t("tool.fsaHsa.out.allowed")}: ${formatMoney(
        allowedFsa
      )}, ${t("tool.fsaHsa.out.excess")}: ${formatMoney(fsaExcess)})`,
      `${t("tool.fsaHsa.out.hsaEmployee")}: ${formatMoney(hsa)} (${t("tool.fsaHsa.out.allowed")}: ${formatMoney(
        allowedHsaEmployee
      )})`,
      `${t("tool.fsaHsa.out.hsaEmployer")}: ${formatMoney(employer)}`,
      `${t("tool.fsaHsa.out.hsaTotal")}: ${formatMoney(hsa + employer)} (${t("tool.fsaHsa.out.allowed")}: ${formatMoney(
        allowedHsaTotal
      )}, ${t("tool.fsaHsa.out.excess")}: ${formatMoney(hsaExcess)})`,
      "",
      `${t("tool.fsaHsa.out.fsaSavings")}: ${formatMoney(fsaTaxSavings)}`,
      `${t("tool.fsaHsa.out.hsaSavings")}: ${formatMoney(hsaTaxSavings)}`,
    ];

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.fsaHsa.status.done"), false);
    return { fsaTaxSavings, hsaTaxSavings };
  }

  function clearAll() {
    $("opt-fsa").value = "";
    $("opt-hsa").value = "";
    $("opt-employer").value = "";
    $("opt-limit-fsa").value = "";
    $("opt-limit-hsa").value = "";
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

      [
        "opt-tax",
        "opt-fsa",
        "opt-hsa",
        "opt-employer",
        "opt-limit-fsa",
        "opt-limit-hsa",
      ].forEach((id) => {
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
