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

  function escapeHtml(input, escapeQuotes) {
    const src = String(input || "");
    let out = src.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (escapeQuotes) {
      out = out.replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
    }
    return out;
  }

  function unescapeHtml(input) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = String(input || "");
    return textarea.value;
  }

  function runEscape() {
    const input = $("tool-input").value;
    const quotes = $("opt-quotes").checked;
    const out = escapeHtml(input, quotes);
    $("tool-output").value = out;
    setStatus(t("tool.html.status.escaped", { len: out.length }), false);
  }

  function runUnescape() {
    const input = $("tool-input").value;
    const out = unescapeHtml(input);
    $("tool-output").value = out;
    setStatus(t("tool.html.status.unescaped", { len: out.length }), false);
  }

  function swap() {
    const input = $("tool-input");
    const output = $("tool-output");
    const tmp = input.value;
    input.value = output.value;
    output.value = tmp;
    setStatus(t("tool.common.status.swapped"), false);
  }

  function clearAll() {
    $("tool-input").value = "";
    $("tool-output").value = "";
    setStatus("", false);
  }

  function main() {
    try {
      $("btn-escape").addEventListener("click", () => {
        try {
          runEscape();
        } catch (error) {
          setStatus(error instanceof Error ? error.message : String(error), true);
        }
      });
      $("btn-unescape").addEventListener("click", () => {
        try {
          runUnescape();
        } catch (error) {
          setStatus(error instanceof Error ? error.message : String(error), true);
        }
      });
      $("btn-swap").addEventListener("click", swap);
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

