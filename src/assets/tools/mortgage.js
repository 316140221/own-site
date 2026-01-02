(function () {
  const STORAGE_HOME_PRICE = "tool_mortgage_homePrice";
  const STORAGE_DOWN_MODE = "tool_mortgage_downMode";
  const STORAGE_DOWN = "tool_mortgage_down";
  const STORAGE_APR = "tool_mortgage_apr";
  const STORAGE_TERM = "tool_mortgage_term";
  const STORAGE_TAX = "tool_mortgage_tax";
  const STORAGE_INSURANCE = "tool_mortgage_insurance";
  const STORAGE_HOA = "tool_mortgage_hoa";
  const STORAGE_PMI = "tool_mortgage_pmi";
  const STORAGE_EXTRA = "tool_mortgage_extra";
  const STORAGE_SCHEDULE = "tool_mortgage_showSchedule";

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
    const homePrice = normalizeNumber($("opt-home-price").value);
    const downMode = String($("opt-down-mode").value || "percent");
    const downRaw = normalizeNumber($("opt-down").value);

    const apr = clampFloat($("opt-apr").value, 0, 100, 0);
    const termYears = clampInt($("opt-term").value, 1, 50, 30);
    const showSchedule = Boolean($("opt-show-schedule").checked);

    const taxYear = normalizeNumber($("opt-tax").value) ?? 0;
    const insuranceYear = normalizeNumber($("opt-insurance").value) ?? 0;
    const hoaMonth = normalizeNumber($("opt-hoa").value) ?? 0;
    const pmiMonth = normalizeNumber($("opt-pmi").value) ?? 0;
    const extraMonth = normalizeNumber($("opt-extra").value) ?? 0;

    const typedAny = [
      $("opt-home-price").value,
      $("opt-down").value,
      $("opt-tax").value,
      $("opt-insurance").value,
      $("opt-hoa").value,
      $("opt-pmi").value,
      $("opt-extra").value,
    ].some((v) => normalizeText(v));

    if (!typedAny) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    if (homePrice == null || !Number.isFinite(homePrice) || homePrice <= 0) {
      $("tool-output").value = "";
      setStatus(t("tool.mortgage.error.homePrice"), true);
      return null;
    }

    let downPayment = 0;
    let downPercent = 0;

    if (downMode === "amount") {
      const dp = downRaw == null ? 0 : downRaw;
      if (!Number.isFinite(dp) || dp < 0) {
        $("tool-output").value = "";
        setStatus(t("tool.mortgage.error.down"), true);
        return null;
      }
      downPayment = Math.min(dp, homePrice);
      downPercent = homePrice > 0 ? (downPayment / homePrice) * 100 : 0;
    } else {
      const pct = downRaw == null ? 0 : downRaw;
      if (!Number.isFinite(pct) || pct < 0) {
        $("tool-output").value = "";
        setStatus(t("tool.mortgage.error.down"), true);
        return null;
      }
      downPercent = Math.min(pct, 100);
      downPayment = (homePrice * downPercent) / 100;
    }

    const loan = Math.max(0, homePrice - downPayment);
    const months = termYears * 12;
    const monthlyRate = apr / 100 / 12;
    const pi = monthlyPayment(loan, monthlyRate, months);
    if (!Number.isFinite(pi)) {
      $("tool-output").value = "";
      setStatus(t("tool.mortgage.error.generic"), true);
      return null;
    }

    const extrasMonthly = (Number(taxYear) || 0) / 12 + (Number(insuranceYear) || 0) / 12 + (Number(hoaMonth) || 0) + (Number(pmiMonth) || 0);
    const baseMonthlyTotal = pi + extrasMonthly;

    const baseTotalPI = pi * months;
    const baseInterest = Math.max(0, baseTotalPI - loan);

    const lines = [
      `${t("tool.mortgage.out.homePrice")}: ${formatMoney(homePrice)}`,
      `${t("tool.mortgage.out.downPayment")}: ${formatMoney(downPayment)} (${formatPercent(downPercent)})`,
      `${t("tool.mortgage.out.loanAmount")}: ${formatMoney(loan)}`,
      `${t("tool.mortgage.out.apr")}: ${formatPercent(apr)}`,
      `${t("tool.mortgage.out.term")}: ${termYears} ${t("tool.mortgage.years")}`,
      "",
      `${t("tool.mortgage.out.pi")}: ${formatMoney(pi)}`,
      `${t("tool.mortgage.out.escrow")}: ${formatMoney(extrasMonthly)}`,
      `${t("tool.mortgage.out.monthlyTotal")}: ${formatMoney(baseMonthlyTotal)}`,
      "",
      `${t("tool.mortgage.out.totalInterest")}: ${formatMoney(baseInterest)}`,
      `${t("tool.mortgage.out.totalPaid")}: ${formatMoney(baseTotalPI)}`,
    ];

    const extra = Number.isFinite(extraMonth) && extraMonth > 0 ? extraMonth : 0;
    if (extra > 0 && loan > 0) {
      const payoff = amortize(loan, monthlyRate, pi, extra, months + 1200);
      const payoffMonths = payoff.months || 0;
      const payoffInterest = payoff.interest || 0;
      const savedInterest = Math.max(0, baseInterest - payoffInterest);

      lines.push("");
      lines.push(`${t("tool.mortgage.out.extra")}: ${formatMoney(extra)}`);
      lines.push(`${t("tool.mortgage.out.monthlyTotalExtra")}: ${formatMoney(baseMonthlyTotal + extra)}`);
      lines.push(`${t("tool.mortgage.out.payoffTime")}: ${payoffMonths} ${t("tool.mortgage.months")} (~${(payoffMonths / 12).toFixed(1)} ${t("tool.mortgage.years")})`);
      lines.push(`${t("tool.mortgage.out.payoffDate")}: ${formatDate(addMonths(new Date(), payoffMonths))}`);
      lines.push(`${t("tool.mortgage.out.totalInterestExtra")}: ${formatMoney(payoffInterest)}`);
      lines.push(`${t("tool.mortgage.out.interestSaved")}: ${formatMoney(savedInterest)}`);

      if (showSchedule && payoff.schedule && payoff.schedule.length) {
        lines.push("");
        lines.push(t("tool.mortgage.out.firstPayments"));
        const max = Math.min(12, payoff.schedule.length);
        for (let i = 0; i < max; i += 1) {
          const row = payoff.schedule[i];
          lines.push(
            `#${row.month}  ${t("tool.mortgage.out.interest")}: ${formatMoney(row.interest)}  ${t("tool.mortgage.out.principal")}: ${formatMoney(row.principal)}  ${t("tool.mortgage.out.balance")}: ${formatMoney(row.balance)}`
          );
        }
      }
    } else if (showSchedule && loan > 0) {
      const payoff = amortize(loan, monthlyRate, pi, 0, months);
      if (payoff.schedule && payoff.schedule.length) {
        lines.push("");
        lines.push(t("tool.mortgage.out.firstPayments"));
        const max = Math.min(12, payoff.schedule.length);
        for (let i = 0; i < max; i += 1) {
          const row = payoff.schedule[i];
          lines.push(
            `#${row.month}  ${t("tool.mortgage.out.interest")}: ${formatMoney(row.interest)}  ${t("tool.mortgage.out.principal")}: ${formatMoney(row.principal)}  ${t("tool.mortgage.out.balance")}: ${formatMoney(row.balance)}`
          );
        }
      }
    }

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.mortgage.status.done"), false);

    storageSet(STORAGE_HOME_PRICE, String(homePrice));
    storageSet(STORAGE_DOWN_MODE, downMode);
    storageSet(STORAGE_DOWN, String(downRaw ?? ""));
    storageSet(STORAGE_APR, String(apr));
    storageSet(STORAGE_TERM, String(termYears));
    storageSet(STORAGE_TAX, String(taxYear));
    storageSet(STORAGE_INSURANCE, String(insuranceYear));
    storageSet(STORAGE_HOA, String(hoaMonth));
    storageSet(STORAGE_PMI, String(pmiMonth));
    storageSet(STORAGE_EXTRA, String(extraMonth));
    storageSet(STORAGE_SCHEDULE, showSchedule ? "1" : "0");

    return { homePrice, downMode, downPayment, downPercent, loan, apr, termYears };
  }

  function clearAll() {
    ["opt-home-price", "opt-down", "opt-tax", "opt-insurance", "opt-hoa", "opt-pmi", "opt-extra"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    $("tool-output").value = "";
    setStatus("", false);
  }

  function restorePrefs() {
    const home = storageGet(STORAGE_HOME_PRICE);
    if (home != null) $("opt-home-price").value = home;

    const mode = storageGet(STORAGE_DOWN_MODE);
    if (mode === "percent" || mode === "amount") $("opt-down-mode").value = mode;

    const down = storageGet(STORAGE_DOWN);
    if (down != null) $("opt-down").value = down;

    const apr = storageGet(STORAGE_APR);
    if (apr != null) $("opt-apr").value = apr;

    const term = storageGet(STORAGE_TERM);
    if (term != null) $("opt-term").value = term;

    const tax = storageGet(STORAGE_TAX);
    if (tax != null) $("opt-tax").value = tax;

    const ins = storageGet(STORAGE_INSURANCE);
    if (ins != null) $("opt-insurance").value = ins;

    const hoa = storageGet(STORAGE_HOA);
    if (hoa != null) $("opt-hoa").value = hoa;

    const pmi = storageGet(STORAGE_PMI);
    if (pmi != null) $("opt-pmi").value = pmi;

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

      [
        "opt-home-price",
        "opt-down-mode",
        "opt-down",
        "opt-apr",
        "opt-term",
        "opt-tax",
        "opt-insurance",
        "opt-hoa",
        "opt-pmi",
        "opt-extra",
        "opt-show-schedule",
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

