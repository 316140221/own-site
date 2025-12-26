# Yunxi Hub

一个零成本的静态站：自动抓取 RSS 新闻流，生成静态页面，并通过 GitHub Actions 自动部署到 GitHub Pages；同时内置一些纯前端的小工具（本地运行，不上传内容）。

## TL;DR（中文快速说明）

- 自动化：推送到 `main` 就会自动构建并部署（无需手动点 Actions）；另外还有定时任务会自动更新数据。
- 站点配置：改根目录 `site.config.json`（站点名、语言开关都在这里）。
- 中英文切换：默认 `languages: ["en"]`（纯英文且不显示切换）；要启用中文再改成 `["en","zh"]`。

## What it does

- RSS → normalized JSON (`data/`) → static site (`dist/`)
- Search powered by Pagefind (no external service)
- A small tools section (Base64 / Base32 / Base58 / Hex / URL / Unicode / HTML / Morse / QueryString / JSON / CSV / XML / Case / SHA / MD5 / CRC32 / HMAC / AES / File Hash / UUID / Password / JWT / Timestamp / IPv4 CIDR / Color) running locally in the browser
- Fully automated deploy via GitHub Actions + GitHub Pages

## Commands

- Install: `npm ci`
- Local preview: `npm run dev`
- Update data: `npm run update` (fetch RSS → cleanup old data → build indexes)
- Build site: `npm run build` (outputs to `dist/`)
- Build + search index: `npm run build:site` (build + Pagefind)
- Archive old data only: `npm run archive`

## Site config (JSON)

Edit `site.config.json` to customize site metadata and UI language options:

- `name` / `brand` / `tagline` / `description`
- `defaultLanguage`: default UI language (e.g. `en`)
- `languages`: supported UI languages
  - Default: `["en"]` (English-only, language switch hidden)
  - Enable Chinese UI: `["en", "zh"]` (shows a language switch in the header)

## GitHub Actions deploy (no manual clicks)

This repo includes `.github/workflows/update-and-deploy.yml`:

- Triggers on push to `main` and on a schedule (every 4 hours UTC)
- Fetches RSS and updates `data/` on a separate `data` branch (keeps `main` clean)
- Builds `dist/` and deploys to GitHub Pages

One-time setup:

1. GitHub repo → **Settings** → **Pages** → **Build and deployment** → **Source**: select **GitHub Actions**
2. (Optional but recommended) GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **Variables**
   - `SITE_URL` (e.g. `https://<owner>.github.io` or your custom domain)
   - `PATH_PREFIX` (`/` for custom domain or `<owner>.github.io` repo; `/<repo>/` for project pages)

After that: any push to `main` will auto build + deploy.

## Environment variables

For local development, you can use a `.env` file (already gitignored). For GitHub Actions, use repo Variables/Secrets.

- `RETENTION_DAYS` (default `90`)
- `MAX_ITEMS_PER_FEED` (default `80`)
- `ARCHIVE_OLD` (default `false`) and `ARCHIVE_DIR` (default `archives`)
- `FAILURE_BACKOFF_THRESHOLD` (default `3`)
- `FAILURE_BACKOFF_BASE_HOURS` (default `24`)
- `FAILURE_BACKOFF_MAX_HOURS` (default `168`)
- `RUN_HISTORY_DAYS` (default `30`, set `0` to disable)
- `RSS_CONTENT_MAX_CHARS` (default `8000`, max chars kept from RSS long content)
- `RSS_CONTENT_MIN_CHARS` (default `200`, minimum chars to store RSS long content)
- `SITE_URL` (site origin for canonical/feeds/sitemap, e.g. `https://shouyun.top`; do not include `/<repo>/`)
- `PATH_PREFIX` (for GitHub Pages project sites, e.g. `/<repo>/` or `/`)
- `GOOGLE_SITE_VERIFICATION` (optional: Google Search Console verification token)
- `ANALYTICS_PROVIDER` (optional: `cloudflare` or `ga4`)
- `CLOUDFLARE_WEB_ANALYTICS_TOKEN` (optional)
- `GA_MEASUREMENT_ID` (optional)

## Analytics (optional)

- Cloudflare Web Analytics: `ANALYTICS_PROVIDER=cloudflare` + `CLOUDFLARE_WEB_ANALYTICS_TOKEN`
- Google Analytics 4: `ANALYTICS_PROVIDER=ga4` + `GA_MEASUREMENT_ID`

## Repo layout

- `src/`: Eleventy templates, layouts, and assets
  - `src/_includes/`: layouts/partials
  - `src/_data/`: data providers (site config loader, tools list, etc.)
  - `src/tools/`: tools pages
  - `src/assets/tools/`: tools JavaScript (browser-only)
- `data/`: generated/normalized RSS data (committed on `data` branch by the workflow)
- `dist/`: build output (not committed)
- `archives/`: optional data archives uploaded as workflow artifacts

## Custom domain (Cloudflare)

1. GitHub repo → **Settings** → **Pages** → **Custom domain**: set your domain, then enable **Enforce HTTPS**
2. Cloudflare → **DNS** add records (use **DNS only** until GitHub verifies)
   - Apex/root domain (e.g. `shouyun.top`):
     - `A` `@` → `185.199.108.153`
     - `A` `@` → `185.199.109.153`
     - `A` `@` → `185.199.110.153`
     - `A` `@` → `185.199.111.153`
     - `AAAA` `@` → `2606:50c0:8000::153`
     - `AAAA` `@` → `2606:50c0:8001::153`
     - `AAAA` `@` → `2606:50c0:8002::153`
     - `AAAA` `@` → `2606:50c0:8003::153`
   - Subdomain (recommended): `CNAME` `news` → `<owner>.github.io`
3. Wait for DNS propagation and GitHub verification

Cloudflare SSL/TLS: use **Full (strict)** (avoid **Flexible**).
