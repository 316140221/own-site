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

  function calculate() {
    const balanceRaw = normalizeText($("opt-balance").value);
    const balance = normalizeNumber(balanceRaw);
    const rate = Number($("opt-rate").value);
    const payment = normalizeNumber($("opt-payment").value);
    const extra = normalizeNumber($("opt-extra").value) ?? 0;
    const showSchedule = Boolean($("opt-show-schedule").checked);

    if (!balanceRaw) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    if (balance == null || !Number.isFinite(balance) || balance <= 0) {
      $("tool-output").value = "";
      setStatus(t("tool.studentLoan.error.balance"), true);
      return null;
    }

    if (!Number.isFinite(rate) || rate < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.studentLoan.error.rate"), true);
      return null;
    }

    if (payment == null || !Number.isFinite(payment) || payment <= 0) {
      $("tool-output").value = "";
      setStatus(t("tool.studentLoan.error.payment"), true);
      return null;
    }

    const monthlyRate = rate / 100 / 12;
    const budget = payment + Math.max(0, extra);
    let bal = balance;
    let month = 0;
    let totalPaid = 0;
    let totalInterest = 0;
    const rows = [];
    const cap = 600;

    while (bal > 0 && month < cap) {
      month += 1;
      const interest = monthlyRate > 0 ? bal * monthlyRate : 0;
      const principal = Math.max(0, budget - interest);
      if (principal <= 0) {
        $("tool-output").value = "";
        setStatus(t("tool.studentLoan.error.tooLow"), true);
        return null;
      }

      const payThis = Math.min(bal + interest, budget);
      const principalPay = payThis - interest;
      bal -= principalPay;
      totalPaid += payThis;
      totalInterest += interest;

      if (showSchedule && rows.length < 12) {
        rows.push({
          month,
          interest,
          principal: principalPay,
          balance: Math.max(0, bal),
        });
      }
    }

    if (month >= cap && bal > 0) {
      $("tool-output").value = "";
      setStatus(t("tool.studentLoan.error.timeout"), true);
      return null;
    }

    const years = month / 12;
    const payoffDate = (() => {
      const d = new Date();
      d.setMonth(d.getMonth() + month);
      return d;
    })();

    const lines = [
      `${t("tool.studentLoan.out.balance")}: ${formatMoney(balance)}`,
      `${t("tool.studentLoan.out.rate")}: ${formatPercent(rate)}`,
      `${t("tool.studentLoan.out.payment")}: ${formatMoney(payment)}`,
      `${t("tool.studentLoan.out.extra")}: ${formatMoney(extra)}`,
      "",
      `${t("tool.studentLoan.out.payoffTime")}: ${month} ${t("tool.studentLoan.months")} (~${years.toFixed(
        2
      )} ${t("tool.studentLoan.years")})`,
      `${t("tool.studentLoan.out.payoffDate")}: ${payoffDate.getFullYear()}-${String(
        payoffDate.getMonth() + 1
      ).padStart(2, "0")}`,
      `${t("tool.studentLoan.out.totalPaid")}: ${formatMoney(totalPaid)}`,
      `${t("tool.studentLoan.out.totalInterest")}: ${formatMoney(totalInterest)}`,
    ];

    if (rows.length) {
      lines.push("", t("tool.studentLoan.out.firstMonths"));
      for (const row of rows) {
        lines.push(
          `${t("tool.studentLoan.out.month")} ${row.month}: ${t("tool.studentLoan.out.principal")}: ${formatMoney(
            row.principal
          )} · ${t("tool.studentLoan.out.interest")}: ${formatMoney(row.interest)} · ${t(
            "tool.studentLoan.out.balance"
          )}: ${formatMoney(row.balance)}`
        );
      }
      if (month > rows.length) lines.push("…");
    }

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.studentLoan.status.done"), false);
    return { month, totalInterest };
  }

  function clearAll() {
    $("opt-balance").value = "";
    $("opt-payment").value = "";
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
          }, 120);
        };
      })();

      ["opt-balance", "opt-rate", "opt-payment", "opt-extra", "opt-show-schedule"].forEach((id) => {
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
