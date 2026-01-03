(function () {
  const STORAGE_DISCOUNT = "tool_discount_percent";
  const STORAGE_TAX = "tool_discount_tax";
  const STORAGE_QTY = "tool_discount_qty";

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

  function calculate() {
    const price = normalizeNumber($("tool-input").value);
    const typed = normalizeText($("tool-input").value);
    const discountPct = clampFloat($("opt-discount").value, 0, 100, 0);
    const taxRate = clampFloat($("opt-tax").value, 0, 100, 0);
    const qty = clampInt($("opt-qty").value, 1, 100000, 1);

    if (!typed) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    if (price == null || !Number.isFinite(price) || price < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.discount.error.price"), true);
      return null;
    }

    if (!Number.isFinite(discountPct) || discountPct < 0 || discountPct > 100) {
      $("tool-output").value = "";
      setStatus(t("tool.discount.error.discountPercent"), true);
      return null;
    }

    if (!Number.isFinite(taxRate) || taxRate < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.discount.error.taxRate"), true);
      return null;
    }

    const subtotal = price * qty;
    const discount = subtotal * (discountPct / 100);
    const afterDiscount = subtotal - discount;
    const tax = afterDiscount * (taxRate / 100);
    const total = afterDiscount + tax;

    const perItemSubtotal = qty ? subtotal / qty : subtotal;
    const perItemAfterDiscount = qty ? afterDiscount / qty : afterDiscount;
    const perItemTax = qty ? tax / qty : tax;
    const perItemTotal = qty ? total / qty : total;

    const lines = [
      `${t("tool.discount.out.price")}: ${formatMoney(price)}`,
      `${t("tool.discount.out.discountPercent")}: ${formatPercent(discountPct)}`,
      `${t("tool.discount.out.taxRate")}: ${formatPercent(taxRate)}`,
      `${t("tool.discount.out.qty")}: ${qty}`,
      "",
      `${t("tool.discount.out.subtotal")}: ${formatMoney(subtotal)}`,
      `${t("tool.discount.out.discountAmount")}: ${formatMoney(discount)}`,
      `${t("tool.discount.out.afterDiscount")}: ${formatMoney(afterDiscount)}`,
      `${t("tool.discount.out.tax")}: ${formatMoney(tax)}`,
      `${t("tool.discount.out.total")}: ${formatMoney(total)}`,
    ];

    if (qty > 1) {
      lines.push("");
      lines.push(`${t("tool.discount.out.perItem")}:`);
      lines.push(`- ${t("tool.discount.out.subtotal")}: ${formatMoney(perItemSubtotal)}`);
      lines.push(`- ${t("tool.discount.out.afterDiscount")}: ${formatMoney(perItemAfterDiscount)}`);
      lines.push(`- ${t("tool.discount.out.tax")}: ${formatMoney(perItemTax)}`);
      lines.push(`- ${t("tool.discount.out.total")}: ${formatMoney(perItemTotal)}`);
    }

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.discount.status.done"), false);

    storageSet(STORAGE_DISCOUNT, String(discountPct));
    storageSet(STORAGE_TAX, String(taxRate));
    storageSet(STORAGE_QTY, String(qty));

    return { price, discountPct, taxRate, qty };
  }

  function clearAll() {
    $("tool-input").value = "";
    $("tool-output").value = "";
    setStatus("", false);
  }

  function applyPreset(value) {
    const pct = clampFloat(value, 0, 100, 0);
    $("opt-discount").value = String(pct);
    calculate();
  }

  function restorePrefs() {
    const discount = storageGet(STORAGE_DISCOUNT);
    if (discount != null) $("opt-discount").value = discount;

    const tax = storageGet(STORAGE_TAX);
    if (tax != null) $("opt-tax").value = tax;

    const qty = storageGet(STORAGE_QTY);
    if (qty != null) $("opt-qty").value = qty;
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

      ["tool-input", "opt-discount", "opt-tax", "opt-qty"].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("input", debounce);
        el.addEventListener("change", debounce);
      });

      document.querySelectorAll("[data-discount-preset]").forEach((el) => {
        el.addEventListener("click", () => {
          applyPreset(el.getAttribute("data-discount-preset"));
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

