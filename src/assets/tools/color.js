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

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function parsePercentOrNumber(input, max) {
    const raw = String(input || "").trim();
    if (raw.endsWith("%")) {
      const p = Number.parseFloat(raw.slice(0, -1));
      if (!Number.isFinite(p)) return null;
      return clamp((p / 100) * max, 0, max);
    }
    const n = Number.parseFloat(raw);
    if (!Number.isFinite(n)) return null;
    return clamp(n, 0, max);
  }

  function parseAlpha(input) {
    const raw = String(input || "").trim();
    if (!raw) return 1;
    if (raw.endsWith("%")) {
      const p = Number.parseFloat(raw.slice(0, -1));
      if (!Number.isFinite(p)) return null;
      return clamp(p / 100, 0, 1);
    }
    const n = Number.parseFloat(raw);
    if (!Number.isFinite(n)) return null;
    return clamp(n, 0, 1);
  }

  function parseHex(input) {
    const raw = String(input || "").trim();
    if (!raw.startsWith("#")) return null;
    const hex = raw.slice(1).trim();
    if (!/^[0-9a-fA-F]+$/.test(hex)) return null;

    let r;
    let g;
    let b;
    let a = 1;

    if (hex.length === 3 || hex.length === 4) {
      r = Number.parseInt(hex[0] + hex[0], 16);
      g = Number.parseInt(hex[1] + hex[1], 16);
      b = Number.parseInt(hex[2] + hex[2], 16);
      if (hex.length === 4) a = Number.parseInt(hex[3] + hex[3], 16) / 255;
    } else if (hex.length === 6 || hex.length === 8) {
      r = Number.parseInt(hex.slice(0, 2), 16);
      g = Number.parseInt(hex.slice(2, 4), 16);
      b = Number.parseInt(hex.slice(4, 6), 16);
      if (hex.length === 8) a = Number.parseInt(hex.slice(6, 8), 16) / 255;
    } else {
      return null;
    }

    return { r, g, b, a };
  }

  function parseRgb(input) {
    const raw = String(input || "").trim();
    const m = raw.match(/^rgba?\((.+)\)$/i);
    if (!m) return null;
    const parts = m[1].split(",").map((p) => p.trim());
    if (parts.length < 3) return null;

    const r = parsePercentOrNumber(parts[0], 255);
    const g = parsePercentOrNumber(parts[1], 255);
    const b = parsePercentOrNumber(parts[2], 255);
    if (r == null || g == null || b == null) return null;

    const a = parts.length >= 4 ? parseAlpha(parts[3]) : 1;
    if (a == null) return null;

    return { r: Math.round(r), g: Math.round(g), b: Math.round(b), a };
  }

  function parseHsl(input) {
    const raw = String(input || "").trim();
    const m = raw.match(/^hsla?\((.+)\)$/i);
    if (!m) return null;
    const parts = m[1].split(",").map((p) => p.trim());
    if (parts.length < 3) return null;

    const h = Number.parseFloat(parts[0].replace(/deg$/i, ""));
    if (!Number.isFinite(h)) return null;
    const sRaw = parts[1];
    const lRaw = parts[2];
    if (!sRaw.endsWith("%") || !lRaw.endsWith("%")) return null;
    const s = Number.parseFloat(sRaw.slice(0, -1));
    const l = Number.parseFloat(lRaw.slice(0, -1));
    if (!Number.isFinite(s) || !Number.isFinite(l)) return null;

    const a = parts.length >= 4 ? parseAlpha(parts[3]) : 1;
    if (a == null) return null;

    const rgb = hslToRgb(h, s / 100, l / 100);
    return { ...rgb, a };
  }

  function hslToRgb(h, s, l) {
    const hh = ((h % 360) + 360) % 360;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
    const m = l - c / 2;

    let r1 = 0;
    let g1 = 0;
    let b1 = 0;

    if (hh < 60) [r1, g1, b1] = [c, x, 0];
    else if (hh < 120) [r1, g1, b1] = [x, c, 0];
    else if (hh < 180) [r1, g1, b1] = [0, c, x];
    else if (hh < 240) [r1, g1, b1] = [0, x, c];
    else if (hh < 300) [r1, g1, b1] = [x, 0, c];
    else [r1, g1, b1] = [c, 0, x];

    return {
      r: Math.round((r1 + m) * 255),
      g: Math.round((g1 + m) * 255),
      b: Math.round((b1 + m) * 255),
    };
  }

  function rgbToHsl(r, g, b) {
    const rr = r / 255;
    const gg = g / 255;
    const bb = b / 255;

    const max = Math.max(rr, gg, bb);
    const min = Math.min(rr, gg, bb);
    const d = max - min;
    const l = (max + min) / 2;

    let h = 0;
    let s = 0;
    if (d !== 0) {
      s = d / (1 - Math.abs(2 * l - 1));
      switch (max) {
        case rr:
          h = ((gg - bb) / d) % 6;
          break;
        case gg:
          h = (bb - rr) / d + 2;
          break;
        default:
          h = (rr - gg) / d + 4;
          break;
      }
      h *= 60;
      if (h < 0) h += 360;
    }

    return { h, s, l };
  }

  function toHex2(n) {
    return Number(n).toString(16).padStart(2, "0");
  }

  function formatRgba(r, g, b, a) {
    const alpha = Math.round(a * 1000) / 1000;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function formatOutput(r, g, b, a) {
    const hex = `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`.toUpperCase();
    const alphaHex = a < 1 ? toHex2(Math.round(a * 255)).toUpperCase() : "";
    const hexOut = a < 1 ? `${hex}${alphaHex}` : hex;

    const hsl = rgbToHsl(r, g, b);
    const h = Math.round(hsl.h);
    const s = Math.round(hsl.s * 100);
    const l = Math.round(hsl.l * 100);
    const alpha = Math.round(a * 1000) / 1000;

    const lines = [
      `${t("tool.color.hex")}: ${hexOut}`,
      `${t("tool.color.rgb")}: rgb(${r}, ${g}, ${b})`,
      `${t("tool.color.rgba")}: ${formatRgba(r, g, b, a)}`,
      `${t("tool.color.hsl")}: hsl(${h}, ${s}%, ${l}%)`,
      `${t("tool.color.hsla")}: hsla(${h}, ${s}%, ${l}%, ${alpha})`,
    ];
    return lines.join("\n");
  }

  function parseColor(input) {
    return parseHex(input) || parseRgb(input) || parseHsl(input);
  }

  function runConvert() {
    const input = $("tool-input").value.trim();
    if (!input) throw new Error(t("tool.color.error.empty"));

    const color = parseColor(input);
    if (!color) throw new Error(t("tool.color.error.invalid"));

    const r = clamp(Math.round(color.r), 0, 255);
    const g = clamp(Math.round(color.g), 0, 255);
    const b = clamp(Math.round(color.b), 0, 255);
    const a = clamp(Number(color.a), 0, 1);

    $("tool-output").value = formatOutput(r, g, b, a);
    $("tool-swatch").style.background = `rgba(${r}, ${g}, ${b}, ${a})`;
    setStatus(t("tool.color.status.done"), false);
  }

  function clearAll() {
    $("tool-input").value = "";
    $("tool-output").value = "";
    $("tool-swatch").style.background = "transparent";
    setStatus("", false);
  }

  function main() {
    try {
      $("btn-convert").addEventListener("click", () => {
        try {
          runConvert();
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

      $("tool-input").addEventListener("input", () => {
        try {
          runConvert();
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

