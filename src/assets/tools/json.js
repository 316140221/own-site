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

  function sortKeys(value) {
    if (Array.isArray(value)) return value.map(sortKeys);
    if (!value || typeof value !== "object") return value;

    const out = {};
    for (const key of Object.keys(value).sort((a, b) => a.localeCompare(b))) {
      out[key] = sortKeys(value[key]);
    }
    return out;
  }

  function readIndent() {
    const raw = $("opt-indent").value;
    if (raw === "tab") return "\t";
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) ? n : 2;
  }

  function parseInput() {
    const raw = $("tool-input").value.trim();
    if (!raw) throw new Error(t("tool.json.error.empty"));
    try {
      return JSON.parse(raw);
    } catch (_error) {
      throw new Error(t("tool.json.error.parse"));
    }
  }

  function runFormat() {
    let value = parseInput();
    if ($("opt-sort-keys").checked) value = sortKeys(value);
    const out = JSON.stringify(value, null, readIndent());
    $("tool-output").value = out;
    setStatus(t("tool.json.status.formatted", { len: out.length }), false);
  }

  function runMinify() {
    let value = parseInput();
    if ($("opt-sort-keys").checked) value = sortKeys(value);
    const out = JSON.stringify(value);
    $("tool-output").value = out;
    setStatus(t("tool.json.status.minified", { len: out.length }), false);
  }

  function clearAll() {
    $("tool-input").value = "";
    $("tool-output").value = "";
    setStatus("", false);
  }

  function main() {
    try {
      $("btn-format").addEventListener("click", () => {
        try {
          runFormat();
        } catch (error) {
          setStatus(error instanceof Error ? error.message : t("tool.json.error.format"), true);
        }
      });
      $("btn-minify").addEventListener("click", () => {
        try {
          runMinify();
        } catch (error) {
          setStatus(error instanceof Error ? error.message : t("tool.json.error.minify"), true);
        }
      });
      $("btn-clear").addEventListener("click", clearAll);
      $("btn-copy").addEventListener("click", async () => {
        try {
          await copyToClipboard($("tool-output").value);
          setStatus(t("tool.common.status.copied"), false);
        } catch (error) {
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
