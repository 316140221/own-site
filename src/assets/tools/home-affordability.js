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

  function monthlyPayment(principal, monthlyRate, months) {
    const p = Number(principal);
    const r = Number(monthlyRate);
    const n = Number(months);
    if (!Number.isFinite(p) || !Number.isFinite(r) || !Number.isFinite(n) || n <= 0) return NaN;
    if (p <= 0) return 0;
    if (r === 0) return p / n;
    const pow = Math.pow(1 + r, n);
    return (p * r * pow) / (pow - 1);
  }

  function principalFromPayment(payment, monthlyRate, months) {
    const pay = Number(payment);
    const r = Number(monthlyRate);
    const n = Number(months);
    if (!Number.isFinite(pay) || !Number.isFinite(r) || !Number.isFinite(n) || n <= 0) return NaN;
    if (pay <= 0) return 0;
    if (r === 0) return pay * n;
    const pow = Math.pow(1 + r, n);
    return pay * (pow - 1) / (r * pow);
  }

  function calculate() {
    const incomeRaw = normalizeText($("opt-income").value);
    const income = normalizeNumber(incomeRaw);
    const debts = normalizeNumber($("opt-debts").value) ?? 0;

    const housingPct = clampFloat($("opt-housing-pct").value, 0, 60, 28);
    const dtiPct = clampFloat($("opt-dti").value, 0, 80, 36);

    const downMode = String($("opt-down-mode").value || "percent");
    const downRaw = normalizeNumber($("opt-down").value);

    const apr = clampFloat($("opt-apr").value, 0, 100, 0);
    const termYears = clampInt($("opt-term").value, 1, 50, 30);

    const taxYear = normalizeNumber($("opt-tax").value) ?? 0;
    const insuranceYear = normalizeNumber($("opt-insurance").value) ?? 0;
    const hoaMonth = normalizeNumber($("opt-hoa").value) ?? 0;
    const pmiMonth = normalizeNumber($("opt-pmi").value) ?? 0;

    const typedAny = [
      $("opt-income").value,
      $("opt-debts").value,
      $("opt-down").value,
      $("opt-tax").value,
      $("opt-insurance").value,
      $("opt-hoa").value,
      $("opt-pmi").value,
    ].some((v) => normalizeText(v));

    if (!typedAny) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    if (income == null || !Number.isFinite(income) || income <= 0) {
      $("tool-output").value = "";
      setStatus(t("tool.homeAfford.error.income"), true);
      return null;
    }

    if (!Number.isFinite(debts) || debts < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.homeAfford.error.debts"), true);
      return null;
    }

    const housingLimit = income * (housingPct / 100);
    const dtiLimit = income * (dtiPct / 100) - debts;
    const allowedHousing = Math.min(housingLimit, dtiLimit);

    if (!Number.isFinite(allowedHousing) || allowedHousing <= 0) {
      $("tool-output").value = "";
      setStatus(t("tool.homeAfford.error.allowed"), true);
      return null;
    }

    const extrasMonthly = (taxYear / 12) + (insuranceYear / 12) + hoaMonth + pmiMonth;
    const maxPI = allowedHousing - extrasMonthly;
    if (!Number.isFinite(maxPI) || maxPI <= 0) {
      $("tool-output").value = "";
      setStatus(t("tool.homeAfford.error.extras"), true);
      return null;
    }

    const months = termYears * 12;
    const monthlyRate = apr / 100 / 12;
    const loanAmount = principalFromPayment(maxPI, monthlyRate, months);
    if (!Number.isFinite(loanAmount) || loanAmount <= 0) {
      $("tool-output").value = "";
      setStatus(t("tool.homeAfford.error.generic"), true);
      return null;
    }

    let downAmount = 0;
    let downPct = 0;
    let homePrice = 0;

    if (downMode === "amount") {
      if (downRaw == null || !Number.isFinite(downRaw) || downRaw < 0) {
        $("tool-output").value = "";
        setStatus(t("tool.homeAfford.error.down"), true);
        return null;
      }
      downAmount = downRaw;
      homePrice = loanAmount + downAmount;
      downPct = homePrice > 0 ? (downAmount / homePrice) * 100 : 0;
    } else {
      const pct = downRaw == null ? 20 : downRaw;
      if (!Number.isFinite(pct) || pct < 0 || pct >= 100) {
        $("tool-output").value = "";
        setStatus(t("tool.homeAfford.error.down"), true);
        return null;
      }
      downPct = pct;
      homePrice = loanAmount / (1 - downPct / 100);
      downAmount = homePrice - loanAmount;
    }

    const pi = monthlyPayment(loanAmount, monthlyRate, months);
    const monthlyTotal = pi + extrasMonthly;

    const lines = [
      `${t("tool.homeAfford.out.income")}: ${formatMoney(income)}`,
      `${t("tool.homeAfford.out.debts")}: ${formatMoney(debts)}`,
      `${t("tool.homeAfford.out.housingLimit")}: ${formatMoney(housingLimit)} (${formatPercent(housingPct)})`,
      `${t("tool.homeAfford.out.dtiLimit")}: ${formatMoney(dtiLimit)} (${formatPercent(dtiPct)})`,
      `${t("tool.homeAfford.out.allowed")}: ${formatMoney(allowedHousing)}`,
      "",
      `${t("tool.homeAfford.out.extras")}: ${formatMoney(extrasMonthly)}`,
      `${t("tool.homeAfford.out.maxPI")}: ${formatMoney(maxPI)}`,
      "",
      `${t("tool.homeAfford.out.loanAmount")}: ${formatMoney(loanAmount)}`,
      `${t("tool.homeAfford.out.downPayment")}: ${formatMoney(downAmount)} (${formatPercent(downPct)})`,
      `${t("tool.homeAfford.out.homePrice")}: ${formatMoney(homePrice)}`,
      "",
      `${t("tool.homeAfford.out.apr")}: ${formatPercent(apr)}`,
      `${t("tool.homeAfford.out.term")}: ${termYears} ${t("tool.homeAfford.years")}`,
      `${t("tool.homeAfford.out.pi")}: ${formatMoney(pi)}`,
      `${t("tool.homeAfford.out.monthlyTotal")}: ${formatMoney(monthlyTotal)}`,
    ];

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.homeAfford.status.done"), false);
    return { homePrice, loanAmount, downAmount, pi, allowedHousing };
  }

  function clearAll() {
    $("opt-income").value = "";
    $("opt-debts").value = "";
    $("opt-down").value = "";
    $("opt-tax").value = "";
    $("opt-insurance").value = "";
    $("opt-hoa").value = "";
    $("opt-pmi").value = "";
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
          }, 120);
        };
      })();

      [
        "opt-income",
        "opt-debts",
        "opt-housing-pct",
        "opt-dti",
        "opt-down-mode",
        "opt-down",
        "opt-apr",
        "opt-term",
        "opt-tax",
        "opt-insurance",
        "opt-hoa",
        "opt-pmi",
      ].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("input", debounce);
        el.addEventListener("change", debounce);
      });

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

