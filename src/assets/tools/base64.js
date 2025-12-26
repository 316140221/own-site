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

  function bytesToBinary(bytes) {
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, chunk);
    }
    return binary;
  }

  function utf8ToBase64(text) {
    const bytes = new TextEncoder().encode(String(text || ""));
    return btoa(bytesToBinary(bytes));
  }

  function base64ToUtf8(base64) {
    const cleaned = String(base64 || "").trim();
    const binary = atob(cleaned);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  function normalizeBase64Input(input, urlSafe) {
    let value = String(input || "").trim();
    value = value.replace(/\s+/g, "");
    if (urlSafe) value = value.replace(/-/g, "+").replace(/_/g, "/");
    const pad = value.length % 4;
    if (pad === 2) value += "==";
    else if (pad === 3) value += "=";
    return value;
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
    const urlSafe = $("opt-url-safe").checked;
    const noPadding = $("opt-no-padding").checked;

    const encoded = utf8ToBase64(input);
    let out = encoded;
    if (urlSafe) out = out.replace(/\+/g, "-").replace(/\//g, "_");
    if (noPadding) out = out.replace(/=+$/g, "");

    $("tool-output").value = out;
    setStatus(t("tool.base64.status.encoded", { len: out.length }), false);
  }

  function runDecode() {
    const input = $("tool-input").value;
    const urlSafe = $("opt-url-safe").checked;
    const normalized = normalizeBase64Input(input, urlSafe);
    const decoded = base64ToUtf8(normalized);
    $("tool-output").value = decoded;
    setStatus(t("tool.base64.status.decoded", { len: decoded.length }), false);
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
          setStatus(error instanceof Error ? error.message : String(error), true);
        }
      });
      $("btn-decode").addEventListener("click", () => {
        try {
          runDecode();
        } catch (error) {
          setStatus(t("tool.base64.error.decode"), true);
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
