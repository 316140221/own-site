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
    const cleaned = raw.replace(/,/g, "").replace(/\s+/g, "");
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }

  function readPrecision() {
    const raw = Number.parseInt($("opt-precision").value, 10);
    if (!Number.isFinite(raw)) return 4;
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

  function calculate() {
    const base = normalizeNumber($("tool-input").value);
    const percent = normalizeNumber($("opt-percent").value);
    const compare = normalizeNumber($("opt-compare").value);

    if (base == null && percent == null && compare == null) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    if (base == null || !Number.isFinite(base)) {
      $("tool-output").value = "";
      setStatus(t("tool.percentage.error.base"), true);
      return null;
    }

    if (percent !== null && !Number.isFinite(percent)) {
      $("tool-output").value = "";
      setStatus(t("tool.percentage.error.percent"), true);
      return null;
    }

    if (compare !== null && !Number.isFinite(compare)) {
      $("tool-output").value = "";
      setStatus(t("tool.percentage.error.compare"), true);
      return null;
    }

    const precision = readPrecision();
    const trim = Boolean($("opt-trim").checked);

    const lines = [];

    if (percent != null) {
      const rate = percent / 100;
      lines.push(
        `${t("tool.percentage.out.percentOf")}: ${formatNumber(base * rate, precision, trim)}`
      );
      lines.push(
        `${t("tool.percentage.out.increase")}: ${formatNumber(base * (1 + rate), precision, trim)}`
      );
      lines.push(
        `${t("tool.percentage.out.decrease")}: ${formatNumber(base * (1 - rate), precision, trim)}`
      );
    }

    if (compare != null && base !== 0) {
      const whatPercent = (compare / base) * 100;
      const change = ((compare - base) / base) * 100;

      lines.push(
        `${t("tool.percentage.out.whatPercent")}: ${formatNumber(whatPercent, precision, trim)}%`
      );
      lines.push(
        `${t("tool.percentage.out.change")}: ${formatNumber(change, precision, trim)}%`
      );
    }

    if (!lines.length) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.percentage.status.done"), false);
    return lines;
  }

  function clearAll() {
    $("tool-input").value = "";
    $("opt-percent").value = "";
    $("opt-compare").value = "";
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
            calculate();
          }, 60);
        };
      })();

      ["tool-input", "opt-percent", "opt-compare", "opt-precision", "opt-trim"].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("input", debounce);
        el.addEventListener("change", debounce);
      });

      $("btn-calc").addEventListener("click", () => {
        try {
          calculate();
        } catch (error) {
          setStatus(error instanceof Error ? error.message : String(error), true);
        }
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
