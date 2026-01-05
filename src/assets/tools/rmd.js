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

  const UNIFORM_TABLE = {
    70: 27.4,
    71: 26.5,
    72: 25.6,
    73: 24.7,
    74: 23.8,
    75: 22.9,
    76: 22.0,
    77: 21.2,
    78: 20.3,
    79: 19.5,
    80: 18.7,
    81: 17.9,
    82: 17.1,
    83: 16.3,
    84: 15.5,
    85: 14.8,
    86: 14.1,
    87: 13.4,
    88: 12.7,
    89: 12.0,
    90: 11.4,
    91: 10.8,
    92: 10.2,
    93: 9.6,
    94: 9.1,
    95: 8.6,
  };

  function divisorForAge(age) {
    if (Object.prototype.hasOwnProperty.call(UNIFORM_TABLE, age)) return UNIFORM_TABLE[age];
    if (age > 95) return 8.1;
    return null;
  }

  function calculate() {
    const balanceRaw = normalizeText($("opt-balance").value);
    const balance = normalizeNumber(balanceRaw);
    const age = Number($("opt-age").value);
    const showTable = Boolean($("opt-show-table").checked);

    if (!balanceRaw) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    if (balance == null || !Number.isFinite(balance) || balance <= 0) {
      $("tool-output").value = "";
      setStatus(t("tool.rmd.error.balance"), true);
      return null;
    }

    if (!Number.isFinite(age) || age < 50 || age > 110) {
      $("tool-output").value = "";
      setStatus(t("tool.rmd.error.age"), true);
      return null;
    }

    const divisor = divisorForAge(age);
    if (!divisor) {
      $("tool-output").value = "";
      setStatus(t("tool.rmd.error.table"), true);
      return null;
    }

    const rmd = balance / divisor;
    const lines = [
      `${t("tool.rmd.out.age")}: ${age}`,
      `${t("tool.rmd.out.balance")}: ${balance.toLocaleString()}`,
      `${t("tool.rmd.out.divisor")}: ${divisor}`,
      `${t("tool.rmd.out.rmd")}: ${rmd.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
    ];

    if (showTable) {
      lines.push("", t("tool.rmd.out.table"));
      for (let a = 70; a <= 95; a += 1) {
        const d = divisorForAge(a);
        if (!d) continue;
        lines.push(`${t("tool.rmd.out.age")} ${a}: ${t("tool.rmd.out.divisor")}: ${d}`);
      }
      lines.push("…");
    }

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.rmd.status.done"), false);
    return { rmd };
  }

  function clearAll() {
    $("opt-balance").value = "";
    $("tool-output").value = "";
    setStatus("", false);
  }

  function main() {
    try {
      setStatus("", false);
      calculate();

      ["opt-balance", "opt-age", "opt-show-table"].forEach((id) => {
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
