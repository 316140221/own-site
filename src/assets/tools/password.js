(function () {
  const SETS = {
    lower: "abcdefghijkmnopqrstuvwxyz",
    upper: "ABCDEFGHJKLMNPQRSTUVWXYZ",
    digits: "23456789",
    symbols: "!@#$%^&*()-_=+[]{};:,.?/|~",
  };

  const AMBIGUOUS = new Set(["0", "O", "o", "1", "l", "I"]);

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

  function randomInt(maxExclusive) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] % maxExclusive;
  }

  function shuffleInPlace(arr) {
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = randomInt(i + 1);
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function buildAlphabet(opts) {
    const parts = [];
    if (opts.lower) parts.push(SETS.lower);
    if (opts.upper) parts.push(SETS.upper);
    if (opts.digits) parts.push(SETS.digits);
    if (opts.symbols) parts.push(SETS.symbols);

    let alphabet = parts.join("");
    if (opts.excludeAmbiguous) {
      alphabet = alphabet
        .split("")
        .filter((c) => !AMBIGUOUS.has(c))
        .join("");
    }
    return alphabet;
  }

  function readNumber(id, min, max, fallback) {
    const raw = Number.parseInt($(id).value, 10);
    if (!Number.isFinite(raw)) return fallback;
    return Math.min(max, Math.max(min, raw));
  }

  function readOpts() {
    return {
      length: readNumber("opt-length", 4, 128, 20),
      count: readNumber("opt-count", 1, 50, 5),
      lower: $("opt-lower").checked,
      upper: $("opt-upper").checked,
      digits: $("opt-digits").checked,
      symbols: $("opt-symbols").checked,
      excludeAmbiguous: $("opt-ambiguous").checked,
    };
  }

  function generateOne(length, opts) {
    const alphabet = buildAlphabet(opts);
    if (!alphabet) throw new Error(t("tool.password.error.noCharset"));

    const categories = [];
    if (opts.lower) categories.push(buildAlphabet({ lower: true, excludeAmbiguous: opts.excludeAmbiguous }));
    if (opts.upper) categories.push(buildAlphabet({ upper: true, excludeAmbiguous: opts.excludeAmbiguous }));
    if (opts.digits) categories.push(buildAlphabet({ digits: true, excludeAmbiguous: opts.excludeAmbiguous }));
    if (opts.symbols) categories.push(buildAlphabet({ symbols: true, excludeAmbiguous: opts.excludeAmbiguous }));

    const chars = [];
    for (const cat of categories) {
      if (!cat) continue;
      chars.push(cat[randomInt(cat.length)]);
    }

    while (chars.length < length) {
      chars.push(alphabet[randomInt(alphabet.length)]);
    }

    return shuffleInPlace(chars).slice(0, length).join("");
  }

  function runGenerate() {
    if (!globalThis.crypto || !crypto.getRandomValues) {
      throw new Error(t("tool.password.error.unsupported"));
    }

    const opts = readOpts();
    const length = opts.length;
    const count = opts.count;

    const list = Array.from({ length: count }, () => generateOne(length, opts));
    const out = list.join("\n");
    $("tool-output").value = out;
    setStatus(t("tool.password.status.done", { count, length }), false);
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

      document
        .querySelectorAll(
          "#opt-length,#opt-count,#opt-lower,#opt-upper,#opt-digits,#opt-symbols,#opt-ambiguous"
        )
        .forEach((el) => {
          el.addEventListener("change", () => {
            try {
              runGenerate();
            } catch (_error) {
              // ignore
            }
          });
        });

      runGenerate();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  window.addEventListener("DOMContentLoaded", main);
})();
