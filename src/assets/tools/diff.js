(function () {
  const MAX_TOTAL_LINES = 4000;

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

  function looksLikeJson(value) {
    const raw = String(value || "").trim();
    return raw.startsWith("{") || raw.startsWith("[");
  }

  function normalizeNewlines(value) {
    return String(value ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  }

  function splitLines(value) {
    const raw = normalizeNewlines(value);
    if (!raw) return [];
    return raw.split("\n");
  }

  function sortJsonKeys(value) {
    if (Array.isArray(value)) return value.map(sortJsonKeys);
    if (!value || typeof value !== "object") return value;
    const out = {};
    for (const key of Object.keys(value).sort((a, b) => a.localeCompare(b))) {
      out[key] = sortJsonKeys(value[key]);
    }
    return out;
  }

  function canonicalizeJson(text, sideLabel) {
    const raw = String(text || "").trim();
    if (!raw) throw new Error(t("tool.diff.error.jsonEmpty", { side: sideLabel }));
    try {
      const parsed = JSON.parse(raw);
      const sorted = sortJsonKeys(parsed);
      return JSON.stringify(sorted, null, 2);
    } catch (_error) {
      throw new Error(t("tool.diff.error.json", { side: sideLabel }));
    }
  }

  function normalizeForCompare(line, ignoreWhitespace, ignoreCase) {
    let out = String(line ?? "");
    if (ignoreWhitespace) out = out.replace(/\s+/g, " ").trim();
    if (ignoreCase) out = out.toLowerCase();
    return out;
  }

  function myersDiffOps(aKeys, bKeys) {
    const n = aKeys.length;
    const m = bKeys.length;

    if (n === 0 && m === 0) return [];
    if (n === 0) return bKeys.map((_l, idx) => ({ type: "insert", bIndex: idx }));
    if (m === 0) return aKeys.map((_l, idx) => ({ type: "delete", aIndex: idx }));

    const max = n + m;
    const offset = max;
    let v = new Int32Array(2 * max + 1);
    const trace = [];

    v[offset + 1] = 0;

    for (let d = 0; d <= max; d += 1) {
      const vNext = new Int32Array(2 * max + 1);
      for (let k = -d; k <= d; k += 2) {
        let x;
        if (k === -d || (k !== d && v[offset + k - 1] < v[offset + k + 1])) {
          x = v[offset + k + 1];
        } else {
          x = v[offset + k - 1] + 1;
        }
        let y = x - k;
        while (x < n && y < m && aKeys[x] === bKeys[y]) {
          x += 1;
          y += 1;
        }
        vNext[offset + k] = x;
        if (x >= n && y >= m) {
          trace.push(vNext.slice(offset - d, offset + d + 1));
          return backtrack(trace, aKeys.length, bKeys.length);
        }
      }
      trace.push(vNext.slice(offset - d, offset + d + 1));
      v = vNext;
    }

    return backtrack(trace, aKeys.length, bKeys.length);
  }

  function backtrack(trace, n, m) {
    let x = n;
    let y = m;
    const ops = [];

    for (let d = trace.length - 1; d > 0; d -= 1) {
      const prev = trace[d - 1];
      const k = x - y;

      let prevK;
      if (
        k === -d ||
        (k !== d &&
          prev[k - 1 + (d - 1)] < prev[k + 1 + (d - 1)])
      ) {
        prevK = k + 1;
      } else {
        prevK = k - 1;
      }

      const prevX = prev[prevK + (d - 1)];
      const prevY = prevX - prevK;

      while (x > prevX && y > prevY) {
        ops.push({ type: "equal", aIndex: x - 1, bIndex: y - 1 });
        x -= 1;
        y -= 1;
      }

      if (x === prevX) {
        ops.push({ type: "insert", bIndex: y - 1 });
        y -= 1;
      } else {
        ops.push({ type: "delete", aIndex: x - 1 });
        x -= 1;
      }
    }

    while (x > 0 && y > 0) {
      ops.push({ type: "equal", aIndex: x - 1, bIndex: y - 1 });
      x -= 1;
      y -= 1;
    }
    while (x > 0) {
      ops.push({ type: "delete", aIndex: x - 1 });
      x -= 1;
    }
    while (y > 0) {
      ops.push({ type: "insert", bIndex: y - 1 });
      y -= 1;
    }

    ops.reverse();
    return ops;
  }

  function buildDiffOutput(ops, aRaw, bRaw) {
    const outLines = [];
    let adds = 0;
    let dels = 0;
    let same = 0;

    for (const op of ops) {
      if (op.type === "equal") {
        same += 1;
        outLines.push(` ${aRaw[op.aIndex] ?? ""}`);
      } else if (op.type === "delete") {
        dels += 1;
        outLines.push(`-${aRaw[op.aIndex] ?? ""}`);
      } else if (op.type === "insert") {
        adds += 1;
        outLines.push(`+${bRaw[op.bIndex] ?? ""}`);
      }
    }

    return { text: outLines.join("\n"), adds, dels, same, lines: outLines.length };
  }

  function compute() {
    const mode = $("opt-mode").value;
    const ignoreWhitespace = $("opt-ignore-ws").checked;
    const ignoreCase = $("opt-ignore-case").checked;

    const leftRawInput = $("tool-left").value;
    const rightRawInput = $("tool-right").value;

    const leftLabel = t("tool.diff.left");
    const rightLabel = t("tool.diff.right");

    let leftText = leftRawInput;
    let rightText = rightRawInput;
    let resolvedMode = mode;

    if (mode === "auto") {
      if (looksLikeJson(leftRawInput) && looksLikeJson(rightRawInput)) {
        try {
          leftText = canonicalizeJson(leftRawInput, leftLabel);
          rightText = canonicalizeJson(rightRawInput, rightLabel);
          resolvedMode = "json";
        } catch (_error) {
          resolvedMode = "text";
        }
      } else {
        resolvedMode = "text";
      }
    }

    if (resolvedMode === "json") {
      leftText = canonicalizeJson(leftRawInput, leftLabel);
      rightText = canonicalizeJson(rightRawInput, rightLabel);
    } else {
      leftText = normalizeNewlines(leftRawInput);
      rightText = normalizeNewlines(rightRawInput);
    }

    const leftLines = splitLines(leftText);
    const rightLines = splitLines(rightText);

    const totalLines = leftLines.length + rightLines.length;
    if (totalLines > MAX_TOTAL_LINES) {
      throw new Error(t("tool.diff.error.tooLarge", { count: totalLines }));
    }

    const leftKeys = leftLines.map((line) => normalizeForCompare(line, ignoreWhitespace, ignoreCase));
    const rightKeys = rightLines.map((line) => normalizeForCompare(line, ignoreWhitespace, ignoreCase));

    const ops = myersDiffOps(leftKeys, rightKeys);
    const result = buildDiffOutput(ops, leftLines, rightLines);
    $("tool-output").value = result.text;
    setStatus(
      t("tool.diff.status.done", {
        adds: result.adds,
        dels: result.dels,
        same: result.same,
        lines: result.lines,
      }),
      false
    );
  }

  function swapInputs() {
    const left = $("tool-left");
    const right = $("tool-right");
    const tmp = left.value;
    left.value = right.value;
    right.value = tmp;
    setStatus(t("tool.diff.status.swapped"), false);
  }

  function clearAll() {
    $("tool-left").value = "";
    $("tool-right").value = "";
    $("tool-output").value = "";
    setStatus("", false);
  }

  function main() {
    try {
      $("btn-compare").addEventListener("click", () => {
        try {
          compute();
        } catch (error) {
          setStatus(error instanceof Error ? error.message : t("tool.diff.error.generic"), true);
        }
      });

      $("btn-swap").addEventListener("click", () => {
        try {
          swapInputs();
          compute();
        } catch (error) {
          setStatus(error instanceof Error ? error.message : t("tool.diff.error.generic"), true);
        }
      });

      $("btn-clear").addEventListener("click", clearAll);

      $("btn-copy").addEventListener("click", async () => {
        try {
          await copyToClipboard($("tool-output").value);
          setStatus(t("tool.common.status.copied"), false);
        } catch (_error) {
          setStatus(t("tool.common.error.copy"), true);
        }
      });

      $("opt-mode").addEventListener("change", () => {
        if ($("tool-output").value) {
          try {
            compute();
          } catch (error) {
            setStatus(error instanceof Error ? error.message : t("tool.diff.error.generic"), true);
          }
        }
      });
      $("opt-ignore-ws").addEventListener("change", () => {
        if ($("tool-output").value) {
          try {
            compute();
          } catch (error) {
            setStatus(error instanceof Error ? error.message : t("tool.diff.error.generic"), true);
          }
        }
      });
      $("opt-ignore-case").addEventListener("change", () => {
        if ($("tool-output").value) {
          try {
            compute();
          } catch (error) {
            setStatus(error instanceof Error ? error.message : t("tool.diff.error.generic"), true);
          }
        }
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  window.addEventListener("DOMContentLoaded", main);
})();

