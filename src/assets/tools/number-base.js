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

  function charToDigit(ch) {
    const code = ch.charCodeAt(0);
    if (code >= 48 && code <= 57) return code - 48;
    if (code >= 65 && code <= 90) return code - 65 + 10;
    if (code >= 97 && code <= 122) return code - 97 + 10;
    return -1;
  }

  function parseBigInt(input, base) {
    const raw = String(input || "").trim();
    if (!raw) throw new Error(t("tool.numberBase.error.empty"));

    let s = raw.replace(/[\s_]/g, "");
    let sign = 1n;
    if (s.startsWith("-")) {
      sign = -1n;
      s = s.slice(1);
    }
    if (!s) throw new Error(t("tool.numberBase.error.invalid"));

    let b = base;
    if (b === "auto") {
      const lowered = s.toLowerCase();
      if (lowered.startsWith("0x")) {
        b = 16;
        s = s.slice(2);
      } else if (lowered.startsWith("0b")) {
        b = 2;
        s = s.slice(2);
      } else if (lowered.startsWith("0o")) {
        b = 8;
        s = s.slice(2);
      } else {
        b = 10;
      }
    }

    const baseNum = Number.parseInt(String(b), 10);
    if (!Number.isFinite(baseNum) || baseNum < 2 || baseNum > 36) throw new Error(t("tool.numberBase.error.base"));

    let value = 0n;
    for (const ch of s) {
      const d = charToDigit(ch);
      if (d < 0 || d >= baseNum) throw new Error(t("tool.numberBase.error.invalid"));
      value = value * BigInt(baseNum) + BigInt(d);
    }
    return sign * value;
  }

  function formatWithPrefix(value, base, upper, prefix) {
    const baseNum = Number.parseInt(String(base), 10);
    const neg = value < 0n;
    const abs = neg ? -value : value;
    let text = abs.toString(baseNum);
    if (upper) text = text.toUpperCase();

    let p = "";
    if (prefix) {
      if (baseNum === 16) p = "0x";
      else if (baseNum === 2) p = "0b";
      else if (baseNum === 8) p = "0o";
    }
    return `${neg ? "-" : ""}${p}${text}`;
  }

  function runConvert() {
    const input = $("tool-input").value;
    const from = $("opt-from").value;
    const to = $("opt-to").value;
    const upper = $("opt-upper").checked;
    const prefix = $("opt-prefix").checked;

    const value = parseBigInt(input, from);
    const out = formatWithPrefix(value, to, upper, prefix);
    $("tool-output").value = out;
    setStatus(t("tool.numberBase.status.done", { len: out.length }), false);
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
      $("btn-convert").addEventListener("click", () => {
        try {
          runConvert();
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

