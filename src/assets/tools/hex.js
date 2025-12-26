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

  function toHex(bytes, uppercase) {
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return uppercase ? hex.toUpperCase() : hex.toLowerCase();
  }

  function formatHex(hex, opts) {
    const spaced = Boolean(opts && opts.spaces);
    const prefix = Boolean(opts && opts.prefix);
    if (!spaced && !prefix) return hex;
    const pairs = hex.match(/[0-9a-fA-F]{2}/g) || [];
    if (prefix) return pairs.map((p) => `0x${p}`).join(" ");
    return pairs.join(" ");
  }

  function normalizeHexInput(input) {
    const raw = String(input || "").trim();
    const stripped = raw.replace(/0x/gi, "").replace(/\\x/gi, "");
    const cleaned = stripped.replace(/[^0-9a-fA-F]/g, "");
    return cleaned;
  }

  function hexToBytes(hex) {
    const cleaned = normalizeHexInput(hex);
    if (!cleaned) return new Uint8Array();
    if (cleaned.length % 2 !== 0) throw new Error(t("tool.hex.error.oddLength"));
    if (!/^[0-9a-fA-F]+$/.test(cleaned)) throw new Error(t("tool.hex.error.invalid"));

    const bytes = new Uint8Array(cleaned.length / 2);
    for (let i = 0; i < cleaned.length; i += 2) {
      bytes[i / 2] = Number.parseInt(cleaned.slice(i, i + 2), 16);
    }
    return bytes;
  }

  function decodeUtf8(bytes) {
    try {
      return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch (_error) {
      throw new Error(t("tool.hex.error.utf8"));
    }
  }

  function runEncode() {
    const input = $("tool-input").value;
    const uppercase = $("opt-uppercase").checked;
    const spaces = $("opt-spaces").checked;
    const prefix = $("opt-prefix").checked;

    const bytes = new TextEncoder().encode(String(input || ""));
    const hex = toHex(bytes, uppercase);
    const out = formatHex(hex, { spaces: spaces || prefix, prefix });

    $("tool-output").value = out;
    setStatus(t("tool.hex.status.encoded", { len: out.length }), false);
  }

  function runDecode() {
    const input = $("tool-input").value;
    const bytes = hexToBytes(input);
    const out = decodeUtf8(bytes);
    $("tool-output").value = out;
    setStatus(t("tool.hex.status.decoded", { len: out.length }), false);
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

