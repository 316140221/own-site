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

  const currencyFormatter = (() => {
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });
    } catch (_e) {
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
    return `${n.toFixed(3).replace(/\.?0+$/g, "")}%`;
  }

  function monthlyPayment(principal, rateMonthly, months) {
    const p = Number(principal);
    const r = Number(rateMonthly);
    const n = Number(months);
    if (!Number.isFinite(p) || !Number.isFinite(r) || !Number.isFinite(n) || n <= 0) return NaN;
    if (p <= 0) return 0;
    if (r === 0) return p / n;
    const pow = Math.pow(1 + r, n);
    return (p * r * pow) / (pow - 1);
  }

  function totalInterest(principal, payment, rateMonthly, months) {
    const p = Number(principal);
    const pay = Number(payment);
    const r = Number(rateMonthly);
    const n = Number(months);
    if (!Number.isFinite(p) || !Number.isFinite(pay) || !Number.isFinite(r) || !Number.isFinite(n) || n <= 0)
      return NaN;
    return pay * n - p;
  }

  function calculate() {
    const balanceRaw = normalizeText($("opt-balance").value);
    const balance = normalizeNumber(balanceRaw);
    const rateCurrent = Number($("opt-rate-current").value);
    const rateNew = Number($("opt-rate-new").value);
    const termCurrent = clampInt($("opt-term-current").value, 1, 50, 30);
    const termNew = clampInt($("opt-term-new").value, 1, 50, termCurrent);
    const closing = normalizeNumber($("opt-closing").value) ?? 0;

    if (!balanceRaw) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    if (balance == null || !Number.isFinite(balance) || balance <= 0) {
      $("tool-output").value = "";
      setStatus(t("tool.refi.error.balance"), true);
      return null;
    }

    if (!Number.isFinite(rateCurrent) || rateCurrent < 0 || !Number.isFinite(rateNew) || rateNew < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.refi.error.rate"), true);
      return null;
    }

    const monthsCurrent = termCurrent * 12;
    const monthsNew = termNew * 12;
    const rCur = rateCurrent / 100 / 12;
    const rNew = rateNew / 100 / 12;

    const payCurrent = monthlyPayment(balance, rCur, monthsCurrent);
    const payNew = monthlyPayment(balance, rNew, monthsNew);
    if (!Number.isFinite(payCurrent) || !Number.isFinite(payNew)) {
      $("tool-output").value = "";
      setStatus(t("tool.refi.error.generic"), true);
      return null;
    }

    const interestCurrent = totalInterest(balance, payCurrent, rCur, monthsCurrent);
    const interestNew = totalInterest(balance, payNew, rNew, monthsNew);

    const monthlySavings = payCurrent - payNew;
    const breakEvenMonths = monthlySavings > 0 ? Math.ceil(closing / monthlySavings) : null;
    const breakEvenYears = breakEvenMonths != null ? breakEvenMonths / 12 : null;

    const lines = [
      `${t("tool.refi.out.balance")}: ${formatMoney(balance)}`,
      `${t("tool.refi.out.currentRate")}: ${formatPercent(rateCurrent)}`,
      `${t("tool.refi.out.currentPayment")}: ${formatMoney(payCurrent)}`,
      `${t("tool.refi.out.currentInterest")}: ${formatMoney(interestCurrent)}`,
      "",
      `${t("tool.refi.out.newRate")}: ${formatPercent(rateNew)}`,
      `${t("tool.refi.out.newPayment")}: ${formatMoney(payNew)}`,
      `${t("tool.refi.out.newInterest")}: ${formatMoney(interestNew)}`,
      `${t("tool.refi.out.closing")}: ${formatMoney(closing)}`,
      "",
      `${t("tool.refi.out.savings")}: ${formatMoney(monthlySavings)} / ${t("tool.refi.month")}`,
    ];

    if (monthlySavings <= 0) {
      lines.push(`${t("tool.refi.out.breakEven")}: ${t("tool.refi.out.none")}`);
    } else {
      lines.push(
        `${t("tool.refi.out.breakEven")}: ${breakEvenMonths} ${t("tool.refi.months")} (~${breakEvenYears.toFixed(
          2
        )} ${t("tool.refi.years")})`
      );
    }

    const interestDiff = interestCurrent - interestNew;
    lines.push(`${t("tool.refi.out.interestDiff")}: ${formatMoney(interestDiff)}`);

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.refi.status.done"), false);
    return { monthlySavings, breakEvenMonths };
  }

  function clearAll() {
    $("opt-balance").value = "";
    $("opt-closing").value = "";
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
        "opt-balance",
        "opt-rate-current",
        "opt-rate-new",
        "opt-term-current",
        "opt-term-new",
        "opt-closing",
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
