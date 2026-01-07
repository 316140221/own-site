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

  function fv(current, monthly, monthlyRate, months) {
    const grow = Math.pow(1 + monthlyRate, months);
    const fvCurrent = current * grow;
    const fvContrib = monthlyRate === 0 ? monthly * months : monthly * ((grow - 1) / monthlyRate);
    return fvCurrent + fvContrib;
  }

  function calculate() {
    const current = normalizeNumber($("opt-current").value) ?? 0;
    const monthly = normalizeNumber($("opt-monthly").value);
    const years = Number($("opt-years").value);
    const annualReturn = Number($("opt-return").value);
    const deductCap = normalizeNumber($("opt-deduct").value) ?? 0;
    const taxRate = Number($("opt-tax").value);
    const showTable = Boolean($("opt-show-table").checked);

    if (monthly == null || !Number.isFinite(monthly) || monthly < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.plan529.error.monthly"), true);
      return null;
    }

    if (!Number.isFinite(current) || current < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.plan529.error.current"), true);
      return null;
    }

    if (!Number.isFinite(years) || years < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.plan529.error.years"), true);
      return null;
    }

    if (!Number.isFinite(annualReturn) || annualReturn < 0 || annualReturn > 20) {
      $("tool-output").value = "";
      setStatus(t("tool.plan529.error.return"), true);
      return null;
    }

    if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 20) {
      $("tool-output").value = "";
      setStatus(t("tool.plan529.error.tax"), true);
      return null;
    }

    const months = Math.round(years * 12);
    const monthlyRate = Math.pow(1 + annualReturn / 100, 1 / 12) - 1;

    const projected = fv(current, monthly, monthlyRate, months);
    const totalContrib = monthly * months + current;

    const annualContribution = monthly * 12;
    const deductible = Math.min(annualContribution, deductCap);
    const taxSavings = deductible * (taxRate / 100);
    const afterTaxCost = annualContribution - taxSavings;

    const lines = [
      `${t("tool.plan529.out.current")}: ${formatMoney(current)}`,
      `${t("tool.plan529.out.monthly")}: ${formatMoney(monthly)}`,
      `${t("tool.plan529.out.years")}: ${years}`,
      `${t("tool.plan529.out.return")}: ${formatPercent(annualReturn / 100)}`,
      "",
      `${t("tool.plan529.out.projected")}: ${formatMoney(projected)}`,
      `${t("tool.plan529.out.totalContrib")}: ${formatMoney(totalContrib)}`,
      `${t("tool.plan529.out.taxSavings")}: ${formatMoney(taxSavings)} (${t("tool.plan529.out.afterTax")}: ${formatMoney(afterTaxCost)} / ${t("tool.plan529.year")})`,
    ];

    if (showTable && years > 0) {
      lines.push("", t("tool.plan529.out.table"));
      const max = Math.min(30, Math.max(1, Math.round(years)));
      for (let y = 1; y <= max; y += 1) {
        const bal = fv(current, monthly, monthlyRate, y * 12);
        lines.push(`${t("tool.plan529.out.year")} ${y}: ${formatMoney(bal)}`);
      }
      if (years > max) lines.push("…");
    }

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.plan529.status.done"), false);
    return { projected, taxSavings };
  }

  function clearAll() {
    $("opt-current").value = "";
    $("opt-monthly").value = "";
    $("opt-deduct").value = "";
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

      ["opt-current", "opt-monthly", "opt-years", "opt-return", "opt-deduct", "opt-tax", "opt-show-table"].forEach(
        (id) => {
          const el = document.getElementById(id);
          if (!el) return;
          el.addEventListener("input", debounce);
          el.addEventListener("change", debounce);
        }
      );

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
