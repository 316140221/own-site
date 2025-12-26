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

  function readFlags() {
    const flags = [];
    if ($("flag-g").checked) flags.push("g");
    if ($("flag-i").checked) flags.push("i");
    if ($("flag-m").checked) flags.push("m");
    if ($("flag-s").checked) flags.push("s");
    if ($("flag-u").checked) flags.push("u");
    if ($("flag-y").checked) flags.push("y");
    return flags.join("");
  }

  function readRegex() {
    const pattern = $("opt-pattern").value;
    if (!pattern) throw new Error(t("tool.regex.error.pattern"));
    const flags = readFlags();
    try {
      return new RegExp(pattern, flags);
    } catch (_error) {
      throw new Error(t("tool.regex.error.compile"));
    }
  }

  function runFind() {
    const text = $("tool-input").value;
    const re = readRegex();
    const pretty = $("opt-pretty").checked;

    if (!re.global) {
      const m = re.exec(text);
      const result = {
        global: false,
        matched: Boolean(m),
        match: m ? m[0] : null,
        index: m ? m.index : null,
        groups: m && m.groups ? m.groups : null,
        captures: m ? Array.from(m).slice(1) : [],
      };
      const out = pretty ? JSON.stringify(result, null, 2) : JSON.stringify(result);
      $("tool-output").value = out;
      setStatus(t("tool.regex.status.done", { count: m ? 1 : 0 }), false);
      return;
    }

    const matches = [];
    let m;
    while ((m = re.exec(text))) {
      matches.push({
        index: m.index,
        match: m[0],
        groups: m.groups || null,
        captures: Array.from(m).slice(1),
      });
      if (m[0] === "") re.lastIndex += 1;
    }

    const result = { global: true, count: matches.length, matches };
    const out = pretty ? JSON.stringify(result, null, 2) : JSON.stringify(result);
    $("tool-output").value = out;
    setStatus(t("tool.regex.status.done", { count: matches.length }), false);
  }

  function runReplace() {
    const text = $("tool-input").value;
    const re = readRegex();
    const replacement = $("opt-replacement").value;
    const out = text.replace(re, replacement);
    $("tool-output").value = out;
    setStatus(t("tool.regex.status.replaced", { len: out.length }), false);
  }

  function clearAll() {
    $("tool-input").value = "";
    $("tool-output").value = "";
    setStatus("", false);
  }

  function main() {
    try {
      $("btn-find").addEventListener("click", () => {
        try {
          runFind();
        } catch (error) {
          setStatus(error instanceof Error ? error.message : String(error), true);
        }
      });
      $("btn-replace").addEventListener("click", () => {
        try {
          runReplace();
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

