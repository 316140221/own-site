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

## Deploy (GitHub Pages + Actions)

1. Push this repo to GitHub.
2. In GitHub repo settings → **Pages** → **Build and deployment** → **Source**: select **GitHub Actions**.
3. Run the workflow once: **Actions** tab → **Update data and deploy** → **Run workflow**.
   - After that, it will run on a schedule (every 8 hours) and redeploy automatically.

**Optional (recommended): set repo variables**

Set GitHub repo **Settings → Secrets and variables → Actions → Variables**:

- `SITE_URL`
  - GitHub Pages default (no custom domain): `https://<owner>.github.io`
  - Custom domain: `https://news.example.com`
- `PATH_PREFIX`
  - User/Org site (`<owner>.github.io` repo): `/`
  - Project site (`<owner>.github.io/<repo>/`): `/<repo>/`
  - Custom domain: `/`

These are used by `.github/workflows/update-and-deploy.yml` to generate correct canonical URLs, sitemap, and RSS links.

## Custom domain (Cloudflare)

1. In GitHub repo settings → **Pages** → **Custom domain**: enter your domain (e.g. `news.example.com`) and save, then enable **Enforce HTTPS**.
2. In Cloudflare → **DNS** add records:
   - Subdomain (recommended): `CNAME` `news` → `<owner>.github.io` (set to **DNS only** until GitHub verifies).
   - Apex/root domain: follow GitHub Pages instructions (A/AAAA records), or use Cloudflare CNAME-flattening.
3. Wait for DNS propagation and GitHub verification (usually minutes, sometimes longer).

Cloudflare SSL/TLS: use **Full (strict)** (avoid **Flexible**).
