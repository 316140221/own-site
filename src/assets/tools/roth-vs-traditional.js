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

  function fvAnnual(contribution, annualRate, years) {
    const r = annualRate;
    const grow = Math.pow(1 + r, years);
    if (r === 0) return contribution * years;
    return contribution * ((grow - 1) / r);
  }

  function calculate() {
    const contribRaw = normalizeText($("opt-contribution").value);
    const contribution = normalizeNumber(contribRaw);
    const years = Number($("opt-years").value);
    const annualReturn = Number($("opt-return").value) / 100;
    const taxNow = Number($("opt-tax-now").value) / 100;
    const taxFuture = Number($("opt-tax-future").value) / 100;
    const showTable = Boolean($("opt-show-table").checked);

    if (!contribRaw) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    if (contribution == null || !Number.isFinite(contribution) || contribution <= 0) {
      $("tool-output").value = "";
      setStatus(t("tool.rothTrad.error.contribution"), true);
      return null;
    }

    if (!Number.isFinite(years) || years < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.rothTrad.error.years"), true);
      return null;
    }

    if (!Number.isFinite(annualReturn) || annualReturn < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.rothTrad.error.return"), true);
      return null;
    }

    if (!Number.isFinite(taxNow) || taxNow < 0 || taxNow > 1 || !Number.isFinite(taxFuture) || taxFuture < 0 || taxFuture > 1) {
      $("tool-output").value = "";
      setStatus(t("tool.rothTrad.error.tax"), true);
      return null;
    }

    const rothContrib = contribution * (1 - taxNow);
    const rothEnd = fvAnnual(rothContrib, annualReturn, years);

    const tradEndPreTax = fvAnnual(contribution, annualReturn, years);
    const tradAfter = tradEndPreTax * (1 - taxFuture);

    const diff = rothEnd - tradAfter;

    const lines = [
      `${t("tool.rothTrad.out.contribution")}: ${formatMoney(contribution)} / ${t("tool.rothTrad.year")}`,
      `${t("tool.rothTrad.out.years")}: ${years}`,
      `${t("tool.rothTrad.out.return")}: ${formatPercent(annualReturn)}`,
      `${t("tool.rothTrad.out.taxNow")}: ${formatPercent(taxNow)}`,
      `${t("tool.rothTrad.out.taxFuture")}: ${formatPercent(taxFuture)}`,
      "",
      `${t("tool.rothTrad.out.rothInvested")}: ${formatMoney(rothContrib)} / ${t("tool.rothTrad.year")}`,
      `${t("tool.rothTrad.out.rothEnd")}: ${formatMoney(rothEnd)}`,
      `${t("tool.rothTrad.out.tradEnd")}: ${formatMoney(tradEndPreTax)}`,
      `${t("tool.rothTrad.out.tradAfter")}: ${formatMoney(tradAfter)}`,
      `${t("tool.rothTrad.out.diff")}: ${formatMoney(diff)} (${diff >= 0 ? t("tool.rothTrad.out.rothBetter") : t("tool.rothTrad.out.tradBetter")})`,
    ];

    if (showTable && years > 0) {
      lines.push("", t("tool.rothTrad.out.table"));
      const max = Math.min(30, Math.max(1, Math.round(years)));
      for (let y = 1; y <= max; y += 1) {
        const rBal = fvAnnual(rothContrib, annualReturn, y);
        const tBal = fvAnnual(contribution, annualReturn, y) * (1 - taxFuture);
        lines.push(`${t("tool.rothTrad.out.year")} ${y}: ${t("tool.rothTrad.out.roth")}: ${formatMoney(rBal)} · ${t("tool.rothTrad.out.trad")}: ${formatMoney(tBal)}`);
      }
      if (years > max) lines.push("…");
    }

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.rothTrad.status.done"), false);
    return { diff, rothEnd, tradAfter };
  }

  function clearAll() {
    $("opt-contribution").value = "";
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

      ["opt-contribution", "opt-years", "opt-return", "opt-tax-now", "opt-tax-future", "opt-show-table"].forEach((id) => {
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
