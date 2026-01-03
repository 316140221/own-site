(function () {
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

  const currencyFormatter = (() => {
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });
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

  function formatPercent(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "";
    return `${n.toFixed(3).replace(/\.?0+$/g, "")}%`;
  }

  function monthlyRateFromApr(aprPercent) {
    const apr = Number(aprPercent);
    if (!Number.isFinite(apr) || apr <= 0) return 0;
    const factor = Math.pow(1 + apr / 100, 1 / 12);
    return factor - 1;
  }

  function calculate() {
    const principalRaw = normalizeText($("opt-principal").value);
    const principal = normalizeNumber(principalRaw);
    const contribution = normalizeNumber($("opt-contribution").value) ?? 0;
    const annualReturn = clampFloat($("opt-return").value, 0, 50, 0);
    const fee = clampFloat($("opt-fee").value, 0, 10, 0);
    const years = clampInt($("opt-years").value, 0, 100, 0);
    const timing = String($("opt-timing").value || "end");
    const showBreakdown = Boolean($("opt-show-breakdown").checked);

    if (!principalRaw) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    if (principal == null || !Number.isFinite(principal) || principal < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.investmentFees.error.principal"), true);
      return null;
    }

    if (!Number.isFinite(contribution) || contribution < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.investmentFees.error.contribution"), true);
      return null;
    }

    if (years <= 0) {
      $("tool-output").value = "";
      setStatus(t("tool.investmentFees.error.years"), true);
      return null;
    }

    const months = years * 12;
    const grossMonthly = monthlyRateFromApr(annualReturn);
    const feeMonthly = fee / 100 / 12;
    const isStart = timing === "start";

    let withFee = principal;
    let withoutFee = principal;
    let feesPaid = 0;
    let totalContrib = 0;
    const breakdown = [];

    for (let m = 1; m <= months; m += 1) {
      if (isStart) {
        withFee += contribution;
        withoutFee += contribution;
        totalContrib += contribution;
      }

      const interestNoFee = withoutFee * grossMonthly;
      withoutFee += interestNoFee;

      const interestWithFee = withFee * grossMonthly;
      withFee += interestWithFee;

      const charged = withFee * feeMonthly;
      withFee -= charged;
      feesPaid += charged;

      if (!isStart) {
        withFee += contribution;
        withoutFee += contribution;
        totalContrib += contribution;
      }

      if (showBreakdown && m % 12 === 0) {
        breakdown.push({
          year: m / 12,
          withFee,
          withoutFee,
          feesPaid,
        });
      }
    }

    const diff = withoutFee - withFee;

    const lines = [
      `${t("tool.investmentFees.out.principal")}: ${formatMoney(principal)}`,
      `${t("tool.investmentFees.out.contribution")}: ${formatMoney(contribution)}`,
      `${t("tool.investmentFees.out.return")}: ${formatPercent(annualReturn)}`,
      `${t("tool.investmentFees.out.fee")}: ${formatPercent(fee)}`,
      `${t("tool.investmentFees.out.years")}: ${years}`,
      `${t("tool.investmentFees.out.timing")}: ${t(isStart ? "tool.investmentFees.timing.start" : "tool.investmentFees.timing.end")}`,
      "",
      `${t("tool.investmentFees.out.totalContrib")}: ${formatMoney(totalContrib)}`,
      `${t("tool.investmentFees.out.finalNoFee")}: ${formatMoney(withoutFee)}`,
      `${t("tool.investmentFees.out.finalWithFee")}: ${formatMoney(withFee)}`,
      `${t("tool.investmentFees.out.diff")}: ${formatMoney(diff)}`,
      `${t("tool.investmentFees.out.feesPaid")}: ${formatMoney(feesPaid)}`,
    ];

    if (showBreakdown && breakdown.length) {
      lines.push("", t("tool.investmentFees.out.breakdown"));
      const max = Math.min(30, breakdown.length);
      for (let i = 0; i < max; i += 1) {
        const row = breakdown[i];
        lines.push(
          `${t("tool.investmentFees.out.year")} ${row.year}: ${t("tool.investmentFees.out.noFee")}: ${formatMoney(row.withoutFee)} · ${t("tool.investmentFees.out.withFee")}: ${formatMoney(row.withFee)} · ${t("tool.investmentFees.out.feesPaid")}: ${formatMoney(row.feesPaid)}`
        );
      }
      if (breakdown.length > max) lines.push("…");
    }

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.investmentFees.status.done"), false);
    return { withFee, withoutFee, feesPaid };
  }

  function clearAll() {
    $("opt-principal").value = "";
    $("opt-contribution").value = "";
    $("tool-output").value = "";
    setStatus("", false);
  }

  function main() {
    try {
      setStatus("", false);
      calculate();

      const debounce = (() => {
        let handle = 0;
        return () => {
          if (handle) window.clearTimeout(handle);
          handle = window.setTimeout(() => {
            handle = 0;
            calculate();
          }, 100);
        };
      })();

      ["opt-principal", "opt-contribution", "opt-return", "opt-fee", "opt-years", "opt-timing", "opt-show-breakdown"].forEach(
        (id) => {
          const el = document.getElementById(id);
          if (!el) return;
          el.addEventListener("input", debounce);
          el.addEventListener("change", debounce);
        }
      );

      $("btn-calc").addEventListener("click", calculate);
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

