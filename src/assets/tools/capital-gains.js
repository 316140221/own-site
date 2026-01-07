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

  const BRACKETS_LONG_2024 = {
    single: [
      { cap: 47025, rate: 0 },
      { cap: 518900, rate: 0.15 },
      { cap: Infinity, rate: 0.20 },
    ],
    mfj: [
      { cap: 94050, rate: 0 },
      { cap: 583750, rate: 0.15 },
      { cap: Infinity, rate: 0.20 },
    ],
  };

  function calcLongTerm(taxableIncome, gain, filing) {
    const brackets = BRACKETS_LONG_2024[filing] || BRACKETS_LONG_2024.single;
    let remaining = Math.max(0, gain);
    let priorIncome = Math.max(0, taxableIncome);
    let tax = 0;
    const parts = [];

    for (const b of brackets) {
      const room = Math.max(0, b.cap - priorIncome);
      const slice = Math.min(remaining, room);
      if (slice > 0) {
        const portion = slice * b.rate;
        tax += portion;
        parts.push({ amount: slice, rate: b.rate, tax: portion });
        remaining -= slice;
      }
      priorIncome += slice || 0;
      if (remaining <= 0) break;
    }

    return { tax, parts };
  }

  function calcShortTerm(gain, marginalRate) {
    const rate = Math.max(0, marginalRate);
    return { tax: gain * rate, rate };
  }

  function calculate() {
    const type = $("opt-type").value === "short" ? "short" : "long";
    const proceeds = normalizeNumber($("opt-proceeds").value);
    const cost = normalizeNumber($("opt-cost").value);
    const income = normalizeNumber($("opt-income").value) ?? 0;
    const filing = $("opt-filing").value === "mfj" ? "mfj" : "single";
    const state = Number($("opt-state").value) / 100;

    if (proceeds == null || !Number.isFinite(proceeds) || proceeds < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.capGains.error.proceeds"), true);
      return null;
    }

    if (cost == null || !Number.isFinite(cost) || cost < 0 || cost > proceeds) {
      $("tool-output").value = "";
      setStatus(t("tool.capGains.error.cost"), true);
      return null;
    }

    if (!Number.isFinite(income) || income < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.capGains.error.income"), true);
      return null;
    }

    if (!Number.isFinite(state) || state < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.capGains.error.state"), true);
      return null;
    }

    const gain = Math.max(0, proceeds - cost);
    let tax = 0;
    let effRate = 0;
    let breakdown = [];

    if (type === "long") {
      const { tax: ltTax, parts } = calcLongTerm(income, gain, filing);
      tax = ltTax;
      effRate = gain > 0 ? tax / gain : 0;
      breakdown = parts;
    } else {
      const assumedMarginal = income > 600000 ? 0.37 : income > 191950 ? 0.32 : income > 100525 ? 0.24 : 0.22; // rough
      const { tax: stTax } = calcShortTerm(gain, assumedMarginal);
      tax = stTax;
      effRate = gain > 0 ? tax / gain : 0;
      breakdown = [{ amount: gain, rate: assumedMarginal, tax: stTax }];
    }

    const stateTax = gain * state;
    const totalTax = tax + stateTax;
    const afterTax = proceeds - totalTax;

    const lines = [
      `${t("tool.capGains.out.type")}: ${t(type === "long" ? "tool.capGains.type.long" : "tool.capGains.type.short")}`,
      `${t("tool.capGains.out.gain")}: ${formatMoney(gain)}`,
      `${t("tool.capGains.out.taxableIncome")}: ${formatMoney(income)}`,
      `${t("tool.capGains.out.filing")}: ${t(filing === "mfj" ? "tool.capGains.filing.mfj" : "tool.capGains.filing.single")}`,
      "",
      `${t("tool.capGains.out.fedTax")}: ${formatMoney(tax)}`,
      `${t("tool.capGains.out.stateTax")}: ${formatMoney(stateTax)}`,
      `${t("tool.capGains.out.totalTax")}: ${formatMoney(totalTax)} (${formatPercent(effRate + state)})`,
      `${t("tool.capGains.out.afterTax")}: ${formatMoney(afterTax)}`,
    ];

    if (breakdown.length) {
      lines.push("", t("tool.capGains.out.breakdown"));
      for (const row of breakdown) {
        lines.push(`${formatMoney(row.amount)} @ ${formatPercent(row.rate)} = ${formatMoney(row.tax)}`);
      }
    }

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.capGains.status.done"), false);
    return { gain, totalTax };
  }

  function clearAll() {
    $("opt-proceeds").value = "";
    $("opt-cost").value = "";
    $("opt-income").value = "";
    $("opt-state").value = "0";
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

      ["opt-type", "opt-proceeds", "opt-cost", "opt-income", "opt-filing", "opt-state"].forEach((id) => {
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
