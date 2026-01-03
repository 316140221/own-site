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

  function periodsForFrequency(freq) {
    if (freq === "weekly") return 52;
    if (freq === "biweekly") return 26;
    if (freq === "semimonthly") return 24;
    return 12;
  }

  function calculate() {
    const grossRaw = normalizeText($("opt-gross").value);
    const gross = normalizeNumber(grossRaw);
    const frequency = String($("opt-frequency").value || "biweekly");
    const pretax = normalizeNumber($("opt-pretax").value) ?? 0;
    const posttax = normalizeNumber($("opt-posttax").value) ?? 0;
    const showAnnual = Boolean($("opt-show-annual").checked);

    const federalRate = clampFloat($("opt-federal").value, 0, 60, 0);
    const stateRate = clampFloat($("opt-state").value, 0, 25, 0);
    const localRate = clampFloat($("opt-local").value, 0, 10, 0);
    const ficaRate = clampFloat($("opt-fica").value, 0, 20, 0);

    if (!grossRaw) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    if (gross == null || !Number.isFinite(gross) || gross <= 0) {
      $("tool-output").value = "";
      setStatus(t("tool.takeHomePay.error.gross"), true);
      return null;
    }

    if (!Number.isFinite(pretax) || pretax < 0 || pretax > gross) {
      $("tool-output").value = "";
      setStatus(t("tool.takeHomePay.error.pretax"), true);
      return null;
    }

    if (!Number.isFinite(posttax) || posttax < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.takeHomePay.error.posttax"), true);
      return null;
    }

    const taxable = Math.max(0, gross - pretax);
    const federalTax = taxable * (federalRate / 100);
    const stateTax = taxable * (stateRate / 100);
    const localTax = taxable * (localRate / 100);
    const ficaTax = taxable * (ficaRate / 100);
    const taxesTotal = federalTax + stateTax + localTax + ficaTax;
    const net = taxable - taxesTotal - posttax;

    if (!Number.isFinite(net) || net < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.takeHomePay.error.net"), true);
      return null;
    }

    const combinedRate = federalRate + stateRate + localRate + ficaRate;
    const perYear = periodsForFrequency(frequency);

    const lines = [
      `${t("tool.takeHomePay.out.gross")}: ${formatMoney(gross)}`,
      `${t("tool.takeHomePay.out.frequency")}: ${t(`tool.takeHomePay.frequency.${frequency}`)}`,
      "",
      `${t("tool.takeHomePay.out.pretax")}: ${formatMoney(pretax)}`,
      `${t("tool.takeHomePay.out.taxable")}: ${formatMoney(taxable)}`,
      "",
      `${t("tool.takeHomePay.out.federal")}: ${formatMoney(federalTax)} (${formatPercent(federalRate)})`,
      `${t("tool.takeHomePay.out.state")}: ${formatMoney(stateTax)} (${formatPercent(stateRate)})`,
      `${t("tool.takeHomePay.out.local")}: ${formatMoney(localTax)} (${formatPercent(localRate)})`,
      `${t("tool.takeHomePay.out.fica")}: ${formatMoney(ficaTax)} (${formatPercent(ficaRate)})`,
      `${t("tool.takeHomePay.out.taxesTotal")}: ${formatMoney(taxesTotal)} (${formatPercent(combinedRate)})`,
      "",
      `${t("tool.takeHomePay.out.posttax")}: ${formatMoney(posttax)}`,
      `${t("tool.takeHomePay.out.net")}: ${formatMoney(net)}`,
      `${t("tool.takeHomePay.out.takeHomeRate")}: ${formatPercent((net / gross) * 100)}`,
    ];

    if (showAnnual) {
      const annualGross = gross * perYear;
      const annualPretax = pretax * perYear;
      const annualPosttax = posttax * perYear;
      const annualTaxable = taxable * perYear;
      const annualTaxes = taxesTotal * perYear;
      const annualNet = net * perYear;

      lines.push(
        "",
        `${t("tool.takeHomePay.out.annualGross")}: ${formatMoney(annualGross)}`,
        `${t("tool.takeHomePay.out.annualPretax")}: ${formatMoney(annualPretax)}`,
        `${t("tool.takeHomePay.out.annualTaxable")}: ${formatMoney(annualTaxable)}`,
        `${t("tool.takeHomePay.out.annualTaxes")}: ${formatMoney(annualTaxes)}`,
        `${t("tool.takeHomePay.out.annualPosttax")}: ${formatMoney(annualPosttax)}`,
        `${t("tool.takeHomePay.out.annualNet")}: ${formatMoney(annualNet)}`
      );
    }

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.takeHomePay.status.done"), false);

    return {
      gross,
      frequency,
      pretax,
      posttax,
      rates: { federalRate, stateRate, localRate, ficaRate },
    };
  }

  function clearAll() {
    $("opt-gross").value = "";
    $("opt-pretax").value = "";
    $("opt-posttax").value = "";
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
          }, 80);
        };
      })();

      [
        "opt-gross",
        "opt-frequency",
        "opt-pretax",
        "opt-federal",
        "opt-state",
        "opt-local",
        "opt-fica",
        "opt-posttax",
        "opt-show-annual",
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

