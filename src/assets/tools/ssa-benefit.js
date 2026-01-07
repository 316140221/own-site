(function () {
  function t(key, vars) {
    if (window.SiteI18n && typeof window.SiteI18n.t === "function") return window.SiteI18n.t(key, vars);
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

  function normalizeText(value) {
    return String(value || "").trim();
  }

  function normalizeNumber(value) {
    const raw = normalizeText(value);
    if (!raw) return null;
    const cleaned = raw.replace(/[$,]/g, "").replace(/\s+/g, "");
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }

  const BEND_POINTS = [1174, 7078]; // 2024 bend points for AIME

  function computePia(aime) {
    const [bp1, bp2] = BEND_POINTS;
    const first = Math.min(aime, bp1) * 0.9;
    const second = Math.max(0, Math.min(aime, bp2) - bp1) * 0.32;
    const third = Math.max(0, aime - bp2) * 0.15;
    return first + second + third;
  }

  function calculate() {
    const aimeRaw = normalizeText($("opt-aime").value);
    const aime = normalizeNumber(aimeRaw);
    const fra = Number($("opt-fra").value);
    const claimAge = Number($("opt-claim").value);
    const cola = Number($("opt-cola").value);
    const years = Number($("opt-years").value);

    if (!aimeRaw) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    if (!Number.isFinite(aime) || aime <= 0) {
      $("tool-output").value = "";
      setStatus(t("tool.ssa.error.aime"), true);
      return null;
    }

    if (!Number.isFinite(fra) || fra < 66 || fra > 67) {
      $("tool-output").value = "";
      setStatus(t("tool.ssa.error.fra"), true);
      return null;
    }

    if (!Number.isFinite(claimAge) || claimAge < 62 || claimAge > 70) {
      $("tool-output").value = "";
      setStatus(t("tool.ssa.error.claim"), true);
      return null;
    }

    if (!Number.isFinite(cola) || cola < 0 || cola > 10) {
      $("tool-output").value = "";
      setStatus(t("tool.ssa.error.cola"), true);
      return null;
    }

    if (!Number.isFinite(years) || years < 0 || years > 40) {
      $("tool-output").value = "";
      setStatus(t("tool.ssa.error.years"), true);
      return null;
    }

    const pia = computePia(aime);
    const monthDiff = Math.round((claimAge - fra) * 12);
    let adjFactor = 1;
    let adjustment = 0;

    if (monthDiff < 0) {
      const monthsEarly = Math.abs(monthDiff);
      const tier1 = Math.min(36, monthsEarly);
      const tier2 = Math.max(0, monthsEarly - 36);
      const reduction = tier1 * (5 / 9) / 100 + tier2 * (5 / 12) / 100;
      adjFactor = Math.max(0, 1 - reduction);
      adjustment = -reduction;
    } else if (monthDiff > 0) {
      const creditPerMonth = 0.08 / 12;
      const increase = monthDiff * creditPerMonth;
      adjFactor = 1 + increase;
      adjustment = increase;
    }

    const benefitAtClaim = pia * adjFactor;
    const colaFactor = years > 0 ? Math.pow(1 + cola / 100, years) : 1;
    const benefitWithCola = benefitAtClaim * colaFactor;

    const formatCurrency = (num) =>
      Number(num || 0).toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });

    const lines = [
      `${t("tool.ssa.out.aime")}: $${formatCurrency(aime)}`,
      `${t("tool.ssa.out.pia")}: $${formatCurrency(pia)}`,
      `${t("tool.ssa.out.fra")}: ${fra.toFixed(2).replace(/\.00$/, "")}`,
      `${t("tool.ssa.out.claimAge")}: ${claimAge.toFixed(2).replace(/\.00$/, "")}`,
      `${t("tool.ssa.out.diff")}: ${monthDiff > 0 ? "+" : ""}${monthDiff} ${t("tool.ssa.out.months")}`,
      `${t("tool.ssa.out.adjustment")}: ${(adjustment >= 0 ? "+" : "")}${(adjustment * 100).toFixed(2)}%`,
      `${t("tool.ssa.out.claimBenefit")}: $${formatCurrency(benefitAtClaim)} / ${t("tool.ssa.out.month")}`,
      `${t("tool.ssa.out.claimAnnual")}: $${formatCurrency(benefitAtClaim * 12)} / ${t("tool.ssa.out.year")}`,
    ];

    if (years > 0) {
      lines.push(
        "",
        `${t("tool.ssa.out.colaBenefit", { years })}: $${formatCurrency(benefitWithCola)} / ${t("tool.ssa.out.month")}`,
        `${t("tool.ssa.out.colaAnnual")}: $${formatCurrency(benefitWithCola * 12)} / ${t("tool.ssa.out.year")}`
      );
    }

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.ssa.status.done"), false);
    return { pia, benefitAtClaim };
  }

  function clearAll() {
    $("opt-aime").value = "";
    $("opt-years").value = "0";
    $("tool-output").value = "";
    setStatus("", false);
  }

  function main() {
    try {
      setStatus("", false);
      calculate();

      ["opt-aime", "opt-fra", "opt-claim", "opt-cola", "opt-years"].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("input", calculate);
        el.addEventListener("change", calculate);
      });

      $("btn-calc").addEventListener("click", calculate);
      $("btn-clear").addEventListener("click", clearAll);
      $("btn-copy").addEventListener("click", async () => {
        try {
          const out = $("tool-output").value || "";
          if (!out.trim()) return;
          await copyToClipboard(out);
          setStatus(t("tool.common.status.copied"), false);
        } catch (_err) {
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
