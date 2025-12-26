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

  function readPrefixFallback() {
    const raw = Number.parseInt($("opt-prefix").value, 10);
    if (!Number.isFinite(raw)) return 24;
    return Math.min(32, Math.max(0, raw));
  }

  function parseCidr(input) {
    const raw = String(input || "").trim();
    if (!raw) throw new Error(t("tool.ip.error.empty"));

    let ipPart = raw;
    let prefix = null;

    const slash = raw.indexOf("/");
    if (slash >= 0) {
      ipPart = raw.slice(0, slash).trim();
      const p = Number.parseInt(raw.slice(slash + 1).trim(), 10);
      prefix = Number.isFinite(p) ? p : null;
    }

    if (prefix == null) prefix = readPrefixFallback();
    if (!Number.isFinite(prefix) || prefix < 0 || prefix > 32) throw new Error(t("tool.ip.error.prefix"));

    const parts = ipPart.split(".").map((p) => p.trim());
    if (parts.length !== 4) throw new Error(t("tool.ip.error.ip"));
    const octets = parts.map((p) => Number.parseInt(p, 10));
    if (octets.some((n) => !Number.isFinite(n) || n < 0 || n > 255)) throw new Error(t("tool.ip.error.ip"));

    const ip =
      (((octets[0] << 24) >>> 0) |
        (octets[1] << 16) |
        (octets[2] << 8) |
        octets[3]) >>> 0;

    return { ip, prefix };
  }

  function toDotted(n) {
    const v = n >>> 0;
    return `${(v >>> 24) & 255}.${(v >>> 16) & 255}.${(v >>> 8) & 255}.${v & 255}`;
  }

  function toBinary(n) {
    const v = (n >>> 0).toString(2).padStart(32, "0");
    return `${v.slice(0, 8)} ${v.slice(8, 16)} ${v.slice(16, 24)} ${v.slice(24)}`;
  }

  function maskFromPrefix(prefix) {
    if (prefix === 0) return 0 >>> 0;
    if (prefix === 32) return 0xffffffff >>> 0;
    return (0xffffffff << (32 - prefix)) >>> 0;
  }

  function compute(ip, prefix) {
    const mask = maskFromPrefix(prefix);
    const wildcard = (~mask) >>> 0;
    const network = ip & mask;
    const broadcast = (network | wildcard) >>> 0;
    const total = 2 ** (32 - prefix);

    let usable = 0;
    let first = network;
    let last = broadcast;
    let note = "";

    if (prefix === 32) {
      usable = 1;
      first = ip;
      last = ip;
      note = "/32";
    } else if (prefix === 31) {
      usable = 2;
      first = network;
      last = broadcast;
      note = "/31";
    } else {
      usable = Math.max(0, total - 2);
      first = (network + 1) >>> 0;
      last = (broadcast - 1) >>> 0;
    }

    return { mask, wildcard, network, broadcast, total, usable, first, last, note };
  }

  function formatOutput(ip, prefix, info) {
    const lines = [
      `${t("tool.ip.out.cidr")}: ${toDotted(ip)}/${prefix}`,
      `${t("tool.ip.out.ip")}: ${toDotted(ip)} (${ip})`,
      `${t("tool.ip.out.ipBinary")}: ${toBinary(ip)}`,
      `${t("tool.ip.out.netmask")}: ${toDotted(info.mask)} (${info.mask})`,
      `${t("tool.ip.out.wildcard")}: ${toDotted(info.wildcard)} (${info.wildcard})`,
      `${t("tool.ip.out.network")}: ${toDotted(info.network)}/${prefix}`,
      `${t("tool.ip.out.broadcast")}: ${toDotted(info.broadcast)}`,
      `${t("tool.ip.out.range")}: ${toDotted(info.first)} - ${toDotted(info.last)}`,
      `${t("tool.ip.out.total")}: ${info.total}`,
      `${t("tool.ip.out.usable")}: ${info.usable}`,
    ];

    if (info.note === "/31") lines.push(t("tool.ip.note.31"));
    if (info.note === "/32") lines.push(t("tool.ip.note.32"));
    return lines.join("\n");
  }

  function runCalc() {
    const input = $("tool-input").value;
    const { ip, prefix } = parseCidr(input);
    const info = compute(ip, prefix);
    const out = formatOutput(ip, prefix, info);
    $("tool-output").value = out;
    setStatus(t("tool.ip.status.done"), false);
  }

  function clearAll() {
    $("tool-input").value = "";
    $("tool-output").value = "";
    setStatus("", false);
  }

  function main() {
    try {
      $("btn-calc").addEventListener("click", () => {
        try {
          runCalc();
        } catch (error) {
          setStatus(error instanceof Error ? error.message : String(error), true);
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
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  window.addEventListener("DOMContentLoaded", main);
})();

