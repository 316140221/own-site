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

  const CATEGORIES = {
    length: {
      base: "m",
      units: [
        { id: "mm", label: "mm", factor: 0.001 },
        { id: "cm", label: "cm", factor: 0.01 },
        { id: "m", label: "m", factor: 1 },
        { id: "km", label: "km", factor: 1000 },
        { id: "in", label: "in", factor: 0.0254 },
        { id: "ft", label: "ft", factor: 0.3048 },
        { id: "yd", label: "yd", factor: 0.9144 },
        { id: "mi", label: "mi", factor: 1609.344 },
      ],
      defaults: { from: "m", to: "ft" },
    },
    mass: {
      base: "g",
      units: [
        { id: "mg", label: "mg", factor: 0.001 },
        { id: "g", label: "g", factor: 1 },
        { id: "kg", label: "kg", factor: 1000 },
        { id: "oz", label: "oz", factor: 28.349523125 },
        { id: "lb", label: "lb", factor: 453.59237 },
        { id: "t", label: "t", factor: 1_000_000 },
      ],
      defaults: { from: "kg", to: "lb" },
    },
    temperature: {
      base: "K",
      units: [
        { id: "C", label: "°C" },
        { id: "F", label: "°F" },
        { id: "K", label: "K" },
      ],
      defaults: { from: "C", to: "F" },
      toBase(value, unitId) {
        if (unitId === "K") return value;
        if (unitId === "C") return value + 273.15;
        if (unitId === "F") return (value - 32) * (5 / 9) + 273.15;
        return Number.NaN;
      },
      fromBase(value, unitId) {
        if (unitId === "K") return value;
        if (unitId === "C") return value - 273.15;
        if (unitId === "F") return (value - 273.15) * (9 / 5) + 32;
        return Number.NaN;
      },
    },
    area: {
      base: "m2",
      units: [
        { id: "mm2", label: "mm²", factor: 1e-6 },
        { id: "cm2", label: "cm²", factor: 1e-4 },
        { id: "m2", label: "m²", factor: 1 },
        { id: "km2", label: "km²", factor: 1e6 },
        { id: "in2", label: "in²", factor: 0.00064516 },
        { id: "ft2", label: "ft²", factor: 0.09290304 },
        { id: "acre", label: "acre", factor: 4046.8564224 },
        { id: "ha", label: "ha", factor: 10000 },
      ],
      defaults: { from: "m2", to: "ft2" },
    },
    volume: {
      base: "L",
      units: [
        { id: "mL", label: "mL", factor: 0.001 },
        { id: "L", label: "L", factor: 1 },
        { id: "m3", label: "m³", factor: 1000 },
        { id: "tsp", label: "tsp (US)", factor: 0.00492892159375 },
        { id: "tbsp", label: "tbsp (US)", factor: 0.01478676478125 },
        { id: "floz", label: "fl oz (US)", factor: 0.0295735295625 },
        { id: "cup", label: "cup (US)", factor: 0.2365882365 },
        { id: "pt", label: "pt (US)", factor: 0.473176473 },
        { id: "qt", label: "qt (US)", factor: 0.946352946 },
        { id: "gal", label: "gal (US)", factor: 3.785411784 },
      ],
      defaults: { from: "L", to: "gal" },
    },
    speed: {
      base: "m/s",
      units: [
        { id: "ms", label: "m/s", factor: 1 },
        { id: "kmh", label: "km/h", factor: 1000 / 3600 },
        { id: "mph", label: "mph", factor: 1609.344 / 3600 },
        { id: "knot", label: "knot", factor: 1852 / 3600 },
      ],
      defaults: { from: "kmh", to: "mph" },
    },
    data: {
      base: "B",
      units: [
        { id: "B", label: "B", factor: 1 },
        { id: "KB", label: "KB", factor: 1000 },
        { id: "MB", label: "MB", factor: 1000 ** 2 },
        { id: "GB", label: "GB", factor: 1000 ** 3 },
        { id: "TB", label: "TB", factor: 1000 ** 4 },
        { id: "KiB", label: "KiB", factor: 1024 },
        { id: "MiB", label: "MiB", factor: 1024 ** 2 },
        { id: "GiB", label: "GiB", factor: 1024 ** 3 },
        { id: "TiB", label: "TiB", factor: 1024 ** 4 },
      ],
      defaults: { from: "MB", to: "MiB" },
    },
  };

  function normalizeText(value) {
    return String(value || "").trim();
  }

  function normalizeNumber(value) {
    const raw = normalizeText(value);
    if (!raw) return null;
    const cleaned = raw.replace(/,/g, "").replace(/\s+/g, "");
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }

  function readPrecision() {
    const raw = Number.parseInt($("opt-precision").value, 10);
    if (!Number.isFinite(raw)) return 6;
    return Math.max(0, Math.min(12, raw));
  }

  function formatNumber(value, precision, trim) {
    if (!Number.isFinite(value)) return "";
    try {
      let out = value.toFixed(precision);
      if (trim && out.includes(".")) out = out.replace(/\.?0+$/g, "");
      return out;
    } catch (_error) {
      return String(value);
    }
  }

  function fillSelect(select, units, desired) {
    if (!(select instanceof HTMLSelectElement)) return;
    const prev = select.value;
    select.innerHTML = "";
    for (const unit of units) {
      const opt = document.createElement("option");
      opt.value = unit.id;
      opt.textContent = unit.label;
      select.appendChild(opt);
    }

    const fallback =
      desired && units.some((u) => u.id === desired)
        ? desired
        : prev && units.some((u) => u.id === prev)
          ? prev
          : units[0]?.id || "";
    if (fallback) select.value = fallback;
  }

  function getCategoryId() {
    const el = $("opt-category");
    if (!(el instanceof HTMLSelectElement)) return "length";
    const value = String(el.value || "").trim();
    return Object.prototype.hasOwnProperty.call(CATEGORIES, value) ? value : "length";
  }

  function getUnitById(category, unitId) {
    const id = String(unitId || "").trim();
    return category.units.find((u) => u.id === id) || null;
  }

  function convertValue() {
    const input = $("tool-input");
    if (!(input instanceof HTMLInputElement)) return null;

    const value = normalizeNumber(input.value);
    if (value == null) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }
    if (!Number.isFinite(value)) {
      $("tool-output").value = "";
      setStatus(t("tool.unit.error.value"), true);
      return null;
    }

    const categoryId = getCategoryId();
    const category = CATEGORIES[categoryId];
    const fromId = $("opt-from").value;
    const toId = $("opt-to").value;

    let out = Number.NaN;
    if (categoryId === "temperature") {
      const base = category.toBase(value, fromId);
      out = category.fromBase(base, toId);
    } else {
      const from = getUnitById(category, fromId);
      const to = getUnitById(category, toId);
      if (!from || !to) {
        $("tool-output").value = "";
        setStatus(t("tool.unit.error.unit"), true);
        return null;
      }
      const base = value * from.factor;
      out = base / to.factor;
    }

    if (!Number.isFinite(out)) {
      $("tool-output").value = "";
      setStatus(t("tool.unit.error.unit"), true);
      return null;
    }

    const precision = readPrecision();
    const trim = Boolean($("opt-trim").checked);
    $("tool-output").value = formatNumber(out, precision, trim);
    setStatus(t("tool.unit.status.done"), false);
    return out;
  }

  function syncUnits() {
    const categoryId = getCategoryId();
    const category = CATEGORIES[categoryId];
    const defaults = category.defaults || {};
    fillSelect($("opt-from"), category.units, defaults.from || "");
    fillSelect($("opt-to"), category.units, defaults.to || "");
  }

  function swapUnits() {
    const from = $("opt-from");
    const to = $("opt-to");
    if (!(from instanceof HTMLSelectElement) || !(to instanceof HTMLSelectElement)) return;
    const a = from.value;
    from.value = to.value;
    to.value = a;
  }

  function clearAll() {
    $("tool-input").value = "";
    $("tool-output").value = "";
    setStatus("", false);
  }

  function main() {
    try {
      const debounce = (() => {
        let handle = 0;
        return () => {
          if (handle) window.clearTimeout(handle);
          handle = window.setTimeout(() => {
            handle = 0;
            convertValue();
          }, 60);
        };
      })();

      syncUnits();
      convertValue();

      $("opt-category").addEventListener("change", () => {
        syncUnits();
        convertValue();
      });

      ["tool-input", "opt-from", "opt-to", "opt-precision", "opt-trim"].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("input", debounce);
        el.addEventListener("change", debounce);
      });

      $("btn-convert").addEventListener("click", () => {
        try {
          convertValue();
        } catch (error) {
          setStatus(error instanceof Error ? error.message : String(error), true);
        }
      });

      $("btn-swap").addEventListener("click", () => {
        swapUnits();
        convertValue();
      });

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

