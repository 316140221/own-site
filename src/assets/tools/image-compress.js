(function () {
  const state = {
    originalUrl: null,
    outputUrl: null,
    lastFileKey: null,
    lastRunToken: 0,
    scheduled: 0,
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

  function clampNumber(value, min, max) {
    const n = Number.parseFloat(String(value ?? ""));
    if (!Number.isFinite(n)) return null;
    return Math.min(max, Math.max(min, n));
  }

  function parsePositiveInt(value) {
    const n = Number.parseInt(String(value ?? ""), 10);
    if (!Number.isFinite(n) || n <= 0) return null;
    return n;
  }

  function formatDims(w, h) {
    if (!w || !h) return "";
    return `${w}×${h}`;
  }

  function extFromMime(mime) {
    const m = String(mime || "").toLowerCase();
    if (m === "image/jpeg") return "jpg";
    if (m === "image/webp") return "webp";
    if (m === "image/png") return "png";
    return "";
  }

  function baseNameFromFileName(name) {
    const raw = String(name || "").trim();
    if (!raw) return "image";
    const idx = raw.lastIndexOf(".");
    return idx > 0 ? raw.slice(0, idx) : raw;
  }

  function fileKey(file) {
    if (!file) return "";
    return `${file.name}::${file.size}::${file.lastModified}::${file.type}`;
  }

  function revokeUrl(url) {
    if (!url) return;
    try {
      URL.revokeObjectURL(url);
    } catch (_error) {
      // ignore
    }
  }

  function cleanupOutput() {
    revokeUrl(state.outputUrl);
    state.outputUrl = null;
    const dl = $("btn-download");
    dl.hidden = true;
    dl.removeAttribute("href");
    $("preview-output").removeAttribute("src");
    $("meta-output").textContent = "";
  }

  function cleanupAll() {
    cleanupOutput();
    revokeUrl(state.originalUrl);
    state.originalUrl = null;
    $("preview-original").removeAttribute("src");
    $("meta-original").textContent = "";
    $("tool-file-meta").textContent = "";
  }

  function getFile() {
    const input = $("tool-file");
    const file = input.files && input.files[0];
    return file || null;
  }

  function updateFileMeta(file, dimsText) {
    const meta = $("tool-file-meta");
    if (!file) {
      meta.textContent = "";
      return;
    }
    const size = formatBytes(file.size);
    const parts = [file.name];
    if (size) parts.push(size);
    if (dimsText) parts.push(dimsText);
    meta.textContent = parts.join(" · ");
  }

  function resolveOutputMime(file, formatValue) {
    const fmt = String(formatValue || "keep").toLowerCase();
    if (fmt === "jpeg") return "image/jpeg";
    if (fmt === "webp") return "image/webp";
    if (fmt === "png") return "image/png";

    const type = String(file?.type || "").toLowerCase();
    if (type === "image/jpeg" || type === "image/webp" || type === "image/png") return type;
    return "image/png";
  }

  function computeTargetSize(srcW, srcH, maxW, maxH) {
    let w = srcW;
    let h = srcH;

    if (!srcW || !srcH) return { w: 0, h: 0, scale: 1 };

    const limitW = parsePositiveInt(maxW);
    const limitH = parsePositiveInt(maxH);
    if (!limitW && !limitH) return { w, h, scale: 1 };

    const ratioW = limitW ? limitW / srcW : Number.POSITIVE_INFINITY;
    const ratioH = limitH ? limitH / srcH : Number.POSITIVE_INFINITY;
    const scale = Math.min(ratioW, ratioH, 1);
    w = Math.max(1, Math.round(srcW * scale));
    h = Math.max(1, Math.round(srcH * scale));
    return { w, h, scale };
  }

  function canvasToBlob(canvas, mime, quality) {
    return new Promise((resolve) => {
      try {
        canvas.toBlob(
          (blob) => resolve(blob || null),
          mime,
          typeof quality === "number" ? quality : undefined
        );
      } catch (_error) {
        resolve(null);
      }
    });
  }

  async function loadImage(file) {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.decoding = "async";
    const ok = new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(t("tool.imageCompress.error.decode")));
    });
    img.src = url;
    await ok;
    return { img, url };
  }

  function setQualityEnabled(mime) {
    const input = $("opt-quality");
    const enabled = mime === "image/jpeg" || mime === "image/webp";
    input.disabled = !enabled;
  }

  async function run({ showErrors } = { showErrors: true }) {
    const file = getFile();
    if (!file) {
      if (showErrors) setStatus(t("tool.imageCompress.error.noFile"), true);
      else setStatus("", false);
      $("tool-output").value = "";
      cleanupAll();
      return;
    }

    if (!String(file.type || "").startsWith("image/")) {
      setStatus(t("tool.imageCompress.error.noFile"), true);
      return;
    }

    const currentKey = fileKey(file);
    const token = (state.lastRunToken += 1);

    cleanupOutput();

    const fmt = String($("opt-format").value || "keep");
    const outMime = resolveOutputMime(file, fmt);
    setQualityEnabled(outMime);

    const quality = clampNumber($("opt-quality").value, 0.05, 1);

    setStatus(t("tool.imageCompress.status.working"), false);

    let decoded;
    try {
      decoded = await loadImage(file);
    } catch (error) {
      if (token !== state.lastRunToken) return;
      setStatus(error instanceof Error ? error.message : String(error), true);
      return;
    }

    if (token !== state.lastRunToken) {
      revokeUrl(decoded.url);
      return;
    }

    const srcW = decoded.img.naturalWidth || 0;
    const srcH = decoded.img.naturalHeight || 0;
    const dimsText = formatDims(srcW, srcH);

    updateFileMeta(file, dimsText);

    if (state.originalUrl && state.originalUrl !== decoded.url) revokeUrl(state.originalUrl);
    state.originalUrl = decoded.url;
    state.lastFileKey = currentKey;

    $("preview-original").src = decoded.url;
    $("preview-original").alt = file.name || "";
    $("meta-original").textContent = [
      file.type || "image",
      dimsText,
      formatBytes(file.size),
    ]
      .filter(Boolean)
      .join(" · ");

    const { w: targetW, h: targetH, scale } = computeTargetSize(
      srcW,
      srcH,
      $("opt-max-width").value,
      $("opt-max-height").value
    );

    if (!targetW || !targetH) {
      setStatus(t("tool.imageCompress.error.decode"), true);
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setStatus(t("tool.imageCompress.error.unsupported"), true);
      return;
    }

    ctx.imageSmoothingEnabled = true;
    try {
      ctx.imageSmoothingQuality = "high";
    } catch (_error) {
      // ignore
    }

    if (outMime === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, targetW, targetH);
    }

    ctx.drawImage(decoded.img, 0, 0, targetW, targetH);

    let blob = await canvasToBlob(canvas, outMime, quality);
    if (!blob && outMime !== "image/png") {
      blob = await canvasToBlob(canvas, "image/png", quality);
    }
    if (!blob) {
      setStatus(t("tool.imageCompress.error.unsupported"), true);
      return;
    }

    if (token !== state.lastRunToken) return;

    const outputUrl = URL.createObjectURL(blob);
    state.outputUrl = outputUrl;
    $("preview-output").src = outputUrl;
    $("preview-output").alt = file.name || "";

    const outExt = extFromMime(blob.type || outMime) || extFromMime(outMime) || "png";
    const base = baseNameFromFileName(file.name);
    const dimsSuffix = scale < 1 ? `-${targetW}x${targetH}` : "";
    const outName = `${base}${dimsSuffix}.${outExt}`;

    const dl = $("btn-download");
    dl.href = outputUrl;
    dl.download = outName;
    dl.hidden = false;

    const savedBytes = file.size - blob.size;
    const savedRatio = file.size > 0 ? savedBytes / file.size : 0;
    const savedPct = Math.round(savedRatio * 100);

    $("meta-output").textContent = [
      blob.type || outMime,
      formatDims(targetW, targetH),
      formatBytes(blob.size),
    ]
      .filter(Boolean)
      .join(" · ");

    const lines = [];
    lines.push(`Original: ${file.name} · ${file.type || "image"} · ${dimsText} · ${formatBytes(file.size)}`);
    lines.push(
      `Output: ${outName} · ${blob.type || outMime} · ${formatDims(targetW, targetH)} · ${formatBytes(blob.size)}`
    );
    if (savedBytes > 0) lines.push(`Saved: ${formatBytes(savedBytes)} (~${savedPct}%)`);
    $("tool-output").value = lines.join("\n");

    setStatus(t("tool.imageCompress.status.done", { saved: savedPct }), false);
  }

  function scheduleAutoRun() {
    window.clearTimeout(state.scheduled);
    state.scheduled = window.setTimeout(() => {
      void run({ showErrors: false });
    }, 120);
  }

  function clearAll() {
    state.lastRunToken += 1;
    const input = $("tool-file");
    input.value = "";
    $("tool-output").value = "";
    $("meta-output").textContent = "";
    $("meta-original").textContent = "";
    cleanupAll();
    setStatus("", false);
  }

  function main() {
    try {
      const fileInput = $("tool-file");
      const formatEl = $("opt-format");
      const maxWEl = $("opt-max-width");
      const maxHEl = $("opt-max-height");
      const qualityEl = $("opt-quality");

      fileInput.addEventListener("change", () => {
        const file = getFile();
        if (!file) {
          clearAll();
          return;
        }
        scheduleAutoRun();
      });

      for (const el of [formatEl, maxWEl, maxHEl, qualityEl]) {
        el.addEventListener("input", scheduleAutoRun);
        el.addEventListener("change", scheduleAutoRun);
      }

      $("btn-run").addEventListener("click", async () => {
        try {
          await run({ showErrors: true });
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

