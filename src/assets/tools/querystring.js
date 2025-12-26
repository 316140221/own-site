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

  function extractQueryString(input) {
    const raw = String(input || "").trim();
    if (!raw) return "";

    if (raw.includes("://")) {
      try {
        const url = new URL(raw);
        return String(url.search || "").replace(/^\?/, "");
      } catch (_error) {
        // fallthrough
      }
    }

    let value = raw;
    const q = value.indexOf("?");
    if (q >= 0) value = value.slice(q + 1);
    const hash = value.indexOf("#");
    if (hash >= 0) value = value.slice(0, hash);
    value = value.replace(/^\?/, "");
    return value;
  }

  function decodePart(part, plusForSpace) {
    const raw = String(part || "");
    const normalized = plusForSpace ? raw.replace(/\+/g, "%20") : raw;
    return decodeURIComponent(normalized);
  }

  function parseQuery(input, plusForSpace) {
    const query = extractQueryString(input);
    if (!query) return {};

    const out = {};
    const pairs = query.split("&");
    for (const pair of pairs) {
      if (!pair) continue;
      const idx = pair.indexOf("=");
      const kRaw = idx >= 0 ? pair.slice(0, idx) : pair;
      const vRaw = idx >= 0 ? pair.slice(idx + 1) : "";
      const key = decodePart(kRaw, plusForSpace);
      const value = decodePart(vRaw, plusForSpace);

      if (Object.prototype.hasOwnProperty.call(out, key)) {
        const prev = out[key];
        if (Array.isArray(prev)) prev.push(value);
        else out[key] = [prev, value];
      } else {
        out[key] = value;
      }
    }

    return out;
  }

  function encodePart(value, plusForSpace) {
    let out = encodeURIComponent(String(value ?? ""));
    if (plusForSpace) out = out.replace(/%20/g, "+");
    return out;
  }

  function buildQuery(data, opts) {
    if (!data || typeof data !== "object") {
      throw new Error(t("tool.querystring.error.json"));
    }

    const plusForSpace = Boolean(opts && opts.plusForSpace);
    const sortKeys = Boolean(opts && opts.sortKeys);
    const leadingQuestionMark = Boolean(opts && opts.leadingQuestionMark);

    const keys = Array.isArray(data) ? [] : Object.keys(data);
    if (sortKeys) keys.sort((a, b) => a.localeCompare(b));

    const pairs = [];
    const pushPair = (key, value) => {
      const k = encodePart(key, plusForSpace);
      const v = encodePart(value, plusForSpace);
      pairs.push(`${k}=${v}`);
    };

    if (Array.isArray(data)) {
      for (const entry of data) {
        if (!entry || typeof entry !== "object") continue;
        const key = entry.key ?? entry.k;
        const value = entry.value ?? entry.v;
        if (key == null) continue;
        pushPair(String(key), value ?? "");
      }
    } else {
      for (const key of keys) {
        const value = data[key];
        if (Array.isArray(value)) {
          for (const item of value) pushPair(key, item ?? "");
        } else {
          pushPair(key, value ?? "");
        }
      }
    }

    const query = pairs.join("&");
    if (!leadingQuestionMark) return query;
    return query ? `?${query}` : "?";
  }

  function runParse() {
    const input = $("tool-input").value.trim();
    if (!input) throw new Error(t("tool.querystring.error.empty"));

    const plusForSpace = $("opt-plus").checked;
    let obj;
    try {
      obj = parseQuery(input, plusForSpace);
    } catch (_error) {
      throw new Error(t("tool.querystring.error.parse"));
    }

    const out = JSON.stringify(obj, null, 2);
    $("tool-output").value = out;
    setStatus(t("tool.querystring.status.parsed", { count: Object.keys(obj).length }), false);
  }

  function runBuild() {
    const input = $("tool-input").value.trim();
    if (!input) throw new Error(t("tool.querystring.error.empty"));

    let data;
    try {
      data = JSON.parse(input);
    } catch (_error) {
      throw new Error(t("tool.querystring.error.json"));
    }

    const opts = {
      plusForSpace: $("opt-plus").checked,
      sortKeys: $("opt-sort").checked,
      leadingQuestionMark: $("opt-qm").checked,
    };

    const out = buildQuery(data, opts);
    $("tool-output").value = out;
    setStatus(t("tool.querystring.status.built", { len: out.length }), false);
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

