(function () {
  const STORAGE_BALANCE = "tool_creditCardPayoff_balance";
  const STORAGE_APR = "tool_creditCardPayoff_apr";
  const STORAGE_PAYMENT = "tool_creditCardPayoff_payment";
  const STORAGE_EXTRA = "tool_creditCardPayoff_extra";
  const STORAGE_SCHEDULE = "tool_creditCardPayoff_showSchedule";

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

  function amortize(balance, monthlyRate, payment, extra, maxMonths) {
    const schedule = [];
    const cap = Number.isFinite(maxMonths) ? Math.max(1, Math.min(3600, maxMonths)) : 3600;

    let b = Number(balance);
    const r = Math.max(0, Number(monthlyRate) || 0);
    const base = Number(payment);
    const extraPay = Math.max(0, Number(extra) || 0);
    const plannedPayment = base + extraPay;
    if (!Number.isFinite(b) || b <= 0) return { ok: false, reason: "balance", months: 0, interest: 0, schedule };
    if (!Number.isFinite(plannedPayment) || plannedPayment <= 0)
      return { ok: false, reason: "payment", months: 0, interest: 0, schedule };

    let totalInterest = 0;
    let totalPaid = 0;
    let months = 0;

    while (b > 0 && months < cap) {
      months += 1;
      const interest = r === 0 ? 0 : b * r;
      if (!Number.isFinite(interest) || interest < 0) return { ok: false, reason: "generic", months, interest: totalInterest, schedule };

      if (r > 0 && plannedPayment <= interest + 1e-9) {
        return { ok: false, reason: "tooLow", months, interest: totalInterest, schedule };
      }

      let principal = plannedPayment - interest;
      if (!Number.isFinite(principal) || principal < 0) principal = 0;
      if (principal > b) principal = b;

      const actualPayment = interest + principal;
      b -= principal;
      totalInterest += interest;
      totalPaid += actualPayment;

      schedule.push({ month: months, interest, principal, payment: actualPayment, balance: b });
    }

    if (b > 0) return { ok: false, reason: "cap", months, interest: totalInterest, totalPaid, schedule };
    return { ok: true, months, interest: totalInterest, totalPaid, schedule };
  }

  function calculate() {
    const balance = normalizeNumber($("opt-balance").value);
    const payment = normalizeNumber($("opt-payment").value);
    const extraMonth = normalizeNumber($("opt-extra").value) ?? 0;
    const apr = clampFloat($("opt-apr").value, 0, 100, 0);
    const showSchedule = Boolean($("opt-show-schedule").checked);

    const typedAny = [$("opt-balance").value, $("opt-payment").value, $("opt-extra").value].some((v) =>
      normalizeText(v)
    );

    if (!typedAny) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    if (balance == null || !Number.isFinite(balance) || balance <= 0) {
      $("tool-output").value = "";
      setStatus(t("tool.creditCardPayoff.error.balance"), true);
      return null;
    }

    if (payment == null || !Number.isFinite(payment) || payment <= 0) {
      $("tool-output").value = "";
      setStatus(t("tool.creditCardPayoff.error.payment"), true);
      return null;
    }

    const monthlyRate = apr / 100 / 12;
    const base = amortize(balance, monthlyRate, payment, 0, 3600);
    if (!base.ok) {
      $("tool-output").value = "";
      setStatus(
        t(base.reason === "tooLow" ? "tool.creditCardPayoff.error.paymentTooLow" : "tool.creditCardPayoff.error.generic"),
        true
      );
      return null;
    }

    const baseMonths = base.months || 0;
    const baseInterest = base.interest || 0;
    const baseTotalPaid = base.totalPaid || balance + baseInterest;

    const lines = [
      `${t("tool.creditCardPayoff.out.balance")}: ${formatMoney(balance)}`,
      `${t("tool.creditCardPayoff.out.apr")}: ${formatPercent(apr)}`,
      `${t("tool.creditCardPayoff.out.payment")}: ${formatMoney(payment)}`,
      "",
      `${t("tool.creditCardPayoff.out.payoffTime")}: ${baseMonths} ${t("tool.creditCardPayoff.months")} (~${(baseMonths / 12).toFixed(1)} ${t("tool.creditCardPayoff.years")})`,
      `${t("tool.creditCardPayoff.out.payoffDate")}: ${formatDate(addMonths(new Date(), baseMonths))}`,
      `${t("tool.creditCardPayoff.out.totalInterest")}: ${formatMoney(baseInterest)}`,
      `${t("tool.creditCardPayoff.out.totalPaid")}: ${formatMoney(baseTotalPaid)}`,
    ];

    const extra = Number.isFinite(extraMonth) && extraMonth > 0 ? extraMonth : 0;
    let scheduleToShow = base.schedule || [];

    if (extra > 0) {
      const faster = amortize(balance, monthlyRate, payment, extra, 3600);
      if (faster.ok) {
        const payoffMonths = faster.months || 0;
        const payoffInterest = faster.interest || 0;
        const payoffTotalPaid = faster.totalPaid || balance + payoffInterest;
        const savedInterest = Math.max(0, baseInterest - payoffInterest);

        lines.push("");
        lines.push(`${t("tool.creditCardPayoff.out.extra")}: ${formatMoney(extra)}`);
        lines.push(`${t("tool.creditCardPayoff.out.paymentExtra")}: ${formatMoney(payment + extra)}`);
        lines.push(
          `${t("tool.creditCardPayoff.out.payoffTimeExtra")}: ${payoffMonths} ${t("tool.creditCardPayoff.months")} (~${(payoffMonths / 12).toFixed(1)} ${t("tool.creditCardPayoff.years")})`
        );
        lines.push(`${t("tool.creditCardPayoff.out.payoffDateExtra")}: ${formatDate(addMonths(new Date(), payoffMonths))}`);
        lines.push(`${t("tool.creditCardPayoff.out.totalInterestExtra")}: ${formatMoney(payoffInterest)}`);
        lines.push(`${t("tool.creditCardPayoff.out.totalPaidExtra")}: ${formatMoney(payoffTotalPaid)}`);
        lines.push(`${t("tool.creditCardPayoff.out.interestSaved")}: ${formatMoney(savedInterest)}`);

        scheduleToShow = faster.schedule || scheduleToShow;
      } else {
        lines.push("");
        lines.push(`${t("tool.creditCardPayoff.out.extra")}: ${formatMoney(extra)}`);
        lines.push(t("tool.creditCardPayoff.error.extraTooLow"));
      }
    }

    if (showSchedule && scheduleToShow.length) {
      lines.push("");
      lines.push(t("tool.creditCardPayoff.out.firstPayments"));
      const max = Math.min(12, scheduleToShow.length);
      for (let i = 0; i < max; i += 1) {
        const row = scheduleToShow[i];
        lines.push(
          `#${row.month}  ${t("tool.creditCardPayoff.out.interest")}: ${formatMoney(row.interest)}  ${t("tool.creditCardPayoff.out.principal")}: ${formatMoney(row.principal)}  ${t("tool.creditCardPayoff.out.balance")}: ${formatMoney(row.balance)}`
        );
      }
    }

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.creditCardPayoff.status.done"), false);

    storageSet(STORAGE_BALANCE, String(balance));
    storageSet(STORAGE_APR, String(apr));
    storageSet(STORAGE_PAYMENT, String(payment));
    storageSet(STORAGE_EXTRA, String(extraMonth));
    storageSet(STORAGE_SCHEDULE, showSchedule ? "1" : "0");

    return { balance, apr, payment, extra };
  }

  function clearAll() {
    $("opt-balance").value = "";
    $("opt-payment").value = "";
    $("opt-extra").value = "";
    $("tool-output").value = "";
    setStatus("", false);
  }

  function restorePrefs() {
    const balance = storageGet(STORAGE_BALANCE);
    if (balance != null) $("opt-balance").value = balance;

    const apr = storageGet(STORAGE_APR);
    if (apr != null) $("opt-apr").value = apr;

    const payment = storageGet(STORAGE_PAYMENT);
    if (payment != null) $("opt-payment").value = payment;

    const extra = storageGet(STORAGE_EXTRA);
    if (extra != null) $("opt-extra").value = extra;

    const schedule = storageGet(STORAGE_SCHEDULE);
    if (schedule != null) $("opt-show-schedule").checked = schedule === "1";
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
          }, 80);
        };
      })();

      ["opt-balance", "opt-apr", "opt-payment", "opt-extra", "opt-show-schedule"].forEach((id) => {
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

