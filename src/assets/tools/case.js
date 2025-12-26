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

  function splitWords(input) {
    const raw = String(input || "");
    const normalized = raw
      .replace(/[_\-./\\]+/g, " ")
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
      .replace(/([a-zA-Z])([0-9])/g, "$1 $2")
      .replace(/([0-9])([a-zA-Z])/g, "$1 $2");

    return normalized
      .trim()
      .split(/\s+/g)
      .map((w) => w.trim())
      .filter(Boolean);
  }

  function capitalize(word) {
    const w = String(word || "");
    if (!w) return "";
    return w.slice(0, 1).toUpperCase() + w.slice(1).toLowerCase();
  }

  function convert(input, mode) {
    const words = splitWords(input);
    if (!words.length) return "";

    const lowerWords = words.map((w) => w.toLowerCase());
    const upperWords = words.map((w) => w.toUpperCase());

    switch (String(mode || "camel")) {
      case "camel": {
        const [first, ...rest] = lowerWords;
        return [first, ...rest.map(capitalize)].join("");
      }
      case "pascal":
        return lowerWords.map(capitalize).join("");
      case "snake":
        return lowerWords.join("_");
      case "kebab":
        return lowerWords.join("-");
      case "constant":
        return upperWords.join("_");
      case "title":
        return lowerWords.map(capitalize).join(" ");
      case "lower":
        return lowerWords.join(" ");
      case "upper":
        return upperWords.join(" ");
      default:
        return lowerWords.map(capitalize).join(" ");
    }
  }

  function runConvert() {
    const input = $("tool-input").value;
    const mode = $("opt-mode").value || "camel";
    const out = convert(input, mode);
    $("tool-output").value = out;
    setStatus(t("tool.case.status.done", { len: out.length }), false);
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
      $("opt-mode").addEventListener("change", () => {
        try {
          runConvert();
        } catch (_error) {
          // ignore
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

