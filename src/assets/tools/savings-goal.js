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

  function monthlyRateFromApy(apyPercent) {
    const apy = Number(apyPercent);
    if (!Number.isFinite(apy) || apy <= 0) return 0;
    const factor = Math.pow(1 + apy / 100, 1 / 12);
    return factor - 1;
  }

  function monthsToGoal(start, goal, monthly, monthlyRate, timing) {
    const r = Number(monthlyRate);
    const deposit = Math.max(0, Number(monthly) || 0);
    const isStart = timing === "start";
    let balance = Math.max(0, Number(start) || 0);
    const target = Math.max(0, Number(goal) || 0);
    if (balance >= target) return { months: 0, endBalance: balance };
    if (deposit <= 0 && r <= 0) return null;

    let months = 0;
    const cap = 3600;
    while (balance < target && months < cap) {
      months += 1;
      if (isStart) balance += deposit;
      if (r > 0) balance *= 1 + r;
      if (!isStart) balance += deposit;
    }
    if (balance < target) return null;
    return { months, endBalance: balance };
  }

  function requiredMonthly(start, goal, months, monthlyRate, timing) {
    const n = Math.max(0, Number(months) || 0);
    const r = Number(monthlyRate);
    const pv = Math.max(0, Number(start) || 0);
    const fv = Math.max(0, Number(goal) || 0);
    if (n <= 0) return NaN;

    if (r <= 0) {
      const needed = (fv - pv) / n;
      return Math.max(0, needed);
    }

    const pow = Math.pow(1 + r, n);
    const without = pv * pow;
    if (fv <= without) return 0;

    const annuity = (pow - 1) / r;
    const adjust = timing === "start" ? (1 + r) : 1;
    const denom = annuity * adjust;
    if (!Number.isFinite(denom) || denom <= 0) return NaN;
    return Math.max(0, ((fv - without) / denom));
  }

  function buildSchedule(start, monthly, monthlyRate, timing, months) {
    const r = Number(monthlyRate);
    const deposit = Math.max(0, Number(monthly) || 0);
    const isStart = timing === "start";
    let balance = Math.max(0, Number(start) || 0);
    const rows = [];

    const cap = Math.max(0, Number(months) || 0);
    for (let i = 1; i <= cap; i += 1) {
      let interest = 0;
      if (isStart) balance += deposit;
      if (r > 0) {
        const before = balance;
        balance *= 1 + r;
        interest = balance - before;
      }
      if (!isStart) balance += deposit;
      rows.push({ month: i, deposit, interest, balance });
    }
    return rows;
  }

  function calculate() {
    const mode = String($("opt-mode").value || "time");
    const goalRaw = normalizeText($("opt-goal").value);
    const goal = normalizeNumber(goalRaw);

    const start = normalizeNumber($("opt-start").value) ?? 0;
    const monthly = normalizeNumber($("opt-monthly").value) ?? 0;
    const years = clampInt($("opt-years").value, 0, 100, 5);
    const months = clampInt($("opt-months").value, 0, 11, 0);
    const apy = clampFloat($("opt-rate").value, 0, 100, 0);
    const timing = String($("opt-timing").value || "end");
    const showSchedule = Boolean($("opt-show-schedule").checked);

    if (!goalRaw) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    if (goal == null || !Number.isFinite(goal) || goal <= 0) {
      $("tool-output").value = "";
      setStatus(t("tool.savingsGoal.error.goal"), true);
      return null;
    }

    if (!Number.isFinite(start) || start < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.savingsGoal.error.start"), true);
      return null;
    }

    if (!Number.isFinite(monthly) || monthly < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.savingsGoal.error.monthly"), true);
      return null;
    }

    const r = monthlyRateFromApy(apy);
    const timingKey = timing === "start" ? "tool.savingsGoal.timing.start" : "tool.savingsGoal.timing.end";

    const lines = [
      `${t("tool.savingsGoal.out.mode")}: ${t(mode === "monthly" ? "tool.savingsGoal.mode.monthly" : "tool.savingsGoal.mode.time")}`,
      `${t("tool.savingsGoal.out.start")}: ${formatMoney(start)}`,
      `${t("tool.savingsGoal.out.goal")}: ${formatMoney(goal)}`,
      `${t("tool.savingsGoal.out.apy")}: ${formatPercent(apy)}`,
      `${t("tool.savingsGoal.out.timing")}: ${t(timingKey)}`,
    ];

    if (mode === "monthly") {
      const totalMonths = Math.max(0, years * 12 + months);
      if (totalMonths <= 0) {
        $("tool-output").value = "";
        setStatus(t("tool.savingsGoal.error.targetTime"), true);
        return null;
      }

      const required = requiredMonthly(start, goal, totalMonths, r, timing);
      if (!Number.isFinite(required)) {
        $("tool-output").value = "";
        setStatus(t("tool.savingsGoal.error.generic"), true);
        return null;
      }

      lines.push(
        "",
        `${t("tool.savingsGoal.out.targetTime")}: ${totalMonths} ${t("tool.savingsGoal.months")} (~${(totalMonths / 12).toFixed(1)} ${t("tool.savingsGoal.years")})`,
        `${t("tool.savingsGoal.out.requiredMonthly")}: ${formatMoney(required)}`
      );

      if (showSchedule) {
        const scheduleMonths = Math.min(12, totalMonths);
        const rows = buildSchedule(start, required, r, timing, scheduleMonths);
        if (rows.length) {
          lines.push("", t("tool.savingsGoal.out.firstMonths"));
          for (const row of rows) {
            lines.push(
              `#${row.month}  ${t("tool.savingsGoal.out.deposit")}: ${formatMoney(row.deposit)}  ${t("tool.savingsGoal.out.interest")}: ${formatMoney(row.interest)}  ${t("tool.savingsGoal.out.balance")}: ${formatMoney(row.balance)}`
            );
          }
        }
      }

      $("tool-output").value = lines.join("\n");
      setStatus(t("tool.savingsGoal.status.done"), false);
      return { mode, start, goal, years, months, apy, timing, required };
    }

    const result = monthsToGoal(start, goal, monthly, r, timing);
    if (!result) {
      $("tool-output").value = "";
      setStatus(t("tool.savingsGoal.error.unreachable"), true);
      return null;
    }

    const neededMonths = result.months || 0;
    const endBalance = result.endBalance || 0;

    lines.push(
      "",
      `${t("tool.savingsGoal.out.monthly")}: ${formatMoney(monthly)}`,
      `${t("tool.savingsGoal.out.timeToGoal")}: ${neededMonths} ${t("tool.savingsGoal.months")} (~${(neededMonths / 12).toFixed(1)} ${t("tool.savingsGoal.years")})`,
      `${t("tool.savingsGoal.out.goalDate")}: ${formatDate(addMonths(new Date(), neededMonths))}`,
      `${t("tool.savingsGoal.out.endBalance")}: ${formatMoney(endBalance)}`
    );

    if (showSchedule) {
      const scheduleMonths = Math.min(12, neededMonths);
      const rows = buildSchedule(start, monthly, r, timing, scheduleMonths);
      if (rows.length) {
        lines.push("", t("tool.savingsGoal.out.firstMonths"));
        for (const row of rows) {
          lines.push(
            `#${row.month}  ${t("tool.savingsGoal.out.deposit")}: ${formatMoney(row.deposit)}  ${t("tool.savingsGoal.out.interest")}: ${formatMoney(row.interest)}  ${t("tool.savingsGoal.out.balance")}: ${formatMoney(row.balance)}`
          );
        }
      }
    }

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.savingsGoal.status.done"), false);
    return { mode, start, goal, monthly, apy, timing, months: neededMonths, endBalance };
  }

  function clearAll() {
    $("opt-start").value = "";
    $("opt-goal").value = "";
    $("opt-monthly").value = "";
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
          }, 80);
        };
      })();

      [
        "opt-mode",
        "opt-start",
        "opt-goal",
        "opt-monthly",
        "opt-years",
        "opt-months",
        "opt-rate",
        "opt-timing",
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

