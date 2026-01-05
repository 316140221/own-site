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

  const DATA = {
    2024: {
      ssWageBase: 168600,
      addlMedThresholds: {
        single: 200000,
        mfj: 250000,
        mfs: 125000,
      },
    },
  };

  function formatMoney(num) {
    return Number(num || 0).toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
  }

  function setSeFactorEnabled(mode) {
    const checkbox = $("opt-se-factor");
    const enabled = mode === "self";
    checkbox.disabled = !enabled;
    checkbox.closest("label")?.classList.toggle("tool-option-disabled", !enabled);
  }

  function calculate() {
    const incomeRaw = normalizeText($("opt-income").value);
    const income = normalizeNumber(incomeRaw);
    const year = Number($("opt-year").value);
    const mode = String($("opt-type").value || "employee");
    const status = String($("opt-status").value || "single");
    const applySeFactor = Boolean($("opt-se-factor").checked);

    setSeFactorEnabled(mode);

    if (!incomeRaw) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    if (!Number.isFinite(income) || income < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.fica.error.income"), true);
      return null;
    }

    const config = DATA[year];
    if (!config) {
      $("tool-output").value = "";
      setStatus(t("tool.fica.error.year"), true);
      return null;
    }

    const threshold = config.addlMedThresholds[status];
    if (!Number.isFinite(threshold)) {
      $("tool-output").value = "";
      setStatus(t("tool.fica.error.status"), true);
      return null;
    }

    const seFactor = mode === "self" && applySeFactor ? 0.9235 : 1;
    const earnings = income * seFactor;
    const ssWages = Math.min(earnings, config.ssWageBase);

    let ssRate = 0;
    let medicareRate = 0;
    let addlMedRate = 0.009;

    if (mode === "employee" || mode === "employer") {
      ssRate = 0.062;
      medicareRate = 0.0145;
    } else if (mode === "both" || mode === "self") {
      ssRate = 0.124;
      medicareRate = 0.029;
    } else {
      $("tool-output").value = "";
      setStatus(t("tool.fica.error.mode"), true);
      return null;
    }

    const ssTax = ssWages * ssRate;
    const medicareTax = earnings * medicareRate;

    const addlMedBase = Math.max(0, earnings - threshold);
    const addlMedTax =
      mode === "employer" ? 0 : addlMedBase * addlMedRate; // employer does not pay Additional Medicare tax

    const total = ssTax + medicareTax + addlMedTax;

    const modeLabelKey =
      mode === "employee"
        ? "tool.fica.type.employee"
        : mode === "employer"
          ? "tool.fica.type.employer"
          : mode === "both"
            ? "tool.fica.type.both"
            : "tool.fica.type.self";

    const statusLabelKey =
      status === "single" ? "tool.fica.status.single" : status === "mfj" ? "tool.fica.status.mfj" : "tool.fica.status.mfs";

    const lines = [
      `${t("tool.fica.out.year")}: ${year}`,
      `${t("tool.fica.out.mode")}: ${t(modeLabelKey)}`,
      `${t("tool.fica.out.income")}: $${formatMoney(income)}`,
    ];

    if (mode === "self") {
      lines.push(
        `${t("tool.fica.out.seFactor")}: ${applySeFactor ? "0.9235" : "1.0000"}`,
        `${t("tool.fica.out.netEarnings")}: $${formatMoney(earnings)}`
      );
    }

    lines.push(
      "",
      `${t("tool.fica.out.ssWageBase")}: $${formatMoney(config.ssWageBase)}`,
      `${t("tool.fica.out.ssWages")}: $${formatMoney(ssWages)}`,
      `${t("tool.fica.out.ssRate")}: ${(ssRate * 100).toFixed(2)}%`,
      `${t("tool.fica.out.ssTax")}: $${formatMoney(ssTax)}`,
      "",
      `${t("tool.fica.out.medicareRate")}: ${(medicareRate * 100).toFixed(2)}%`,
      `${t("tool.fica.out.medicareTax")}: $${formatMoney(medicareTax)}`,
      "",
      `${t("tool.fica.out.addlThreshold")}: $${formatMoney(threshold)} (${t(statusLabelKey)})`,
      `${t("tool.fica.out.addlRate")}: ${(addlMedRate * 100).toFixed(2)}%`,
      `${t("tool.fica.out.addlBase")}: $${formatMoney(addlMedBase)}`,
      `${t("tool.fica.out.addlTax")}: $${formatMoney(addlMedTax)}`,
      "",
      `${t("tool.fica.out.total")}: $${formatMoney(total)}`
    );

    if (mode === "self") {
      const halfDeduction = (ssTax + medicareTax) / 2;
      lines.push("", `${t("tool.fica.out.halfDeduction")}: $${formatMoney(halfDeduction)}`);
    }

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.fica.status.done"), false);
    return { total };
  }

  function clearAll() {
    $("opt-income").value = "";
    $("tool-output").value = "";
    setStatus("", false);
  }

  function main() {
    try {
      setStatus("", false);
      calculate();

      ["opt-income", "opt-year", "opt-type", "opt-status", "opt-se-factor"].forEach((id) => {
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
