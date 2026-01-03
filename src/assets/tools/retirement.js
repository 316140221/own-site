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

  function monthlyRateFromApr(aprPercent) {
    const apr = Number(aprPercent);
    if (!Number.isFinite(apr) || apr <= 0) return 0;
    const factor = Math.pow(1 + apr / 100, 1 / 12);
    return factor - 1;
  }

  function calculate() {
    const typedAny = [$("opt-balance").value, $("opt-salary").value].some((v) => normalizeText(v));
    if (!typedAny) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    const currentAge = clampInt($("opt-age").value, 0, 100, 30);
    const retireAge = clampInt($("opt-retire-age").value, 0, 120, 65);
    const showTable = Boolean($("opt-show-table").checked);

    const startBalance = normalizeNumber($("opt-balance").value) ?? 0;
    const startSalary = normalizeNumber($("opt-salary").value) ?? 0;
    const employeePct = clampFloat($("opt-employee").value, 0, 100, 0);
    const matchRate = clampFloat($("opt-match-rate").value, 0, 200, 0);
    const matchCap = clampFloat($("opt-match-cap").value, 0, 100, 0);
    const annualReturn = clampFloat($("opt-return").value, 0, 50, 0);
    const salaryGrowth = clampFloat($("opt-growth").value, 0, 20, 0);

    if (retireAge <= currentAge) {
      $("tool-output").value = "";
      setStatus(t("tool.retirement.error.ages"), true);
      return null;
    }

    if (!Number.isFinite(startBalance) || startBalance < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.retirement.error.balance"), true);
      return null;
    }

    if (!Number.isFinite(startSalary) || startSalary < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.retirement.error.salary"), true);
      return null;
    }

    const years = retireAge - currentAge;
    const months = years * 12;
    const monthlyReturn = monthlyRateFromApr(annualReturn);
    const annualGrowthFactor = 1 + salaryGrowth / 100;

    let balance = startBalance;
    let salary = startSalary;
    let totalEmployee = 0;
    let totalEmployer = 0;

    const snapshots = [];
    for (let m = 0; m < months; m += 1) {
      if (m > 0 && m % 12 === 0) salary *= annualGrowthFactor;
      const monthlySalary = salary / 12;

      const employeeMonthly = monthlySalary * (employeePct / 100);
      const employerMonthly =
        monthlySalary * (Math.min(employeePct, matchCap) / 100) * (matchRate / 100);

      if (monthlyReturn > 0) balance *= 1 + monthlyReturn;
      balance += employeeMonthly + employerMonthly;

      totalEmployee += employeeMonthly;
      totalEmployer += employerMonthly;

      if ((m + 1) % 12 === 0) {
        const year = (m + 1) / 12;
        snapshots.push({
          age: currentAge + year,
          salary,
          balance,
        });
      }
    }

    const totalContrib = totalEmployee + totalEmployer;
    const growth = balance - startBalance - totalContrib;

    const employeeAnnualNow = startSalary * (employeePct / 100);
    const employerAnnualNow = startSalary * (Math.min(employeePct, matchCap) / 100) * (matchRate / 100);

    const lines = [
      `${t("tool.retirement.out.currentAge")}: ${currentAge}`,
      `${t("tool.retirement.out.retireAge")}: ${retireAge}`,
      `${t("tool.retirement.out.horizon")}: ${years} ${t("tool.retirement.years")}`,
      "",
      `${t("tool.retirement.out.startBalance")}: ${formatMoney(startBalance)}`,
      `${t("tool.retirement.out.salary")}: ${formatMoney(startSalary)}`,
      `${t("tool.retirement.out.employeePct")}: ${formatPercent(employeePct)}`,
      `${t("tool.retirement.out.employerMatch")}: ${formatPercent(matchRate)} · ${t("tool.retirement.out.matchUpTo")} ${formatPercent(matchCap)}`,
      `${t("tool.retirement.out.contribNow")}: ${formatMoney(employeeAnnualNow)} + ${formatMoney(employerAnnualNow)} / ${t("tool.retirement.year")}`,
      "",
      `${t("tool.retirement.out.assumedReturn")}: ${formatPercent(annualReturn)}`,
      `${t("tool.retirement.out.salaryGrowth")}: ${formatPercent(salaryGrowth)}`,
      "",
      `${t("tool.retirement.out.finalBalance")}: ${formatMoney(balance)}`,
      `${t("tool.retirement.out.totalEmployee")}: ${formatMoney(totalEmployee)}`,
      `${t("tool.retirement.out.totalEmployer")}: ${formatMoney(totalEmployer)}`,
      `${t("tool.retirement.out.totalContrib")}: ${formatMoney(totalContrib)}`,
      `${t("tool.retirement.out.growth")}: ${formatMoney(growth)}`,
    ];

    if (showTable && snapshots.length) {
      lines.push("", t("tool.retirement.out.yearlyBreakdown"));
      const max = Math.min(60, snapshots.length);
      for (let i = 0; i < max; i += 1) {
        const row = snapshots[i];
        lines.push(
          `${t("tool.retirement.out.age")}: ${row.age}  ${t("tool.retirement.out.salary")}: ${formatMoney(row.salary)}  ${t("tool.retirement.out.balance")}: ${formatMoney(row.balance)}`
        );
      }
      if (snapshots.length > max) {
        const last = snapshots[snapshots.length - 1];
        lines.push("…");
        lines.push(
          `${t("tool.retirement.out.age")}: ${last.age}  ${t("tool.retirement.out.salary")}: ${formatMoney(last.salary)}  ${t("tool.retirement.out.balance")}: ${formatMoney(last.balance)}`
        );
      }
    }

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.retirement.status.done"), false);

    return {
      currentAge,
      retireAge,
      startBalance,
      startSalary,
      employeePct,
      matchRate,
      matchCap,
      annualReturn,
      salaryGrowth,
      balance,
      totalEmployee,
      totalEmployer,
    };
  }

  function clearAll() {
    $("opt-balance").value = "";
    $("opt-salary").value = "";
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

      [
        "opt-age",
        "opt-retire-age",
        "opt-balance",
        "opt-salary",
        "opt-employee",
        "opt-match-rate",
        "opt-match-cap",
        "opt-return",
        "opt-growth",
        "opt-show-table",
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

