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

  function runEncode() {
    const input = $("tool-input").value;
    const plusForSpace = $("opt-plus-for-space").checked;
    let out = encodeURIComponent(input);
    if (plusForSpace) out = out.replace(/%20/g, "+");
    $("tool-output").value = out;
    setStatus(t("tool.url.status.encoded", { len: out.length }), false);
  }

  function runDecode() {
    const input = $("tool-input").value;
    const plusForSpace = $("opt-plus-for-space").checked;
    const normalized = plusForSpace ? input.replace(/\+/g, "%20") : input;
    const out = decodeURIComponent(normalized);
    $("tool-output").value = out;
    setStatus(t("tool.url.status.decoded", { len: out.length }), false);
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
      $("btn-encode").addEventListener("click", () => {
        try {
          runEncode();
        } catch (error) {
          setStatus(t("tool.url.error.encode"), true);
        }
      });
      $("btn-decode").addEventListener("click", () => {
        try {
          runDecode();
        } catch (error) {
          setStatus(t("tool.url.error.decode"), true);
        }
      });
      $("btn-swap").addEventListener("click", swap);
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
