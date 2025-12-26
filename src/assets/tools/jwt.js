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

  function base64UrlToBytes(input) {
    const normalized = String(input || "").replace(/-/g, "+").replace(/_/g, "/");
    const pad = normalized.length % 4;
    const padded =
      pad === 0 ? normalized : pad === 2 ? `${normalized}==` : pad === 3 ? `${normalized}=` : normalized;
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function parseJwt(token) {
    const raw = String(token || "").trim();
    if (!raw) throw new Error(t("tool.jwt.error.empty"));
    const parts = raw.split(".");
    if (parts.length < 2) throw new Error(t("tool.jwt.error.format"));
    return { header: parts[0], payload: parts[1], signature: parts[2] || "" };
  }

  function decodeJsonPart(part, labelKey) {
    try {
      const bytes = base64UrlToBytes(part);
      const text = new TextDecoder().decode(bytes);
      const obj = JSON.parse(text);
      return JSON.stringify(obj, null, 2);
    } catch (_error) {
      throw new Error(t(labelKey));
    }
  }

  function runDecode() {
    const token = $("tool-input").value;
    const parsed = parseJwt(token);
    const header = decodeJsonPart(parsed.header, "tool.jwt.error.header");
    const payload = decodeJsonPart(parsed.payload, "tool.jwt.error.payload");

    $("tool-header").value = header;
    $("tool-payload").value = payload;

    const hasSig = Boolean(parsed.signature);
    setStatus(t(hasSig ? "tool.jwt.status.decodedSig" : "tool.jwt.status.decodedNoSig"), false);
  }

  function clearAll() {
    $("tool-input").value = "";
    $("tool-header").value = "";
    $("tool-payload").value = "";
    setStatus("", false);
  }

  function main() {
    try {
      $("btn-decode").addEventListener("click", () => {
        try {
          runDecode();
        } catch (error) {
          setStatus(error instanceof Error ? error.message : String(error), true);
        }
      });

      $("btn-clear").addEventListener("click", clearAll);
      $("btn-copy-payload").addEventListener("click", async () => {
        try {
          await copyToClipboard($("tool-payload").value);
          setStatus(t("tool.common.status.copied"), false);
        } catch (_error) {
          setStatus(t("tool.common.error.copy"), true);
        }
      });

      $("tool-input").addEventListener("input", () => {
        try {
          runDecode();
        } catch (_error) {
          // ignore while typing
        }
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  window.addEventListener("DOMContentLoaded", main);
})();
