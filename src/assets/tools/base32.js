(function () {
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const ALPHABET_MAP = Object.fromEntries(
    ALPHABET.split("").map((c, i) => [c, i])
  );

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

  function encodeBase32(bytes, noPadding) {
    let bits = 0;
    let value = 0;
    let out = "";

    for (let i = 0; i < bytes.length; i += 1) {
      value = (value << 8) | bytes[i];
      bits += 8;
      while (bits >= 5) {
        out += ALPHABET[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }

    if (bits > 0) {
      out += ALPHABET[(value << (5 - bits)) & 31];
    }

    if (!noPadding) {
      while (out.length % 8 !== 0) out += "=";
    }

    return out;
  }

  function decodeBase32(input) {
    const cleaned = String(input || "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "")
      .replace(/=+$/g, "");

    let bits = 0;
    let value = 0;
    const out = [];

    for (let i = 0; i < cleaned.length; i += 1) {
      const ch = cleaned[i];
      const idx = ALPHABET_MAP[ch];
      if (idx === undefined) throw new Error(t("tool.base32.error.decode"));

      value = (value << 5) | idx;
      bits += 5;
      if (bits >= 8) {
        out.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }

    return new Uint8Array(out);
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
    const noPadding = $("opt-no-padding").checked;
    const lowercase = $("opt-lowercase").checked;

    const bytes = new TextEncoder().encode(String(input || ""));
    let out = encodeBase32(bytes, noPadding);
    if (lowercase) out = out.toLowerCase();

    $("tool-output").value = out;
    setStatus(t("tool.base32.status.encoded", { len: out.length }), false);
  }

  function runDecode() {
    const input = $("tool-input").value;
    const bytes = decodeBase32(input);
    const decoded = new TextDecoder().decode(bytes);
    $("tool-output").value = decoded;
    setStatus(t("tool.base32.status.decoded", { len: decoded.length }), false);
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
          setStatus(t("tool.base32.error.decode"), true);
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
