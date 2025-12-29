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

function applyShopTagFilter(tag) {
  const active = normalizeTag(tag);
  const items = Array.from(document.querySelectorAll("[data-shop-item]"));
  const groups = Array.from(document.querySelectorAll("[data-shop-group]"));
  const buttons = Array.from(document.querySelectorAll("[data-shop-tag]"));
  const status = document.querySelector("[data-shop-filter-status]");
  const empty = document.querySelector("[data-shop-empty]");

  let visibleCount = 0;
  for (const el of items) {
    const raw = el.getAttribute("data-shop-tags") || "[]";
    const tags = parseJsonArray(raw).map((t) => normalizeTag(t)).filter(Boolean);
    const show = !active || tags.includes(active);
    el.hidden = !show;
    if (show) visibleCount += 1;
  }

  for (const section of groups) {
    const anyVisible = section.querySelector("[data-shop-item]:not([hidden])");
    section.hidden = !anyVisible;
  }

  if (empty) empty.hidden = visibleCount > 0;

  for (const btn of buttons) {
    const tagValue = normalizeTag(btn.getAttribute("data-shop-tag"));
    const pressed = active ? tagValue === active : !tagValue;
    btn.setAttribute("aria-pressed", pressed ? "true" : "false");
  }

  if (status) {
    if (active) {
      status.hidden = false;
      status.textContent = t("shop.filterStatus", {
        tag: getTagLabel(active, buttons),
        count: visibleCount,
      });
    } else {
      status.hidden = true;
      status.textContent = "";
    }
  }
}

function setupShopFilters() {
  const items = document.querySelectorAll("[data-shop-item]");
  if (!items.length) return;

  const initial = getActiveTagFromUrl();
  applyShopTagFilter(initial);
  if (initial) setActiveTagInUrl(initial);

  document.querySelectorAll("[data-shop-tag]").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const current = getActiveTagFromUrl();
      const tag = btn.getAttribute("data-shop-tag") || "";
      const normalized = normalizeTag(tag);
      const next = normalized && normalized === current ? "" : tag;
      setActiveTagInUrl(next);
      applyShopTagFilter(next);

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

  window.addEventListener("popstate", () => {
    applyShopTagFilter(getActiveTagFromUrl());
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupShopFilters);
} else {
  setupShopFilters();
}
