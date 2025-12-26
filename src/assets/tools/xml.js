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

  function readIndent() {
    const raw = $("opt-indent").value;
    if (raw === "tab") return "\t";
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n) || n <= 0) return "  ";
    return " ".repeat(n);
  }

  function parseXml(text) {
    const raw = String(text || "").trim();
    if (!raw) throw new Error(t("tool.xml.error.empty"));
    const parser = new DOMParser();
    const doc = parser.parseFromString(raw, "application/xml");
    if (doc.getElementsByTagName("parsererror").length) {
      throw new Error(t("tool.xml.error.parse"));
    }
    const serializer = new XMLSerializer();
    return serializer.serializeToString(doc);
  }

  function prettyFormatXml(xml, indent) {
    const src = String(xml || "")
      .replace(/>\s+</g, "><")
      .replace(/(>)(<)(\\/?)/g, "$1\n$2$3")
      .trim();

    const lines = src.split("\n").map((l) => l.trim()).filter(Boolean);
    let pad = 0;
    const out = [];

    for (const line of lines) {
      const isClosing = /^<\\//.test(line);
      const isDeclaration = /^<\\?/.test(line) || /^<!/.test(line);
      const isSelfClosing = /\\/>$/.test(line);
      const isOpening = /^<[^!?\\/][^>]*>$/.test(line) && !isSelfClosing && !line.includes("</");

      if (isClosing) pad = Math.max(0, pad - 1);
      out.push(`${indent.repeat(pad)}${line}`);
      if (isOpening && !isDeclaration) pad += 1;
    }

    return out.join("\n");
  }

  function minifyXml(xml) {
    return String(xml || "").replace(/>\s+</g, "><").trim();
  }

  function runFormat() {
    const input = $("tool-input").value;
    const xml = parseXml(input);
    const indent = readIndent();
    const out = prettyFormatXml(xml, indent);
    $("tool-output").value = out;
    setStatus(t("tool.xml.status.formatted", { len: out.length }), false);
  }

  function runMinify() {
    const input = $("tool-input").value;
    const xml = parseXml(input);
    const out = minifyXml(xml);
    $("tool-output").value = out;
    setStatus(t("tool.xml.status.minified", { len: out.length }), false);
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
      $("btn-format").addEventListener("click", () => {
        try {
          runFormat();
        } catch (error) {
          setStatus(error instanceof Error ? error.message : String(error), true);
        }
      });
      $("btn-minify").addEventListener("click", () => {
        try {
          runMinify();
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

