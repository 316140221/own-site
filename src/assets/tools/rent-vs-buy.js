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

  function monthlyRateFromApr(aprPercent) {
    const apr = Number(aprPercent);
    if (!Number.isFinite(apr) || apr <= 0) return 0;
    return (apr / 100) / 12;
  }

  function monthlyRateFromAnnualPercent(ratePercent) {
    const r = Number(ratePercent);
    if (!Number.isFinite(r) || r === 0) return 0;
    const factor = Math.pow(1 + r / 100, 1 / 12);
    return factor - 1;
  }

  function calculate() {
    const rentRaw = normalizeText($("opt-rent").value);
    const rent0 = normalizeNumber(rentRaw);
    const rentGrowth = clampFloat($("opt-rent-growth").value, 0, 50, 0);

    const priceRaw = normalizeText($("opt-price").value);
    const price = normalizeNumber(priceRaw);

    const downMode = String($("opt-down-mode").value || "percent");
    const downRaw = normalizeNumber($("opt-down").value);

    const apr = clampFloat($("opt-apr").value, 0, 100, 0);
    const termYears = clampInt($("opt-term").value, 1, 50, 30);

    const closingPct = clampFloat($("opt-closing").value, 0, 20, 0);
    const sellingPct = clampFloat($("opt-selling").value, 0, 20, 0);

    const taxYear = normalizeNumber($("opt-tax").value) ?? 0;
    const insuranceYear = normalizeNumber($("opt-insurance").value) ?? 0;
    const hoaMonth = normalizeNumber($("opt-hoa").value) ?? 0;

    const maintenancePct = clampFloat($("opt-maintenance").value, 0, 10, 0);
    const appreciation = clampFloat($("opt-appreciation").value, -50, 50, 0);
    const horizonYears = clampInt($("opt-horizon").value, 1, 50, 10);
    const showTable = Boolean($("opt-show-table").checked);

    const typedAny = [
      $("opt-rent").value,
      $("opt-price").value,
      $("opt-down").value,
      $("opt-tax").value,
      $("opt-insurance").value,
      $("opt-hoa").value,
    ].some((v) => normalizeText(v));

    if (!typedAny) {
      $("tool-output").value = "";
      setStatus("", false);
      return null;
    }

    if (rent0 == null || !Number.isFinite(rent0) || rent0 <= 0) {
      $("tool-output").value = "";
      setStatus(t("tool.rentVsBuy.error.rent"), true);
      return null;
    }

    if (price == null || !Number.isFinite(price) || price <= 0) {
      $("tool-output").value = "";
      setStatus(t("tool.rentVsBuy.error.price"), true);
      return null;
    }

    let downAmount = 0;
    let downPct = 0;
    if (downMode === "amount") {
      if (downRaw == null || !Number.isFinite(downRaw) || downRaw < 0 || downRaw >= price) {
        $("tool-output").value = "";
        setStatus(t("tool.rentVsBuy.error.down"), true);
        return null;
      }
      downAmount = downRaw;
      downPct = (downAmount / price) * 100;
    } else {
      const pct = downRaw == null ? 20 : downRaw;
      if (!Number.isFinite(pct) || pct < 0 || pct >= 100) {
        $("tool-output").value = "";
        setStatus(t("tool.rentVsBuy.error.down"), true);
        return null;
      }
      downPct = pct;
      downAmount = price * (downPct / 100);
    }

    const loanAmount = price - downAmount;
    const termMonths = termYears * 12;
    const mRate = monthlyRateFromApr(apr);
    const payment = monthlyPayment(loanAmount, mRate, termMonths);
    if (!Number.isFinite(payment) || payment < 0) {
      $("tool-output").value = "";
      setStatus(t("tool.rentVsBuy.error.generic"), true);
      return null;
    }

    const closingCosts = price * (closingPct / 100);
    const monthlyApp = monthlyRateFromAnnualPercent(appreciation);

    let rent = rent0;
    let homeValue = price;
    let balance = loanAmount;
    let ownerOut = 0;
    let rentOut = 0;
    const table = [];

    for (let m = 1; m <= horizonYears * 12; m += 1) {
      const maint = (maintenancePct / 100) * homeValue / 12;
      const extras = (taxYear / 12) + (insuranceYear / 12) + hoaMonth + maint;

      let interest = 0;
      let principal = 0;
      let mortgagePay = 0;

      if (balance > 0) {
        interest = mRate > 0 ? balance * mRate : 0;
        mortgagePay = payment;
        principal = mortgagePay - interest;
        if (principal < 0) principal = 0;
        if (principal > balance) {
          principal = balance;
          mortgagePay = interest + principal;
        }
        balance -= principal;
      }

      ownerOut += mortgagePay + extras;
      rentOut += rent;

      homeValue *= 1 + monthlyApp;

      if (m % 12 === 0) {
        const year = m / 12;
        const saleProceeds = homeValue * (1 - sellingPct / 100) - balance;
        const buyNet = downAmount + closingCosts + ownerOut - saleProceeds;
        const rentNet = rentOut;
        table.push({ year, buyNet, rentNet, homeValue, balance });

        rent *= 1 + rentGrowth / 100;
      }
    }

    const last = table[table.length - 1];
    const breakEven = table.find((row) => row.buyNet <= row.rentNet);

    const lines = [
      `${t("tool.rentVsBuy.out.horizon")}: ${horizonYears} ${t("tool.rentVsBuy.years")}`,
      "",
      `${t("tool.rentVsBuy.out.rent")}: ${formatMoney(rent0)} (${formatPercent(rentGrowth)} / ${t("tool.rentVsBuy.year")})`,
      `${t("tool.rentVsBuy.out.rentTotal")}: ${formatMoney(last ? last.rentNet : rentOut)}`,
      "",
      `${t("tool.rentVsBuy.out.price")}: ${formatMoney(price)}`,
      `${t("tool.rentVsBuy.out.down")}: ${formatMoney(downAmount)} (${formatPercent(downPct)})`,
      `${t("tool.rentVsBuy.out.loan")}: ${formatMoney(loanAmount)}`,
      `${t("tool.rentVsBuy.out.apr")}: ${formatPercent(apr)}`,
      `${t("tool.rentVsBuy.out.payment")}: ${formatMoney(payment)}`,
      `${t("tool.rentVsBuy.out.closing")}: ${formatMoney(closingCosts)} (${formatPercent(closingPct)})`,
      `${t("tool.rentVsBuy.out.selling")}: ${formatPercent(sellingPct)}`,
      `${t("tool.rentVsBuy.out.appreciation")}: ${formatPercent(appreciation)}`,
      `${t("tool.rentVsBuy.out.maintenance")}: ${formatPercent(maintenancePct)}`,
      "",
      `${t("tool.rentVsBuy.out.homeValue")}: ${formatMoney(last ? last.homeValue : homeValue)}`,
      `${t("tool.rentVsBuy.out.balance")}: ${formatMoney(last ? last.balance : balance)}`,
      `${t("tool.rentVsBuy.out.buyNet")}: ${formatMoney(last ? last.buyNet : NaN)}`,
    ];

    if (breakEven) {
      lines.push("", `${t("tool.rentVsBuy.out.breakEven")}: ${breakEven.year} ${t("tool.rentVsBuy.years")}`);
    } else {
      lines.push("", `${t("tool.rentVsBuy.out.breakEven")}: ${t("tool.rentVsBuy.out.none")}`);
    }

    if (showTable && table.length) {
      lines.push("", t("tool.rentVsBuy.out.table"));
      for (const row of table) {
        lines.push(
          `${t("tool.rentVsBuy.out.year")} ${row.year}: ${t("tool.rentVsBuy.out.rentTotal")}: ${formatMoney(row.rentNet)} · ${t("tool.rentVsBuy.out.buyNet")}: ${formatMoney(row.buyNet)}`
        );
      }
    }

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.rentVsBuy.status.done"), false);
    return { breakEven: breakEven ? breakEven.year : null };
  }

  function clearAll() {
    $("opt-rent").value = "";
    $("opt-price").value = "";
    $("opt-down").value = "";
    $("opt-tax").value = "";
    $("opt-insurance").value = "";
    $("opt-hoa").value = "";
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
          }, 140);
        };
      })();

      [
        "opt-rent",
        "opt-rent-growth",
        "opt-price",
        "opt-down-mode",
        "opt-down",
        "opt-apr",
        "opt-term",
        "opt-closing",
        "opt-selling",
        "opt-tax",
        "opt-insurance",
        "opt-hoa",
        "opt-maintenance",
        "opt-appreciation",
        "opt-horizon",
        "opt-show-table",
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

