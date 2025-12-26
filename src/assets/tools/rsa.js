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

  function base64ToBytes(base64) {
    const cleaned = String(base64 || "").replace(/\s+/g, "");
    const bin = atob(cleaned);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  function bytesToBase64(bytes) {
    return btoa(bytesToBinary(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)));
  }

  function pemToBytes(pem) {
    const src = String(pem || "").trim();
    if (!src) throw new Error(t("tool.rsa.error.keyMissing"));
    const cleaned = src
      .replace(/-----BEGIN [^-]+-----/g, "")
      .replace(/-----END [^-]+-----/g, "")
      .replace(/\s+/g, "");
    return base64ToBytes(cleaned);
  }

  function toPem(label, bytes) {
    const base64 = bytesToBase64(bytes);
    const lines = base64.match(/.{1,64}/g) || [];
    return `-----BEGIN ${label}-----\n${lines.join("\n")}\n-----END ${label}-----`;
  }

  function getSubtle() {
    if (!crypto || !crypto.subtle) throw new Error(t("tool.rsa.error.unsupported"));
    return crypto.subtle;
  }

  async function importPublicKey(pem) {
    const subtle = getSubtle();
    const spki = pemToBytes(pem);
    return subtle.importKey("spki", spki, { name: "RSA-OAEP", hash: "SHA-256" }, false, ["encrypt"]);
  }

  async function importPrivateKey(pem) {
    const subtle = getSubtle();
    const pkcs8 = pemToBytes(pem);
    return subtle.importKey("pkcs8", pkcs8, { name: "RSA-OAEP", hash: "SHA-256" }, false, ["decrypt"]);
  }

  async function generateKeypair(size) {
    const subtle = getSubtle();
    const modulusLength = Number.parseInt(String(size), 10);
    if (!Number.isFinite(modulusLength) || modulusLength < 1024) throw new Error(t("tool.rsa.error.keySize"));
    return subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
    );
  }

  async function exportKeys(keyPair) {
    const subtle = getSubtle();
    const spki = new Uint8Array(await subtle.exportKey("spki", keyPair.publicKey));
    const pkcs8 = new Uint8Array(await subtle.exportKey("pkcs8", keyPair.privateKey));
    return {
      publicPem: toPem("PUBLIC KEY", spki),
      privatePem: toPem("PRIVATE KEY", pkcs8),
    };
  }

  async function hybridEncrypt(publicKeyPem, plaintext) {
    const subtle = getSubtle();
    const publicKey = await importPublicKey(publicKeyPem);

    const aesKey = await subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const data = new TextEncoder().encode(String(plaintext || ""));
    const ciphertext = new Uint8Array(await subtle.encrypt({ name: "AES-GCM", iv }, aesKey, data));

    const rawKey = new Uint8Array(await subtle.exportKey("raw", aesKey));
    const wrappedKey = new Uint8Array(await subtle.encrypt({ name: "RSA-OAEP" }, publicKey, rawKey));

    return JSON.stringify(
      {
        v: 1,
        alg: "RSA-OAEP+AES-256-GCM",
        hash: "SHA-256",
        iv: bytesToBase64(iv),
        key: bytesToBase64(wrappedKey),
        ciphertext: bytesToBase64(ciphertext),
      },
      null,
      2
    );
  }

  async function hybridDecrypt(privateKeyPem, payloadText) {
    const subtle = getSubtle();
    const privateKey = await importPrivateKey(privateKeyPem);

    let payload;
    try {
      payload = JSON.parse(String(payloadText || ""));
    } catch (_error) {
      throw new Error(t("tool.rsa.error.payload"));
    }
    if (!payload || typeof payload !== "object") throw new Error(t("tool.rsa.error.payload"));

    const iv = base64ToBytes(payload.iv || "");
    const wrappedKey = base64ToBytes(payload.key || "");
    const ciphertext = base64ToBytes(payload.ciphertext || "");
    if (iv.length !== 12) throw new Error(t("tool.rsa.error.payload"));

    const rawKey = new Uint8Array(await subtle.decrypt({ name: "RSA-OAEP" }, privateKey, wrappedKey));
    const aesKey = await subtle.importKey("raw", rawKey, "AES-GCM", false, ["decrypt"]);
    const plainBytes = new Uint8Array(await subtle.decrypt({ name: "AES-GCM", iv }, aesKey, ciphertext));

    try {
      return new TextDecoder().decode(plainBytes);
    } catch (_error) {
      throw new Error(t("tool.rsa.error.utf8"));
    }
  }

  async function runGenerate() {
    const size = $("opt-size").value;
    const keyPair = await generateKeypair(size);
    const { publicPem, privatePem } = await exportKeys(keyPair);
    $("key-public").value = publicPem;
    $("key-private").value = privatePem;
    setStatus(t("tool.rsa.status.generated", { size }), false);
  }

  async function runEncrypt() {
    const pub = $("key-public").value;
    const input = $("tool-input").value;
    const out = await hybridEncrypt(pub, input);
    $("tool-output").value = out;
    setStatus(t("tool.rsa.status.encrypted", { len: out.length }), false);
  }

  async function runDecrypt() {
    const priv = $("key-private").value;
    const input = $("tool-input").value;
    const out = await hybridDecrypt(priv, input);
    $("tool-output").value = out;
    setStatus(t("tool.rsa.status.decrypted", { len: out.length }), false);
  }

  function clearAll() {
    $("key-public").value = "";
    $("key-private").value = "";
    $("tool-input").value = "";
    $("tool-output").value = "";
    setStatus("", false);
  }

  function main() {
    try {
      $("btn-generate").addEventListener("click", async () => {
        try {
          await runGenerate();
        } catch (error) {
          setStatus(error instanceof Error ? error.message : String(error), true);
        }
      });
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

