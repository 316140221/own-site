(function () {
  const WORDS = [
    "lorem",
    "ipsum",
    "dolor",
    "sit",
    "amet",
    "consectetur",
    "adipiscing",
    "elit",
    "sed",
    "do",
    "eiusmod",
    "tempor",
    "incididunt",
    "ut",
    "labore",
    "et",
    "dolore",
    "magna",
    "aliqua",
    "enim",
    "ad",
    "minim",
    "veniam",
    "quis",
    "nostrud",
    "exercitation",
    "ullamco",
    "laboris",
    "nisi",
    "ut",
    "aliquip",
    "ex",
    "ea",
    "commodo",
    "consequat",
    "duis",
    "aute",
    "irure",
    "dolor",
    "in",
    "reprehenderit",
    "in",
    "voluptate",
    "velit",
    "esse",
    "cillum",
    "dolore",
    "eu",
    "fugiat",
    "nulla",
    "pariatur",
    "excepteur",
    "sint",
    "occaecat",
    "cupidatat",
    "non",
    "proident",
    "sunt",
    "in",
    "culpa",
    "qui",
    "officia",
    "deserunt",
    "mollit",
    "anim",
    "id",
    "est",
    "laborum",
  ];

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

  function randInt(max) {
    if (max <= 0) return 0;
    if (crypto && crypto.getRandomValues) {
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      return buf[0] % max;
    }
    return Math.floor(Math.random() * max);
  }

  function sentence(words) {
    const count = Math.max(3, words);
    const parts = [];
    for (let i = 0; i < count; i += 1) {
      const w = WORDS[randInt(WORDS.length)];
      parts.push(w);
    }
    parts[0] = parts[0].slice(0, 1).toUpperCase() + parts[0].slice(1);
    return `${parts.join(" ")}.`;
  }

  function paragraph(sentences, words, startWithLorem) {
    const out = [];
    for (let i = 0; i < sentences; i += 1) out.push(sentence(words));
    if (startWithLorem && out.length) {
      out[0] = "Lorem ipsum dolor sit amet.";
    }
    return out.join(" ");
  }

  function runGenerate() {
    const paragraphs = Number.parseInt($("opt-paragraphs").value, 10);
    const sentences = Number.parseInt($("opt-sentences").value, 10);
    const words = Number.parseInt($("opt-words").value, 10);
    const start = $("opt-start").checked;

    if (!Number.isFinite(paragraphs) || paragraphs < 1 || paragraphs > 20) throw new Error(t("tool.lorem.error.paragraphs"));
    if (!Number.isFinite(sentences) || sentences < 1 || sentences > 40) throw new Error(t("tool.lorem.error.sentences"));
    if (!Number.isFinite(words) || words < 3 || words > 60) throw new Error(t("tool.lorem.error.words"));

    const out = [];
    for (let i = 0; i < paragraphs; i += 1) out.push(paragraph(sentences, words, start && i === 0));
    const text = out.join("\n\n");
    $("tool-output").value = text;
    setStatus(t("tool.lorem.status.done", { paragraphs }), false);
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
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  window.addEventListener("DOMContentLoaded", main);
})();

