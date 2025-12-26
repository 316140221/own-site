(function () {
  const S1 = [3, 7, 11, 19];
  const S2 = [3, 5, 9, 13];
  const S3 = [3, 9, 11, 15];

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

  function F(x, y, z) {
    return (x & y) | (~x & z);
  }

  function G(x, y, z) {
    return (x & y) | (x & z) | (y & z);
  }

  function H(x, y, z) {
    return x ^ y ^ z;
  }

  function md4(bytes) {
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

    function R1(aa, bb, cc, dd, k, s) {
      return rol(add32(aa, add32(F(bb, cc, dd), x[k])), s);
    }

    function R2(aa, bb, cc, dd, k, s) {
      return rol(add32(aa, add32(add32(G(bb, cc, dd), x[k]), 0x5a827999 | 0)), s);
    }

    function R3(aa, bb, cc, dd, k, s) {
      return rol(add32(aa, add32(add32(H(bb, cc, dd), x[k]), 0x6ed9eba1 | 0)), s);
    }

    for (let offset = 0; offset < buf.length; offset += 64) {
      for (let i = 0; i < 16; i += 1) {
        const j = offset + i * 4;
        x[i] = (buf[j] | (buf[j + 1] << 8) | (buf[j + 2] << 16) | (buf[j + 3] << 24)) | 0;
      }

      const aa = a;
      const bb = b;
      const cc = c;
      const dd = d;

      // Round 1
      a = R1(a, b, c, d, 0, S1[0]);
      d = R1(d, a, b, c, 1, S1[1]);
      c = R1(c, d, a, b, 2, S1[2]);
      b = R1(b, c, d, a, 3, S1[3]);
      a = R1(a, b, c, d, 4, S1[0]);
      d = R1(d, a, b, c, 5, S1[1]);
      c = R1(c, d, a, b, 6, S1[2]);
      b = R1(b, c, d, a, 7, S1[3]);
      a = R1(a, b, c, d, 8, S1[0]);
      d = R1(d, a, b, c, 9, S1[1]);
      c = R1(c, d, a, b, 10, S1[2]);
      b = R1(b, c, d, a, 11, S1[3]);
      a = R1(a, b, c, d, 12, S1[0]);
      d = R1(d, a, b, c, 13, S1[1]);
      c = R1(c, d, a, b, 14, S1[2]);
      b = R1(b, c, d, a, 15, S1[3]);

      // Round 2
      a = R2(a, b, c, d, 0, S2[0]);
      d = R2(d, a, b, c, 4, S2[1]);
      c = R2(c, d, a, b, 8, S2[2]);
      b = R2(b, c, d, a, 12, S2[3]);
      a = R2(a, b, c, d, 1, S2[0]);
      d = R2(d, a, b, c, 5, S2[1]);
      c = R2(c, d, a, b, 9, S2[2]);
      b = R2(b, c, d, a, 13, S2[3]);
      a = R2(a, b, c, d, 2, S2[0]);
      d = R2(d, a, b, c, 6, S2[1]);
      c = R2(c, d, a, b, 10, S2[2]);
      b = R2(b, c, d, a, 14, S2[3]);
      a = R2(a, b, c, d, 3, S2[0]);
      d = R2(d, a, b, c, 7, S2[1]);
      c = R2(c, d, a, b, 11, S2[2]);
      b = R2(b, c, d, a, 15, S2[3]);

      // Round 3
      a = R3(a, b, c, d, 0, S3[0]);
      d = R3(d, a, b, c, 8, S3[1]);
      c = R3(c, d, a, b, 4, S3[2]);
      b = R3(b, c, d, a, 12, S3[3]);
      a = R3(a, b, c, d, 2, S3[0]);
      d = R3(d, a, b, c, 10, S3[1]);
      c = R3(c, d, a, b, 6, S3[2]);
      b = R3(b, c, d, a, 14, S3[3]);
      a = R3(a, b, c, d, 1, S3[0]);
      d = R3(d, a, b, c, 9, S3[1]);
      c = R3(c, d, a, b, 5, S3[2]);
      b = R3(b, c, d, a, 13, S3[3]);
      a = R3(a, b, c, d, 3, S3[0]);
      d = R3(d, a, b, c, 11, S3[1]);
      c = R3(c, d, a, b, 7, S3[2]);
      b = R3(b, c, d, a, 15, S3[3]);

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

  function runMd4() {
    const input = $("tool-input").value;
    const fmt = String($("opt-format").value || "hex");
    const upper = $("opt-uppercase").checked;

    const bytes = new TextEncoder().encode(String(input || ""));
    const digest = md4(bytes);

    let out = "";
    if (fmt === "base64") out = toBase64(digest);
    else out = toHex(digest, upper);

    $("tool-output").value = out;
    setStatus(t("tool.md4.status.done", { len: out.length }), false);
  }

  function clearAll() {
    $("tool-input").value = "";
    $("tool-output").value = "";
    setStatus("", false);
  }

  function main() {
    try {
      $("btn-md4").addEventListener("click", () => {
        try {
          runMd4();
        } catch (error) {
          setStatus(error instanceof Error ? error.message : t("tool.md4.error.generic"), true);
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

