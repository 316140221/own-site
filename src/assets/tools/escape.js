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

  function toHex(value, width, upper) {
    const hex = value.toString(16).padStart(width, "0");
    return upper ? hex.toUpperCase() : hex.toLowerCase();
  }

  function escapeLegacy(input, upper) {
    const src = String(input || "");
    let out = "";
    for (let i = 0; i < src.length; i += 1) {
      const code = src.charCodeAt(i);
      const ch = src[i];
      const isAlphaNum =
        (code >= 48 && code <= 57) || (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
      const isSafe = isAlphaNum || "@*_+-./".includes(ch);

      if (isSafe) {
        out += ch;
      } else if (code < 256) {
        out += `%${toHex(code, 2, upper)}`;
      } else {
        out += `%u${toHex(code, 4, upper)}`;
      }
    }
    return out;
  }

  function unescapeLegacy(input) {
    return String(input || "")
      .replace(/%u([0-9a-fA-F]{4})/g, (_m, hex) => String.fromCharCode(Number.parseInt(hex, 16)))
      .replace(/%([0-9a-fA-F]{2})/g, (_m, hex) => String.fromCharCode(Number.parseInt(hex, 16)));
  }

  function runEncode() {
    const input = $("tool-input").value;
    const upper = $("opt-upper").checked;
    const out = escapeLegacy(input, upper);
    $("tool-output").value = out;
    setStatus(t("tool.escape.status.encoded", { len: out.length }), false);
  }

  function runDecode() {
    const input = $("tool-input").value;
    const out = unescapeLegacy(input);
    $("tool-output").value = out;
    setStatus(t("tool.escape.status.decoded", { len: out.length }), false);
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

