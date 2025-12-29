(function () {
  const state = { scheduled: 0 };

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

  function formatBytes(bytes) {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let value = Number(bytes);
    if (!Number.isFinite(value) || value < 0) return "";
    let idx = 0;
    while (value >= 1024 && idx < units.length - 1) {
      value /= 1024;
      idx += 1;
    }
    const rounded = idx === 0 ? String(Math.round(value)) : value.toFixed(2);
    return `${rounded} ${units[idx]}`;
  }

  function getFile() {
    const input = $("tool-file");
    const file = input.files && input.files[0];
    return file || null;
  }

  function inferAlt(file) {
    const name = String(file?.name || "").trim();
    if (!name) return "";
    const idx = name.lastIndexOf(".");
    return idx > 0 ? name.slice(0, idx) : name;
  }

  function escapeAttr(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function buildOutput({ mode, dataUrl, base64, alt }) {
    const a = String(alt || "").trim();
    const safeAlt = escapeAttr(a);
    if (mode === "base64") return base64;
    if (mode === "html") return `<img src="${dataUrl}" alt="${safeAlt}">`;
    if (mode === "markdown") return `![${a} ](${dataUrl})`.replace(" ](", "](");
    if (mode === "css") return `background-image: url("${dataUrl}");`;
    return dataUrl;
  }

  function readAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error(t("tool.imageBase64.error.read")));
      reader.readAsDataURL(file);
    });
  }

  async function generate({ showErrors } = { showErrors: true }) {
    const file = getFile();
    if (!file) {
      $("tool-output").value = "";
      $("tool-file-meta").textContent = "";
      $("preview-image").removeAttribute("src");
      if (showErrors) setStatus(t("tool.imageBase64.error.noFile"), true);
      else setStatus("", false);
      return;
    }

    if (!String(file.type || "").startsWith("image/")) {
      setStatus(t("tool.imageBase64.error.noFile"), true);
      return;
    }

    setStatus(t("tool.imageBase64.status.working"), false);

    let dataUrl = "";
    try {
      dataUrl = await readAsDataUrl(file);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error), true);
      return;
    }

    const commaIdx = dataUrl.indexOf(",");
    const base64 = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
    const mode = String($("opt-mode").value || "dataUrl");
    const alt = String($("opt-alt").value || "").trim() || inferAlt(file);

    const out = buildOutput({ mode, dataUrl, base64, alt });
    $("tool-output").value = out;
    $("preview-image").src = dataUrl;
    $("preview-image").alt = alt || "";
    $("tool-file-meta").textContent = [file.name, formatBytes(file.size)].filter(Boolean).join(" · ");
    setStatus(t("tool.imageBase64.status.done", { len: out.length }), false);
  }

  function scheduleAutoGenerate() {
    window.clearTimeout(state.scheduled);
    state.scheduled = window.setTimeout(() => {
      void generate({ showErrors: false });
    }, 120);
  }

  function clearAll() {
    const input = $("tool-file");
    input.value = "";
    $("opt-alt").value = "";
    $("tool-output").value = "";
    $("tool-file-meta").textContent = "";
    $("preview-image").removeAttribute("src");
    setStatus("", false);
  }

  function main() {
    try {
      $("tool-file").addEventListener("change", scheduleAutoGenerate);
      $("opt-mode").addEventListener("change", scheduleAutoGenerate);
      $("opt-alt").addEventListener("input", scheduleAutoGenerate);

      $("btn-generate").addEventListener("click", async () => {
        try {
          await generate({ showErrors: true });
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

