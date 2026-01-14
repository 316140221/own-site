(function () {
  const state = {
    scheduled: 0,
    svgUrl: "",
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

  function revokeSvgUrl() {
    if (!state.svgUrl) return;
    try {
      URL.revokeObjectURL(state.svgUrl);
    } catch (_error) {
      // ignore
    }
    state.svgUrl = "";
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

  function clampInt(value, min, max) {
    const n = Number.parseInt(String(value ?? ""), 10);
    if (!Number.isFinite(n)) return null;
    return Math.min(max, Math.max(min, n));
  }

  function loadVendor() {
    if (window.qrcodegen && window.qrcodegen.QrCode) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-qr-vendor="qrcodegen"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener(
          "error",
          () => reject(new Error(t("tool.qrCode.error.vendor"))),
          { once: true }
        );
        return;
      }

      const script = document.createElement("script");
      script.src =
        typeof resolveSitePath === "function"
          ? resolveSitePath("/assets/vendor/qrcodegen.js")
          : "/assets/vendor/qrcodegen.js";
      script.defer = true;
      script.setAttribute("data-qr-vendor", "qrcodegen");
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(t("tool.qrCode.error.vendor")));
      document.head.appendChild(script);
    });
  }

  function eccFromValue(value) {
    const v = String(value || "M").toUpperCase();
    const QrCode = window.qrcodegen && window.qrcodegen.QrCode;
    const Ecc = QrCode && QrCode.Ecc;
    if (!Ecc) throw new Error(t("tool.qrCode.error.vendor"));
    if (v === "L") return Ecc.LOW;
    if (v === "Q") return Ecc.QUARTILE;
    if (v === "H") return Ecc.HIGH;
    return Ecc.MEDIUM;
  }

  function makePngDataUrl(qr, border, sizePx, fg, bg) {
    const total = qr.size + border * 2;
    const modulePx = Math.max(1, Math.floor(sizePx / total));
    const actualPx = modulePx * total;
    const canvas = document.createElement("canvas");
    canvas.width = actualPx;
    canvas.height = actualPx;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error(t("tool.qrCode.error.unsupported"));
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, actualPx, actualPx);
    ctx.fillStyle = fg;
    for (let y = 0; y < qr.size; y += 1) {
      for (let x = 0; x < qr.size; x += 1) {
        if (!qr.getModule(x, y)) continue;
        ctx.fillRect((x + border) * modulePx, (y + border) * modulePx, modulePx, modulePx);
      }
    }
    return { dataUrl: canvas.toDataURL("image/png"), actualPx };
  }

  function makeSvgString(qr, border, sizePx, fg, bg) {
    const total = qr.size + border * 2;
    const parts = [];

    for (let y = 0; y < qr.size; y += 1) {
      let x = 0;
      while (x < qr.size) {
        if (!qr.getModule(x, y)) {
          x += 1;
          continue;
        }
        const start = x;
        while (x < qr.size && qr.getModule(x, y)) x += 1;
        const len = x - start;
        const px = start + border;
        const py = y + border;
        parts.push(`M${px},${py}h${len}v1h-${len}z`);
      }
    }

    const path = parts.join("");
    return [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${sizePx}" height="${sizePx}" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges">`,
      `<rect width="100%" height="100%" fill="${bg}"/>`,
      path ? `<path d="${path}" fill="${fg}"/>` : "",
      `</svg>`,
    ].join("");
  }

  async function generate({ showErrors } = { showErrors: true }) {
    const input = $("tool-input").value || "";
    const text = String(input).trim();
    if (!text) {
      $("tool-output").value = "";
      $("qr-preview").removeAttribute("src");
      $("qr-meta").textContent = "";
      const dl = $("btn-download");
      dl.hidden = true;
      dl.removeAttribute("href");
      revokeSvgUrl();
      if (showErrors) setStatus(t("tool.qrCode.error.noText"), true);
      else setStatus("", false);
      return;
    }

    await loadVendor();

    const size = clampInt($("opt-size").value, 64, 2048);
    const border = clampInt($("opt-margin").value, 0, 16);
    if (size == null) throw new Error(t("tool.qrCode.error.size"));
    if (border == null) throw new Error(t("tool.qrCode.error.margin"));

    const fgRaw = String($("opt-fg").value || "").trim();
    const bgRaw = String($("opt-bg").value || "").trim();
    if (!isValidHexColor(fgRaw) || !isValidHexColor(bgRaw)) {
      throw new Error(t("tool.qrCode.error.color"));
    }
    const fg = expandHexColor(fgRaw);
    const bg = expandHexColor(bgRaw);

    const ecc = eccFromValue($("opt-ecc").value);
    const fmt = String($("opt-format").value || "png").toLowerCase();

    setStatus(t("tool.qrCode.status.working"), false);

    let qr;
    try {
      qr = window.qrcodegen.QrCode.encodeText(text, ecc);
    } catch (_error) {
      throw new Error(t("tool.qrCode.error.tooLong"));
    }

    const version = qr.version || 0;
    const meta = `v${version} · ${qr.size}×${qr.size}`;

    const dl = $("btn-download");
    const output = $("tool-output");

    revokeSvgUrl();

    if (fmt === "svg") {
      const svg = makeSvgString(qr, border, size, fg, bg);
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      state.svgUrl = url;
      $("qr-preview").src = url;
      $("qr-preview").alt = t("tools.item.qr-code.title");
      $("qr-meta").textContent = `${meta} · SVG`;
      output.value = svg;
      dl.href = url;
      dl.download = "qr-code.svg";
      dl.hidden = false;
      setStatus(t("tool.qrCode.status.done", { meta }), false);
      return;
    }

    const png = makePngDataUrl(qr, border, size, fg, bg);
    $("qr-preview").src = png.dataUrl;
    $("qr-preview").alt = t("tools.item.qr-code.title");
    $("qr-meta").textContent = `${meta} · ${png.actualPx}×${png.actualPx}px`;
    output.value = png.dataUrl;
    dl.href = png.dataUrl;
    dl.download = "qr-code.png";
    dl.hidden = false;
    setStatus(t("tool.qrCode.status.done", { meta }), false);
  }

  function scheduleAutoGenerate() {
    window.clearTimeout(state.scheduled);
    state.scheduled = window.setTimeout(() => {
      void generate({ showErrors: false });
    }, 150);
  }

  function clearAll() {
    window.clearTimeout(state.scheduled);
    $("tool-input").value = "";
    $("tool-output").value = "";
    $("qr-preview").removeAttribute("src");
    $("qr-meta").textContent = "";
    const dl = $("btn-download");
    dl.hidden = true;
    dl.removeAttribute("href");
    revokeSvgUrl();
    setStatus("", false);
  }

  function main() {
    try {
      const autoEls = [
        $("tool-input"),
        $("opt-ecc"),
        $("opt-format"),
        $("opt-size"),
        $("opt-margin"),
        $("opt-fg"),
        $("opt-bg"),
      ];
      for (const el of autoEls) {
        el.addEventListener("input", scheduleAutoGenerate);
        el.addEventListener("change", scheduleAutoGenerate);
      }

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
