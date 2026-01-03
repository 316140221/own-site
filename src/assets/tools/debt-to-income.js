(function () {
  const STORAGE_INCOME = "tool_dti_income";
  const STORAGE_HOUSING = "tool_dti_housing";
  const STORAGE_CAR = "tool_dti_car";
  const STORAGE_STUDENT = "tool_dti_student";
  const STORAGE_CREDIT = "tool_dti_credit";
  const STORAGE_OTHER = "tool_dti_other";

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
    const cleaned = raw.replace(/[$,]/g, "").replace(/\s+/g, "");
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
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
    return `${n.toFixed(2).replace(/\.?0+$/g, "")}%`;
  }

  function classify(dti) {
    const v = Number(dti);
    if (!Number.isFinite(v) || v < 0) return "tool.dti.category.unknown";
    if (v < 20) return "tool.dti.category.low";
    if (v < 36) return "tool.dti.category.ok";
    if (v < 43) return "tool.dti.category.borderline";
    return "tool.dti.category.high";
  }

  function calculate() {
    const income = normalizeNumber($("opt-income").value);
    const housing = normalizeNumber($("opt-housing").value) ?? 0;
    const car = normalizeNumber($("opt-car").value) ?? 0;
    const student = normalizeNumber($("opt-student").value) ?? 0;
    const credit = normalizeNumber($("opt-credit").value) ?? 0;
    const other = normalizeNumber($("opt-other").value) ?? 0;

    const typedAny = [
      $("opt-income").value,
      $("opt-housing").value,
      $("opt-car").value,
      $("opt-student").value,
      $("opt-credit").value,
      $("opt-other").value,
    ].some((v) => normalizeText(v));

    if (!typedAny) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    if (income == null || !Number.isFinite(income) || income <= 0) {
      $("tool-output").value = "";
      setStatus(t("tool.dti.error.income"), true);
      return null;
    }

    const debts = { housing, car, student, credit, other };
    const debtLabels = {
      housing: t("tool.dti.housing"),
      car: t("tool.dti.car"),
      student: t("tool.dti.student"),
      credit: t("tool.dti.credit"),
      other: t("tool.dti.other"),
    };
    for (const [key, value] of Object.entries(debts)) {
      if (!Number.isFinite(value) || value < 0) {
        $("tool-output").value = "";
        setStatus(t("tool.dti.error.debt", { field: debtLabels[key] || key }), true);
        return null;
      }
    }

    const totalDebt = housing + car + student + credit + other;
    const dti = (totalDebt / income) * 100;
    const categoryKey = classify(dti);

    const lines = [
      `${t("tool.dti.out.income")}: ${formatMoney(income)}`,
      `${t("tool.dti.out.totalDebt")}: ${formatMoney(totalDebt)}`,
      `${t("tool.dti.out.dti")}: ${formatPercent(dti)}`,
      `${t("tool.dti.out.category")}: ${t(categoryKey)}`,
      "",
      `${t("tool.dti.out.breakdown")}:`,
      `- ${t("tool.dti.housing")}: ${formatMoney(housing)}`,
      `- ${t("tool.dti.car")}: ${formatMoney(car)}`,
      `- ${t("tool.dti.student")}: ${formatMoney(student)}`,
      `- ${t("tool.dti.credit")}: ${formatMoney(credit)}`,
      `- ${t("tool.dti.other")}: ${formatMoney(other)}`,
    ];

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.dti.status.done"), false);

    storageSet(STORAGE_INCOME, String(income));
    storageSet(STORAGE_HOUSING, String(housing));
    storageSet(STORAGE_CAR, String(car));
    storageSet(STORAGE_STUDENT, String(student));
    storageSet(STORAGE_CREDIT, String(credit));
    storageSet(STORAGE_OTHER, String(other));

    return { income, totalDebt, dti };
  }

  function clearAll() {
    ["opt-income", "opt-housing", "opt-car", "opt-student", "opt-credit", "opt-other"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    $("tool-output").value = "";
    setStatus("", false);
  }

  function restorePrefs() {
    const income = storageGet(STORAGE_INCOME);
    if (income != null) $("opt-income").value = income;
    const housing = storageGet(STORAGE_HOUSING);
    if (housing != null) $("opt-housing").value = housing;
    const car = storageGet(STORAGE_CAR);
    if (car != null) $("opt-car").value = car;
    const student = storageGet(STORAGE_STUDENT);
    if (student != null) $("opt-student").value = student;
    const credit = storageGet(STORAGE_CREDIT);
    if (credit != null) $("opt-credit").value = credit;
    const other = storageGet(STORAGE_OTHER);
    if (other != null) $("opt-other").value = other;
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
          }, 80);
        };
      })();

      ["opt-income", "opt-housing", "opt-car", "opt-student", "opt-credit", "opt-other"].forEach((id) => {
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
