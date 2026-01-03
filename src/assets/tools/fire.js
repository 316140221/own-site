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
    return `${(n * 100).toFixed(2).replace(/\.?0+$/g, "")}%`;
  }

  function calculate() {
    const expensesRaw = normalizeText($("opt-expenses").value);
    const expenses = normalizeNumber(expensesRaw);
    const portfolio = normalizeNumber($("opt-portfolio").value) ?? 0;
    const savings = normalizeNumber($("opt-savings").value) ?? 0;
    const annualReturn = clampFloat($("opt-return").value, 0, 50, 0);
    const withdrawal = clampFloat($("opt-withdrawal").value, 0.1, 10, 4);
    const showTable = Boolean($("opt-show-table").checked);

    if (!expensesRaw) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    if (expenses == null || !Number.isFinite(expenses) || expenses <= 0) {
      $("tool-output").value = "";
      setStatus(t("tool.fire.error.expenses"), true);
      return null;
    }

    if (!Number.isFinite(portfolio) || portfolio < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.fire.error.portfolio"), true);
      return null;
    }

    if (!Number.isFinite(savings) || savings < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.fire.error.savings"), true);
      return null;
    }

    const fireNumber = expenses / (withdrawal / 100);
    if (!Number.isFinite(fireNumber) || fireNumber <= 0) {
      $("tool-output").value = "";
      setStatus(t("tool.fire.error.withdrawal"), true);
      return null;
    }

    const currentSafe = portfolio * (withdrawal / 100);
    const gap = Math.max(0, fireNumber - portfolio);

    const impliedIncome = expenses + savings;
    const savingsRate = impliedIncome > 0 ? savings / impliedIncome : 0;

    let yearsTo = 0;
    let reached = portfolio >= fireNumber;
    const rows = [];

    if (!reached) {
      if (savings <= 0 && annualReturn <= 0) {
        $("tool-output").value = "";
        setStatus(t("tool.fire.error.unreachable"), true);
        return null;
      }

      let bal = portfolio;
      const capYears = 200;
      for (let y = 1; y <= capYears; y += 1) {
        bal *= 1 + annualReturn / 100;
        bal += savings;
        if (showTable && y <= 30) rows.push({ year: y, balance: bal });
        if (bal >= fireNumber) {
          yearsTo = y;
          reached = true;
          break;
        }
      }

      if (!reached) {
        $("tool-output").value = "";
        setStatus(t("tool.fire.error.timeout"), true);
        return null;
      }
    }

    const lines = [
      `${t("tool.fire.out.expenses")}: ${formatMoney(expenses)}`,
      `${t("tool.fire.out.withdrawal")}: ${withdrawal.toFixed(2).replace(/\.?0+$/g, "")}%`,
      `${t("tool.fire.out.fireNumber")}: ${formatMoney(fireNumber)}`,
      "",
      `${t("tool.fire.out.portfolio")}: ${formatMoney(portfolio)}`,
      `${t("tool.fire.out.safeSpendNow")}: ${formatMoney(currentSafe)} / ${t("tool.fire.year")}`,
      `${t("tool.fire.out.gap")}: ${formatMoney(gap)}`,
      "",
      `${t("tool.fire.out.savings")}: ${formatMoney(savings)} / ${t("tool.fire.year")}`,
      `${t("tool.fire.out.return")}: ${annualReturn.toFixed(2).replace(/\.?0+$/g, "")}%`,
      `${t("tool.fire.out.savingsRate")}: ${formatPercent(savingsRate)}`,
    ];

    if (portfolio >= fireNumber) {
      lines.push("", `${t("tool.fire.out.timeToFire")}: 0 ${t("tool.fire.years")}`);
      lines.push(`${t("tool.fire.out.estimateYear")}: ${new Date().getFullYear()}`);
    } else {
      lines.push(
        "",
        `${t("tool.fire.out.timeToFire")}: ${yearsTo} ${t("tool.fire.years")}`,
        `${t("tool.fire.out.estimateYear")}: ${new Date().getFullYear() + yearsTo}`
      );
    }

    if (showTable && rows.length) {
      lines.push("", t("tool.fire.out.table"));
      for (const row of rows) {
        lines.push(`${t("tool.fire.out.year")} ${row.year}: ${formatMoney(row.balance)}`);
      }
      if (yearsTo > 30) lines.push("…");
    }

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.fire.status.done"), false);
    return { fireNumber, yearsTo };
  }

  function clearAll() {
    $("opt-expenses").value = "";
    $("opt-portfolio").value = "";
    $("opt-savings").value = "";
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

      ["opt-expenses", "opt-portfolio", "opt-savings", "opt-return", "opt-withdrawal", "opt-show-table"].forEach(
        (id) => {
          const el = document.getElementById(id);
          if (!el) return;
          el.addEventListener("input", debounce);
          el.addEventListener("change", debounce);
        }
      );

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

