(function () {
  const CRC_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i += 1) {
      let c = i;
      for (let k = 0; k < 8; k += 1) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[i] = c >>> 0;
    }
    return table;
  })();

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
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return upper ? hex.toUpperCase() : hex;
  }

  function toBase64(buffer) {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    return btoa(bytesToBinary(bytes));
  }

  function crc32(bytes) {
    let c = 0xffffffff;
    for (let i = 0; i < bytes.length; i += 1) {
      c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function formatBytes(bytes) {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let value = Number(bytes);
    if (!Number.isFinite(value) || value < 0) return "";
    let idx = 0;
    while (value >= 1024 && idx < units.length - 1) {
      value /= 1024;
      idx += 1;
    }
    const rounded = idx === 0 ? String(Math.round(value)) : value.toFixed(2);
    return `${rounded} ${units[idx]}`;
  }

  function readFile() {
    const input = $("tool-file");
    const file = input.files && input.files[0];
    if (!file) throw new Error(t("tool.fileHash.error.noFile"));
    return file;
  }

  function updateMeta(file) {
    const meta = $("tool-file-meta");
    if (!file) {
      meta.textContent = "";
      return;
    }
    const size = formatBytes(file.size);
    meta.textContent = size ? `${file.name} · ${size}` : file.name;
  }

  async function runHash() {
    const file = readFile();
    updateMeta(file);

    const alg = String($("opt-alg").value || "SHA-256");
    const fmt = String($("opt-format").value || "hex");
    const upper = $("opt-uppercase").checked;

    setStatus(t("tool.fileHash.status.working"), false);

    const buf = await file.arrayBuffer();
    const bytes = new Uint8Array(buf);

    if (alg === "CRC32") {
      const sum = crc32(bytes);
      let hex = sum.toString(16).padStart(8, "0");
      if (upper) hex = hex.toUpperCase();
      const out = `CRC32: ${hex}\nDecimal: ${sum}`;
      $("tool-output").value = out;
      setStatus(t("tool.fileHash.status.done", { alg }), false);
      return;
    }

    if (!globalThis.crypto || !crypto.subtle || !crypto.subtle.digest) {
      throw new Error(t("tool.fileHash.error.unsupported"));
    }

    const digest = await crypto.subtle.digest(alg, buf);

    const hex = toHex(digest, upper);
    const base64 = toBase64(digest);

    let out = "";
    if (fmt === "base64") out = base64;
    else if (fmt === "both") out = `HEX: ${hex}\nBase64: ${base64}`;
    else out = hex;

    $("tool-output").value = out;
    setStatus(t("tool.fileHash.status.done", { alg }), false);
  }

  function clearAll() {
    const input = $("tool-file");
    input.value = "";
    updateMeta(null);
    $("tool-output").value = "";
    setStatus("", false);
  }

  function main() {
    try {
      const fileInput = $("tool-file");
      fileInput.addEventListener("change", () => {
        const file = fileInput.files && fileInput.files[0];
        updateMeta(file);
      });

      $("btn-hash").addEventListener("click", async () => {
        try {
          await runHash();
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

