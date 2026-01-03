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
    return `${n.toFixed(2).replace(/\.?0+$/g, "")}%`;
  }

  function requiredNestEgg(annualSpending, ratePct) {
    const spending = Number(annualSpending);
    const rate = Number(ratePct);
    if (!Number.isFinite(spending) || spending < 0) return NaN;
    if (!Number.isFinite(rate) || rate <= 0) return NaN;
    return spending / (rate / 100);
  }

  function calculate() {
    const spendingRaw = normalizeText($("opt-spending").value);
    const spending = normalizeNumber(spendingRaw);
    const rate = clampFloat($("opt-rate").value, 0.1, 20, 4);
    const current = normalizeNumber($("opt-current").value) ?? 0;
    const showTable = Boolean($("opt-show-table").checked);

    if (!spendingRaw) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    if (spending == null || !Number.isFinite(spending) || spending <= 0) {
      $("tool-output").value = "";
      setStatus(t("tool.fourPercentRule.error.spending"), true);
      return null;
    }

    if (!Number.isFinite(current) || current < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.fourPercentRule.error.current"), true);
      return null;
    }

    const required = requiredNestEgg(spending, rate);
    if (!Number.isFinite(required)) {
      $("tool-output").value = "";
      setStatus(t("tool.fourPercentRule.error.rate"), true);
      return null;
    }

    const gap = required - current;
    const multiplier = 100 / rate;

    const lines = [
      `${t("tool.fourPercentRule.out.spending")}: ${formatMoney(spending)}`,
      `${t("tool.fourPercentRule.out.monthly")}: ${formatMoney(spending / 12)}`,
      `${t("tool.fourPercentRule.out.rate")}: ${formatPercent(rate)}`,
      `${t("tool.fourPercentRule.out.multiplier")}: ${multiplier.toFixed(2).replace(/\.?0+$/g, "")}×`,
      "",
      `${t("tool.fourPercentRule.out.required")}: ${formatMoney(required)}`,
      `${t("tool.fourPercentRule.out.current")}: ${formatMoney(current)}`,
      `${t("tool.fourPercentRule.out.gap")}: ${formatMoney(Math.abs(gap))} (${gap <= 0 ? t("tool.fourPercentRule.out.gap.ok") : t("tool.fourPercentRule.out.gap.more")})`,
    ];

    if (showTable) {
      const rates = [3, 3.5, 4, 4.5, 5];
      lines.push("", t("tool.fourPercentRule.out.table"));
      for (const r of rates) {
        const needed = requiredNestEgg(spending, r);
        lines.push(`- ${formatPercent(r)} → ${formatMoney(needed)}`);
      }
    }

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.fourPercentRule.status.done"), false);
    return { spending, rate, current, required };
  }

  function clearAll() {
    $("opt-spending").value = "";
    $("opt-current").value = "";
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

      ["opt-spending", "opt-rate", "opt-current", "opt-show-table"].forEach((id) => {
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

