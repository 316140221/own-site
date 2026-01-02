(function () {
  const STORAGE_TIP_PERCENT = "tool_tip_percent";
  const STORAGE_PEOPLE = "tool_tip_people";
  const STORAGE_ROUND = "tool_tip_round";

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

  function normalizeText(value) {
    return String(value || "").trim();
  }

  function normalizeNumber(value) {
    const raw = normalizeText(value);
    if (!raw) return null;
    const cleaned = raw.replace(/,/g, "").replace(/\s+/g, "");
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }

  const currencyFormatter = (() => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
      });
    } catch (_error) {
      return null;
    }
  })();

  function formatMoney(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "";
    if (currencyFormatter) return currencyFormatter.format(n);
    return `$${n.toFixed(2)}`;
  }

  function clampInt(value, min, max, fallback) {
    const n = Number.parseInt(String(value ?? ""), 10);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }

  function clampFloat(value, min, max, fallback) {
    const n = Number(String(value ?? ""));
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }

  function calculate() {
    const bill = normalizeNumber($("tool-input").value);
    const tipPercent = clampFloat($("opt-tip-percent").value, 0, 500, 18);
    const people = clampInt($("opt-people").value, 1, 1000, 1);
    const round = Boolean($("opt-round").checked);

    if (bill == null && !normalizeText($("tool-input").value)) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    if (bill == null || !Number.isFinite(bill) || bill < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.tip.error.bill"), true);
      return null;
    }

    const rawTip = bill * (tipPercent / 100);
    const rawTotal = bill + rawTip;

    let tip = rawTip;
    let total = rawTotal;

    if (round) {
      const perPerson = rawTotal / people;
      const roundedPerPerson = Math.ceil(perPerson);
      total = roundedPerPerson * people;
      tip = total - bill;
    }

    const perPersonBill = bill / people;
    const perPersonTip = tip / people;
    const perPersonTotal = total / people;
    const effectiveTipPercent = bill > 0 ? (tip / bill) * 100 : 0;

    const lines = [
      `${t("tool.tip.out.bill")}: ${formatMoney(bill)}`,
      `${t("tool.tip.out.tip")}: ${formatMoney(tip)} (${effectiveTipPercent.toFixed(2)}%)`,
      `${t("tool.tip.out.total")}: ${formatMoney(total)}`,
      "",
      `${t("tool.tip.out.split")}: ${people}`,
      `${t("tool.tip.out.perPersonBill")}: ${formatMoney(perPersonBill)}`,
      `${t("tool.tip.out.perPersonTip")}: ${formatMoney(perPersonTip)}`,
      `${t("tool.tip.out.perPersonTotal")}: ${formatMoney(perPersonTotal)}`,
    ];

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.tip.status.done"), false);

    storageSet(STORAGE_TIP_PERCENT, String(tipPercent));
    storageSet(STORAGE_PEOPLE, String(people));
    storageSet(STORAGE_ROUND, round ? "1" : "0");

    return { bill, tipPercent, people, round };
  }

  function clearAll() {
    $("tool-input").value = "";
    $("tool-output").value = "";
    setStatus("", false);
  }

  function applyPreset(percent) {
    const value = clampFloat(percent, 0, 500, 18);
    $("opt-tip-percent").value = String(value);
    calculate();
  }

  function restorePrefs() {
    const savedTip = storageGet(STORAGE_TIP_PERCENT);
    if (savedTip != null) $("opt-tip-percent").value = savedTip;

    const savedPeople = storageGet(STORAGE_PEOPLE);
    if (savedPeople != null) $("opt-people").value = savedPeople;

    const savedRound = storageGet(STORAGE_ROUND);
    if (savedRound != null) $("opt-round").checked = savedRound === "1";
  }

  function main() {
    try {
      restorePrefs();
      setStatus("", false);
      calculate();

      const debounce = (() => {
        let handle = 0;
        return () => {
          if (handle) window.clearTimeout(handle);
          handle = window.setTimeout(() => {
            handle = 0;
            calculate();
          }, 60);
        };
      })();

      ["tool-input", "opt-tip-percent", "opt-people", "opt-round"].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("input", debounce);
        el.addEventListener("change", debounce);
      });

      document.querySelectorAll("[data-tip-preset]").forEach((el) => {
        el.addEventListener("click", () => {
          const value = el.getAttribute("data-tip-preset") || "";
          applyPreset(value);
        });
      });

      $("btn-calc").addEventListener("click", () => {
        calculate();
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

