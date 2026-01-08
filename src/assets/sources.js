(function () {
  var TAG_NORMALIZE_RE = null;
  (function () {
    try {
      TAG_NORMALIZE_RE = new RegExp("[^\\p{L}\\p{N}]+", "gu");
    } catch (_e) {
      TAG_NORMALIZE_RE = /[^a-z0-9]+/g;
    }
  })();

  function normalizeTagId(value) {
    var raw = String(value || "").trim().toLowerCase();
    if (!raw) return "";
    return raw
      .replace(TAG_NORMALIZE_RE, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-");
  }

  function getSearchParam(name) {
    try {
      return new URL(window.location.href).searchParams.get(name);
    } catch (_e) {
      return null;
    }
  }

  function parseTags(raw) {
    if (!raw) return [];
    return String(raw)
      .split(",")
      .map(function (t) {
        return String(t || "").trim();
      })
      .filter(Boolean);
  }

  function init() {
    var filterInput = document.querySelector("[data-source-filter]");
    var status = document.querySelector("[data-source-filter-status]");
    var rows = Array.prototype.slice.call(document.querySelectorAll("tr[data-source-id]"));
    if (!rows.length) return;

    var tagFilterRaw = getSearchParam("tag") || "";
    var tagFilter = normalizeTagId(tagFilterRaw);

    var tagLinks = Array.prototype.slice.call(
      document.querySelectorAll(".source-tag-filters a.tag-pill")
    );
    tagLinks.forEach(function (a) {
      var href = a.getAttribute("href") || "";
      var matches = false;
      try {
        var u = new URL(href, window.location.href);
        var tag = normalizeTagId(u.searchParams.get("tag") || "");
        matches = tagFilter ? tag === tagFilter : !tag;
      } catch (_e) {
        matches = false;
      }
      if (matches) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });

    function apply() {
      var q = filterInput ? String(filterInput.value || "").trim().toLowerCase() : "";
      var shown = 0;
      var total = rows.length;

      rows.forEach(function (row) {
        var name = String(row.getAttribute("data-source-name") || "").toLowerCase();
        var id = String(row.getAttribute("data-source-id") || "").toLowerCase();
        var category = String(row.getAttribute("data-source-category") || "").toLowerCase();
        var language = String(row.getAttribute("data-source-language") || "").toLowerCase();
        var country = String(row.getAttribute("data-source-country") || "").toLowerCase();
        var tagsRaw = parseTags(row.getAttribute("data-source-tags"));

        var normalizedTags = tagsRaw.map(normalizeTagId).filter(Boolean);
        var tagOk = !tagFilter || normalizedTags.indexOf(tagFilter) !== -1;

        var haystack = [name, id, category, language, country]
          .concat(tagsRaw.map(function (t) { return String(t || "").toLowerCase(); }))
          .join(" ");
        var textOk = !q || haystack.indexOf(q) !== -1;

        var ok = tagOk && textOk;
        row.hidden = !ok;
        if (ok) shown += 1;
      });

      if (status) {
        var tagLabel = "";
        if (tagFilter) {
          for (var i = 0; i < tagLinks.length; i++) {
            if (tagLinks[i].getAttribute("aria-current") === "page") {
              tagLabel = String(tagLinks[i].textContent || "").trim();
              break;
            }
          }
          if (!tagLabel) tagLabel = tagFilterRaw || tagFilter;
        }

        var key = "sources.filterStatus";
        var vars = { shown: shown, total: total };
        if (tagFilter && q) {
          key = "sources.filterStatusBoth";
          vars.tag = tagLabel;
          vars.q = q;
        } else if (tagFilter) {
          key = "sources.filterStatusTag";
          vars.tag = tagLabel;
        } else if (q) {
          key = "sources.filterStatusQuery";
          vars.q = q;
        }

        if (window.SiteI18n && typeof window.SiteI18n.t === "function") {
          status.textContent = window.SiteI18n.t(key, vars);
        } else {
          var fallback = "Showing " + shown + " / " + total;
          if (tagFilter && q) fallback += " · Tag: " + tagLabel + " · Search: \"" + q + "\"";
          else if (tagFilter) fallback += " · Tag: " + tagLabel;
          else if (q) fallback += " · Search: \"" + q + "\"";
          status.textContent = fallback;
        }
      }
    }

    if (filterInput) {
      filterInput.addEventListener("input", apply);
    }
    window.addEventListener("site:lang", apply);
    apply();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
