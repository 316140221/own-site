(function () {
  const STORAGE_FROM = "tool_timeZone_from";
  const STORAGE_TO = "tool_timeZone_to";

  const DEFAULT_TIME_ZONES = [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Phoenix",
    "America/Anchorage",
    "Pacific/Honolulu",
    "America/Toronto",
    "America/Vancouver",
    "America/Mexico_City",
    "America/Sao_Paulo",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Europe/Madrid",
    "Europe/Rome",
    "Africa/Johannesburg",
    "Asia/Dubai",
    "Asia/Kolkata",
    "Asia/Bangkok",
    "Asia/Singapore",
    "Asia/Hong_Kong",
    "Asia/Shanghai",
    "Asia/Tokyo",
    "Asia/Seoul",
    "Australia/Perth",
    "Australia/Sydney",
    "Pacific/Auckland",
  ];

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

  function pad2(value) {
    return String(value).padStart(2, "0");
  }

  function formatForDatetimeLocal(date) {
    const d = date instanceof Date ? date : new Date();
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(
      d.getHours()
    )}:${pad2(d.getMinutes())}`;
  }

  function parseDatetimeLocalParts(value) {
    const raw = String(value || "").trim();
    if (!raw) return null;
    const match =
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(raw);
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const hour = Number(match[4]);
    const minute = Number(match[5]);
    const second = match[6] ? Number(match[6]) : 0;
    if (
      !Number.isFinite(year) ||
      !Number.isFinite(month) ||
      !Number.isFinite(day) ||
      !Number.isFinite(hour) ||
      !Number.isFinite(minute) ||
      !Number.isFinite(second)
    ) {
      return null;
    }
    return { year, month, day, hour, minute, second };
  }

  const dtfCache = new Map();
  function getDtf(timeZone) {
    const tz = String(timeZone || "").trim();
    if (!tz) throw new Error("Missing time zone");
    const cached = dtfCache.get(tz);
    if (cached) return cached;

    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
    dtfCache.set(tz, dtf);
    return dtf;
  }

  function isTimeZoneSupported(timeZone) {
    try {
      getDtf(timeZone).format(new Date());
      return true;
    } catch (_error) {
      return false;
    }
  }

  function getPartsMsForTimeZone(epochMs, timeZone) {
    const dtf = getDtf(timeZone);
    const parts = dtf.formatToParts(new Date(epochMs));
    const map = {};
    for (const part of parts) {
      if (part.type === "literal") continue;
      map[part.type] = part.value;
    }

    const year = Number(map.year);
    const month = Number(map.month);
    const day = Number(map.day);
    let hour = Number(map.hour);
    const minute = Number(map.minute);
    const second = Number(map.second);

    const dayAdjust = hour === 24 ? 1 : 0;
    if (hour === 24) hour = 0;

    const asUtcMs = Date.UTC(year, month - 1, day + dayAdjust, hour, minute, second);
    return {
      year,
      month,
      day: day + dayAdjust,
      hour,
      minute,
      second,
      asUtcMs,
    };
  }

  function getOffsetMinutes(epochMs, timeZone) {
    const { asUtcMs } = getPartsMsForTimeZone(epochMs, timeZone);
    return (asUtcMs - epochMs) / 60000;
  }

  function zonedTimeToUtcMs(parts, timeZone) {
    const utcGuess = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second || 0
    );

    let offset = getOffsetMinutes(utcGuess, timeZone);
    let utcMs = utcGuess - offset * 60000;

    for (let i = 0; i < 3; i += 1) {
      const nextOffset = getOffsetMinutes(utcMs, timeZone);
      if (nextOffset === offset) break;
      offset = nextOffset;
      utcMs = utcGuess - offset * 60000;
    }

    return utcMs;
  }

  function formatDateTimeInZone(epochMs, timeZone) {
    try {
      return new Intl.DateTimeFormat(undefined, {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
        timeZoneName: "short",
      }).format(new Date(epochMs));
    } catch (_error) {
      return new Date(epochMs).toISOString();
    }
  }

  function sameLocalMinute(a, b) {
    return (
      a &&
      b &&
      a.year === b.year &&
      a.month === b.month &&
      a.day === b.day &&
      a.hour === b.hour &&
      a.minute === b.minute
    );
  }

  function calculate() {
    const parts = parseDatetimeLocalParts($("opt-datetime").value);
    const fromTz = String($("opt-from-tz").value || "").trim();
    const toTz = String($("opt-to-tz").value || "").trim();

    if (!parts) {
      $("tool-output").value = "";
      setStatus(t("tool.timeZone.error.datetime"), true);
      return null;
    }

    if (!fromTz || !isTimeZoneSupported(fromTz)) {
      $("tool-output").value = "";
      setStatus(t("tool.timeZone.error.fromZone"), true);
      return null;
    }

    if (!toTz || !isTimeZoneSupported(toTz)) {
      $("tool-output").value = "";
      setStatus(t("tool.timeZone.error.toZone"), true);
      return null;
    }

    const utcMs = zonedTimeToUtcMs(parts, fromTz);
    if (!Number.isFinite(utcMs)) {
      $("tool-output").value = "";
      setStatus(t("tool.timeZone.error.datetime"), true);
      return null;
    }

    const fromDisplay = `${formatDateTimeInZone(utcMs, fromTz)} (${fromTz})`;
    const utcDisplay = `${formatDateTimeInZone(utcMs, "UTC")} (UTC)`;
    const toDisplay = `${formatDateTimeInZone(utcMs, toTz)} (${toTz})`;

    const fromCheck = getPartsMsForTimeZone(utcMs, fromTz);
    const isExact = sameLocalMinute(parts, fromCheck);

    const lines = [
      `${t("tool.timeZone.out.from")} ${fromDisplay}`,
      `${t("tool.timeZone.out.utc")} ${utcDisplay}`,
      `${t("tool.timeZone.out.to")} ${toDisplay}`,
      `${t("tool.timeZone.out.timestamp")} ${Math.floor(utcMs / 1000)} (${utcMs} ms)`,
    ];

    if (!isExact) {
      lines.push("");
      lines.push(t("tool.timeZone.note.adjusted"));
      setStatus(t("tool.timeZone.status.adjusted"), false);
    } else {
      setStatus(t("tool.timeZone.status.done"), false);
    }

    $("tool-output").value = lines.join("\n");
    storageSet(STORAGE_FROM, fromTz);
    storageSet(STORAGE_TO, toTz);
    return { utcMs, fromTz, toTz };
  }

  function swapZones() {
    const from = $("opt-from-tz").value;
    $("opt-from-tz").value = $("opt-to-tz").value;
    $("opt-to-tz").value = from;
  }

  function clearAll() {
    $("opt-datetime").value = "";
    $("tool-output").value = "";
    setStatus("", false);
  }

  function uniqueZonesWithLocalFirst() {
    const local = (() => {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      } catch (_error) {
        return "";
      }
    })();

    const out = [];
    const seen = new Set();
    const push = (tz) => {
      const value = String(tz || "").trim();
      if (!value || seen.has(value)) return;
      if (!isTimeZoneSupported(value)) return;
      seen.add(value);
      out.push(value);
    };

    push(local);
    for (const tz of DEFAULT_TIME_ZONES) push(tz);
    return out;
  }

  function populateZones() {
    const zones = uniqueZonesWithLocalFirst();

    const fromSel = $("opt-from-tz");
    const toSel = $("opt-to-tz");
    fromSel.innerHTML = "";
    toSel.innerHTML = "";

    zones.forEach((tz) => {
      const o1 = document.createElement("option");
      o1.value = tz;
      o1.textContent = tz;
      fromSel.appendChild(o1);

      const o2 = document.createElement("option");
      o2.value = tz;
      o2.textContent = tz;
      toSel.appendChild(o2);
    });

    const storedFrom = storageGet(STORAGE_FROM);
    const storedTo = storageGet(STORAGE_TO);

    if (storedFrom && zones.includes(storedFrom)) fromSel.value = storedFrom;
    if (storedTo && zones.includes(storedTo)) toSel.value = storedTo;

    if (!fromSel.value) fromSel.value = zones[0] || "UTC";
    if (!toSel.value) toSel.value = zones.includes("UTC") ? "UTC" : zones[0] || "UTC";
  }

  function setNow() {
    $("opt-datetime").value = formatForDatetimeLocal(new Date());
  }

  function main() {
    try {
      populateZones();
      setNow();
      setStatus("", false);
      calculate();

      const debounce = (() => {
        let handle = 0;
        return () => {
          if (handle) window.clearTimeout(handle);
          handle = window.setTimeout(() => {
            handle = 0;
            calculate();
          }, 60);
        };
      })();

      ["opt-datetime", "opt-from-tz", "opt-to-tz"].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("input", debounce);
        el.addEventListener("change", debounce);
      });

      $("btn-convert").addEventListener("click", () => {
        calculate();
      });

      $("btn-now").addEventListener("click", () => {
        setNow();
        calculate();
      });

      $("btn-swap").addEventListener("click", () => {
        swapZones();
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

