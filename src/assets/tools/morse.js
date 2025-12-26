(function () {
  const ENC = {
    A: ".-",
    B: "-...",
    C: "-.-.",
    D: "-..",
    E: ".",
    F: "..-.",
    G: "--.",
    H: "....",
    I: "..",
    J: ".---",
    K: "-.-",
    L: ".-..",
    M: "--",
    N: "-.",
    O: "---",
    P: ".--.",
    Q: "--.-",
    R: ".-.",
    S: "...",
    T: "-",
    U: "..-",
    V: "...-",
    W: ".--",
    X: "-..-",
    Y: "-.--",
    Z: "--..",
    "0": "-----",
    "1": ".----",
    "2": "..---",
    "3": "...--",
    "4": "....-",
    "5": ".....",
    "6": "-....",
    "7": "--...",
    "8": "---..",
    "9": "----.",
    ".": ".-.-.-",
    ",": "--..--",
    "?": "..--..",
    "'": ".----.",
    "!": "-.-.--",
    "/": "-..-.",
    "(": "-.--.",
    ")": "-.--.-",
    "&": ".-...",
    ":": "---...",
    ";": "-.-.-.",
    "=": "-...-",
    "+": ".-.-.",
    "-": "-....-",
    "_": "..--.-",
    "\"": ".-..-.",
    "$": "...-..-",
    "@": ".--.-.",
  };

  const DEC = Object.fromEntries(Object.entries(ENC).map(([k, v]) => [v, k]));

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

  function normalizeSymbols(token) {
    return String(token || "")
      .replace(/[•·]/g, ".")
      .replace(/[–—]/g, "-")
      .trim();
  }

  function runEncode() {
    const input = $("tool-input").value;
    const useSlash = $("opt-slash").checked;

    const words = String(input || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    let unknown = 0;
    const encodedWords = words.map((word) => {
      const letters = [];
      for (const ch of word) {
        const key = String(ch || "").toUpperCase();
        const code = ENC[key];
        if (code) letters.push(code);
        else {
          letters.push("?");
          unknown += 1;
        }
      }
      return letters.join(" ");
    });

    const sep = useSlash ? " / " : "   ";
    const out = encodedWords.join(sep);
    $("tool-output").value = out;
    setStatus(
      unknown
        ? t("tool.morse.status.encodedUnknown", { len: out.length, unknown })
        : t("tool.morse.status.encoded", { len: out.length }),
      false
    );
  }

  function runDecode() {
    const input = $("tool-input").value;
    const upper = $("opt-upper").checked;

    const text = String(input || "").trim();
    if (!text) {
      $("tool-output").value = "";
      setStatus("", false);
      return;
    }

    const words = text.split(/\s{3,}|\s*\/\s*/).map((w) => w.trim()).filter(Boolean);

    let unknown = 0;
    const decodedWords = words.map((word) => {
      const tokens = word.split(/\s+/).filter(Boolean);
      const letters = tokens.map((token) => {
        const normalized = normalizeSymbols(token);
        const ch = DEC[normalized];
        if (ch) return ch;
        unknown += 1;
        return "?";
      });
      const out = letters.join("");
      return upper ? out.toUpperCase() : out.toLowerCase();
    });

    const out = decodedWords.join(" ");
    $("tool-output").value = out;
    setStatus(
      unknown
        ? t("tool.morse.status.decodedUnknown", { len: out.length, unknown })
        : t("tool.morse.status.decoded", { len: out.length }),
      false
    );
  }

  function swap() {
    const input = $("tool-input");
    const output = $("tool-output");
    const tmp = input.value;
    input.value = output.value;
    output.value = tmp;
    setStatus(t("tool.common.status.swapped"), false);
  }

  function clearAll() {
    $("tool-input").value = "";
    $("tool-output").value = "";
    setStatus("", false);
  }

  function main() {
    try {
      $("btn-encode").addEventListener("click", () => {
        try {
          runEncode();
        } catch (error) {
          setStatus(error instanceof Error ? error.message : String(error), true);
        }
      });
      $("btn-decode").addEventListener("click", () => {
        try {
          runDecode();
        } catch (error) {
          setStatus(error instanceof Error ? error.message : String(error), true);
        }
      });
      $("btn-swap").addEventListener("click", swap);
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

