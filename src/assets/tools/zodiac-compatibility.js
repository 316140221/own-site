(function () {
  const SIGNS = [
    { id: "aries", label: "Aries", element: "fire" },
    { id: "taurus", label: "Taurus", element: "earth" },
    { id: "gemini", label: "Gemini", element: "air" },
    { id: "cancer", label: "Cancer", element: "water" },
    { id: "leo", label: "Leo", element: "fire" },
    { id: "virgo", label: "Virgo", element: "earth" },
    { id: "libra", label: "Libra", element: "air" },
    { id: "scorpio", label: "Scorpio", element: "water" },
    { id: "sagittarius", label: "Sagittarius", element: "fire" },
    { id: "capricorn", label: "Capricorn", element: "earth" },
    { id: "aquarius", label: "Aquarius", element: "air" },
    { id: "pisces", label: "Pisces", element: "water" },
  ];

  const STRENGTHS = [
    "Easy chemistry when you keep things simple.",
    "A natural rhythm that builds trust over time.",
    "Good balance of energy and calm.",
    "Shared curiosity makes conversations flow.",
    "You can motivate each other when goals are clear.",
    "Strong potential when you respect boundaries.",
  ];

  const CHALLENGES = [
    "Different communication styles can cause misunderstandings.",
    "Pace mismatch: one moves fast, the other prefers certainty.",
    "Stubbornness shows up when neither wants to yield.",
    "Emotional timing may not align on stressful days.",
    "Overthinking small issues can create distance.",
    "Too much intensity can feel overwhelming without breaks.",
  ];

  const TIPS_LOVE = [
    "Say what you need directly—mind reading doesn’t work.",
    "Make small plans consistently; reliability beats grand gestures.",
    "Keep conflict short and specific—return to warmth quickly.",
    "Balance closeness with personal space.",
  ];

  const TIPS_FRIENDSHIP = [
    "Lean into shared hobbies—fun is your glue.",
    "Be honest early; it prevents awkward buildup.",
    "Respect differences in social energy and routines.",
    "Check in regularly, even if briefly.",
  ];

  const TIPS_WORK = [
    "Define roles and expectations in writing.",
    "Use strengths: one leads, the other stabilizes.",
    "Keep feedback factual and timely.",
    "Agree on a decision process before big choices.",
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

  function signInfo(id) {
    return SIGNS.find((s) => s.id === id) || null;
  }

  function elementName(el) {
    const e = String(el || "");
    if (e === "fire") return "Fire";
    if (e === "earth") return "Earth";
    if (e === "air") return "Air";
    if (e === "water") return "Water";
    return e;
  }

  function baseScore(a, b) {
    if (!a || !b) return 50;
    if (a.id === b.id) return 86;
    if (a.element === b.element) return 82;

    const pair = `${a.element}|${b.element}`;
    const compatible = new Set(["fire|air", "air|fire", "earth|water", "water|earth"]);
    if (compatible.has(pair)) return 78;
    return 62;
  }

  function adjustForType(score, type) {
    const s = Number(score);
    if (!Number.isFinite(s)) return 50;
    if (type === "love") return s + 3;
    if (type === "work") return s - 2;
    return s;
  }

  function clampScore(score) {
    const n = Number(score);
    if (!Number.isFinite(n)) return 50;
    return Math.max(0, Math.min(100, Math.round(n)));
  }

  function tipsForType(type) {
    if (type === "love") return TIPS_LOVE;
    if (type === "work") return TIPS_WORK;
    return TIPS_FRIENDSHIP;
  }

  function generate() {
    const youId = String($("opt-you").value || "aries");
    const themId = String($("opt-them").value || "libra");
    const type = String($("opt-type").value || "love");
    const you = signInfo(youId);
    const them = signInfo(themId);

    const seed = hashString(`${youId}|${themId}|${type}`);
    const rng = mulberry32(seed);

    const score = clampScore(adjustForType(baseScore(you, them), type));
    const strength = pick(STRENGTHS, rng);
    const challenge = pick(CHALLENGES, rng);
    const tip = pick(tipsForType(type), rng);

    const lines = [
      `${t("tool.zodiacCompat.out.you")}: ${you ? you.label : youId}`,
      `${t("tool.zodiacCompat.out.them")}: ${them ? them.label : themId}`,
      `${t("tool.zodiacCompat.out.type")}: ${t(`tool.zodiacCompat.type.${type}`)}`,
      `${t("tool.zodiacCompat.out.elements")}: ${elementName(you ? you.element : "")} + ${elementName(them ? them.element : "")}`,
      `${t("tool.zodiacCompat.out.score")}: ${score}/100`,
      "",
      `${t("tool.zodiacCompat.out.strengths")}: ${strength}`,
      `${t("tool.zodiacCompat.out.challenges")}: ${challenge}`,
      `${t("tool.zodiacCompat.out.tip")}: ${tip}`,
    ];

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.zodiacCompat.status.done"), false);
    return { youId, themId, type, score };
  }

  function clearAll() {
    $("tool-output").value = "";
    setStatus("", false);
  }

  function main() {
    try {
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

      ["opt-you", "opt-them", "opt-type"].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("input", debounce);
        el.addEventListener("change", debounce);
      });

      $("btn-generate").addEventListener("click", generate);
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

