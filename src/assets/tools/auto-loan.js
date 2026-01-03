(function () {
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
    return `${n.toFixed(3).replace(/\.?0+$/g, "")}%`;
  }

  function addMonths(date, months) {
    const d = date instanceof Date ? new Date(date.getTime()) : new Date();
    const y = d.getFullYear();
    const m = d.getMonth();
    const day = d.getDate();
    const target = new Date(y, m + months, 1);
    const maxDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
    target.setDate(Math.min(day, maxDay));
    return target;
  }

  function formatDate(date) {
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return "";
    try {
      return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short" }).format(d);
    } catch (_error) {
      return d.toISOString().slice(0, 7);
    }
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

  function amortize(principal, monthlyRate, payment, extra, maxMonths) {
    const schedule = [];
    let balance = Number(principal);
    if (!Number.isFinite(balance) || balance <= 0) return { months: 0, interest: 0, schedule };
    const r = Number(monthlyRate);
    const base = Number(payment);
    const extraPay = Math.max(0, Number(extra) || 0);
    const cap = Number.isFinite(maxMonths) ? Math.max(1, Math.min(3600, maxMonths)) : 3600;

    let totalInterest = 0;
    let months = 0;
    while (balance > 0 && months < cap) {
      months += 1;
      const interest = r === 0 ? 0 : balance * r;
      let principalPaid = base - interest;
      if (!Number.isFinite(principalPaid)) principalPaid = 0;
      if (principalPaid < 0) principalPaid = 0;

      let extraPrincipal = extraPay;
      let totalPrincipal = principalPaid + extraPrincipal;
      if (totalPrincipal > balance) {
        totalPrincipal = balance;
        extraPrincipal = Math.max(0, totalPrincipal - principalPaid);
      }

      balance -= totalPrincipal;
      totalInterest += interest;

      schedule.push({
        month: months,
        interest,
        principal: totalPrincipal,
        extra: extraPrincipal,
        balance,
      });
    }

    return { months, interest: totalInterest, schedule };
  }

  function calculate() {
    const typedAny = [
      $("opt-price").value,
      $("opt-tradein").value,
      $("opt-down").value,
      $("opt-fees").value,
      $("opt-extra").value,
    ].some((v) => normalizeText(v));

    const price = normalizeNumber($("opt-price").value);
    const tradeIn = normalizeNumber($("opt-tradein").value) ?? 0;
    const down = normalizeNumber($("opt-down").value) ?? 0;
    const fees = normalizeNumber($("opt-fees").value) ?? 0;
    const extraMonth = normalizeNumber($("opt-extra").value) ?? 0;

    const taxRate = clampFloat($("opt-tax").value, 0, 30, 0);
    const taxAfterTradeIn = Boolean($("opt-tax-after-tradein").checked);

    const apr = clampFloat($("opt-apr").value, 0, 100, 0);
    const termMonths = clampInt($("opt-term").value, 1, 600, 60);
    const showSchedule = Boolean($("opt-show-schedule").checked);

    if (!typedAny) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    if (price == null || !Number.isFinite(price) || price <= 0) {
      $("tool-output").value = "";
      setStatus(t("tool.autoLoan.error.price"), true);
      return null;
    }

    if (!Number.isFinite(tradeIn) || tradeIn < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.autoLoan.error.tradeIn"), true);
      return null;
    }

    if (!Number.isFinite(down) || down < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.autoLoan.error.down"), true);
      return null;
    }

    if (!Number.isFinite(fees) || fees < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.autoLoan.error.fees"), true);
      return null;
    }

    if (!Number.isFinite(extraMonth) || extraMonth < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.autoLoan.error.extra"), true);
      return null;
    }

    const taxableAmount = taxAfterTradeIn ? Math.max(0, price - tradeIn) : price;
    const tax = taxableAmount * (taxRate / 100);

    const amountFinanced = Math.max(0, price + fees + tax - tradeIn - down);
    const monthlyRate = apr / 100 / 12;
    const payment = monthlyPayment(amountFinanced, monthlyRate, termMonths);
    if (!Number.isFinite(payment)) {
      $("tool-output").value = "";
      setStatus(t("tool.autoLoan.error.generic"), true);
      return null;
    }

    const base = amortize(amountFinanced, monthlyRate, payment, 0, termMonths);
    const baseInterest = base.interest || 0;
    const baseTotal = amountFinanced + baseInterest;

    const lines = [
      `${t("tool.autoLoan.out.price")}: ${formatMoney(price)}`,
      `${t("tool.autoLoan.out.tradeIn")}: ${formatMoney(tradeIn)}`,
      `${t("tool.autoLoan.out.down")}: ${formatMoney(down)}`,
      `${t("tool.autoLoan.out.fees")}: ${formatMoney(fees)}`,
      "",
      `${t("tool.autoLoan.out.taxRate")}: ${formatPercent(taxRate)}`,
      `${t("tool.autoLoan.out.taxableAmount")}: ${formatMoney(taxableAmount)}`,
      `${t("tool.autoLoan.out.tax")}: ${formatMoney(tax)}`,
      "",
      `${t("tool.autoLoan.out.amountFinanced")}: ${formatMoney(amountFinanced)}`,
      `${t("tool.autoLoan.out.apr")}: ${formatPercent(apr)}`,
      `${t("tool.autoLoan.out.term")}: ${termMonths} ${t("tool.autoLoan.months")}`,
      "",
      `${t("tool.autoLoan.out.payment")}: ${formatMoney(payment)}`,
      `${t("tool.autoLoan.out.totalInterest")}: ${formatMoney(baseInterest)}`,
      `${t("tool.autoLoan.out.totalPaid")}: ${formatMoney(baseTotal)}`,
    ];

    const extra = Number.isFinite(extraMonth) && extraMonth > 0 ? extraMonth : 0;
    if (extra > 0 && amountFinanced > 0) {
      const payoff = amortize(amountFinanced, monthlyRate, payment, extra, termMonths + 1200);
      const payoffMonths = payoff.months || 0;
      const payoffInterest = payoff.interest || 0;
      const savedInterest = Math.max(0, baseInterest - payoffInterest);

      lines.push("");
      lines.push(`${t("tool.autoLoan.out.extra")}: ${formatMoney(extra)}`);
      lines.push(`${t("tool.autoLoan.out.paymentExtra")}: ${formatMoney(payment + extra)}`);
      lines.push(
        `${t("tool.autoLoan.out.payoffTime")}: ${payoffMonths} ${t("tool.autoLoan.months")} (~${(payoffMonths / 12).toFixed(1)} ${t("tool.autoLoan.years")})`
      );
      lines.push(`${t("tool.autoLoan.out.payoffDate")}: ${formatDate(addMonths(new Date(), payoffMonths))}`);
      lines.push(`${t("tool.autoLoan.out.totalInterestExtra")}: ${formatMoney(payoffInterest)}`);
      lines.push(`${t("tool.autoLoan.out.interestSaved")}: ${formatMoney(savedInterest)}`);

      if (showSchedule && payoff.schedule && payoff.schedule.length) {
        lines.push("");
        lines.push(t("tool.autoLoan.out.firstPayments"));
        const max = Math.min(12, payoff.schedule.length);
        for (let i = 0; i < max; i += 1) {
          const row = payoff.schedule[i];
          lines.push(
            `#${row.month}  ${t("tool.autoLoan.out.interest")}: ${formatMoney(row.interest)}  ${t("tool.autoLoan.out.principal")}: ${formatMoney(row.principal)}  ${t("tool.autoLoan.out.balance")}: ${formatMoney(row.balance)}`
          );
        }
      }
    } else if (showSchedule && amountFinanced > 0 && base.schedule && base.schedule.length) {
      lines.push("");
      lines.push(t("tool.autoLoan.out.firstPayments"));
      const max = Math.min(12, base.schedule.length);
      for (let i = 0; i < max; i += 1) {
        const row = base.schedule[i];
        lines.push(
          `#${row.month}  ${t("tool.autoLoan.out.interest")}: ${formatMoney(row.interest)}  ${t("tool.autoLoan.out.principal")}: ${formatMoney(row.principal)}  ${t("tool.autoLoan.out.balance")}: ${formatMoney(row.balance)}`
        );
      }
    }

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.autoLoan.status.done"), false);

    return {
      price,
      tradeIn,
      down,
      fees,
      taxRate,
      taxAfterTradeIn,
      amountFinanced,
      apr,
      termMonths,
      extraMonth,
    };
  }

  function clearAll() {
    $("opt-price").value = "";
    $("opt-tradein").value = "";
    $("opt-down").value = "";
    $("opt-fees").value = "";
    $("opt-extra").value = "";
    $("tool-output").value = "";
    setStatus("", false);
  }

  function applyPreset(value) {
    const term = clampInt(value, 1, 600, 60);
    $("opt-term").value = String(term);
    calculate();
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
          }, 80);
        };
      })();

      [
        "opt-price",
        "opt-tradein",
        "opt-down",
        "opt-tax",
        "opt-tax-after-tradein",
        "opt-fees",
        "opt-apr",
        "opt-term",
        "opt-extra",
        "opt-show-schedule",
      ].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("input", debounce);
        el.addEventListener("change", debounce);
      });

      document.querySelectorAll("[data-term-preset]").forEach((el) => {
        el.addEventListener("click", () => applyPreset(el.getAttribute("data-term-preset")));
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

