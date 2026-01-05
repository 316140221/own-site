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

  function clampInt(value, min, max, fallback) {
    const n = Number.parseInt(String(value ?? ""), 10);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
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

  function monthlyPayment(principal, monthlyRate, months) {
    const p = Number(principal);
    const r = Number(monthlyRate);
    const n = Number(months);
    if (!Number.isFinite(p) || !Number.isFinite(r) || !Number.isFinite(n) || n <= 0) return NaN;
    if (p <= 0) return 0;
    if (r === 0) return p / n;
    const pow = Math.pow(1 + r, n);
    return (p * r * pow) / (pow - 1);
  }

  function calculate() {
    const loanRaw = normalizeText($("opt-loan").value);
    const loan = normalizeNumber(loanRaw);
    const rateNo = Number($("opt-rate-no").value);
    const rateWith = Number($("opt-rate-with").value);
    const pointsPct = Number($("opt-points").value);
    const termYears = clampInt($("opt-term").value, 1, 50, 30);
    const horizonYears = clampInt($("opt-horizon").value, 1, 50, termYears);

    if (!loanRaw) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    if (loan == null || !Number.isFinite(loan) || loan <= 0) {
      $("tool-output").value = "";
      setStatus(t("tool.points.error.loan"), true);
      return null;
    }

    if (!Number.isFinite(rateNo) || rateNo <= 0 || !Number.isFinite(rateWith) || rateWith <= 0) {
      $("tool-output").value = "";
      setStatus(t("tool.points.error.rate"), true);
      return null;
    }

    if (!Number.isFinite(pointsPct) || pointsPct < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.points.error.points"), true);
      return null;
    }

    const months = termYears * 12;
    const monthsHorizon = horizonYears * 12;
    const payNo = monthlyPayment(loan, rateNo / 100 / 12, months);
    const payWith = monthlyPayment(loan, rateWith / 100 / 12, months);
    const monthlySavings = payNo - payWith;
    const costPoints = loan * (pointsPct / 100);

    const breakEvenMonths = monthlySavings > 0 ? Math.ceil(costPoints / monthlySavings) : null;
    const breakEvenYears = breakEvenMonths != null ? breakEvenMonths / 12 : null;

    const totalCostNo = payNo * monthsHorizon;
    const totalCostWith = payWith * monthsHorizon + costPoints;
    const netSavingsHorizon = totalCostNo - totalCostWith;

    const lines = [
      `${t("tool.points.out.loan")}: ${formatMoney(loan)}`,
      `${t("tool.points.out.term")}: ${termYears} ${t("tool.points.years")}`,
      `${t("tool.points.out.rateNo")}: ${formatPercent(rateNo)}`,
      `${t("tool.points.out.rateWith")}: ${formatPercent(rateWith)}`,
      `${t("tool.points.out.pointsCost")}: ${formatMoney(costPoints)} (${formatPercent(pointsPct)})`,
      "",
      `${t("tool.points.out.paymentNo")}: ${formatMoney(payNo)}`,
      `${t("tool.points.out.paymentWith")}: ${formatMoney(payWith)}`,
      `${t("tool.points.out.savings")}: ${formatMoney(monthlySavings)} / ${t("tool.points.month")}`,
    ];

    if (monthlySavings <= 0) {
      lines.push(`${t("tool.points.out.breakEven")}: ${t("tool.points.out.none")}`);
    } else {
      lines.push(
        `${t("tool.points.out.breakEven")}: ${breakEvenMonths} ${t("tool.points.months")} (~${breakEvenYears.toFixed(
          2
        )} ${t("tool.points.years")})`
      );
    }

    lines.push(
      "",
      `${t("tool.points.out.horizon")}: ${horizonYears} ${t("tool.points.years")}`,
      `${t("tool.points.out.totalNo")}: ${formatMoney(totalCostNo)}`,
      `${t("tool.points.out.totalWith")}: ${formatMoney(totalCostWith)}`,
      `${t("tool.points.out.netSavings")}: ${formatMoney(netSavingsHorizon)}`
    );

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.points.status.done"), false);
    return { monthlySavings, breakEvenMonths, netSavingsHorizon };
  }

  function clearAll() {
    $("opt-loan").value = "";
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

      ["opt-loan", "opt-rate-no", "opt-rate-with", "opt-points", "opt-term", "opt-horizon"].forEach((id) => {
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
