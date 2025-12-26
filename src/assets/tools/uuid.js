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

  function randomUuidV4() {
    if (!globalThis.crypto) {
      throw new Error(t("tool.uuid.error.unsupported"));
    }

    if (typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }

    if (!crypto.getRandomValues) {
      throw new Error(t("tool.uuid.error.unsupported"));
    }

    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(
      16,
      20
    )}-${hex.slice(20)}`;
  }

  function formatUuid(uuid, opts) {
    const upper = Boolean(opts && opts.upper);
    const noHyphens = Boolean(opts && opts.noHyphens);
    const braces = Boolean(opts && opts.braces);

    let out = String(uuid || "");
    if (noHyphens) out = out.replace(/-/g, "");
    if (upper) out = out.toUpperCase();
    if (braces) out = `{${out}}`;
    return out;
  }

  function readCount() {
    const raw = Number.parseInt($("opt-count").value, 10);
    if (!Number.isFinite(raw)) return 1;
    return Math.min(100, Math.max(1, raw));
  }

  function runGenerate() {
    const count = readCount();
    const opts = {
      upper: $("opt-uppercase").checked,
      noHyphens: $("opt-no-hyphens").checked,
      braces: $("opt-braces").checked,
    };

    const list = Array.from({ length: count }, () => formatUuid(randomUuidV4(), opts));
    const out = list.join("\n");
    $("tool-output").value = out;
    setStatus(t("tool.uuid.status.done", { count }), false);
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
      runGenerate();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  window.addEventListener("DOMContentLoaded", main);
})();
