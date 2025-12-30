(function () {
  const INCH_TO_M = 0.0254;
  const LB_TO_KG = 0.45359237;

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

  function parseNumber(value) {
    const cleaned = String(value ?? "").trim().replace(/,/g, "");
    const n = Number.parseFloat(cleaned);
    if (!Number.isFinite(n)) return null;
    return n;
  }

  function formatFixed(n, digits) {
    const value = Number(n);
    if (!Number.isFinite(value)) return "";
    return value.toFixed(digits);
  }

  function showUnit(unit) {
    const metric = document.querySelector("[data-bmi-metric]");
    const imperial = document.querySelector("[data-bmi-imperial]");
    if (metric) metric.hidden = unit !== "metric";
    if (imperial) imperial.hidden = unit !== "imperial";
  }

  function getCategoryKey(bmi) {
    const value = Number(bmi);
    if (!Number.isFinite(value) || value <= 0) return "tool.bmi.category.unknown";
    if (value < 18.5) return "tool.bmi.category.underweight";
    if (value < 25) return "tool.bmi.category.normal";
    if (value < 30) return "tool.bmi.category.overweight";
    return "tool.bmi.category.obese";
  }

  function formatRange(primaryMin, primaryMax, primaryUnit, secondaryMin, secondaryMax, secondaryUnit) {
    const main = `${formatFixed(primaryMin, 1)}–${formatFixed(primaryMax, 1)} ${primaryUnit}`;
    const alt = `${formatFixed(secondaryMin, 1)}–${formatFixed(secondaryMax, 1)} ${secondaryUnit}`;
    return `${main} (${alt})`;
  }

  function readMetric() {
    const heightCm = parseNumber($("input-height-cm").value);
    if (!heightCm || heightCm <= 0) throw new Error(t("tool.bmi.error.height"));
    const weightKg = parseNumber($("input-weight-kg").value);
    if (!weightKg || weightKg <= 0) throw new Error(t("tool.bmi.error.weight"));

    return { heightM: heightCm / 100, weightKg };
  }

  function readImperial() {
    const ft = parseNumber($("input-height-ft").value);
    const inches = parseNumber($("input-height-in").value);
    const lb = parseNumber($("input-weight-lb").value);

    const safeFt = ft || 0;
    const safeIn = inches || 0;
    const totalInches = safeFt * 12 + safeIn;
    if (!totalInches || totalInches <= 0) throw new Error(t("tool.bmi.error.height"));
    if (!lb || lb <= 0) throw new Error(t("tool.bmi.error.weight"));

    const heightM = totalInches * INCH_TO_M;
    const weightKg = lb * LB_TO_KG;
    return { heightM, weightKg };
  }

  function compute() {
    const unit = $("opt-unit").value === "imperial" ? "imperial" : "metric";
    showUnit(unit);

    const { heightM, weightKg } = unit === "imperial" ? readImperial() : readMetric();
    if (!heightM || heightM <= 0) throw new Error(t("tool.bmi.error.height"));

    const bmi = weightKg / (heightM * heightM);
    const bmiRounded = formatFixed(bmi, 1);
    const categoryKey = getCategoryKey(bmi);
    const category = t(categoryKey);

    const minKg = 18.5 * heightM * heightM;
    const maxKg = 24.9 * heightM * heightM;
    const minLb = minKg / LB_TO_KG;
    const maxLb = maxKg / LB_TO_KG;

    const range =
      unit === "imperial"
        ? formatRange(minLb, maxLb, "lb", minKg, maxKg, "kg")
        : formatRange(minKg, maxKg, "kg", minLb, maxLb, "lb");

    const lines = [
      `${t("tool.bmi.out.bmi")}: ${bmiRounded}`,
      `${t("tool.bmi.out.category")}: ${category}`,
      `${t("tool.bmi.out.healthyRange")}: ${range}`,
    ];

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.bmi.status.done"), false);
  }

  function clearAll() {
    $("input-height-cm").value = "";
    $("input-weight-kg").value = "";
    $("input-height-ft").value = "";
    $("input-height-in").value = "";
    $("input-weight-lb").value = "";
    $("tool-output").value = "";
    setStatus("", false);
    showUnit($("opt-unit").value === "imperial" ? "imperial" : "metric");
  }

  function main() {
    try {
      showUnit($("opt-unit").value === "imperial" ? "imperial" : "metric");

      $("opt-unit").addEventListener("change", () => {
        showUnit($("opt-unit").value === "imperial" ? "imperial" : "metric");
      });

      $("btn-calc").addEventListener("click", () => {
        try {
          compute();
        } catch (error) {
          setStatus(error instanceof Error ? error.message : t("tool.bmi.error.generic"), true);
        }
      });

      $("btn-copy").addEventListener("click", async () => {
        try {
          await copyToClipboard($("tool-output").value);
          setStatus(t("tool.common.status.copied"), false);
        } catch (_error) {
          setStatus(t("tool.common.error.copy"), true);
        }
      });

      $("btn-clear").addEventListener("click", clearAll);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  window.addEventListener("DOMContentLoaded", main);
})();

