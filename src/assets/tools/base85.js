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

  function encodeAscii85(bytes, useZ) {
    const input = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    const parts = [];
    for (let i = 0; i < input.length; i += 4) {
      const chunk = input.subarray(i, i + 4);
      const n = chunk.length;
      const b0 = chunk[0] || 0;
      const b1 = chunk[1] || 0;
      const b2 = chunk[2] || 0;
      const b3 = chunk[3] || 0;
      const value = (((b0 << 24) >>> 0) | (b1 << 16) | (b2 << 8) | b3) >>> 0;

      if (useZ && n === 4 && value === 0) {
        parts.push("z");
        continue;
      }

      const chars = new Array(5);
      let v = value;
      for (let j = 4; j >= 0; j -= 1) {
        chars[j] = String.fromCharCode((v % 85) + 33);
        v = Math.floor(v / 85);
      }

      const outLen = n < 4 ? n + 1 : 5;
      parts.push(chars.slice(0, outLen).join(""));
    }
    return parts.join("");
  }

  function decodeAscii85(text) {
    let src = String(text || "");
    src = src.replace(/\s+/g, "");
    if (!src) return new Uint8Array(0);
    if (src.startsWith("<~")) src = src.slice(2);
    if (src.endsWith("~>")) src = src.slice(0, -2);

    const out = [];
    let group = [];

    function pushValue(value, take) {
      if (!Number.isFinite(value) || value < 0 || value > 0xffffffff) {
        throw new Error(t("tool.base85.error.decode"));
      }
      const b0 = (value >>> 24) & 255;
      const b1 = (value >>> 16) & 255;
      const b2 = (value >>> 8) & 255;
      const b3 = value & 255;
      const bytes = [b0, b1, b2, b3];
      for (let i = 0; i < take; i += 1) out.push(bytes[i]);
    }

    function flushGroup(final) {
      if (!group.length) return;
      if (group.length === 1) throw new Error(t("tool.base85.error.decode"));

      const take = final ? group.length - 1 : 4;
      while (group.length < 5) group.push(84); // 'u' - 33

      let v = 0;
      for (const d of group) v = v * 85 + d;
      pushValue(v, take);
      group = [];
    }

    for (let i = 0; i < src.length; i += 1) {
      const ch = src[i];
      if (ch === "z") {
        if (group.length) throw new Error(t("tool.base85.error.decode"));
        out.push(0, 0, 0, 0);
        continue;
      }

      const code = ch.charCodeAt(0);
      if (code < 33 || code > 117) throw new Error(t("tool.base85.error.decode"));
      group.push(code - 33);

      if (group.length === 5) flushGroup(false);
    }

    flushGroup(true);
    return new Uint8Array(out);
  }

  function runEncode() {
    const input = $("tool-input").value;
    const useZ = $("opt-z").checked;
    const wrap = $("opt-delimiters").checked;

    const bytes = new TextEncoder().encode(String(input || ""));
    let out = encodeAscii85(bytes, useZ);
    if (wrap) out = `<~${out}~>`;
    $("tool-output").value = out;
    setStatus(t("tool.base85.status.encoded", { len: out.length }), false);
  }

  function runDecode() {
    const input = $("tool-input").value;
    const bytes = decodeAscii85(input);
    let decoded = "";
    try {
      decoded = new TextDecoder().decode(bytes);
    } catch (_error) {
      throw new Error(t("tool.base85.error.utf8"));
    }
    $("tool-output").value = decoded;
    setStatus(t("tool.base85.status.decoded", { len: decoded.length }), false);
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
        } catch (_error) {
          setStatus(t("tool.base85.error.decode"), true);
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

