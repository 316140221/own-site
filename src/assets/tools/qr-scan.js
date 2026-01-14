(function () {
  const MAX_SCAN_DIM = 1280;

  const state = {
    imageUrl: null,
    stream: null,
    scanning: false,
    scanTimer: 0,
    detector: null,
    lastOutput: "",
    barcodeSupported: null,
    jsqrPromise: null,
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

  function revokeUrl(url) {
    if (!url) return;
    try {
      URL.revokeObjectURL(url);
    } catch (_error) {
      // ignore
    }
  }

  function stopTimer() {
    if (state.scanTimer) window.clearTimeout(state.scanTimer);
    state.scanTimer = 0;
  }

  function createDetector() {
    if (!("BarcodeDetector" in window)) return null;
    try {
      // eslint-disable-next-line no-undef
      return new BarcodeDetector({ formats: ["qr_code"] });
    } catch (_error) {
      try {
        // eslint-disable-next-line no-undef
        return new BarcodeDetector();
      } catch (_error2) {
        return null;
      }
    }
  }

  async function supportsBarcodeDetector() {
    if (state.barcodeSupported !== null) return state.barcodeSupported;
    if (!("BarcodeDetector" in window)) {
      state.barcodeSupported = false;
      return false;
    }

    try {
      // eslint-disable-next-line no-undef
      if (typeof BarcodeDetector.getSupportedFormats === "function") {
        // eslint-disable-next-line no-undef
        const formats = await BarcodeDetector.getSupportedFormats();
        state.barcodeSupported = Array.isArray(formats) && formats.includes("qr_code");
        return state.barcodeSupported;
      }
    } catch (_error) {
      // ignore
    }

    const detector = createDetector();
    state.barcodeSupported = Boolean(detector);
    return state.barcodeSupported;
  }

  function loadJsQr() {
    if (typeof window.jsQR === "function") return Promise.resolve(window.jsQR);
    if (state.jsqrPromise) return state.jsqrPromise;

    state.jsqrPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector("script[data-jsqr-vendor]");
      if (existing) {
        existing.addEventListener("load", () => resolve(window.jsQR));
        existing.addEventListener("error", () => reject(new Error(t("tool.qrScan.error.vendor"))));
        return;
      }

      const script = document.createElement("script");
      script.src =
        typeof resolveSitePath === "function"
          ? resolveSitePath("/assets/vendor/jsqr.js")
          : "/assets/vendor/jsqr.js";
      script.async = true;
      script.dataset.jsqrVendor = "jsqr";
      script.onload = () => {
        if (typeof window.jsQR === "function") resolve(window.jsQR);
        else reject(new Error(t("tool.qrScan.error.vendor")));
      };
      script.onerror = () => reject(new Error(t("tool.qrScan.error.vendor")));
      document.head.appendChild(script);
    });

    return state.jsqrPromise;
  }

  function setPreviewMode(mode) {
    const img = $("preview-image");
    const video = $("preview-video");

    if (mode === "image") {
      img.hidden = false;
      video.hidden = true;
      video.pause();
      video.removeAttribute("src");
      video.srcObject = null;
      return;
    }

    if (mode === "video") {
      img.hidden = true;
      img.removeAttribute("src");
      video.hidden = false;
      return;
    }

    img.hidden = true;
    img.removeAttribute("src");
    video.hidden = true;
    video.pause();
    video.removeAttribute("src");
    video.srcObject = null;
  }

  function setFileMeta(file) {
    const el = $("tool-file-meta");
    if (!file) {
      el.textContent = "";
      return;
    }
    const parts = [];
    if (file.name) parts.push(file.name);
    if (Number.isFinite(file.size)) parts.push(formatBytes(file.size));
    el.textContent = parts.filter(Boolean).join(" · ");
  }

  function clampScanSize(w, h) {
    const width = Number(w);
    const height = Number(h);
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      return { w: 1, h: 1, scale: 1 };
    }

    const maxDim = Math.max(width, height);
    const scale = maxDim > MAX_SCAN_DIM ? MAX_SCAN_DIM / maxDim : 1;
    return {
      w: Math.max(1, Math.round(width * scale)),
      h: Math.max(1, Math.round(height * scale)),
      scale,
    };
  }

  function drawToCanvas(source) {
    const canvas = $("scan-canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error(t("tool.qrScan.error.canvas"));

    const w =
      source instanceof HTMLVideoElement ? source.videoWidth : source.naturalWidth || source.width;
    const h =
      source instanceof HTMLVideoElement ? source.videoHeight : source.naturalHeight || source.height;
    const size = clampScanSize(w, h);

    canvas.width = size.w;
    canvas.height = size.h;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    return { canvas, ctx };
  }

  async function decodeFromSource(source, multi) {
    const canBarcode = await supportsBarcodeDetector();
    if (canBarcode) {
      const detector = state.detector || createDetector();
      state.detector = detector;
      if (!detector) throw new Error(t("tool.qrScan.error.unsupported"));
      const results = await detector.detect(source);
      if (!Array.isArray(results)) return [];
      const out = multi ? results : results.slice(0, 1);
      return out
        .map((r) => ({ rawValue: r && r.rawValue ? String(r.rawValue) : "" }))
        .filter((r) => r.rawValue);
    }

    const jsQR = await loadJsQr();
    const { canvas, ctx } = drawToCanvas(source);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height, {
      inversionAttempts: "attemptBoth",
    });
    if (!code || !code.data) return [];
    return [{ rawValue: String(code.data) }];
  }

  function uniqueStrings(list) {
    const out = [];
    const seen = new Set();
    for (const item of list) {
      const value = String(item || "").trim();
      if (!value || seen.has(value)) continue;
      seen.add(value);
      out.push(value);
    }
    return out;
  }

  function resolveOpenUrl(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    try {
      const url = new URL(raw);
      const protocol = String(url.protocol || "").toLowerCase();
      if (protocol === "http:" || protocol === "https:") return url.toString();
    } catch (_error) {
      // ignore
    }
    return "";
  }

  function setOpenLink(url) {
    const btn = document.getElementById("btn-open");
    if (!(btn instanceof HTMLAnchorElement)) return;
    const resolved = resolveOpenUrl(url);
    if (!resolved) {
      btn.hidden = true;
      btn.removeAttribute("href");
      return;
    }
    btn.href = resolved;
    btn.hidden = false;
  }

  function setOutput(values) {
    const out = uniqueStrings(values);
    const text = out.join("\n");
    $("tool-output").value = text;
    state.lastOutput = text;
    setOpenLink(out[0] || "");
    return out.length;
  }

  async function loadFilePreview(file) {
    revokeUrl(state.imageUrl);
    state.imageUrl = null;

    const img = $("preview-image");
    setPreviewMode("image");

    const url = URL.createObjectURL(file);
    state.imageUrl = url;

    await new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(t("tool.qrScan.error.decode")));
      img.src = url;
    });

    return img;
  }

  async function runFileScan() {
    const fileInput = $("tool-file");
    const file = fileInput.files && fileInput.files[0];
    if (!file) throw new Error(t("tool.qrScan.error.noFile"));

    await stopCamera();
    setFileMeta(file);

    setStatus(t("tool.qrScan.status.working"), false);
    const img = await loadFilePreview(file);
    const multi = $("opt-multi").checked;

    const results = await decodeFromSource(img, multi);
    const count = setOutput(results.map((r) => r.rawValue));
    if (!count) {
      setStatus(t("tool.qrScan.status.none"), false);
      return;
    }

    setStatus(t("tool.qrScan.status.done", { count }), false);
  }

  function setCameraButtons(isRunning) {
    $("btn-start").disabled = Boolean(isRunning);
    $("btn-stop").disabled = !isRunning;
  }

  async function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(t("tool.qrScan.error.camera"));
    }

    const supported = await supportsBarcodeDetector();
    if (!supported) await loadJsQr();

    await stopCamera();

    const video = $("preview-video");
    setPreviewMode("video");
    setCameraButtons(true);
    setStatus(t("tool.qrScan.status.camera"), false);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false,
    });
    state.stream = stream;
    video.srcObject = stream;

    try {
      await video.play();
    } catch (_error) {
      // ignore; some browsers need user gesture
    }

    state.scanning = true;
    state.lastOutput = "";

    const loop = async () => {
      if (!state.scanning) return;
      stopTimer();

      try {
        const multi = $("opt-multi").checked;
        const results = await decodeFromSource(video, multi);
        if (results.length) {
          const count = setOutput(results.map((r) => r.rawValue));
          if (count) setStatus(t("tool.qrScan.status.done", { count }), false);
        }
      } catch (_error) {
        // ignore decode errors while streaming
      }

      state.scanTimer = window.setTimeout(loop, 250);
    };

    loop();
  }

  async function stopCamera() {
    state.scanning = false;
    stopTimer();
    setCameraButtons(false);

    const video = $("preview-video");
    try {
      video.pause();
    } catch (_error) {
      // ignore
    }
    try {
      video.srcObject = null;
    } catch (_error) {
      // ignore
    }

    if (state.stream) {
      try {
        for (const track of state.stream.getTracks()) track.stop();
      } catch (_error) {
        // ignore
      }
      state.stream = null;
    }

    if ($("preview-video").hidden === false) {
      setPreviewMode(null);
    }
  }

  function clearAll() {
    stopCamera();
    revokeUrl(state.imageUrl);
    state.imageUrl = null;
    $("tool-file").value = "";
    $("tool-output").value = "";
    setOpenLink("");
    setFileMeta(null);
    setPreviewMode(null);
    setStatus("", false);
  }

  function main() {
    try {
      setCameraButtons(false);

      $("btn-scan").addEventListener("click", () => {
        runFileScan().catch((error) => {
          setStatus(error instanceof Error ? error.message : t("tool.qrScan.error.generic"), true);
        });
      });

      $("tool-file").addEventListener("change", () => {
        const file = $("tool-file").files && $("tool-file").files[0];
        setFileMeta(file || null);
      });

      $("btn-start").addEventListener("click", () => {
        startCamera().catch((error) => {
          setStatus(error instanceof Error ? error.message : t("tool.qrScan.error.generic"), true);
          setCameraButtons(false);
        });
      });

      $("btn-stop").addEventListener("click", () => {
        stopCamera();
        setStatus(t("tool.qrScan.status.stopped"), false);
      });

      $("btn-copy").addEventListener("click", async () => {
        try {
          await copyToClipboard($("tool-output").value);
          setStatus(t("tool.common.status.copied"), false);
        } catch (_error) {
          setStatus(t("tool.common.error.copy"), true);
        }
      });

      $("btn-clear").addEventListener("click", clearAll);

      document.addEventListener("visibilitychange", () => {
        if (document.hidden) stopCamera();
      });
      window.addEventListener("pagehide", () => stopCamera());
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  window.addEventListener("DOMContentLoaded", main);
})();
