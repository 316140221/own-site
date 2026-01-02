(function () {
  const STORAGE_SIGN = "tool_horoscope_sign";

  const SIGNS = [
    { id: "aries", label: "Aries" },
    { id: "taurus", label: "Taurus" },
    { id: "gemini", label: "Gemini" },
    { id: "cancer", label: "Cancer" },
    { id: "leo", label: "Leo" },
    { id: "virgo", label: "Virgo" },
    { id: "libra", label: "Libra" },
    { id: "scorpio", label: "Scorpio" },
    { id: "sagittarius", label: "Sagittarius" },
    { id: "capricorn", label: "Capricorn" },
    { id: "aquarius", label: "Aquarius" },
    { id: "pisces", label: "Pisces" },
  ];

  const GENERAL = [
    "A small change in your routine can unlock a big mood shift.",
    "Your best results today come from focus, not speed.",
    "Say yes to the simple option—it’s the right one.",
    "A conversation you’ve been avoiding turns out easier than expected.",
    "You’ll notice a pattern; follow it instead of forcing an outcome.",
    "An old idea becomes useful again with a tiny twist.",
    "Your intuition is sharp—trust the first signal you get.",
    "Today rewards consistency more than ambition.",
  ];

  const LOVE = [
    "Keep it light and honest—clarity beats grand gestures.",
    "A small compliment goes a long way.",
    "If you want something, ask directly and kindly.",
    "Make space for someone else’s point of view.",
    "Quality time beats multitasking today.",
    "Flirting is easier when you stop overthinking.",
    "A gentle boundary improves everything.",
  ];

  const CAREER = [
    "Do the hardest task first; momentum follows.",
    "One extra detail makes your work stand out.",
    "Write it down—your future self will thank you.",
    "A quick check-in prevents rework later.",
    "Keep meetings short and decisions clear.",
    "You’re closer to a breakthrough than it feels.",
  ];

  const MONEY = [
    "Small savings add up—skip one unnecessary add-on.",
    "Wait 24 hours before an impulse purchase.",
    "A simple budget tweak brings relief.",
    "Compare options before committing—there’s a better deal.",
    "Spend on what reduces stress; cut what adds it.",
  ];

  const HEALTH = [
    "Hydrate early; energy follows.",
    "A short walk resets your focus.",
    "Stretching beats scrolling.",
    "Go to bed a bit earlier than usual.",
    "Keep it steady—no need to overdo it.",
  ];

  const COLORS = ["Blue", "Green", "Red", "Purple", "Orange", "Yellow", "Black", "White", "Silver"];

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

  function storageGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (_error) {
      return null;
    }
  }

  function storageSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (_error) {}
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

  function pad2(value) {
    return String(value).padStart(2, "0");
  }

  function formatIsoDate(date) {
    const d = date instanceof Date ? date : new Date();
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  }

  function hashString(input) {
    let h = 2166136261;
    const str = String(input || "");
    for (let i = 0; i < str.length; i += 1) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t0 = Math.imul(a ^ (a >>> 15), 1 | a);
      t0 ^= t0 + Math.imul(t0 ^ (t0 >>> 7), 61 | t0);
      return ((t0 ^ (t0 >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pick(list, rng) {
    const arr = Array.isArray(list) ? list : [];
    if (!arr.length) return "";
    const idx = Math.floor(rng() * arr.length);
    return arr[Math.max(0, Math.min(arr.length - 1, idx))];
  }

  function signLabel(id) {
    const entry = SIGNS.find((s) => s.id === id);
    return entry ? entry.label : String(id || "");
  }

  function generate() {
    const sign = String($("opt-sign").value || "aries");
    const date = String($("opt-date").value || "").trim() || formatIsoDate(new Date());
    const seed = hashString(`${date}|${sign}`);
    const rng = mulberry32(seed);

    const luckyNumber = 1 + Math.floor(rng() * 99);
    const luckyColor = pick(COLORS, rng);

    const lines = [
      `${t("tool.horoscope.out.sign")}: ${signLabel(sign)}`,
      `${t("tool.horoscope.out.date")}: ${date}`,
      "",
      `${t("tool.horoscope.out.general")}: ${pick(GENERAL, rng)}`,
      `${t("tool.horoscope.out.love")}: ${pick(LOVE, rng)}`,
      `${t("tool.horoscope.out.career")}: ${pick(CAREER, rng)}`,
      `${t("tool.horoscope.out.money")}: ${pick(MONEY, rng)}`,
      `${t("tool.horoscope.out.health")}: ${pick(HEALTH, rng)}`,
      "",
      `${t("tool.horoscope.out.luckyColor")}: ${luckyColor}`,
      `${t("tool.horoscope.out.luckyNumber")}: ${luckyNumber}`,
    ];

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.horoscope.status.done"), false);
    storageSet(STORAGE_SIGN, sign);
    return { sign, date };
  }

  function setToday() {
    $("opt-date").value = formatIsoDate(new Date());
  }

  function clearAll() {
    $("tool-output").value = "";
    setStatus("", false);
  }

  function main() {
    try {
      const savedSign = storageGet(STORAGE_SIGN);
      if (savedSign) $("opt-sign").value = savedSign;
      setToday();
      setStatus("", false);
      generate();

      const debounce = (() => {
        let handle = 0;
        return () => {
          if (handle) window.clearTimeout(handle);
          handle = window.setTimeout(() => {
            handle = 0;
            generate();
          }, 60);
        };
      })();

      ["opt-sign", "opt-date"].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("input", debounce);
        el.addEventListener("change", debounce);
      });

      $("btn-generate").addEventListener("click", generate);
      $("btn-today").addEventListener("click", () => {
        setToday();
        generate();
      });
      $("btn-clear").addEventListener("click", clearAll);

      $("btn-copy").addEventListener("click", async () => {
        try {
          const out = $("tool-output").value || "";
          if (!out.trim()) return;
          await copyToClipboard(out);
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

