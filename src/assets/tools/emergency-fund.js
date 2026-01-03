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

  function calculate() {
    const expensesRaw = normalizeText($("opt-expenses").value);
    const expenses = normalizeNumber(expensesRaw);
    const months = clampInt($("opt-months").value, 1, 36, 6);
    const current = normalizeNumber($("opt-current").value) ?? 0;
    const monthlySave = normalizeNumber($("opt-monthly-save").value) ?? 0;
    const showSchedule = Boolean($("opt-show-schedule").checked);

    const typedAny = [
      $("opt-expenses").value,
      $("opt-current").value,
      $("opt-monthly-save").value,
    ].some((v) => normalizeText(v));

    if (!typedAny) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    if (expenses == null || !Number.isFinite(expenses) || expenses <= 0) {
      $("tool-output").value = "";
      setStatus(t("tool.emergencyFund.error.expenses"), true);
      return null;
    }

    if (!Number.isFinite(current) || current < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.emergencyFund.error.current"), true);
      return null;
    }

    if (!Number.isFinite(monthlySave) || monthlySave < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.emergencyFund.error.monthlySave"), true);
      return null;
    }

    const target = expenses * months;
    const gap = Math.max(0, target - current);
    const coveredMonths = expenses > 0 ? current / expenses : 0;

    const lines = [
      `${t("tool.emergencyFund.out.expenses")}: ${formatMoney(expenses)}`,
      `${t("tool.emergencyFund.out.target")}: ${formatMoney(target)} (${months} ${t("tool.emergencyFund.out.months")})`,
      `${t("tool.emergencyFund.out.current")}: ${formatMoney(current)}`,
      `${t("tool.emergencyFund.out.covered")}: ${coveredMonths.toFixed(2)}`,
      `${t("tool.emergencyFund.out.gap")}: ${formatMoney(gap)}`,
    ];

    const save = Number.isFinite(monthlySave) && monthlySave > 0 ? monthlySave : 0;
    if (save > 0 && gap > 0) {
      const monthsToGoal = Math.ceil(gap / save);
      lines.push(
        "",
        `${t("tool.emergencyFund.out.monthlySave")}: ${formatMoney(save)}`,
        `${t("tool.emergencyFund.out.timeToGoal")}: ${monthsToGoal} ${t("tool.emergencyFund.out.months")}`,
        `${t("tool.emergencyFund.out.goalDate")}: ${formatDate(addMonths(new Date(), monthsToGoal))}`
      );

      if (showSchedule) {
        lines.push("", t("tool.emergencyFund.out.firstMonths"));
        const max = Math.min(12, monthsToGoal);
        for (let i = 1; i <= max; i += 1) {
          const balance = current + save * i;
          const remaining = Math.max(0, target - balance);
          lines.push(
            `#${i}  ${t("tool.emergencyFund.out.balance")}: ${formatMoney(balance)}  ${t("tool.emergencyFund.out.remaining")}: ${formatMoney(remaining)}`
          );
        }
      }
    }

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.emergencyFund.status.done"), false);
    return { expenses, months, current, target, gap };
  }

  function clearAll() {
    $("opt-expenses").value = "";
    $("opt-current").value = "";
    $("opt-monthly-save").value = "";
    $("tool-output").value = "";
    setStatus("", false);
  }

  function applyPreset(value) {
    const next = clampInt(value, 1, 36, 6);
    $("opt-months").value = String(next);
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

      ["opt-expenses", "opt-months", "opt-current", "opt-monthly-save", "opt-show-schedule"].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("input", debounce);
        el.addEventListener("change", debounce);
      });

      document.querySelectorAll("[data-months-preset]").forEach((el) => {
        el.addEventListener("click", () => applyPreset(el.getAttribute("data-months-preset")));
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

