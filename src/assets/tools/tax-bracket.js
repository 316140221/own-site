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

  function parseBracketLines(text) {
    const lines = String(text || "").split(/\r?\n/);
    const brackets = [];

    for (const line of lines) {
      const trimmed = normalizeText(line);
      if (!trimmed) continue;
      const parts = trimmed.replace(/\s+/g, " ").split(" ");
      if (parts.length < 2) continue;

      const capRaw = parts[0].toLowerCase();
      const rateRaw = parts[1];

      let cap;
      if (["inf", "∞", "infinity"].includes(capRaw)) {
        cap = Infinity;
      } else {
        cap = normalizeNumber(capRaw);
      }
      const rate = normalizeNumber(rateRaw);
      if (!Number.isFinite(rate) || rate < 0 || rate > 100) continue;
      if (cap == null || Number.isNaN(cap)) continue;
      brackets.push({ cap, rate: rate / 100 });
    }

    if (!brackets.length) return null;

    brackets.sort((a, b) => a.cap - b.cap);
    const cleaned = [];
    let lastCap = -Infinity;
    for (const b of brackets) {
      if (b.cap <= lastCap) continue;
      cleaned.push(b.cap === Infinity ? { cap: Infinity, rate: b.rate } : b);
      lastCap = b.cap;
    }
    const top = cleaned[cleaned.length - 1];
    if (top.cap !== Infinity) cleaned.push({ cap: Infinity, rate: top.rate });
    return cleaned;
  }

  const BRACKETS_2024 = {
    single: {
      deduction: 14600,
      brackets: [
        { cap: 11600, rate: 0.1 },
        { cap: 47150, rate: 0.12 },
        { cap: 100525, rate: 0.22 },
        { cap: 191950, rate: 0.24 },
        { cap: 243725, rate: 0.32 },
        { cap: 609350, rate: 0.35 },
        { cap: Infinity, rate: 0.37 },
      ],
    },
    mfj: {
      deduction: 29200,
      brackets: [
        { cap: 23200, rate: 0.1 },
        { cap: 94300, rate: 0.12 },
        { cap: 201050, rate: 0.22 },
        { cap: 383900, rate: 0.24 },
        { cap: 487450, rate: 0.32 },
        { cap: 731200, rate: 0.35 },
        { cap: Infinity, rate: 0.37 },
      ],
    },
  };

  const currencyFormatter = (() => {
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });
    } catch (_e) {
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

  function computeTax(taxable, brackets) {
    let remaining = Math.max(0, taxable);
    let prevCap = 0;
    let tax = 0;
    let marginal = 0;
    const parts = [];

    for (const b of brackets) {
      const cap = b.cap === Infinity ? Infinity : Math.max(prevCap, b.cap);
      const slice = Math.min(remaining, cap - prevCap);
      if (slice > 0) {
        const portion = slice * b.rate;
        parts.push({ amount: slice, rate: b.rate, tax: portion });
        tax += portion;
        remaining -= slice;
        marginal = b.rate;
      }
      prevCap = cap;
      if (remaining <= 0) break;
    }

    return { tax, marginal, parts };
  }

  function calculate() {
    const incomeRaw = normalizeText($("opt-income").value);
    const income = normalizeNumber(incomeRaw);
    const status = $("opt-status").value === "mfj" ? "mfj" : "single";
    const deductionRaw = normalizeNumber($("opt-deduction").value);
    const useCustom = Boolean($("opt-custom").checked);
    const bracketsCustom = useCustom ? parseBracketLines($("opt-brackets").value) : null;

    if (!incomeRaw) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    if (income == null || !Number.isFinite(income) || income <= 0) {
      $("tool-output").value = "";
      setStatus(t("tool.taxBracket.error.income"), true);
      return null;
    }

    const table = bracketsCustom || BRACKETS_2024[status].brackets;
    const stdDeduction =
      deductionRaw == null || Number.isNaN(deductionRaw) || deductionRaw < 0
        ? BRACKETS_2024[status].deduction
        : deductionRaw;

    const taxable = Math.max(0, income - stdDeduction);
    const { tax, marginal, parts } = computeTax(taxable, table);
    const effective = tax / income;
    const after = income - tax;

    const lines = [
      `${t("tool.taxBracket.out.income")}: ${formatMoney(income)}`,
      `${t("tool.taxBracket.out.status")}: ${t(
        status === "mfj" ? "tool.taxBracket.status.mfj" : "tool.taxBracket.status.single"
      )}`,
      `${t("tool.taxBracket.out.deduction")}: ${formatMoney(stdDeduction)}`,
      `${t("tool.taxBracket.out.taxable")}: ${formatMoney(taxable)}`,
      "",
      `${t("tool.taxBracket.out.tax")}: ${formatMoney(tax)}`,
      `${t("tool.taxBracket.out.effective")}: ${formatPercent(effective)}`,
      `${t("tool.taxBracket.out.marginal")}: ${formatPercent(marginal)}`,
      `${t("tool.taxBracket.out.after")}: ${formatMoney(after)}`,
    ];

    if (parts.length) {
      lines.push("", t("tool.taxBracket.out.parts"));
      for (const part of parts) {
        lines.push(`${formatMoney(part.amount)} @ ${formatPercent(part.rate)} = ${formatMoney(part.tax)}`);
      }
    }

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.taxBracket.status.done"), false);
    return { tax, effective, marginal };
  }

  function clearAll() {
    $("opt-income").value = "";
    $("opt-deduction").value = "";
    $("opt-brackets").value = "";
    $("opt-custom").checked = false;
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

      ["opt-income", "opt-status", "opt-deduction", "opt-custom", "opt-brackets"].forEach((id) => {
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
