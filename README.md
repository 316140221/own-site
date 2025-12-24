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
- `ANALYTICS_PROVIDER` (optional: `cloudflare` or `ga4`)
- `CLOUDFLARE_WEB_ANALYTICS_TOKEN` (optional: Cloudflare Web Analytics token)
- `GA_MEASUREMENT_ID` (optional: Google Analytics 4 measurement id, e.g. `G-XXXXXXXXXX`)

## Analytics (optional)

This site can inject a lightweight analytics script at build time (disabled by default).

- Cloudflare Web Analytics: set `ANALYTICS_PROVIDER=cloudflare` + `CLOUDFLARE_WEB_ANALYTICS_TOKEN`
- Google Analytics 4: set `ANALYTICS_PROVIDER=ga4` + `GA_MEASUREMENT_ID`

## Deploy (GitHub Pages + Actions)

1. Push this repo to GitHub.
2. In GitHub repo settings → **Pages** → **Build and deployment** → **Source**: select **GitHub Actions**.
3. Run the workflow once: **Actions** tab → **Update data and deploy** → **Run workflow**.
   - After that, it will run on a schedule (every 8 hours) and redeploy automatically.

## Data history branch (recommended)

The workflow commits generated changes under `data/` to a separate branch `data`, to keep `main` clean for code changes.

If you don't want to fetch `data` locally, clone/fetch only `main`:

- Fresh clone: `git clone --single-branch --branch main <repo-url>`
- Existing clone:
  - `git remote set-branches origin main`
  - `git fetch --prune origin`

**Optional (recommended): set repo variables**

Set GitHub repo **Settings → Secrets and variables → Actions → Variables** (click the **Variables** tab, then **New repository variable**):

- `SITE_URL`
  - GitHub Pages default (no custom domain): `https://<owner>.github.io`
  - Custom domain: `https://shouyun.top` (or `https://news.example.com`)
- `PATH_PREFIX`
  - User/Org site (`<owner>.github.io` repo): `/`
  - Project site (`<owner>.github.io/<repo>/`): `/<repo>/`
  - Custom domain: `/`

Notes:
- This workflow reads `vars.SITE_URL` / `vars.PATH_PREFIX` (see `.github/workflows/update-and-deploy.yml`).
- If you set `SITE_URL` (custom domain), `PATH_PREFIX` will default to `/` automatically.

These are used to generate correct canonical URLs, sitemap, and RSS links.

## Custom domain (Cloudflare)

1. In GitHub repo settings → **Pages** → **Custom domain**: enter your domain (e.g. `news.example.com`) and save, then enable **Enforce HTTPS**.
2. In Cloudflare → **DNS** add records (set to **DNS only** / gray cloud until GitHub verifies):
   - Apex/root domain (e.g. `shouyun.top`): add these records (Name is `@` in Cloudflare):
     - `A` `@` → `185.199.108.153`
     - `A` `@` → `185.199.109.153`
     - `A` `@` → `185.199.110.153`
     - `A` `@` → `185.199.111.153`
     - `AAAA` `@` → `2606:50c0:8000::153`
     - `AAAA` `@` → `2606:50c0:8001::153`
     - `AAAA` `@` → `2606:50c0:8002::153`
     - `AAAA` `@` → `2606:50c0:8003::153`
   - Subdomain (recommended): `CNAME` `news` → `<owner>.github.io`
   - Optional: `CNAME` `www` → `<owner>.github.io` (or redirect `www` → apex via Cloudflare rules)
3. Wait for DNS propagation and GitHub verification (usually minutes, sometimes longer).

Cloudflare SSL/TLS: use **Full (strict)** (avoid **Flexible**).
