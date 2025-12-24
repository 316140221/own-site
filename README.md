# own-site

Zero-cost news aggregator: fetch RSS feeds, store normalized JSON, build a static site, deploy to GitHub Pages.

## Commands

- `npm ci`
- `npm run update` (fetch RSS → cleanup old data → build indexes)
- `ARCHIVE_OLD=1 npm run update` (archive old data to `archives/` before cleanup)
- `npm run archive` (archive+cleanup only; no fetching)
- `npm run dev` (local preview)
- `npm run build` (build static site to `dist/`)
- `npm run build:site` (build + Pagefind search index)

## Environment variables

- `RETENTION_DAYS` (default `90`)
- `MAX_ITEMS_PER_FEED` (default `80`)
- `ARCHIVE_OLD` (default `false`) and `ARCHIVE_DIR` (default `archives`)
- `FAILURE_BACKOFF_THRESHOLD` (default `3`)
- `FAILURE_BACKOFF_BASE_HOURS` (default `24`)
- `FAILURE_BACKOFF_MAX_HOURS` (default `168`)
- `RUN_HISTORY_DAYS` (default `30`, set `0` to disable)
- `SITE_URL` (site origin for canonical/feeds/sitemap, e.g. `https://<owner>.github.io` or a custom domain; do not include `/<repo>/`)
- `PATH_PREFIX` (for GitHub Pages project sites, e.g. `/<repo>/` or `/`)
