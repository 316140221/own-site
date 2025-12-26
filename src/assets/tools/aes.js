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

  function bytesToBinary(bytes) {
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, chunk);
    }
    return binary;
  }

  function toBase64(buffer) {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    return btoa(bytesToBinary(bytes));
  }

  function fromBase64(input) {
    const raw = String(input || "").trim();
    const bin = atob(raw);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  function readIterations() {
    const raw = Number.parseInt($("opt-iter").value, 10);
    if (!Number.isFinite(raw)) return 100000;
    return Math.min(2000000, Math.max(1000, raw));
  }

  function ensureCrypto() {
    if (!globalThis.crypto || !crypto.subtle || !crypto.subtle.deriveKey) {
      throw new Error(t("tool.aes.error.unsupported"));
    }
  }

  async function deriveKey(passphrase, salt, iterations) {
    ensureCrypto();
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, [
      "deriveKey",
    ]);
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  async function runEncrypt() {
    ensureCrypto();
    const input = $("tool-input").value;
    const passphrase = $("tool-pass").value;
    if (!String(passphrase || "").trim()) throw new Error(t("tool.aes.error.passphrase"));

    const iterations = readIterations();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(passphrase, salt, iterations);
    const plaintext = new TextEncoder().encode(String(input || ""));
    const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);

    const payload = {
      v: 1,
      alg: "AES-GCM",
      kdf: "PBKDF2-SHA256",
      iter: iterations,
      salt: toBase64(salt),
      iv: toBase64(iv),
      ct: toBase64(ct),
    };

    const out = JSON.stringify(payload, null, 2);
    $("tool-output").value = out;
    setStatus(t("tool.aes.status.encrypted", { len: out.length }), false);
  }

  async function runDecrypt() {
    ensureCrypto();
    const input = $("tool-input").value.trim();
    const passphrase = $("tool-pass").value;
    if (!String(passphrase || "").trim()) throw new Error(t("tool.aes.error.passphrase"));
    if (!input) throw new Error(t("tool.aes.error.empty"));

    let payload;
    try {
      payload = JSON.parse(input);
    } catch (_error) {
      throw new Error(t("tool.aes.error.payload"));
    }

    if (!payload || typeof payload !== "object") throw new Error(t("tool.aes.error.payload"));
    if (payload.alg !== "AES-GCM" || payload.kdf !== "PBKDF2-SHA256") throw new Error(t("tool.aes.error.payload"));

    const iterations = Number.parseInt(payload.iter, 10);
    if (!Number.isFinite(iterations) || iterations < 1000) throw new Error(t("tool.aes.error.payload"));

    let salt;
    let iv;
    let ct;
    try {
      salt = fromBase64(payload.salt);
      iv = fromBase64(payload.iv);
      ct = fromBase64(payload.ct);
    } catch (_error) {
      throw new Error(t("tool.aes.error.payload"));
    }

    const key = await deriveKey(passphrase, salt, iterations);

    let pt;
    try {
      pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
    } catch (_error) {
      throw new Error(t("tool.aes.error.decrypt"));
    }

    const out = new TextDecoder().decode(new Uint8Array(pt));
    $("tool-output").value = out;
    setStatus(t("tool.aes.status.decrypted", { len: out.length }), false);
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
      $("btn-encrypt").addEventListener("click", async () => {
        try {
          await runEncrypt();
        } catch (error) {
          setStatus(error instanceof Error ? error.message : String(error), true);
        }
      });
      $("btn-decrypt").addEventListener("click", async () => {
        try {
          await runDecrypt();
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

