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

  function clampFloat(value, min, max, fallback) {
    const n = Number(String(value ?? ""));
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }

  function parseNumberToken(token) {
    const raw = String(token || "").trim();
    if (!raw) return null;
    const cleaned = raw.replace(/,/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }

  function extractLastThreeNumberTokens(line) {
    const raw = normalizeText(line);
    if (!raw) return null;
    const matches = raw.match(/-?\d[\d,]*(?:\.\d+)?/g);
    if (!matches || matches.length < 3) return null;
    const paymentToken = matches[matches.length - 1];
    const aprToken = matches[matches.length - 2];
    const balanceToken = matches[matches.length - 3];
    return { balanceToken, aprToken, paymentToken };
  }

  function removeLastOccurrence(text, sub) {
    const str = String(text || "");
    const needle = String(sub || "");
    if (!needle) return str;
    const idx = str.lastIndexOf(needle);
    if (idx < 0) return str;
    return str.slice(0, idx) + str.slice(idx + needle.length);
  }

  function cleanLabel(label) {
    const s = normalizeText(label);
    if (!s) return "";
    return s.replace(/[:\-–—|/]+$/g, "").trim();
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

  function pickTarget(debts, method) {
    if (!debts.length) return null;
    const kind = method === "avalanche" ? "avalanche" : "snowball";
    if (kind === "avalanche") {
      return debts
        .slice()
        .sort((a, b) => (b.apr - a.apr) || (a.balance - b.balance))[0];
    }
    return debts
      .slice()
      .sort((a, b) => (a.balance - b.balance) || (b.apr - a.apr))[0];
  }

  function parseDebts(text) {
    const lines = String(text || "").split(/\r?\n/);
    const debts = [];
    let invalid = 0;

    for (let i = 0; i < lines.length; i += 1) {
      const line = normalizeText(lines[i]);
      if (!line) continue;

      const tokens = extractLastThreeNumberTokens(line);
      if (!tokens) {
        invalid += 1;
        continue;
      }

      const balance0 = parseNumberToken(tokens.balanceToken);
      const apr0 = parseNumberToken(tokens.aprToken);
      const min0 = parseNumberToken(tokens.paymentToken);
      if (balance0 == null || apr0 == null || min0 == null) {
        invalid += 1;
        continue;
      }

      const balance = Math.max(0, balance0);
      const apr = Math.max(0, apr0);
      const minPayment = Math.max(0, min0);

      if (balance <= 0) {
        invalid += 1;
        continue;
      }

      let label = line;
      label = removeLastOccurrence(label, tokens.paymentToken);
      label = removeLastOccurrence(label, tokens.aprToken);
      label = removeLastOccurrence(label, tokens.balanceToken);
      label = cleanLabel(label);
      if (!label) label = `${t("tool.debtPayoffPlan.debt")} ${debts.length + 1}`;

      debts.push({
        id: `d${debts.length + 1}`,
        label,
        balance,
        apr,
        minPayment,
        interestAccrued: 0,
        totalPaid: 0,
        payoffMonth: null,
      });
    }

    return { debts, invalid };
  }

  function simulate({ debts, extraMonthly, method, rollover, showSchedule }) {
    const active = debts.map((d) => ({ ...d }));
    const capMonths = 3600;
    const initialMinSum = active.reduce((sum, d) => sum + d.minPayment, 0);
    const extra = Math.max(0, Number(extraMonthly) || 0);

    let month = 0;
    let noProgress = 0;
    const schedule = [];

    while (active.length && month < capMonths) {
      month += 1;
      const beforeTotal = active.reduce((sum, d) => sum + d.balance, 0);
      if (!Number.isFinite(beforeTotal) || beforeTotal <= 0) break;

      const monthlyBudget = rollover ? initialMinSum + extra : active.reduce((sum, d) => sum + d.minPayment, 0) + extra;
      if (!Number.isFinite(monthlyBudget) || monthlyBudget <= 0) {
        return { ok: false, errorKey: "tool.debtPayoffPlan.error.budget" };
      }

      let interestThisMonth = 0;
      for (const d of active) {
        const r = d.apr / 100 / 12;
        const interest = r > 0 ? d.balance * r : 0;
        d.balance += interest;
        d.interestAccrued += interest;
        interestThisMonth += interest;
      }

      // Step 1: minimum payments
      let spent = 0;
      for (const d of active) {
        if (d.balance <= 0) continue;
        const minPay = Math.min(d.minPayment, d.balance);
        d.balance -= minPay;
        d.totalPaid += minPay;
        spent += minPay;
      }

      // Step 2: allocate remaining budget to target debts
      let remaining = monthlyBudget - spent;
      if (!Number.isFinite(remaining)) remaining = 0;
      if (remaining < 0) remaining = 0;

      while (remaining > 0 && active.length) {
        // remove paid-off debts first
        for (let i = active.length - 1; i >= 0; i -= 1) {
          if (active[i].balance <= 0) {
            active[i].balance = 0;
            if (active[i].payoffMonth == null) active[i].payoffMonth = month;
            debts.find((x) => x.id === active[i].id).payoffMonth = active[i].payoffMonth;
            debts.find((x) => x.id === active[i].id).interestAccrued = active[i].interestAccrued;
            debts.find((x) => x.id === active[i].id).totalPaid = active[i].totalPaid;
            active.splice(i, 1);
          }
        }
        if (!active.length) break;

        const target = pickTarget(active, method);
        if (!target) break;

        const pay = Math.min(remaining, target.balance);
        target.balance -= pay;
        target.totalPaid += pay;
        spent += pay;
        remaining -= pay;

        if (target.balance <= 0) {
          target.balance = 0;
          if (target.payoffMonth == null) target.payoffMonth = month;
          const original = debts.find((x) => x.id === target.id);
          if (original) {
            original.payoffMonth = target.payoffMonth;
            original.interestAccrued = target.interestAccrued;
            original.totalPaid = target.totalPaid;
          }
          const idx = active.findIndex((x) => x.id === target.id);
          if (idx >= 0) active.splice(idx, 1);
        }
      }

      // Finalize any paid-off debts
      for (let i = active.length - 1; i >= 0; i -= 1) {
        if (active[i].balance <= 0) {
          active[i].balance = 0;
          if (active[i].payoffMonth == null) active[i].payoffMonth = month;
          const original = debts.find((x) => x.id === active[i].id);
          if (original) {
            original.payoffMonth = active[i].payoffMonth;
            original.interestAccrued = active[i].interestAccrued;
            original.totalPaid = active[i].totalPaid;
          }
          active.splice(i, 1);
        }
      }

      const afterTotal = active.reduce((sum, d) => sum + d.balance, 0);
      if (Number.isFinite(afterTotal) && afterTotal >= beforeTotal - 0.01) {
        noProgress += 1;
      } else {
        noProgress = 0;
      }

      if (showSchedule && schedule.length < 12) {
        schedule.push({
          month,
          payment: spent,
          interest: interestThisMonth,
          balance: afterTotal,
          debtsLeft: active.length,
        });
      }

      if (noProgress >= 24) {
        return { ok: false, errorKey: "tool.debtPayoffPlan.error.noProgress" };
      }
    }

    if (active.length) {
      return { ok: false, errorKey: "tool.debtPayoffPlan.error.timeout" };
    }

    const interestTotal = debts.reduce((sum, d) => sum + (Number(d.interestAccrued) || 0), 0);
    const paidTotal = debts.reduce((sum, d) => sum + (Number(d.totalPaid) || 0), 0);
    const payoffMonths = Math.max(0, ...debts.map((d) => d.payoffMonth || 0));

    return {
      ok: true,
      payoffMonths,
      interestTotal,
      paidTotal,
      schedule,
    };
  }

  function calculate() {
    const debtsText = String($("opt-debts").value || "");
    const method = String($("opt-method").value || "snowball");
    const extra = normalizeNumber($("opt-extra").value) ?? 0;
    const rollover = Boolean($("opt-rollover").checked);
    const showSchedule = Boolean($("opt-show-schedule").checked);

    if (!normalizeText(debtsText)) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    if (!Number.isFinite(extra) || extra < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.debtPayoffPlan.error.extra"), true);
      return null;
    }

    const parsed = parseDebts(debtsText);
    const debts = parsed.debts;
    if (!debts.length) {
      $("tool-output").value = "";
      setStatus(t("tool.debtPayoffPlan.error.noDebts"), true);
      return null;
    }

    const result = simulate({
      debts,
      extraMonthly: extra,
      method,
      rollover,
      showSchedule,
    });
    if (!result.ok) {
      $("tool-output").value = "";
      setStatus(t(result.errorKey), true);
      return null;
    }

    const initialMinSum = debts.reduce((sum, d) => sum + d.minPayment, 0);
    const monthlyBudget = (rollover ? initialMinSum : initialMinSum) + extra;
    const years = result.payoffMonths / 12;

    const lines = [
      `${t("tool.debtPayoffPlan.out.method")}: ${t(method === "avalanche" ? "tool.debtPayoffPlan.method.avalancheShort" : "tool.debtPayoffPlan.method.snowballShort")}`,
      `${t("tool.debtPayoffPlan.out.debts")}: ${debts.length}`,
      `${t("tool.debtPayoffPlan.out.extra")}: ${formatMoney(extra)}`,
      `${t("tool.debtPayoffPlan.out.rollover")}: ${rollover ? t("tool.debtPayoffPlan.yes") : t("tool.debtPayoffPlan.no")}`,
      "",
      `${t("tool.debtPayoffPlan.out.monthlyBudget")}: ${formatMoney(monthlyBudget)}`,
      `${t("tool.debtPayoffPlan.out.payoffTime")}: ${result.payoffMonths} ${t("tool.debtPayoffPlan.months")} (~${years.toFixed(1)} ${t("tool.debtPayoffPlan.years")})`,
      `${t("tool.debtPayoffPlan.out.payoffDate")}: ${formatDate(addMonths(new Date(), result.payoffMonths))}`,
      `${t("tool.debtPayoffPlan.out.totalInterest")}: ${formatMoney(result.interestTotal)}`,
      `${t("tool.debtPayoffPlan.out.totalPaid")}: ${formatMoney(result.paidTotal)}`,
    ];

    const payoffOrder = debts
      .slice()
      .sort((a, b) => (a.payoffMonth || 0) - (b.payoffMonth || 0));
    if (payoffOrder.length) {
      lines.push("");
      lines.push(t("tool.debtPayoffPlan.out.payoffOrder"));
      for (const d of payoffOrder) {
        lines.push(
          `- ${d.label}: ${d.payoffMonth || 0} ${t("tool.debtPayoffPlan.months")} · ${t("tool.debtPayoffPlan.out.interest")}: ${formatMoney(d.interestAccrued)}`
        );
      }
    }

    if (parsed.invalid > 0) {
      lines.push("", `${t("tool.debtPayoffPlan.out.ignoredLines")}: ${parsed.invalid}`);
    }

    if (showSchedule && result.schedule && result.schedule.length) {
      lines.push("", t("tool.debtPayoffPlan.out.firstMonths"));
      for (const row of result.schedule) {
        lines.push(
          `#${row.month}  ${t("tool.debtPayoffPlan.out.payment")}: ${formatMoney(row.payment)}  ${t("tool.debtPayoffPlan.out.interest")}: ${formatMoney(row.interest)}  ${t("tool.debtPayoffPlan.out.balance")}: ${formatMoney(row.balance)}  ${t("tool.debtPayoffPlan.out.debtsLeft")}: ${row.debtsLeft}`
        );
      }
    }

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.debtPayoffPlan.status.done"), false);
    return result;
  }

  function clearAll() {
    $("opt-debts").value = "";
    $("opt-extra").value = "";
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
          }, 100);
        };
      })();

      ["opt-debts", "opt-method", "opt-extra", "opt-rollover", "opt-show-schedule"].forEach((id) => {
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

