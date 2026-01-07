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

  function fv(current, monthly, monthlyRate, months) {
    const grow = Math.pow(1 + monthlyRate, months);
    const fvCurrent = current * grow;
    const fvContrib = monthlyRate === 0 ? monthly * months : monthly * ((grow - 1) / monthlyRate);
    return fvCurrent + fvContrib;
  }

  function requiredMonthly(goal, current, monthlyRate, months) {
    const grow = Math.pow(1 + monthlyRate, months);
    const numerator = goal - current * grow;
    if (numerator <= 0) return 0;
    if (monthlyRate === 0) return numerator / months;
    return numerator * (monthlyRate / (grow - 1));
  }

  function calculate() {
    const goalRaw = normalizeText($("opt-goal").value);
    const goal = normalizeNumber(goalRaw);
    const current = normalizeNumber($("opt-current").value) ?? 0;
    const years = Number($("opt-years").value);
    const annualReturn = Number($("opt-return").value);
    const monthly = normalizeNumber($("opt-monthly").value) ?? 0;
    const showTable = Boolean($("opt-show-table").checked);

    if (!goalRaw) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    if (goal == null || !Number.isFinite(goal) || goal <= 0) {
      $("tool-output").value = "";
      setStatus(t("tool.collegeSavings.error.goal"), true);
      return null;
    }

    if (!Number.isFinite(current) || current < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.collegeSavings.error.current"), true);
      return null;
    }

    if (!Number.isFinite(years) || years < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.collegeSavings.error.years"), true);
      return null;
    }

    if (!Number.isFinite(annualReturn) || annualReturn < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.collegeSavings.error.return"), true);
      return null;
    }

    if (!Number.isFinite(monthly) || monthly < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.collegeSavings.error.monthly"), true);
      return null;
    }

    const months = Math.round(years * 12);
    const monthlyRate = Math.pow(1 + annualReturn / 100, 1 / 12) - 1;
    const projected = fv(current, monthly, monthlyRate, months);
    const reqMonthly = requiredMonthly(goal, current, monthlyRate, months);
    const gap = goal - projected;

    const lines = [
      `${t("tool.collegeSavings.out.goal")}: ${formatMoney(goal)}`,
      `${t("tool.collegeSavings.out.current")}: ${formatMoney(current)}`,
      `${t("tool.collegeSavings.out.years")}: ${years}`,
      `${t("tool.collegeSavings.out.return")}: ${formatPercent(annualReturn / 100)}`,
      `${t("tool.collegeSavings.out.monthly")}: ${formatMoney(monthly)}`,
      "",
      `${t("tool.collegeSavings.out.projected")}: ${formatMoney(projected)}`,
      `${t("tool.collegeSavings.out.gap")}: ${formatMoney(gap)}`,
      `${t("tool.collegeSavings.out.required")}: ${formatMoney(reqMonthly)} / ${t("tool.collegeSavings.month")}`,
    ];

    if (showTable) {
      const rows = [];
      for (let y = 1; y <= Math.min(years, 30); y += 1) {
        const m = y * 12;
        rows.push({ year: y, balance: fv(current, monthly, monthlyRate, m) });
      }
      if (rows.length) {
        lines.push("", t("tool.collegeSavings.out.table"));
        for (const row of rows) {
          lines.push(`${t("tool.collegeSavings.out.year")} ${row.year}: ${formatMoney(row.balance)}`);
        }
        if (years > rows.length) lines.push("…");
      }
    }

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.collegeSavings.status.done"), false);
    return { projected, reqMonthly };
  }

  function clearAll() {
    $("opt-goal").value = "";
    $("opt-current").value = "";
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
          }, 120);
        };
      })();

      ["opt-goal", "opt-current", "opt-years", "opt-return", "opt-monthly", "opt-show-table"].forEach((id) => {
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
