(function () {
  const ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  const MAX_RANDOM = (1n << 80n) - 1n;

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

  function encodeBase32(value, length) {
    let out = "";
    let v = BigInt(value);
    for (let i = 0; i < length; i += 1) {
      const mod = v % 32n;
      out = ENCODING[Number(mod)] + out;
      v = v / 32n;
    }
    return out;
  }

  function bytesToBigInt(bytes) {
    let v = 0n;
    for (const b of bytes) v = (v << 8n) + BigInt(b);
    return v;
  }

  function readCount() {
    const raw = Number.parseInt($("opt-count").value, 10);
    if (!Number.isFinite(raw)) return 1;
    return Math.min(100, Math.max(1, raw));
  }

  function random80Bits() {
    if (!globalThis.crypto || typeof crypto.getRandomValues !== "function") {
      throw new Error(t("tool.ulid.error.unsupported"));
    }

    const bytes = new Uint8Array(10);
    crypto.getRandomValues(bytes);
    return bytesToBigInt(bytes);
  }

  function runGenerate() {
    const count = readCount();
    const monotonic = $("opt-monotonic").checked;
    const lowercase = $("opt-lowercase").checked;

    const out = [];
    let lastTime = 0;
    let lastRandom = 0n;

    for (let i = 0; i < count; i += 1) {
      let time = Date.now();
      let random = random80Bits();

      if (monotonic && time === lastTime) {
        random = lastRandom + 1n;
        if (random > MAX_RANDOM) {
          time = lastTime + 1;
          random = random80Bits();
        }
      }

      lastTime = time;
      lastRandom = random;

      let id = encodeBase32(BigInt(time), 10) + encodeBase32(random, 16);
      if (lowercase) id = id.toLowerCase();
      out.push(id);
    }

    $("tool-output").value = out.join("\n");
    setStatus(t("tool.ulid.status.done", { count }), false);
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

