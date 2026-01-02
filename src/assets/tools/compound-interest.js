(function () {
  const STORAGE_PRINCIPAL = "tool_compoundInterest_principal";
  const STORAGE_CONTRIB = "tool_compoundInterest_contrib";
  const STORAGE_RATE = "tool_compoundInterest_rate";
  const STORAGE_YEARS = "tool_compoundInterest_years";
  const STORAGE_TIMING = "tool_compoundInterest_timing";
  const STORAGE_BREAKDOWN = "tool_compoundInterest_showBreakdown";

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

  function simulate(principal, contribution, annualRate, months, timing) {
    let balance = Number(principal) || 0;
    let totalContrib = Number(principal) || 0;

    const rate = Number(annualRate) || 0;
    const m = clampFloat(months, 0, 1200, 0);
    const monthlyRate = rate / 100 / 12;

    const snapshots = [];
    for (let month = 1; month <= m; month += 1) {
      if (timing === "start") {
        balance += contribution;
        totalContrib += contribution;
      }

      balance *= 1 + monthlyRate;

      if (timing !== "start") {
        balance += contribution;
        totalContrib += contribution;
      }

      if (month % 12 === 0) {
        snapshots.push({ months: month, balance, totalContrib });
      }
    }

    return { months: m, balance, totalContrib, interest: balance - totalContrib, snapshots };
  }

  function calculate() {
    const principalRaw = $("opt-principal").value;
    const contribRaw = $("opt-contrib").value;

    const principalTyped = normalizeText(principalRaw);
    const contribTyped = normalizeText(contribRaw);
    const typedAny = Boolean(principalTyped || contribTyped);

    if (!typedAny) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    const principalParsed = normalizeNumber(principalRaw);
    const contribParsed = normalizeNumber(contribRaw);

    if (principalTyped && (principalParsed == null || !Number.isFinite(principalParsed) || principalParsed < 0)) {
      $("tool-output").value = "";
      setStatus(t("tool.compoundInterest.error.principal"), true);
      return null;
    }

    if (contribTyped && (contribParsed == null || !Number.isFinite(contribParsed) || contribParsed < 0)) {
      $("tool-output").value = "";
      setStatus(t("tool.compoundInterest.error.contribution"), true);
      return null;
    }

    const principal = principalParsed == null ? 0 : principalParsed;
    const contribution = contribParsed == null ? 0 : contribParsed;

    const rate = clampFloat($("opt-rate").value, -100, 100, 0);
    const years = clampFloat($("opt-years").value, 0, 100, 10);
    const months = Math.max(0, Math.round(years * 12));
    const timing = $("opt-timing").value === "start" ? "start" : "end";
    const showBreakdown = Boolean($("opt-show-breakdown").checked);

    const result = simulate(principal, contribution, rate, months, timing);
    const finalBalance = result.balance;
    const totalContrib = result.totalContrib;
    const totalInterest = finalBalance - totalContrib;

    const lines = [
      `${t("tool.compoundInterest.out.principal")}: ${formatMoney(principal)}`,
      `${t("tool.compoundInterest.out.contribution")}: ${formatMoney(contribution)}`,
      `${t("tool.compoundInterest.out.rate")}: ${formatPercent(rate)}`,
      `${t("tool.compoundInterest.out.duration")}: ${months} ${t("tool.compoundInterest.months")} (~${(months / 12).toFixed(1)} ${t("tool.compoundInterest.years")})`,
      `${t("tool.compoundInterest.out.timing")}: ${t(timing === "start" ? "tool.compoundInterest.timing.start" : "tool.compoundInterest.timing.end")}`,
      "",
      `${t("tool.compoundInterest.out.final")}: ${formatMoney(finalBalance)}`,
      `${t("tool.compoundInterest.out.totalContributions")}: ${formatMoney(totalContrib)}`,
      `${t("tool.compoundInterest.out.totalInterest")}: ${formatMoney(totalInterest)}`,
    ];

    if (showBreakdown && months > 0) {
      lines.push("");
      lines.push(t("tool.compoundInterest.out.breakdownTitle"));

      const records = result.snapshots || [];
      const finalIsYearBoundary = months % 12 === 0;
      const finalRecord = finalIsYearBoundary
        ? null
        : { months, balance: finalBalance, totalContrib };

      const list = finalRecord ? records.concat([finalRecord]) : records.slice();
      const render = (row) => {
        if (!row || !Number.isFinite(row.months)) return;
        const year = row.months / 12;
        const yearLabel = row.months % 12 === 0 ? String(year) : year.toFixed(1);
        lines.push(
          t("tool.compoundInterest.out.breakdownLine", {
            year: yearLabel,
            balance: formatMoney(row.balance),
            contrib: formatMoney(row.totalContrib),
            interest: formatMoney(row.balance - row.totalContrib),
          })
        );
      };

      if (list.length > 30) {
        list.slice(0, 10).forEach(render);
        lines.push("…");
        render(list[list.length - 1]);
      } else {
        list.forEach(render);
      }
    }

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.compoundInterest.status.done"), false);

    storageSet(STORAGE_PRINCIPAL, String(principalTyped ? principal : ""));
    storageSet(STORAGE_CONTRIB, String(contribTyped ? contribution : ""));
    storageSet(STORAGE_RATE, String(rate));
    storageSet(STORAGE_YEARS, String(years));
    storageSet(STORAGE_TIMING, timing);
    storageSet(STORAGE_BREAKDOWN, showBreakdown ? "1" : "0");

    return { principal, contribution, rate, years, timing };
  }

  function clearAll() {
    $("opt-principal").value = "";
    $("opt-contrib").value = "";
    $("tool-output").value = "";
    setStatus("", false);
  }

  function restorePrefs() {
    const principal = storageGet(STORAGE_PRINCIPAL);
    if (principal != null) $("opt-principal").value = principal;

    const contrib = storageGet(STORAGE_CONTRIB);
    if (contrib != null) $("opt-contrib").value = contrib;

    const rate = storageGet(STORAGE_RATE);
    if (rate != null) $("opt-rate").value = rate;

    const years = storageGet(STORAGE_YEARS);
    if (years != null) $("opt-years").value = years;

    const timing = storageGet(STORAGE_TIMING);
    if (timing === "start" || timing === "end") $("opt-timing").value = timing;

    const breakdown = storageGet(STORAGE_BREAKDOWN);
    if (breakdown != null) $("opt-show-breakdown").checked = breakdown === "1";
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

      ["opt-principal", "opt-contrib", "opt-rate", "opt-years", "opt-timing", "opt-show-breakdown"].forEach((id) => {
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

