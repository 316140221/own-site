(function () {
  const T = (() => {
    const arr = new Uint32Array(64);
    for (let i = 0; i < 64; i += 1) {
      arr[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) >>> 0;
    }
    return arr;
  })();

  const S1 = [7, 12, 17, 22];
  const S2 = [5, 9, 14, 20];
  const S3 = [4, 11, 16, 23];
  const S4 = [6, 10, 15, 21];

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

  function add32(a, b) {
    return (a + b) | 0;
  }

  function add32_4(a, b, c, d) {
    return add32(add32(a, b), add32(c, d));
  }

  function rol(x, s) {
    return (x << s) | (x >>> (32 - s));
  }

  function writeUint32LE(buf, offset, value) {
    const v = value >>> 0;
    buf[offset] = v & 0xff;
    buf[offset + 1] = (v >>> 8) & 0xff;
    buf[offset + 2] = (v >>> 16) & 0xff;
    buf[offset + 3] = (v >>> 24) & 0xff;
  }

  function md5(bytes) {
    const input = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    const origLen = input.length;
    const withOne = origLen + 1;
    const mod = withOne % 64;
    const padLen = mod <= 56 ? 56 - mod : 56 + (64 - mod);
    const totalLen = origLen + 1 + padLen + 8;

    const buf = new Uint8Array(totalLen);
    buf.set(input);
    buf[origLen] = 0x80;

    const bitLenLow = (origLen << 3) >>> 0;
    const bitLenHigh = (origLen >>> 29) >>> 0;
    writeUint32LE(buf, totalLen - 8, bitLenLow);
    writeUint32LE(buf, totalLen - 4, bitLenHigh);

    let a = 0x67452301 | 0;
    let b = 0xefcdab89 | 0;
    let c = 0x98badcfe | 0;
    let d = 0x10325476 | 0;

    const x = new Int32Array(16);

    for (let offset = 0; offset < buf.length; offset += 64) {
      for (let i = 0; i < 16; i += 1) {
        const j = offset + i * 4;
        x[i] = (buf[j] | (buf[j + 1] << 8) | (buf[j + 2] << 16) | (buf[j + 3] << 24)) | 0;
      }

      const aa = a;
      const bb = b;
      const cc = c;
      const dd = d;

      for (let i = 0; i < 64; i += 1) {
        let f = 0;
        let g = 0;
        let s = 0;

        if (i < 16) {
          f = (b & c) | (~b & d);
          g = i;
          s = S1[i % 4];
        } else if (i < 32) {
          f = (d & b) | (~d & c);
          g = (5 * i + 1) % 16;
          s = S2[i % 4];
        } else if (i < 48) {
          f = b ^ c ^ d;
          g = (3 * i + 5) % 16;
          s = S3[i % 4];
        } else {
          f = c ^ (b | ~d);
          g = (7 * i) % 16;
          s = S4[i % 4];
        }

        const tmp = d;
        d = c;
        c = b;
        const sum = add32_4(a, f, x[g], T[i] | 0);
        b = add32(b, rol(sum, s));
        a = tmp;
      }

      a = add32(a, aa);
      b = add32(b, bb);
      c = add32(c, cc);
      d = add32(d, dd);
    }

    const out = new Uint8Array(16);
    writeUint32LE(out, 0, a);
    writeUint32LE(out, 4, b);
    writeUint32LE(out, 8, c);
    writeUint32LE(out, 12, d);
    return out;
  }

  function bytesToBinary(bytes) {
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, chunk);
    }
    return binary;
  }

  function toHex(bytes, upper) {
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return upper ? hex.toUpperCase() : hex;
  }

  function toBase64(bytes) {
    return btoa(bytesToBinary(bytes));
  }

  function runMd5() {
    const input = $("tool-input").value;
    const fmt = String($("opt-format").value || "hex");
    const upper = $("opt-uppercase").checked;

    const bytes = new TextEncoder().encode(String(input || ""));
    const digest = md5(bytes);

    let out = "";
    if (fmt === "base64") out = toBase64(digest);
    else out = toHex(digest, upper);

    $("tool-output").value = out;
    setStatus(t("tool.md5.status.done", { len: out.length }), false);
  }

  function clearAll() {
    $("tool-input").value = "";
    $("tool-output").value = "";
    setStatus("", false);
  }

  function main() {
    try {
      $("btn-md5").addEventListener("click", () => {
        try {
          runMd5();
        } catch (error) {
          setStatus(error instanceof Error ? error.message : t("tool.md5.error.generic"), true);
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

