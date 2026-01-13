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

  function setSearchParam(name, value) {
    try {
      var url = new URL(window.location.href);
      var next = String(value || "").trim();
      if (next) url.searchParams.set(name, next);
      else url.searchParams.delete(name);
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    } catch (_e) {}
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

  function parseBoolParam(value) {
    var raw = String(value || "").trim().toLowerCase();
    return raw === "1" || raw === "true" || raw === "yes";
  }

  function readFavoriteSourceIdMap() {
    if (typeof readFavoriteSources !== "function") return {};
    var list = [];
    try {
      list = readFavoriteSources();
    } catch (_e) {
      list = [];
    }
    if (!Array.isArray(list)) return {};
    var map = {};
    for (var i = 0; i < list.length; i += 1) {
      var item = list[i];
      if (!item || !item.id) continue;
      var id = String(item.id || "").trim().toLowerCase();
      if (!id) continue;
      map[id] = true;
    }
    return map;
  }

  function getSourceMetaFromRow(row) {
    if (!(row instanceof HTMLElement)) return null;
    var id = String(row.getAttribute("data-source-id") || "").trim();
    var name = String(row.getAttribute("data-source-name") || "").trim();
    if (!id || !name) return null;
    return { id: id, name: name, path: "/source/" + id + "/" };
  }

  function setStarButtonState(btn, on) {
    if (!(btn instanceof HTMLButtonElement)) return;
    var pressed = Boolean(on);
    btn.setAttribute("aria-pressed", pressed ? "true" : "false");
    var key = pressed ? "sources.unstar" : "sources.star";
    btn.setAttribute("data-i18n", key);
    if (window.SiteI18n && typeof window.SiteI18n.t === "function") {
      btn.textContent = window.SiteI18n.t(key);
    } else {
      btn.textContent = pressed ? "Unstar" : "Star";
    }
  }

  function init() {
    var filterInput = document.querySelector("[data-source-filter]");
    var status = document.querySelector("[data-source-filter-status]");
    var rows = Array.prototype.slice.call(document.querySelectorAll("tr[data-source-id]"));
    if (!rows.length) return;

    var tagFilterRaw = getSearchParam("tag") || "";
    var tagFilter = normalizeTagId(tagFilterRaw);

    var statusFilterRaw = getSearchParam("status") || "";
    var statusFilter = normalizeTagId(statusFilterRaw);

    var starredOnlyBtn = document.querySelector("[data-source-starred-only]");
    var starredOnly = parseBoolParam(getSearchParam("star"));
    var favoriteIdMap = readFavoriteSourceIdMap();

    var qFromUrl = getSearchParam("q") || "";
    if (filterInput && qFromUrl) filterInput.value = qFromUrl;

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

    var statusButtons = Array.prototype.slice.call(
      document.querySelectorAll("[data-source-status-filters] [data-source-status]")
    );

    function refreshStatusButtons() {
      statusFilterRaw = getSearchParam("status") || "";
      statusFilter = normalizeTagId(statusFilterRaw);
      statusButtons.forEach(function (btn) {
        if (!(btn instanceof HTMLElement)) return;
        var value = normalizeTagId(btn.getAttribute("data-source-status"));
        var on = statusFilter ? value === statusFilter : !value;
        btn.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }

    function refreshStarredOnlyButton() {
      starredOnly = parseBoolParam(getSearchParam("star"));
      if (starredOnlyBtn instanceof HTMLButtonElement) {
        starredOnlyBtn.setAttribute("aria-pressed", starredOnly ? "true" : "false");
      }
    }

    function getStatusLabel() {
      if (!statusFilter) return "";
      for (var i = 0; i < statusButtons.length; i++) {
        var btn = statusButtons[i];
        if (!(btn instanceof HTMLElement)) continue;
        var value = normalizeTagId(btn.getAttribute("data-source-status"));
        if (value === statusFilter) {
          var label = String(btn.textContent || "").trim();
          if (label) return label;
        }
      }
      return statusFilterRaw || statusFilter;
    }

    statusButtons.forEach(function (btn) {
      if (!(btn instanceof HTMLButtonElement)) return;
      btn.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        var next = normalizeTagId(btn.getAttribute("data-source-status"));
        setSearchParam("status", next);
        refreshStatusButtons();
        apply();
      });
    });

    if (starredOnlyBtn instanceof HTMLButtonElement) {
      starredOnlyBtn.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        var next = parseBoolParam(getSearchParam("star")) ? "" : "1";
        setSearchParam("star", next);
        refreshStarredOnlyButton();
        apply();
      });
    }

    function refreshFavoriteButtons() {
      favoriteIdMap = readFavoriteSourceIdMap();
      rows.forEach(function (row) {
        if (!(row instanceof HTMLElement)) return;
        var rowId = String(row.getAttribute("data-source-id") || "").trim().toLowerCase();
        var btn = row.querySelector("[data-favorite-source]");
        if (!(btn instanceof HTMLButtonElement)) return;
        setStarButtonState(btn, Boolean(rowId && favoriteIdMap[rowId]));
      });
    }

    rows.forEach(function (row) {
      if (!(row instanceof HTMLElement)) return;
      var starBtn = row.querySelector("[data-favorite-source]");
      if (starBtn instanceof HTMLButtonElement) {
        starBtn.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          var meta = getSourceMetaFromRow(row);
          if (!meta || typeof toggleFavoriteSource !== "function") return;
          toggleFavoriteSource(meta);
          refreshFavoriteButtons();
          apply();
        });
      }

      var copyBtn = row.querySelector("[data-source-copy-id]");
      if (copyBtn instanceof HTMLButtonElement) {
        copyBtn.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          var id = copyBtn.getAttribute("data-source-copy-id") || "";
          if (typeof copyToClipboard !== "function" || typeof flashButtonLabel !== "function") return;
          Promise.resolve(copyToClipboard(id)).then(function (ok) {
            flashButtonLabel(copyBtn, ok ? "common.copied" : "common.copyFailed");
          });
        });
      }
    });

    function apply() {
      var q = filterInput ? String(filterInput.value || "").trim().toLowerCase() : "";
      var shown = 0;
      var total = rows.length;

      rows.forEach(function (row) {
        var name = String(row.getAttribute("data-source-name") || "").toLowerCase();
        var id = String(row.getAttribute("data-source-id") || "").trim().toLowerCase();
        var category = String(row.getAttribute("data-source-category") || "").toLowerCase();
        var language = String(row.getAttribute("data-source-language") || "").toLowerCase();
        var country = String(row.getAttribute("data-source-country") || "").toLowerCase();
        var rowStatus = normalizeTagId(row.getAttribute("data-source-status"));
        var tagsRaw = parseTags(row.getAttribute("data-source-tags"));

        var normalizedTags = tagsRaw.map(normalizeTagId).filter(Boolean);
        var tagOk = !tagFilter || normalizedTags.indexOf(tagFilter) !== -1;
        var statusOk = !statusFilter || rowStatus === statusFilter;
        var starOk = !starredOnly || Boolean(id && favoriteIdMap[id]);

        var haystack = [name, id, category, language, country]
          .concat(
            tagsRaw.map(function (t) {
              return String(t || "").toLowerCase();
            })
          )
          .join(" ");
        var textOk = !q || haystack.indexOf(q) !== -1;

        var ok = tagOk && statusOk && starOk && textOk;
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

        var statusLabel = getStatusLabel();

        var key = "sources.filterStatus";
        var vars = { shown: shown, total: total };
        if (statusFilter) {
          vars.status = statusLabel;
          if (tagFilter && q) {
            key = "sources.filterStatusStatusTagQuery";
            vars.tag = tagLabel;
            vars.q = q;
          } else if (tagFilter) {
            key = "sources.filterStatusStatusTag";
            vars.tag = tagLabel;
          } else if (q) {
            key = "sources.filterStatusStatusQuery";
            vars.q = q;
          } else {
            key = "sources.filterStatusStatus";
          }
        } else if (tagFilter && q) {
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
          if (statusFilter) fallback += " · Status: " + statusLabel;
          if (tagFilter) fallback += " · Tag: " + tagLabel;
          if (q) fallback += " · Search: \"" + q + "\"";
          status.textContent = fallback;
        }

        if (starredOnly) {
          var starredLabel =
            window.SiteI18n && typeof window.SiteI18n.t === "function"
              ? window.SiteI18n.t("sources.starredOnly")
              : "Starred only";
          status.textContent = status.textContent + " · " + starredLabel;
        }
      }
    }

    if (filterInput) {
      filterInput.addEventListener("input", function () {
        setSearchParam("q", filterInput.value || "");
        apply();
      });
    }
    window.addEventListener("site:lang", apply);
    window.addEventListener("site:source-favorites", function () {
      refreshFavoriteButtons();
      apply();
    });
    refreshStarredOnlyButton();
    refreshFavoriteButtons();
    refreshStatusButtons();
    apply();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
