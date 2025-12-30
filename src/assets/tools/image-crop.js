(function () {
  const state = {
    fileKey: "",
    img: null,
    srcW: 0,
    srcH: 0,
    originalUrl: "",
    outputUrl: "",
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

  function formatDims(w, h) {
    if (!w || !h) return "";
    return `${w}×${h}`;
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

  function clampInt(value, min, max) {
    const n = Number.parseInt(String(value ?? ""), 10);
    if (!Number.isFinite(n)) return null;
    return Math.min(max, Math.max(min, n));
  }

  function parsePositiveInt(value) {
    const n = Number.parseInt(String(value ?? ""), 10);
    if (!Number.isFinite(n) || n <= 0) return null;
    return n;
  }

  function clampNumber(value, min, max) {
    const n = Number.parseFloat(String(value ?? ""));
    if (!Number.isFinite(n)) return null;
    return Math.min(max, Math.max(min, n));
  }

  function isValidHexColor(value) {
    const v = String(value || "").trim();
    return /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(v);
  }

  function expandHexColor(value) {
    const v = String(value || "").trim();
    if (/^#[0-9a-fA-F]{6}$/.test(v)) return v;
    const m = v.match(/^#([0-9a-fA-F]{3})$/);
    if (!m) return v;
    const s = m[1];
    return `#${s[0]}${s[0]}${s[1]}${s[1]}${s[2]}${s[2]}`;
  }

  function extFromMime(mime) {
    const m = String(mime || "").toLowerCase();
    if (m === "image/jpeg") return "jpg";
    if (m === "image/webp") return "webp";
    if (m === "image/png") return "png";
    return "png";
  }

  function baseNameFromFileName(name) {
    const raw = String(name || "").trim();
    if (!raw) return "image";
    const idx = raw.lastIndexOf(".");
    return idx > 0 ? raw.slice(0, idx) : raw;
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

  function setQualityEnabled(mime) {
    const input = $("opt-quality");
    const enabled = mime === "image/jpeg" || mime === "image/webp";
    input.disabled = !enabled;
  }

  function readFile() {
    const input = $("tool-file");
    const file = input.files && input.files[0];
    if (!file) return null;
    return file;
  }

  function updateFileMeta(file) {
    const meta = $("tool-file-meta");
    if (!file) {
      meta.textContent = "";
      return;
    }
    const size = formatBytes(file.size);
    meta.textContent = size ? `${file.name} · ${size}` : file.name;
  }

  function roundRectPath(ctx, x, y, w, h, r) {
    const rr = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
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

  async function loadImage(file) {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.decoding = "async";
    const ok = new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(t("tool.imageCrop.error.decode")));
    });
    img.src = url;
    await ok;
    return { img, url };
  }

  function updateModeVisibility() {
    const mode = String($("opt-mode").value || "center");
    const ratioWrap = $("opt-ratio-wrap");
    const ratioW = $("opt-ratio-w-wrap");
    const ratioH = $("opt-ratio-h-wrap");

    const manualIds = ["opt-x-wrap", "opt-y-wrap", "opt-w-wrap", "opt-h-wrap"];
    const showManual = mode === "manual";
    for (const id of manualIds) {
      $(id).hidden = !showManual;
    }

    const showRatio = mode === "center";
    ratioWrap.hidden = !showRatio;
    const ratio = String($("opt-ratio").value || "free");
    const showCustom = showRatio && ratio === "custom";
    ratioW.hidden = !showCustom;
    ratioH.hidden = !showCustom;
  }

  function getCenterCropRect(srcW, srcH) {
    const ratioVal = String($("opt-ratio").value || "free");
    if (ratioVal === "free") return { x: 0, y: 0, w: srcW, h: srcH, label: "free" };

    let rw = 0;
    let rh = 0;
    if (ratioVal === "custom") {
      rw = parsePositiveInt($("opt-ratio-w").value) || 0;
      rh = parsePositiveInt($("opt-ratio-h").value) || 0;
    } else {
      const m = ratioVal.match(/^(\d+):(\d+)$/);
      if (m) {
        rw = Number.parseInt(m[1], 10);
        rh = Number.parseInt(m[2], 10);
      }
    }

    if (!rw || !rh) return { x: 0, y: 0, w: srcW, h: srcH, label: "free" };

    const target = rw / rh;
    const srcRatio = srcW / srcH;
    if (srcRatio > target) {
      const w = Math.max(1, Math.round(srcH * target));
      const x = Math.max(0, Math.round((srcW - w) / 2));
      return { x, y: 0, w, h: srcH, label: `${rw}:${rh}` };
    }
    const h = Math.max(1, Math.round(srcW / target));
    const y = Math.max(0, Math.round((srcH - h) / 2));
    return { x: 0, y, w: srcW, h, label: `${rw}:${rh}` };
  }

  function getManualRect(srcW, srcH) {
    const x = clampInt($("opt-x").value, 0, Math.max(0, srcW - 1));
    const y = clampInt($("opt-y").value, 0, Math.max(0, srcH - 1));
    if (x == null || y == null) throw new Error(t("tool.imageCrop.error.manual"));

    const w = clampInt($("opt-w").value, 1, Math.max(1, srcW - x));
    const h = clampInt($("opt-h").value, 1, Math.max(1, srcH - y));
    if (w == null || h == null) throw new Error(t("tool.imageCrop.error.manual"));
    return { x, y, w, h, label: "manual" };
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

  function cleanupOutput() {
    revokeUrl(state.outputUrl);
    state.outputUrl = "";
    const dl = $("btn-download");
    dl.hidden = true;
    dl.removeAttribute("href");
    $("preview-output").removeAttribute("src");
    $("meta-output").textContent = "";
  }

  function cleanupAll() {
    cleanupOutput();
    revokeUrl(state.originalUrl);
    state.originalUrl = "";
    state.img = null;
    state.srcW = 0;
    state.srcH = 0;
    $("preview-original").removeAttribute("src");
    $("meta-original").textContent = "";
    $("tool-file-meta").textContent = "";
  }

  async function ensureImageLoaded(file) {
    const key = fileKey(file);
    if (key && state.fileKey === key && state.img) return;

    const decoded = await loadImage(file);
    if (state.originalUrl && state.originalUrl !== decoded.url) revokeUrl(state.originalUrl);
    state.originalUrl = decoded.url;
    state.img = decoded.img;
    state.srcW = decoded.img.naturalWidth || 0;
    state.srcH = decoded.img.naturalHeight || 0;
    state.fileKey = key;

    $("preview-original").src = decoded.url;
    $("preview-original").alt = file.name || "";
    $("meta-original").textContent = [
      file.type || "image",
      formatDims(state.srcW, state.srcH),
      formatBytes(file.size),
    ]
      .filter(Boolean)
      .join(" · ");

    const w = Math.max(1, state.srcW);
    const h = Math.max(1, state.srcH);

    $("opt-x").value = "0";
    $("opt-y").value = "0";
    $("opt-w").value = String(w);
    $("opt-h").value = String(h);

    $("opt-x").max = String(Math.max(0, w - 1));
    $("opt-y").max = String(Math.max(0, h - 1));
    $("opt-w").max = String(w);
    $("opt-h").max = String(h);
  }

  async function run({ showErrors } = { showErrors: true }) {
    const file = readFile();
    if (!file) {
      if (showErrors) setStatus(t("tool.imageCrop.error.noFile"), true);
      else setStatus("", false);
      $("tool-output").value = "";
      cleanupAll();
      return;
    }

    if (!String(file.type || "").startsWith("image/")) {
      setStatus(t("tool.imageCrop.error.noFile"), true);
      return;
    }

    const token = (state.lastRunToken += 1);
    cleanupOutput();

    updateFileMeta(file);
    setStatus(t("tool.imageCrop.status.working"), false);

    try {
      await ensureImageLoaded(file);
    } catch (error) {
      if (token !== state.lastRunToken) return;
      setStatus(error instanceof Error ? error.message : String(error), true);
      return;
    }

    if (token !== state.lastRunToken) return;

    const outMime = resolveOutputMime(file, $("opt-format").value);
    setQualityEnabled(outMime);
    const quality = clampNumber($("opt-quality").value, 0.05, 1);

    const bgRaw = String($("opt-bg").value || "").trim();
    if (bgRaw && !isValidHexColor(bgRaw)) throw new Error(t("tool.imageCrop.error.color"));
    const bg = bgRaw ? expandHexColor(bgRaw) : "#ffffff";

    const mode = String($("opt-mode").value || "center");
    let crop;
    if (mode === "manual") crop = getManualRect(state.srcW, state.srcH);
    else if (mode === "full") crop = { x: 0, y: 0, w: state.srcW, h: state.srcH, label: "full" };
    else crop = getCenterCropRect(state.srcW, state.srcH);

    const maxW = $("opt-max-width").value;
    const maxH = $("opt-max-height").value;
    const target = computeTargetSize(crop.w, crop.h, maxW, maxH);
    if (!target.w || !target.h) throw new Error(t("tool.imageCrop.error.decode"));

    const radiusIn = clampInt($("opt-radius").value, 0, 100000) ?? 0;
    const radius = Math.min(radiusIn, Math.floor(Math.min(target.w, target.h) / 2));

    const canvas = document.createElement("canvas");
    canvas.width = target.w;
    canvas.height = target.h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error(t("tool.imageCrop.error.unsupported"));

    ctx.imageSmoothingEnabled = true;
    try {
      ctx.imageSmoothingQuality = "high";
    } catch (_error) {
      // ignore
    }

    if (outMime === "image/jpeg") {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, target.w, target.h);
    }

    ctx.save();
    if (radius > 0) {
      roundRectPath(ctx, 0, 0, target.w, target.h, radius);
      ctx.clip();
    }

    ctx.drawImage(
      state.img,
      crop.x,
      crop.y,
      crop.w,
      crop.h,
      0,
      0,
      target.w,
      target.h
    );
    ctx.restore();

    let blob = await canvasToBlob(canvas, outMime, quality);
    if (!blob && outMime !== "image/png") {
      blob = await canvasToBlob(canvas, "image/png", quality);
    }
    if (!blob) throw new Error(t("tool.imageCrop.error.unsupported"));

    if (token !== state.lastRunToken) return;

    const url = URL.createObjectURL(blob);
    state.outputUrl = url;
    $("preview-output").src = url;
    $("preview-output").alt = file.name || "";

    const base = baseNameFromFileName(file.name);
    const ext = extFromMime(blob.type || outMime);
    const outName = `${base}-crop.${ext}`;

    const dl = $("btn-download");
    dl.href = url;
    dl.download = outName;
    dl.hidden = false;

    $("meta-output").textContent = [
      blob.type || outMime,
      formatDims(target.w, target.h),
      formatBytes(blob.size),
    ]
      .filter(Boolean)
      .join(" · ");

    const lines = [];
    lines.push(`Original: ${file.name} · ${formatDims(state.srcW, state.srcH)} · ${formatBytes(file.size)}`);
    lines.push(`Crop: ${crop.label} · x=${crop.x}, y=${crop.y}, w=${crop.w}, h=${crop.h}`);
    lines.push(`Output: ${outName} · ${formatDims(target.w, target.h)} · ${formatBytes(blob.size)}`);
    if (radius > 0) lines.push(`Radius: ${radius}px`);
    $("tool-output").value = lines.join("\n");

    setStatus(t("tool.imageCrop.status.done"), false);
  }

  function scheduleAutoRun() {
    window.clearTimeout(state.scheduled);
    state.scheduled = window.setTimeout(() => {
      void run({ showErrors: false });
    }, 140);
  }

  function clearAll() {
    state.lastRunToken += 1;
    window.clearTimeout(state.scheduled);
    $("tool-file").value = "";
    $("tool-output").value = "";
    cleanupAll();
    setStatus("", false);
  }

  function main() {
    try {
      updateModeVisibility();

      $("opt-mode").addEventListener("change", () => {
        updateModeVisibility();
        scheduleAutoRun();
      });
      $("opt-ratio").addEventListener("change", () => {
        updateModeVisibility();
        scheduleAutoRun();
      });

      $("tool-file").addEventListener("change", () => {
        const file = readFile();
        if (!file) {
          clearAll();
          return;
        }
        scheduleAutoRun();
      });

      const autoIds = [
        "opt-ratio-w",
        "opt-ratio-h",
        "opt-x",
        "opt-y",
        "opt-w",
        "opt-h",
        "opt-radius",
        "opt-format",
        "opt-max-width",
        "opt-max-height",
        "opt-quality",
        "opt-bg",
      ];
      for (const id of autoIds) {
        $(id).addEventListener("input", scheduleAutoRun);
        $(id).addEventListener("change", scheduleAutoRun);
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

