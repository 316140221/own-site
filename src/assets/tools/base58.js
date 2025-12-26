(function () {
  const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const MAP = Object.fromEntries(ALPHABET.split("").map((c, i) => [c, i]));

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

  function encodeBase58(bytes) {
    if (!bytes || !bytes.length) return "";

    let zeros = 0;
    while (zeros < bytes.length && bytes[zeros] === 0) zeros += 1;

    const digits = [0];
    for (let i = 0; i < bytes.length; i += 1) {
      let carry = bytes[i];
      for (let j = 0; j < digits.length; j += 1) {
        carry += digits[j] << 8;
        digits[j] = carry % 58;
        carry = (carry / 58) | 0;
      }
      while (carry) {
        digits.push(carry % 58);
        carry = (carry / 58) | 0;
      }
    }

    let out = "1".repeat(zeros);
    for (let i = digits.length - 1; i >= 0; i -= 1) {
      out += ALPHABET[digits[i]];
    }
    return out;
  }

  function decodeBase58(input) {
    const raw = String(input || "").trim().replace(/\s+/g, "");
    if (!raw) return new Uint8Array();

    let zeros = 0;
    while (zeros < raw.length && raw[zeros] === "1") zeros += 1;

    const bytes = [0];
    for (let i = zeros; i < raw.length; i += 1) {
      const ch = raw[i];
      const val = MAP[ch];
      if (val === undefined) throw new Error(t("tool.base58.error.invalid"));

      let carry = val;
      for (let j = 0; j < bytes.length; j += 1) {
        carry += bytes[j] * 58;
        bytes[j] = carry & 255;
        carry >>= 8;
      }
      while (carry) {
        bytes.push(carry & 255);
        carry >>= 8;
      }
    }

    for (let i = 0; i < zeros; i += 1) bytes.push(0);
    return new Uint8Array(bytes.reverse());
  }

  function decodeUtf8(bytes) {
    try {
      return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch (_error) {
      throw new Error(t("tool.base58.error.utf8"));
    }
  }

  function runEncode() {
    const input = $("tool-input").value;
    const bytes = new TextEncoder().encode(String(input || ""));
    const out = encodeBase58(bytes);
    $("tool-output").value = out;
    setStatus(t("tool.base58.status.encoded", { len: out.length }), false);
  }

  function runDecode() {
    const input = $("tool-input").value;
    const bytes = decodeBase58(input);
    const out = decodeUtf8(bytes);
    $("tool-output").value = out;
    setStatus(t("tool.base58.status.decoded", { len: out.length }), false);
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

