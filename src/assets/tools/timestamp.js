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

  function isNumeric(input) {
    return /^-?\d+(\.\d+)?$/.test(String(input || "").trim());
  }

  function formatOutput(date, ms) {
    const iso = date.toISOString();
    const local = date.toLocaleString();
    const seconds = ms / 1000;
    return `UTC: ${iso}\nLocal: ${local}\nms: ${ms}\ns: ${seconds}`;
  }

  function parseUnit() {
    const raw = String($("opt-unit").value || "auto");
    if (raw === "s" || raw === "ms") return raw;
    return "auto";
  }

  function resolveTimestampMs(value, unit) {
    const num = Number(value);
    if (!Number.isFinite(num)) throw new Error(t("tool.timestamp.error.invalid"));
    if (unit === "s") return Math.trunc(num * 1000);
    if (unit === "ms") return Math.trunc(num);
    const abs = Math.abs(num);
    return abs < 1e12 ? Math.trunc(num * 1000) : Math.trunc(num);
  }

  function runConvert() {
    const input = $("tool-input").value.trim();
    if (!input) throw new Error(t("tool.timestamp.error.empty"));

    const unit = parseUnit();

    let date;
    let ms;

    if (isNumeric(input)) {
      ms = resolveTimestampMs(input, unit);
      date = new Date(ms);
    } else {
      date = new Date(input);
      ms = date.getTime();
    }

    if (Number.isNaN(date.getTime())) throw new Error(t("tool.timestamp.error.invalid"));

    const out = formatOutput(date, ms);
    $("tool-output").value = out;
    setStatus(t("tool.timestamp.status.done"), false);
  }

  function runNow() {
    $("tool-input").value = String(Date.now());
    $("opt-unit").value = "ms";
    runConvert();
  }

  function clearAll() {
    $("tool-input").value = "";
    $("tool-output").value = "";
    setStatus("", false);
  }

  function main() {
    try {
      $("btn-convert").addEventListener("click", () => {
        try {
          runConvert();
        } catch (error) {
          setStatus(error instanceof Error ? error.message : String(error), true);
        }
      });
      $("btn-now").addEventListener("click", () => {
        try {
          runNow();
        } catch (error) {
          setStatus(error instanceof Error ? error.message : String(error), true);
        }
      });
      $("btn-clear").addEventListener("click", clearAll);
      $("btn-copy").addEventListener("click", async () => {
        try {
          await copyToClipboard($("tool-output").value);
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

