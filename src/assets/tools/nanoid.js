(function () {
  const PRESETS = {
    url: "_-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
    alnum: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
    hex: "0123456789abcdef",
    numeric: "0123456789",
  };

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

  function getRandomBytes(size) {
    const buf = new Uint8Array(size);
    if (crypto && crypto.getRandomValues) crypto.getRandomValues(buf);
    else for (let i = 0; i < buf.length; i += 1) buf[i] = Math.floor(Math.random() * 256);
    return buf;
  }

  function uniqueChars(input) {
    const out = [];
    const seen = new Set();
    for (const ch of String(input || "")) {
      if (seen.has(ch)) continue;
      seen.add(ch);
      out.push(ch);
    }
    return out.join("");
  }

  function nanoid(size, alphabet) {
    const chars = uniqueChars(alphabet);
    if (chars.length < 2) throw new Error(t("tool.nanoid.error.alphabet"));
    if (size <= 0) return "";

    const mask = (2 ** Math.ceil(Math.log2(chars.length)) - 1) >>> 0;
    const step = Math.ceil((1.6 * mask * size) / chars.length);

    let id = "";
    while (id.length < size) {
      const bytes = getRandomBytes(step);
      for (let i = 0; i < bytes.length && id.length < size; i += 1) {
        const idx = bytes[i] & mask;
        if (idx < chars.length) id += chars[idx];
      }
    }
    return id;
  }

  function readOptions() {
    const length = Number.parseInt($("opt-length").value, 10);
    const count = Number.parseInt($("opt-count").value, 10);
    const preset = String($("opt-preset").value || "url");
    const custom = $("opt-custom").value;

    if (!Number.isFinite(length) || length < 4 || length > 128) throw new Error(t("tool.nanoid.error.length"));
    if (!Number.isFinite(count) || count < 1 || count > 50) throw new Error(t("tool.nanoid.error.count"));

    let alphabet = PRESETS[preset] || PRESETS.url;
    if (preset === "custom") alphabet = custom || PRESETS.url;
    return { length, count, alphabet };
  }

  function runGenerate() {
    if (!crypto || !crypto.getRandomValues) throw new Error(t("tool.nanoid.error.unsupported"));

    const { length, count, alphabet } = readOptions();
    const ids = [];
    for (let i = 0; i < count; i += 1) ids.push(nanoid(length, alphabet));
    const out = ids.join("\n");
    $("tool-output").value = out;
    setStatus(t("tool.nanoid.status.done", { count, length }), false);
  }

  function clearAll() {
    $("tool-output").value = "";
    setStatus("", false);
  }

  function main() {
    try {
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
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  window.addEventListener("DOMContentLoaded", main);
})();

