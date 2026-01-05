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

  const LIMITS_2024 = {
    employee401k: 23000,
    catchup401k: 7500,
    total401k: 69000,
    ira: 7000,
    catchupIra: 1000,
  };

  function getLimits(year, age) {
    if (year === 2024) {
      const catchup = age >= 50;
      const employee401k = LIMITS_2024.employee401k + (catchup ? LIMITS_2024.catchup401k : 0);
      const total401k = LIMITS_2024.total401k + (catchup ? LIMITS_2024.catchup401k : 0);
      const ira = LIMITS_2024.ira + (catchup ? LIMITS_2024.catchupIra : 0);
      return { employee401k, total401k, ira, catchup };
    }
    return null;
  }

  function formatCurrency(num) {
    return Number(num || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function statusLine(planned, limit) {
    if (!Number.isFinite(planned) || planned <= 0) return `${t("tool.contrib.status.none")}`;
    const diff = limit - planned;
    if (diff > 0) return `${t("tool.contrib.status.remaining")}: $${formatCurrency(diff)}`;
    if (diff < 0) return `${t("tool.contrib.status.excess")}: $${formatCurrency(Math.abs(diff))}`;
    return t("tool.contrib.status.maxed");
  }

  function calculate() {
    const age = Number($("opt-age").value);
    const year = Number($("opt-year").value);
    const kEmployee = normalizeNumber($("opt-k-employee").value) || 0;
    const kEmployer = normalizeNumber($("opt-k-employer").value) || 0;
    const ira = normalizeNumber($("opt-ira").value) || 0;

    if (!Number.isFinite(age) || age < 16 || age > 80) {
      $("tool-output").value = "";
      setStatus(t("tool.contrib.error.age"), true);
      return null;
    }

    const limits = getLimits(year, age);
    if (!limits) {
      $("tool-output").value = "";
      setStatus(t("tool.contrib.error.year"), true);
      return null;
    }

    const employeeStatus = statusLine(kEmployee, limits.employee401k);
    const totalPlanned = kEmployee + kEmployer;
    const totalStatus = statusLine(totalPlanned, limits.total401k);
    const iraStatus = statusLine(ira, limits.ira);

    const lines = [
      `${t("tool.contrib.out.year")}: ${year}`,
      `${t("tool.contrib.out.age")}: ${age}${limits.catchup ? ` (${t("tool.contrib.out.catchup")})` : ""}`,
      "",
      `${t("tool.contrib.out.kEmployee")}: $${formatCurrency(kEmployee)}`,
      `${t("tool.contrib.out.kEmployeeLimit")}: $${formatCurrency(limits.employee401k)}`,
      `${t("tool.contrib.out.status")}: ${employeeStatus}`,
      "",
      `${t("tool.contrib.out.kEmployer")}: $${formatCurrency(kEmployer)}`,
      `${t("tool.contrib.out.kTotal")}: $${formatCurrency(totalPlanned)}`,
      `${t("tool.contrib.out.kTotalLimit")}: $${formatCurrency(limits.total401k)}`,
      `${t("tool.contrib.out.status")}: ${totalStatus}`,
      "",
      `${t("tool.contrib.out.ira")}: $${formatCurrency(ira)}`,
      `${t("tool.contrib.out.iraLimit")}: $${formatCurrency(limits.ira)}`,
      `${t("tool.contrib.out.status")}: ${iraStatus}`,
    ];

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.contrib.status.done"), false);
    return { limits };
  }

  function clearAll() {
    $("opt-k-employee").value = "";
    $("opt-k-employer").value = "";
    $("opt-ira").value = "";
    $("tool-output").value = "";
    setStatus("", false);
  }

  function main() {
    try {
      setStatus("", false);
      calculate();

      ["opt-age", "opt-year", "opt-k-employee", "opt-k-employer", "opt-ira"].forEach((id) => {
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
