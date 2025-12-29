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

  const SCHEME_RE = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

  function coerceUrl(raw) {
    const value = String(raw || "").trim();
    if (!value) return null;

    if (value.startsWith("/")) {
      try {
        return new URL(value, window.location.origin);
      } catch (_error) {
        return null;
      }
    }

    if (SCHEME_RE.test(value)) {
      try {
        return new URL(value);
      } catch (_error) {
        return null;
      }
    }

    if (value.startsWith("//")) {
      try {
        return new URL(`https:${value}`);
      } catch (_error) {
        return null;
      }
    }

    const looksLikeDomain = /^[\w.-]+\.[a-z]{2,}(?:[/:?#]|$)/i.test(value);
    if (looksLikeDomain) {
      try {
        return new URL(`https://${value}`);
      } catch (_error) {
        return null;
      }
    }

    return null;
  }

  function readText(id) {
    const el = $(id);
    if (!(el instanceof HTMLInputElement) && !(el instanceof HTMLTextAreaElement)) return "";
    return String(el.value || "").trim();
  }

  function setValueIfEmpty(id, value) {
    const el = document.getElementById(id);
    if (!(el instanceof HTMLInputElement) && !(el instanceof HTMLTextAreaElement)) return;
    if (String(el.value || "").trim()) return;
    el.value = String(value || "");
  }

  function parseCustomParams(raw) {
    const value = String(raw || "").trim();
    if (!value) return null;

    let input = value;
    if (input.startsWith("?")) input = input.slice(1);
    if (input.startsWith("&")) input = input.slice(1);

    try {
      return new URLSearchParams(input);
    } catch (_error) {
      return null;
    }
  }

  const UTM_FIELDS = [
    ["utm_source", "opt-source"],
    ["utm_medium", "opt-medium"],
    ["utm_campaign", "opt-campaign"],
    ["utm_term", "opt-term"],
    ["utm_content", "opt-content"],
  ];

  function prefillFromUrl(url) {
    if (!(url instanceof URL)) return;
    for (const [param, id] of UTM_FIELDS) {
      const v = url.searchParams.get(param);
      if (v) setValueIfEmpty(id, v);
    }
  }

  function buildOutput() {
    const baseInput = readText("tool-input");
    const url = coerceUrl(baseInput);
    if (!url) {
      $("tool-output").value = "";
      if (!baseInput) setStatus("", false);
      else setStatus(t("tool.utm.error.url"), true);
      return null;
    }

    prefillFromUrl(url);

    for (const [param, id] of UTM_FIELDS) {
      const v = readText(id);
      if (v) url.searchParams.set(param, v);
    }

    const customRaw = readText("opt-custom");
    const customParams = parseCustomParams(customRaw);
    if (customParams) {
      for (const [k, v] of customParams.entries()) {
        const key = String(k || "").trim();
        if (!key) continue;
        url.searchParams.set(key, String(v ?? ""));
      }
    }

    const out = url.toString();
    $("tool-output").value = out;
    setStatus(t("tool.utm.status.done"), false);
    return out;
  }

  function clearAll() {
    $("tool-input").value = "";
    $("tool-output").value = "";
    $("opt-source").value = "";
    $("opt-medium").value = "";
    $("opt-campaign").value = "";
    $("opt-term").value = "";
    $("opt-content").value = "";
    $("opt-custom").value = "";
    setStatus("", false);
  }

  function main() {
    try {
      const debounced = (() => {
        let handle = 0;
        return () => {
          if (handle) window.clearTimeout(handle);
          handle = window.setTimeout(() => {
            handle = 0;
            buildOutput();
          }, 60);
        };
      })();

      $("btn-generate").addEventListener("click", () => {
        try {
          buildOutput();
        } catch (error) {
          setStatus(error instanceof Error ? error.message : String(error), true);
        }
      });

      $("btn-clear").addEventListener("click", clearAll);

      $("btn-copy").addEventListener("click", async () => {
        try {
          const out = $("tool-output").value || "";
          if (!out.trim()) return;
          await copyToClipboard(out);
          setStatus(t("tool.common.status.copied"), false);
        } catch (_error) {
          setStatus(t("tool.common.error.copy"), true);
        }
      });

      $("btn-open").addEventListener("click", () => {
        const out = $("tool-output").value || "";
        const url = coerceUrl(out);
        if (!url) {
          setStatus(t("tool.utm.error.url"), true);
          return;
        }
        window.open(url.toString(), "_blank", "noopener,noreferrer");
      });

      ["tool-input", "opt-source", "opt-medium", "opt-campaign", "opt-term", "opt-content", "opt-custom"].forEach(
        (id) => {
          const el = document.getElementById(id);
          if (!el) return;
          el.addEventListener("input", debounced);
        }
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  window.addEventListener("DOMContentLoaded", main);
})();

