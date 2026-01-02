(function () {
  const STORAGE_MPG = "tool_gasCost_mpg";
  const STORAGE_PRICE = "tool_gasCost_price";
  const STORAGE_TRIPS = "tool_gasCost_trips";
  const STORAGE_ROUNDTRIP = "tool_gasCost_roundTrip";

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

  function formatNumber(value, digits) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "";
    try {
      return n.toFixed(digits).replace(/\.?0+$/g, "");
    } catch (_error) {
      return String(n);
    }
  }

  function calculate() {
    const distance = normalizeNumber($("tool-input").value);
    const mpg = clampFloat($("opt-mpg").value, 0.1, 1000, 28);
    const price = normalizeNumber($("opt-price").value);
    const trips = clampInt($("opt-trips").value, 1, 100000, 1);
    const roundTrip = Boolean($("opt-roundtrip").checked);

    const typedDistance = normalizeText($("tool-input").value);
    const typedPrice = normalizeText($("opt-price").value);
    const typedAny = Boolean(typedDistance || typedPrice);

    if (!typedAny) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    if (distance == null || !Number.isFinite(distance) || distance < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.gasCost.error.distance"), true);
      return null;
    }

    if (!Number.isFinite(mpg) || mpg <= 0) {
      $("tool-output").value = "";
      setStatus(t("tool.gasCost.error.mpg"), true);
      return null;
    }

    if (price == null || !Number.isFinite(price) || price < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.gasCost.error.price"), true);
      return null;
    }

    const multiplier = trips * (roundTrip ? 2 : 1);
    const totalDistance = distance * multiplier;
    const gallons = mpg > 0 ? totalDistance / mpg : 0;
    const totalCost = gallons * price;
    const costPerMile = totalDistance > 0 ? totalCost / totalDistance : 0;

    const lines = [
      `${t("tool.gasCost.out.distance")}: ${formatNumber(distance, 2)} mi`,
      `${t("tool.gasCost.out.mpg")}: ${formatNumber(mpg, 2)} mpg`,
      `${t("tool.gasCost.out.price")}: ${formatMoney(price)} / gal`,
      `${t("tool.gasCost.out.trips")}: ${trips}${roundTrip ? ` (${t("tool.gasCost.out.roundTrip")})` : ""}`,
      "",
      `${t("tool.gasCost.out.totalDistance")}: ${formatNumber(totalDistance, 2)} mi`,
      `${t("tool.gasCost.out.gallons")}: ${formatNumber(gallons, 3)} gal`,
      `${t("tool.gasCost.out.totalCost")}: ${formatMoney(totalCost)}`,
      `${t("tool.gasCost.out.costPerMile")}: ${formatMoney(costPerMile)}/mi`,
    ];

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.gasCost.status.done"), false);

    storageSet(STORAGE_MPG, String(mpg));
    storageSet(STORAGE_PRICE, String(price));
    storageSet(STORAGE_TRIPS, String(trips));
    storageSet(STORAGE_ROUNDTRIP, roundTrip ? "1" : "0");

    return { distance, mpg, price, trips, roundTrip };
  }

  function clearAll() {
    $("tool-input").value = "";
    $("opt-price").value = "";
    $("tool-output").value = "";
    setStatus("", false);
  }

  function restorePrefs() {
    const mpg = storageGet(STORAGE_MPG);
    if (mpg != null) $("opt-mpg").value = mpg;

    const price = storageGet(STORAGE_PRICE);
    if (price != null) $("opt-price").value = price;

    const trips = storageGet(STORAGE_TRIPS);
    if (trips != null) $("opt-trips").value = trips;

    const roundTrip = storageGet(STORAGE_ROUNDTRIP);
    if (roundTrip != null) $("opt-roundtrip").checked = roundTrip === "1";
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

      ["tool-input", "opt-mpg", "opt-price", "opt-trips", "opt-roundtrip"].forEach((id) => {
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

