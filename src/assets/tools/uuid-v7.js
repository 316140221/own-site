(function () {
  const MAX_RANDOM_74 = (1n << 74n) - 1n;

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

  function bytesToBigInt(bytes) {
    let v = 0n;
    for (const b of bytes) v = (v << 8n) + BigInt(b);
    return v;
  }

  function random74Bits() {
    if (!globalThis.crypto || typeof crypto.getRandomValues !== "function") {
      throw new Error(t("tool.uuid7.error.unsupported"));
    }
    const bytes = new Uint8Array(10);
    crypto.getRandomValues(bytes);
    return bytesToBigInt(bytes) & MAX_RANDOM_74;
  }

  function encodeUuid(bytes, opts) {
    const upper = Boolean(opts && opts.upper);
    const noHyphens = Boolean(opts && opts.noHyphens);
    const braces = Boolean(opts && opts.braces);

    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    const out = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(
      16,
      20
    )}-${hex.slice(20)}`;

    let formatted = out;
    if (noHyphens) formatted = formatted.replace(/-/g, "");
    if (upper) formatted = formatted.toUpperCase();
    if (braces) formatted = `{${formatted}}`;
    return formatted;
  }

  function readCount() {
    const raw = Number.parseInt($("opt-count").value, 10);
    if (!Number.isFinite(raw)) return 1;
    return Math.min(100, Math.max(1, raw));
  }

  function uuidV7(timestampMs, random74) {
    const time = BigInt(timestampMs);
    const rand = BigInt(random74);

    const randA = (rand >> 62n) & 0xfffn;
    const randB = rand & ((1n << 62n) - 1n);

    const bytes = new Uint8Array(16);

    // 48-bit timestamp (big-endian)
    bytes[0] = Number((time >> 40n) & 0xffn);
    bytes[1] = Number((time >> 32n) & 0xffn);
    bytes[2] = Number((time >> 24n) & 0xffn);
    bytes[3] = Number((time >> 16n) & 0xffn);
    bytes[4] = Number((time >> 8n) & 0xffn);
    bytes[5] = Number(time & 0xffn);

    // version 7 + rand_a (12 bits)
    bytes[6] = 0x70 | Number((randA >> 8n) & 0x0fn);
    bytes[7] = Number(randA & 0xffn);

    // variant (10) + rand_b (62 bits)
    bytes[8] = 0x80 | Number((randB >> 56n) & 0x3fn);
    bytes[9] = Number((randB >> 48n) & 0xffn);
    bytes[10] = Number((randB >> 40n) & 0xffn);
    bytes[11] = Number((randB >> 32n) & 0xffn);
    bytes[12] = Number((randB >> 24n) & 0xffn);
    bytes[13] = Number((randB >> 16n) & 0xffn);
    bytes[14] = Number((randB >> 8n) & 0xffn);
    bytes[15] = Number(randB & 0xffn);

    return bytes;
  }

  function runGenerate() {
    const count = readCount();
    const monotonic = $("opt-monotonic").checked;
    const opts = {
      upper: $("opt-uppercase").checked,
      noHyphens: $("opt-no-hyphens").checked,
      braces: $("opt-braces").checked,
    };

    const out = [];
    let lastTime = 0;
    let lastRandom = 0n;

    for (let i = 0; i < count; i += 1) {
      let time = Date.now();
      let random = random74Bits();

      if (monotonic && time === lastTime) {
        random = lastRandom + 1n;
        if (random > MAX_RANDOM_74) {
          time = lastTime + 1;
          random = random74Bits();
        }
      }

      lastTime = time;
      lastRandom = random;

      out.push(encodeUuid(uuidV7(time, random), opts));
    }

    $("tool-output").value = out.join("\n");
    setStatus(t("tool.uuid7.status.done", { count }), false);
  }

  function clearAll() {
    $("tool-output").value = "";
    setStatus("", false);
  }

  function main() {
    try {
      $("btn-generate").addEventListener("click", () => {
        try {
          runGenerate();
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

      runGenerate();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  window.addEventListener("DOMContentLoaded", main);
})();

