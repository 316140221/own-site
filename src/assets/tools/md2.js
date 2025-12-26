(function () {
  const S = new Uint8Array([
    41, 46, 67, 201, 162, 216, 124, 1, 61, 54, 84, 161, 236, 240, 6, 19, 98, 167, 5, 243,
    192, 199, 115, 140, 152, 147, 43, 217, 188, 76, 130, 202, 30, 155, 87, 60, 253, 212, 224,
    22, 103, 66, 111, 24, 138, 23, 229, 18, 190, 78, 196, 214, 218, 158, 222, 73, 160, 251,
    245, 142, 187, 47, 238, 122, 169, 104, 121, 145, 21, 178, 7, 63, 148, 194, 16, 137, 11,
    34, 95, 33, 128, 127, 93, 154, 90, 144, 50, 39, 53, 62, 204, 231, 191, 247, 151, 3, 255,
    25, 48, 179, 72, 165, 181, 209, 215, 94, 146, 42, 172, 86, 170, 198, 79, 184, 56, 210,
    150, 164, 125, 182, 118, 252, 107, 226, 156, 116, 4, 241, 69, 157, 112, 89, 100, 113, 135,
    32, 134, 91, 207, 101, 230, 45, 168, 2, 27, 96, 37, 173, 174, 176, 185, 246, 28, 70, 97,
    105, 52, 64, 126, 15, 85, 71, 163, 35, 221, 81, 175, 58, 195, 92, 249, 206, 186, 197,
    234, 38, 44, 83, 13, 110, 133, 40, 132, 9, 211, 223, 205, 244, 65, 129, 77, 82, 106, 220,
    55, 200, 108, 193, 171, 250, 36, 225, 123, 8, 12, 189, 177, 74, 120, 136, 149, 139, 227,
    99, 232, 109, 233, 203, 213, 254, 59, 0, 29, 57, 242, 239, 183, 14, 102, 88, 208, 228,
    166, 119, 114, 248, 235, 117, 75, 10, 49, 68, 80, 180, 143, 237, 31, 26, 219, 153, 141,
    51, 159, 17, 131, 20,
  ]);

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

  function md2(bytes) {
    const input = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    const padLen = 16 - (input.length % 16 || 16);
    const padded = new Uint8Array(input.length + padLen);
    padded.set(input);
    padded.fill(padLen, input.length);

    const checksum = new Uint8Array(16);
    let L = 0;
    for (let i = 0; i < padded.length; i += 16) {
      for (let j = 0; j < 16; j += 1) {
        const c = padded[i + j];
        checksum[j] ^= S[c ^ L];
        L = checksum[j];
      }
    }

    const msg = new Uint8Array(padded.length + 16);
    msg.set(padded);
    msg.set(checksum, padded.length);

    const X = new Uint8Array(48);
    for (let i = 0; i < msg.length; i += 16) {
      for (let j = 0; j < 16; j += 1) {
        X[16 + j] = msg[i + j];
        X[32 + j] = X[16 + j] ^ X[j];
      }
      let tVal = 0;
      for (let j = 0; j < 18; j += 1) {
        for (let k = 0; k < 48; k += 1) {
          X[k] ^= S[tVal];
          tVal = X[k];
        }
        tVal = (tVal + j) & 0xff;
      }
    }
    return X.slice(0, 16);
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

  function runMd2() {
    const input = $("tool-input").value;
    const fmt = String($("opt-format").value || "hex");
    const upper = $("opt-uppercase").checked;

    const bytes = new TextEncoder().encode(String(input || ""));
    const digest = md2(bytes);

    let out = "";
    if (fmt === "base64") out = toBase64(digest);
    else out = toHex(digest, upper);

    $("tool-output").value = out;
    setStatus(t("tool.md2.status.done", { len: out.length }), false);
  }

  function clearAll() {
    $("tool-input").value = "";
    $("tool-output").value = "";
    setStatus("", false);
  }

  function main() {
    try {
      $("btn-md2").addEventListener("click", () => {
        try {
          runMd2();
        } catch (error) {
          setStatus(error instanceof Error ? error.message : t("tool.md2.error.generic"), true);
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

