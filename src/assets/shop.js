function parseJsonArray(value) {
  try {
    const parsed = JSON.parse(String(value || "[]"));
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function normalizeTag(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeText(value) {
  return String(value || "").toLowerCase().trim();
}

function t(key, vars) {
  const api = window.SiteI18n;
  if (api && typeof api.t === "function") return api.t(key, vars);
  let input = String(key || "");
  if (!vars || typeof vars !== "object") return input;
  return input.replace(/\{(\w+)\}/g, function (_m, k) {
    return Object.prototype.hasOwnProperty.call(vars, k) ? String(vars[k]) : "{" + k + "}";
  });
}

function prefersReducedMotion() {
  return Boolean(
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function getActiveTagFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return normalizeTag(params.get("tag"));
}

function setActiveTagInUrl(tag) {
  const url = new URL(window.location.href);
  const normalized = normalizeTag(tag);
  if (normalized) url.searchParams.set("tag", normalized);
  else url.searchParams.delete("tag");
  window.history.replaceState(null, "", url.pathname + url.search + url.hash);
}

function getSearchQueryFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return normalizeText(params.get("q"));
}

function setSearchQueryInUrl(q) {
  const url = new URL(window.location.href);
  const normalized = String(q || "").trim();
  if (normalized) url.searchParams.set("q", normalized);
  else url.searchParams.delete("q");
  window.history.replaceState(null, "", url.pathname + url.search + url.hash);
}

function getSortFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const raw = String(params.get("sort") || "").trim();
  return raw;
}

function setSortInUrl(sort) {
  const url = new URL(window.location.href);
  const normalized = String(sort || "").trim();
  if (normalized) url.searchParams.set("sort", normalized);
  else url.searchParams.delete("sort");
  window.history.replaceState(null, "", url.pathname + url.search + url.hash);
}

function getTagLabel(active, buttons) {
  const normalized = normalizeTag(active);
  if (!normalized) return "";
  for (const btn of buttons) {
    if (!(btn instanceof HTMLElement)) continue;
    const tagValue = normalizeTag(btn.getAttribute("data-shop-tag"));
    if (tagValue !== normalized) continue;
    const label = btn.getAttribute("data-shop-tag-label");
    if (label) return label;
  }
  return normalized;
}

function parseNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const cleaned = String(value ?? "").replace(/,/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function parsePrice(value) {
  const raw = String(value ?? "");
  const m = raw.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  if (!m) return null;
  const parsed = Number.parseFloat(m[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

function matchesQuery(haystack, q) {
  const query = normalizeText(q);
  if (!query) return true;
  const text = normalizeText(haystack);
  const parts = query.split(/\s+/).filter(Boolean);
  for (const p of parts) {
    if (!text.includes(p)) return false;
  }
  return true;
}

function buildGroupData() {
  const groups = Array.from(document.querySelectorAll("[data-shop-group]"));
  return groups.map((section) => {
    const grid = section.querySelector(".shop-grid");
    const items = Array.from(section.querySelectorAll("[data-shop-item]"));
    for (let i = 0; i < items.length; i += 1) {
      if (!items[i].getAttribute("data-shop-idx")) items[i].setAttribute("data-shop-idx", String(i));
    }
    return { section, grid, items };
  });
}

function getOriginalIndex(el) {
  const raw = el.getAttribute("data-shop-idx") || "0";
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : 0;
}

function compareTitle(a, b, dir) {
  const at = String(a.getAttribute("data-shop-title") || a.getAttribute("data-shop-asin") || "").trim();
  const bt = String(b.getAttribute("data-shop-title") || b.getAttribute("data-shop-asin") || "").trim();
  const cmp = at.localeCompare(bt, undefined, { numeric: true, sensitivity: "base" });
  if (cmp !== 0) return dir === "desc" ? -cmp : cmp;
  return getOriginalIndex(a) - getOriginalIndex(b);
}

function applySort(groupData, sortKey) {
  const key = String(sortKey || "").trim();
  for (const g of groupData) {
    if (!g.grid) continue;
    const items = g.items.slice();
    items.sort((a, b) => {
      const ia = getOriginalIndex(a);
      const ib = getOriginalIndex(b);

      if (!key) return ia - ib;
      if (key === "rating") {
        const ra = parseNumber(a.getAttribute("data-shop-rating")) ?? -1;
        const rb = parseNumber(b.getAttribute("data-shop-rating")) ?? -1;
        if (ra !== rb) return rb - ra;
        const ca = parseNumber(a.getAttribute("data-shop-review-count")) ?? -1;
        const cb = parseNumber(b.getAttribute("data-shop-review-count")) ?? -1;
        if (ca !== cb) return cb - ca;
        return ia - ib;
      }
      if (key === "reviews") {
        const ca = parseNumber(a.getAttribute("data-shop-review-count")) ?? -1;
        const cb = parseNumber(b.getAttribute("data-shop-review-count")) ?? -1;
        if (ca !== cb) return cb - ca;
        const ra = parseNumber(a.getAttribute("data-shop-rating")) ?? -1;
        const rb = parseNumber(b.getAttribute("data-shop-rating")) ?? -1;
        if (ra !== rb) return rb - ra;
        return ia - ib;
      }
      if (key === "priceAsc") {
        const pa = parsePrice(a.getAttribute("data-shop-price"));
        const pb = parsePrice(b.getAttribute("data-shop-price"));
        const va = pa == null ? Number.POSITIVE_INFINITY : pa;
        const vb = pb == null ? Number.POSITIVE_INFINITY : pb;
        if (va !== vb) return va - vb;
        return ia - ib;
      }
      if (key === "priceDesc") {
        const pa = parsePrice(a.getAttribute("data-shop-price"));
        const pb = parsePrice(b.getAttribute("data-shop-price"));
        const va = pa == null ? Number.NEGATIVE_INFINITY : pa;
        const vb = pb == null ? Number.NEGATIVE_INFINITY : pb;
        if (va !== vb) return vb - va;
        return ia - ib;
      }
      if (key === "titleAsc") return compareTitle(a, b, "asc");
      if (key === "titleDesc") return compareTitle(a, b, "desc");
      return ia - ib;
    });

    for (const el of items) g.grid.appendChild(el);
  }
}

function applyShopFilters(tag, query, sortKey, groupData) {
  const active = normalizeTag(tag);
  const q = String(query || "").trim();
  const buttons = Array.from(document.querySelectorAll("[data-shop-tag]"));
  const status = document.querySelector("[data-shop-filter-status]");
  const empty = document.querySelector("[data-shop-empty]");

  let visibleCount = 0;
  for (const group of groupData) {
    for (const el of group.items) {
      const raw = el.getAttribute("data-shop-tags") || "[]";
      const tags = parseJsonArray(raw).map((t) => normalizeTag(t)).filter(Boolean);
      const title = el.getAttribute("data-shop-title") || "";
      const asin = el.getAttribute("data-shop-asin") || "";
      const show = (!active || tags.includes(active)) && matchesQuery(`${title} ${asin}`, q);
      el.hidden = !show;
      if (show) visibleCount += 1;
    }
  }

  applySort(groupData, sortKey);

  for (const group of groupData) {
    const anyVisible = group.section.querySelector("[data-shop-item]:not([hidden])");
    group.section.hidden = !anyVisible;
  }

  if (empty) empty.hidden = visibleCount > 0;

  for (const btn of buttons) {
    const tagValue = normalizeTag(btn.getAttribute("data-shop-tag"));
    const pressed = active ? tagValue === active : !tagValue;
    btn.setAttribute("aria-pressed", pressed ? "true" : "false");
  }

  if (status) {
    if (active || q) {
      status.hidden = false;
      if (active && q) {
        status.textContent = t("shop.filterStatusBoth", {
          tag: getTagLabel(active, buttons),
          q,
          count: visibleCount,
        });
      } else if (active) {
        status.textContent = t("shop.filterStatus", {
          tag: getTagLabel(active, buttons),
          count: visibleCount,
        });
      } else {
        status.textContent = t("shop.searchStatus", { q, count: visibleCount });
      }
    } else {
      status.hidden = true;
      status.textContent = "";
    }
  }
}

function setupShopFilters() {
  const items = document.querySelectorAll("[data-shop-item]");
  if (!items.length) return;

  const groupData = buildGroupData();

  const initialTag = getActiveTagFromUrl();
  const initialQ = getSearchQueryFromUrl();
  const initialSort = getSortFromUrl();

  const searchInput = document.querySelector("[data-shop-search-input]");
  if (searchInput instanceof HTMLInputElement) searchInput.value = initialQ;

  const sortSelect = document.querySelector("[data-shop-sort]");
  if (sortSelect instanceof HTMLSelectElement) sortSelect.value = initialSort;

  applyShopFilters(initialTag, initialQ, initialSort, groupData);
  if (initialTag) setActiveTagInUrl(initialTag);
  if (initialQ) setSearchQueryInUrl(initialQ);
  if (initialSort) setSortInUrl(initialSort);

  document.querySelectorAll("[data-shop-tag]").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const current = getActiveTagFromUrl();
      const q = getSearchQueryFromUrl();
      const sort = getSortFromUrl();
      const tag = btn.getAttribute("data-shop-tag") || "";
      const normalized = normalizeTag(tag);
      const next = normalized && normalized === current ? "" : tag;
      setActiveTagInUrl(next);
      applyShopFilters(next, q, sort, groupData);

      const fromItem = btn.closest(".shop-tags");
      if (fromItem) {
        const anchor = document.querySelector("[data-shop-filters]") || document.querySelector("h1");
        if (anchor) {
          anchor.scrollIntoView({
            behavior: prefersReducedMotion() ? "auto" : "smooth",
            block: "start",
          });
        }
      }
    });
  });

  let searchTimer = 0;
  function scheduleSearchApply() {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => {
      const tag = getActiveTagFromUrl();
      const sort = getSortFromUrl();
      const q = searchInput instanceof HTMLInputElement ? searchInput.value : getSearchQueryFromUrl();
      setSearchQueryInUrl(q);
      applyShopFilters(tag, q, sort, groupData);
    }, 120);
  }

  if (searchInput instanceof HTMLInputElement) {
    searchInput.addEventListener("input", scheduleSearchApply);
  }

  const clearBtn = document.querySelector("[data-shop-search-clear]");
  if (clearBtn instanceof HTMLButtonElement && searchInput instanceof HTMLInputElement) {
    clearBtn.addEventListener("click", (event) => {
      event.preventDefault();
      searchInput.value = "";
      setSearchQueryInUrl("");
      applyShopFilters(getActiveTagFromUrl(), "", getSortFromUrl(), groupData);
      try {
        searchInput.focus({ preventScroll: true });
      } catch (_error) {
        // ignore
      }
    });
  }

  if (sortSelect instanceof HTMLSelectElement) {
    sortSelect.addEventListener("change", () => {
      const sort = sortSelect.value || "";
      setSortInUrl(sort);
      applyShopFilters(getActiveTagFromUrl(), getSearchQueryFromUrl(), sort, groupData);
    });
  }

  window.addEventListener("popstate", () => {
    const tag = getActiveTagFromUrl();
    const q = getSearchQueryFromUrl();
    const sort = getSortFromUrl();
    if (searchInput instanceof HTMLInputElement) searchInput.value = q;
    if (sortSelect instanceof HTMLSelectElement) sortSelect.value = sort;
    applyShopFilters(tag, q, sort, groupData);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupShopFilters);
} else {
  setupShopFilters();
}
