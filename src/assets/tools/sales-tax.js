(function () {
  const STORAGE_MODE = "tool_salesTax_mode";
  const STORAGE_RATE = "tool_salesTax_rate";
  const STORAGE_QTY = "tool_salesTax_qty";

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

  function calculate() {
    const amount = normalizeNumber($("tool-input").value);
    const rate = clampFloat($("opt-rate").value, 0, 100, 0);
    const qty = clampInt($("opt-qty").value, 1, 100000, 1);
    const mode = String($("opt-mode").value || "add");

    const typed = normalizeText($("tool-input").value);
    if (amount == null && !typed) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    if (amount == null || !Number.isFinite(amount) || amount < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.salesTax.error.amount"), true);
      return null;
    }

    if (!Number.isFinite(rate) || rate < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.salesTax.error.rate"), true);
      return null;
    }

    const rateFactor = rate / 100;
    let subtotal = 0;
    let tax = 0;
    let total = 0;

    if (mode === "included") {
      total = amount * qty;
      if (rateFactor === 0) {
        subtotal = total;
        tax = 0;
      } else {
        subtotal = total / (1 + rateFactor);
        tax = total - subtotal;
      }
    } else {
      subtotal = amount * qty;
      tax = subtotal * rateFactor;
      total = subtotal + tax;
    }

    const perItemSubtotal = qty ? subtotal / qty : subtotal;
    const perItemTax = qty ? tax / qty : tax;
    const perItemTotal = qty ? total / qty : total;

    const lines = [
      `${t("tool.salesTax.out.mode")}: ${t(mode === "included" ? "tool.salesTax.mode.included" : "tool.salesTax.mode.add")}`,
      `${t("tool.salesTax.out.rate")}: ${formatPercent(rate)}`,
      `${t("tool.salesTax.out.qty")}: ${qty}`,
      "",
      `${t("tool.salesTax.out.subtotal")}: ${formatMoney(subtotal)}`,
      `${t("tool.salesTax.out.tax")}: ${formatMoney(tax)}`,
      `${t("tool.salesTax.out.total")}: ${formatMoney(total)}`,
    ];

    if (qty > 1) {
      lines.push("");
      lines.push(`${t("tool.salesTax.out.perItem")}:`);
      lines.push(`- ${t("tool.salesTax.out.subtotal")}: ${formatMoney(perItemSubtotal)}`);
      lines.push(`- ${t("tool.salesTax.out.tax")}: ${formatMoney(perItemTax)}`);
      lines.push(`- ${t("tool.salesTax.out.total")}: ${formatMoney(perItemTotal)}`);
    }

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.salesTax.status.done"), false);

    storageSet(STORAGE_MODE, mode);
    storageSet(STORAGE_RATE, String(rate));
    storageSet(STORAGE_QTY, String(qty));

    return { amount, rate, qty, mode };
  }

  function clearAll() {
    $("tool-input").value = "";
    $("tool-output").value = "";
    setStatus("", false);
  }

  function applyPreset(value) {
    const rate = clampFloat(value, 0, 100, 0);
    $("opt-rate").value = String(rate);
    calculate();
  }

  function restorePrefs() {
    const savedMode = storageGet(STORAGE_MODE);
    if (savedMode === "add" || savedMode === "included") $("opt-mode").value = savedMode;

    const savedRate = storageGet(STORAGE_RATE);
    if (savedRate != null) $("opt-rate").value = savedRate;

    const savedQty = storageGet(STORAGE_QTY);
    if (savedQty != null) $("opt-qty").value = savedQty;
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
          }, 60);
        };
      })();

      ["tool-input", "opt-mode", "opt-rate", "opt-qty"].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("input", debounce);
        el.addEventListener("change", debounce);
      });

      document.querySelectorAll("[data-tax-preset]").forEach((el) => {
        el.addEventListener("click", () => {
          applyPreset(el.getAttribute("data-tax-preset"));
        });
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

