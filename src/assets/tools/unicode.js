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
    const hex = Number(value).toString(16).padStart(width, "0");
    return upper ? hex.toUpperCase() : hex.toLowerCase();
  }

  function escapeText(input, opts) {
    const upper = Boolean(opts && opts.upper);
    const braces = Boolean(opts && opts.braces);
    const escapeAscii = Boolean(opts && opts.escapeAscii);

    let out = "";

    for (const ch of String(input || "")) {
      switch (ch) {
        case "\\":
          out += "\\\\";
          continue;
        case "\n":
          out += "\\n";
          continue;
        case "\r":
          out += "\\r";
          continue;
        case "\t":
          out += "\\t";
          continue;
        case "\b":
          out += "\\b";
          continue;
        case "\f":
          out += "\\f";
          continue;
        default:
          break;
      }

      const cp = ch.codePointAt(0);
      if (cp === undefined) continue;

      if (!escapeAscii && cp >= 0x20 && cp <= 0x7e) {
        out += ch;
        continue;
      }

      if (cp <= 0xffff) {
        out += `\\u${toHex(cp, 4, upper)}`;
        continue;
      }

      if (braces) {
        out += `\\u{${toHex(cp, 0, upper)}}`;
        continue;
      }

      const n = cp - 0x10000;
      const high = 0xd800 + (n >>> 10);
      const low = 0xdc00 + (n & 0x3ff);
      out += `\\u${toHex(high, 4, upper)}\\u${toHex(low, 4, upper)}`;
    }

    return out;
  }

  function isHex(s) {
    return /^[0-9a-fA-F]+$/.test(String(s || ""));
  }

  function unescapeText(input) {
    const src = String(input || "");
    let out = "";

    for (let i = 0; i < src.length; i += 1) {
      const ch = src[i];
      if (ch !== "\\") {
        out += ch;
        continue;
      }

      const next = src[i + 1] || "";
      if (!next) {
        out += "\\";
        continue;
      }

      if (next === "n") {
        out += "\n";
        i += 1;
        continue;
      }
      if (next === "r") {
        out += "\r";
        i += 1;
        continue;
      }
      if (next === "t") {
        out += "\t";
        i += 1;
        continue;
      }
      if (next === "b") {
        out += "\b";
        i += 1;
        continue;
      }
      if (next === "f") {
        out += "\f";
        i += 1;
        continue;
      }
      if (next === "v") {
        out += "\v";
        i += 1;
        continue;
      }
      if (next === "\\") {
        out += "\\";
        i += 1;
        continue;
      }
      if (next === "\"") {
        out += "\"";
        i += 1;
        continue;
      }
      if (next === "'") {
        out += "'";
        i += 1;
        continue;
      }

      if (next === "x") {
        const hex = src.slice(i + 2, i + 4);
        if (hex.length === 2 && isHex(hex)) {
          out += String.fromCharCode(Number.parseInt(hex, 16));
          i += 3;
          continue;
        }
      }

      if (next === "u") {
        if (src[i + 2] === "{") {
          const end = src.indexOf("}", i + 3);
          if (end !== -1) {
            const hex = src.slice(i + 3, end);
            if (hex && isHex(hex)) {
              const cp = Number.parseInt(hex, 16);
              out += String.fromCodePoint(cp);
              i = end;
              continue;
            }
          }
        }

        const hex = src.slice(i + 2, i + 6);
        if (hex.length === 4 && isHex(hex)) {
          out += String.fromCharCode(Number.parseInt(hex, 16));
          i += 5;
          continue;
        }
      }

      out += next;
      i += 1;
    }

    return out;
  }

  function runEscape() {
    const input = $("tool-input").value;
    const upper = $("opt-upper").checked;
    const braces = $("opt-braces").checked;
    const escapeAscii = $("opt-escape-ascii").checked;
    const out = escapeText(input, { upper, braces, escapeAscii });
    $("tool-output").value = out;
    setStatus(t("tool.unicode.status.escaped", { len: out.length }), false);
  }

  function runUnescape() {
    const input = $("tool-input").value;
    const out = unescapeText(input);
    $("tool-output").value = out;
    setStatus(t("tool.unicode.status.unescaped", { len: out.length }), false);
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
      $("btn-escape").addEventListener("click", () => {
        try {
          runEscape();
        } catch (error) {
          setStatus(error instanceof Error ? error.message : String(error), true);
        }
      });
      $("btn-unescape").addEventListener("click", () => {
        try {
          runUnescape();
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

