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

  function resolveDelimiter() {
    const raw = $("opt-delim").value;
    return raw === "\\t" ? "\t" : raw;
  }

  function parseCsv(text, delimiter) {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;
    let i = 0;

    const pushField = () => {
      row.push(field);
      field = "";
    };

    const pushRow = () => {
      rows.push(row);
      row = [];
    };

    const src = String(text || "");

    while (i < src.length) {
      const ch = src[i];

      if (inQuotes) {
        if (ch === '"') {
          if (src[i + 1] === '"') {
            field += '"';
            i += 2;
            continue;
          }
          inQuotes = false;
          i += 1;
          continue;
        }

        field += ch;
        i += 1;
        continue;
      }

      if (ch === '"') {
        inQuotes = true;
        i += 1;
        continue;
      }

      if (ch === delimiter) {
        pushField();
        i += 1;
        continue;
      }

      if (ch === "\n" || ch === "\r") {
        pushField();
        pushRow();
        if (ch === "\r" && src[i + 1] === "\n") i += 2;
        else i += 1;
        continue;
      }

      field += ch;
      i += 1;
    }

    pushField();
    if (row.length > 1 || row[0] !== "" || src.endsWith(delimiter)) pushRow();

    return rows;
  }

  function isRowEmpty(row) {
    return !row || !row.length || row.every((cell) => String(cell || "").trim() === "");
  }

  function normalizeHeaders(rawHeaders) {
    const seen = new Map();
    return rawHeaders.map((h, idx) => {
      const base = String(h || "").trim() || `col${idx + 1}`;
      const count = (seen.get(base) || 0) + 1;
      seen.set(base, count);
      return count === 1 ? base : `${base}_${count}`;
    });
  }

  function escapeCsvField(value, delimiter, quoteAll) {
    const raw = value == null ? "" : String(value);
    const needsQuote =
      quoteAll ||
      raw.includes('"') ||
      raw.includes("\n") ||
      raw.includes("\r") ||
      raw.includes(delimiter) ||
      /^\s|\s$/.test(raw);
    if (!needsQuote) return raw;
    return `"${raw.replace(/"/g, '""')}"`;
  }

  function runParse() {
    const input = $("tool-input").value;
    if (!input.trim()) throw new Error(t("tool.csv.error.empty"));

    const delimiter = resolveDelimiter();
    const headerRow = $("opt-header").checked;
    const trim = $("opt-trim").checked;
    const skipEmpty = $("opt-skip-empty").checked;
    const pretty = $("opt-pretty").checked;

    let rows = parseCsv(input, delimiter);
    if (skipEmpty) rows = rows.filter((r) => !isRowEmpty(r));
    if (!rows.length) throw new Error(t("tool.csv.error.noRows"));

    if (trim) rows = rows.map((r) => r.map((c) => String(c ?? "").trim()));

    let out;
    let count = 0;
    if (headerRow) {
      const headers = normalizeHeaders(rows[0]);
      const dataRows = rows.slice(1);
      out = dataRows.map((r) => {
        const obj = {};
        for (let i = 0; i < headers.length; i += 1) {
          obj[headers[i]] = r[i] ?? "";
        }
        if (r.length > headers.length) {
          obj._extra = r.slice(headers.length);
        }
        return obj;
      });
      count = out.length;
    } else {
      out = rows;
      count = rows.length;
    }

    const json = pretty ? JSON.stringify(out, null, 2) : JSON.stringify(out);
    $("tool-output").value = json;
    setStatus(t("tool.csv.status.parsed", { rows: count }), false);
  }

  function readRowsFromJson(value) {
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object" && Array.isArray(value.rows)) return value.rows;
    throw new Error(t("tool.csv.error.json"));
  }

  function runBuild() {
    const input = $("tool-input").value.trim();
    if (!input) throw new Error(t("tool.csv.error.empty"));

    let parsed;
    try {
      parsed = JSON.parse(input);
    } catch (_error) {
      throw new Error(t("tool.csv.error.json"));
    }

    const rows = readRowsFromJson(parsed);
    const delimiter = resolveDelimiter();
    const includeHeader = $("opt-header").checked;
    const quoteAll = $("opt-quote-all").checked;
    const sortKeys = $("opt-sort-keys").checked;
    const trim = $("opt-trim").checked;

    if (!rows.length) throw new Error(t("tool.csv.error.noRows"));

    let header = [];
    let dataRows = [];

    if (Array.isArray(rows[0])) {
      dataRows = rows.map((r) => (Array.isArray(r) ? r : []));
    } else if (rows[0] && typeof rows[0] === "object") {
      const keys = [];
      const seen = new Set();
      for (const row of rows) {
        if (!row || typeof row !== "object") continue;
        for (const k of Object.keys(row)) {
          if (k === "_extra") continue;
          if (seen.has(k)) continue;
          seen.add(k);
          keys.push(k);
        }
      }
      header = sortKeys ? keys.sort((a, b) => a.localeCompare(b)) : keys;
      dataRows = rows.map((r) => header.map((k) => (r && typeof r === "object" ? r[k] : "")));
    } else {
      throw new Error(t("tool.csv.error.json"));
    }

    const outRows = [];
    if (includeHeader && header.length) outRows.push(header);

    for (const r of dataRows) {
      const line = r.map((v) => {
        let cell = v;
        if (typeof cell === "object" && cell !== null) cell = JSON.stringify(cell);
        const raw = cell == null ? "" : String(cell);
        const normalized = trim ? raw.trim() : raw;
        return escapeCsvField(normalized, delimiter, quoteAll);
      });
      outRows.push(line);
    }

    const out = outRows.map((r) => r.join(delimiter)).join("\n");
    $("tool-output").value = out;
    setStatus(t("tool.csv.status.built", { rows: dataRows.length }), false);
  }

  function swap() {
    const input = $("tool-input");
    const output = $("tool-output");
    const tmp = input.value;
    input.value = output.value;
    output.value = tmp;
    setStatus(t("tool.common.status.swapped"), false);
  }

  function clearAll() {
    $("tool-input").value = "";
    $("tool-output").value = "";
    setStatus("", false);
  }

  function main() {
    try {
      $("btn-parse").addEventListener("click", () => {
        try {
          runParse();
        } catch (error) {
          setStatus(error instanceof Error ? error.message : String(error), true);
        }
      });
      $("btn-build").addEventListener("click", () => {
        try {
          runBuild();
        } catch (error) {
          setStatus(error instanceof Error ? error.message : String(error), true);
        }
      });
      $("btn-swap").addEventListener("click", swap);
      $("btn-clear").addEventListener("click", clearAll);
      $("btn-copy").addEventListener("click", async () => {
        try {
          await copyToClipboard($("tool-output").value);
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

