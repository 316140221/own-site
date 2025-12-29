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

  function pad2(value) {
    return String(value).padStart(2, "0");
  }

  function formatForDatetimeLocal(date) {
    const d = date instanceof Date ? date : new Date();
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(
      d.getHours()
    )}:${pad2(d.getMinutes())}`;
  }

  function parseDatetimeLocal(value) {
    const raw = String(value || "").trim();
    if (!raw) return null;
    const match =
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(raw);
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    const hour = Number(match[4]);
    const minute = Number(match[5]);
    const second = match[6] ? Number(match[6]) : 0;
    const date = new Date(year, month, day, hour, minute, second, 0);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function formatDateTime(date) {
    try {
      return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
      }).format(date);
    } catch (_error) {
      return String(date);
    }
  }

  function formatFloat(value, digits = 6) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "";
    try {
      return n.toFixed(digits).replace(/\.?0+$/g, "");
    } catch (_error) {
      return String(n);
    }
  }

  function computeBreakdown(ms) {
    let remaining = Math.max(0, Math.floor(ms));
    const day = 24 * 60 * 60 * 1000;
    const hour = 60 * 60 * 1000;
    const minute = 60 * 1000;
    const second = 1000;

    const days = Math.floor(remaining / day);
    remaining -= days * day;
    const hours = Math.floor(remaining / hour);
    remaining -= hours * hour;
    const minutes = Math.floor(remaining / minute);
    remaining -= minutes * minute;
    const seconds = Math.floor(remaining / second);
    return { days, hours, minutes, seconds };
  }

  function calculate() {
    const start = parseDatetimeLocal($("opt-start").value);
    const end = parseDatetimeLocal($("opt-end").value);

    if (!start || !end) {
      $("tool-output").value = "";
      setStatus(t("tool.dateDiff.error.missing"), true);
      return null;
    }

    const deltaMs = end.getTime() - start.getTime();
    const sign = deltaMs < 0 ? "-" : "";
    const absMs = Math.abs(deltaMs);

    const totalSeconds = absMs / 1000;
    const totalMinutes = absMs / (60 * 1000);
    const totalHours = absMs / (60 * 60 * 1000);
    const totalDays = absMs / (24 * 60 * 60 * 1000);

    const breakdown = computeBreakdown(absMs);

    const lines = [
      `${t("tool.dateDiff.out.start")} ${formatDateTime(start)}`,
      `${t("tool.dateDiff.out.end")} ${formatDateTime(end)}`,
      `${t("tool.dateDiff.out.diff")} ${sign}${breakdown.days}d ${breakdown.hours}h ${breakdown.minutes}m ${breakdown.seconds}s`,
      `${t("tool.dateDiff.out.totalDays")} ${sign}${formatFloat(totalDays)}`,
      `${t("tool.dateDiff.out.totalHours")} ${sign}${formatFloat(totalHours)}`,
      `${t("tool.dateDiff.out.totalMinutes")} ${sign}${formatFloat(totalMinutes)}`,
      `${t("tool.dateDiff.out.totalSeconds")} ${sign}${formatFloat(totalSeconds)}`,
    ];

    $("tool-output").value = lines.join("\n");
    setStatus(t("tool.dateDiff.status.done"), false);
    return { start, end, deltaMs };
  }

  function setEndNow() {
    $("opt-end").value = formatForDatetimeLocal(new Date());
  }

  function swap() {
    const start = $("opt-start").value;
    $("opt-start").value = $("opt-end").value;
    $("opt-end").value = start;
  }

  function clearAll() {
    $("opt-start").value = "";
    $("opt-end").value = "";
    $("tool-output").value = "";
    setStatus("", false);
  }

  function main() {
    try {
      setEndNow();
      setStatus("", false);

      const debounce = (() => {
        let handle = 0;
        return () => {
          if (handle) window.clearTimeout(handle);
          handle = window.setTimeout(() => {
            handle = 0;
            const startFilled = String($("opt-start").value || "").trim();
            const endFilled = String($("opt-end").value || "").trim();
            if (!startFilled && !endFilled) {
              $("tool-output").value = "";
              setStatus("", false);
              return;
            }
            calculate();
          }, 60);
        };
      })();

      ["opt-start", "opt-end"].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("input", debounce);
        el.addEventListener("change", debounce);
      });

      $("btn-now").addEventListener("click", () => {
        setEndNow();
        calculate();
      });

      $("btn-swap").addEventListener("click", () => {
        swap();
        calculate();
      });

      $("btn-calc").addEventListener("click", () => {
        calculate();
      });

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

