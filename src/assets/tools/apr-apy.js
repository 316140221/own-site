(function () {
  const STORAGE_MODE = "tool_aprApy_mode";
  const STORAGE_COMPOUND = "tool_aprApy_compound";

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
    const cleaned = raw.replace(/[%\s,]/g, "");
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }

  function clampFloat(value, min, max, fallback) {
    const n = Number(String(value ?? ""));
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }

  function formatPercent(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "";
    return `${n.toFixed(6).replace(/\.?0+$/g, "")}%`;
  }

  function parseCompounding(raw) {
    const v = String(raw || "");
    if (v === "continuous") return { kind: "continuous" };
    const n = Number.parseInt(v, 10);
    if (!Number.isFinite(n) || n <= 0) return { kind: "periodic", n: 12 };
    return { kind: "periodic", n };
  }

  function aprToApy(aprPercent, compounding) {
    const apr = Number(aprPercent) / 100;
    if (!Number.isFinite(apr)) return NaN;
    if (compounding.kind === "continuous") {
      return (Math.exp(apr) - 1) * 100;
    }
    const n = compounding.n;
    const base = 1 + apr / n;
    if (base <= 0) return NaN;
    return (Math.pow(base, n) - 1) * 100;
  }

  function apyToApr(apyPercent, compounding) {
    const apy = Number(apyPercent) / 100;
    if (!Number.isFinite(apy) || apy <= -1) return NaN;
    if (compounding.kind === "continuous") {
      return Math.log(1 + apy) * 100;
    }
    const n = compounding.n;
    return (n * (Math.pow(1 + apy, 1 / n) - 1)) * 100;
  }

  function describeCompounding(compounding) {
    if (compounding.kind === "continuous") return t("tool.aprApy.compound.continuous");
    const n = compounding.n;
    if (n === 365) return t("tool.aprApy.compound.daily");
    if (n === 12) return t("tool.aprApy.compound.monthly");
    if (n === 4) return t("tool.aprApy.compound.quarterly");
    if (n === 1) return t("tool.aprApy.compound.annual");
    return `${n}`;
  }

  function calculate() {
    const rate = normalizeNumber($("tool-input").value);
    const typed = normalizeText($("tool-input").value);
    const mode = $("opt-mode").value === "apyToApr" ? "apyToApr" : "aprToApy";
    const compounding = parseCompounding($("opt-compound").value);

    if (!typed) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    if (rate == null || !Number.isFinite(rate)) {
      $("tool-output").value = "";
      setStatus(t("tool.aprApy.error.rate"), true);
      return null;
    }

    const safeRate = clampFloat(rate, -99.999999, 100000, rate);

    let outRate = NaN;
    if (mode === "apyToApr") outRate = apyToApr(safeRate, compounding);
    else outRate = aprToApy(safeRate, compounding);

    if (!Number.isFinite(outRate)) {
      $("tool-output").value = "";
      setStatus(t("tool.aprApy.error.generic"), true);
      return null;
    }

    const lines = [
      `${t("tool.aprApy.out.mode")}: ${t(mode === "apyToApr" ? "tool.aprApy.mode.apyToApr" : "tool.aprApy.mode.aprToApy")}`,
      `${t("tool.aprApy.out.compounding")}: ${describeCompounding(compounding)}`,
      "",
      `${t("tool.aprApy.out.input")}: ${formatPercent(safeRate)}`,
      `${t("tool.aprApy.out.output")}: ${formatPercent(outRate)}`,
    ];

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.aprApy.status.done"), false);

    storageSet(STORAGE_MODE, mode);
    storageSet(STORAGE_COMPOUND, compounding.kind === "continuous" ? "continuous" : String(compounding.n));

    return { mode, compounding, input: safeRate, output: outRate };
  }

  function clearAll() {
    $("tool-input").value = "";
    $("tool-output").value = "";
    setStatus("", false);
  }

  function restorePrefs() {
    const mode = storageGet(STORAGE_MODE);
    if (mode === "aprToApy" || mode === "apyToApr") $("opt-mode").value = mode;

    const compound = storageGet(STORAGE_COMPOUND);
    if (compound != null) $("opt-compound").value = compound;
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

      ["tool-input", "opt-mode", "opt-compound"].forEach((id) => {
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

