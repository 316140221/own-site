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

  function toHex(buffer, upper) {
    const bytes = new Uint8Array(buffer);
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return upper ? hex.toUpperCase() : hex;
  }

  function toBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    return btoa(bytesToBinary(bytes));
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

  async function runHmac() {
    if (!globalThis.crypto || !crypto.subtle || !crypto.subtle.importKey) {
      throw new Error(t("tool.hmac.error.unsupported"));
    }

    const message = $("tool-input").value;
    const secret = $("tool-secret").value;
    const alg = $("opt-alg").value || "SHA-256";
    const format = $("opt-format").value || "hex";
    const uppercase = $("opt-uppercase").checked;

    const enc = new TextEncoder();
    const keyBytes = enc.encode(String(secret || ""));
    const msgBytes = enc.encode(String(message || ""));

    const key = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "HMAC", hash: { name: alg } },
      false,
      ["sign"]
    );

    const sig = await crypto.subtle.sign("HMAC", key, msgBytes);

    let out = "";
    if (format === "base64") out = toBase64(sig);
    else out = toHex(sig, uppercase);

    $("tool-output").value = out;
    setStatus(t("tool.hmac.status.done", { alg }), false);
  }

  function clearAll() {
    $("tool-input").value = "";
    $("tool-secret").value = "";
    $("tool-output").value = "";
    setStatus("", false);
  }

  function main() {
    try {
      $("btn-hmac").addEventListener("click", async () => {
        try {
          await runHmac();
        } catch (error) {
          setStatus(error instanceof Error ? error.message : t("tool.hmac.error.generic"), true);
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

