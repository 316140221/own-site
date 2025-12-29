(function () {
  const MAX_TOTAL_BYTES = 65536;

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

  function toHex(bytes, uppercase, prefix) {
    const parts = [];
    for (const b of bytes) parts.push(b.toString(16).padStart(2, "0"));
    let out = parts.join("");
    if (uppercase) out = out.toUpperCase();
    if (prefix) out = `0x${out}`;
    return out;
  }

  function bytesToBase64(bytes) {
    let binary = "";
    const chunkSize = 0x2000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, chunk);
    }
    return btoa(binary);
  }

  function toBase64Url(bytes) {
    return bytesToBase64(bytes)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  }

  function readInt(id, fallback) {
    const raw = Number.parseInt($(id).value, 10);
    return Number.isFinite(raw) ? raw : fallback;
  }

  function readOptions() {
    const bytes = readInt("opt-bytes", 32);
    const count = readInt("opt-count", 1);
    const encoding = String($("opt-encoding").value || "hex");
    const uppercase = $("opt-uppercase").checked;
    const prefix = $("opt-prefix").checked;

    if (!Number.isFinite(bytes) || bytes < 1 || bytes > 4096) {
      throw new Error(t("tool.randomBytes.error.bytes"));
    }
    if (!Number.isFinite(count) || count < 1 || count > 50) {
      throw new Error(t("tool.randomBytes.error.count"));
    }
    if (bytes * count > MAX_TOTAL_BYTES) {
      throw new Error(t("tool.randomBytes.error.tooLarge", { max: MAX_TOTAL_BYTES }));
    }

    return { bytes, count, encoding, uppercase, prefix };
  }

  function updateEncodingOptions() {
    const encoding = String($("opt-encoding").value || "hex");
    const isHex = encoding === "hex";
    $("opt-uppercase").disabled = !isHex;
    $("opt-prefix").disabled = !isHex;
  }

  function getRandomBytes(size) {
    if (!globalThis.crypto || typeof crypto.getRandomValues !== "function") {
      throw new Error(t("tool.randomBytes.error.unsupported"));
    }
    const buf = new Uint8Array(size);
    crypto.getRandomValues(buf);
    return buf;
  }

  function runGenerate() {
    const { bytes, count, encoding, uppercase, prefix } = readOptions();
    const out = [];
    for (let i = 0; i < count; i += 1) {
      const buf = getRandomBytes(bytes);
      if (encoding === "base64") out.push(bytesToBase64(buf));
      else if (encoding === "base64url") out.push(toBase64Url(buf));
      else out.push(toHex(buf, uppercase, prefix));
    }
    $("tool-output").value = out.join("\n");
    setStatus(t("tool.randomBytes.status.done", { count }), false);
  }

  function clearAll() {
    $("tool-output").value = "";
    setStatus("", false);
  }

  function main() {
    try {
      updateEncodingOptions();
      $("opt-encoding").addEventListener("change", () => {
        updateEncodingOptions();
      });

      $("btn-generate").addEventListener("click", () => {
        try {
          runGenerate();
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

      runGenerate();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  window.addEventListener("DOMContentLoaded", main);
})();
