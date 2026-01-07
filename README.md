# Yunxi Hub

一个零成本的静态站：自动抓取 RSS 新闻流，生成静态页面，并通过 GitHub Actions 自动部署到 GitHub Pages；同时内置一些纯前端的小工具（本地运行，不上传内容）。

## TL;DR（中文快速说明）

- 自动化：推送到 `main` 就会自动构建并部署（无需手动点 Actions）；另外还有定时任务会自动更新数据。
- 站点配置：改根目录 `site.config.json`（站点名、语言开关都在这里）。
- 中英文切换：默认 `languages: ["en"]`（纯英文且不显示切换）；要启用中文再改成 `["en","zh"]`。

## What it does

- RSS → normalized JSON (`data/`) → static site (`dist/`)
- Search powered by Pagefind (no external service)
- OPML export for sources (`/sources.opml`)
- Trending/Top aggregation (`/trending/`)
- A small tools section (Base64 / Base32 / Base58 / Base85 / ROT13 / Escape / Hex / URL / Unicode / HTML / Morse / QueryString / Regex / JSON / CSV / XML / Case / Lines / SHA / MD5 / MD4 / MD2 / CRC32 / HMAC / AES / RSA / File Hash / UUID / NanoID / Password / Lorem / JWT / Timestamp / Number Base / IPv4 CIDR / Color) running locally in the browser
- Fully automated deploy via GitHub Actions + GitHub Pages

## Commands

- Install: `npm ci`
- Local preview: `npm run dev`
- Update data: `npm run update` (fetch RSS → cleanup old data → build indexes)
- Loop update (default 30 runs): `npm run loop:update` (tune via `LOOP_TIMES`, `LOOP_DELAY_MS`, `LOOP_CONTINUE_ON_FAIL`)
- Import sources from OPML: `npm run import:opml -- ./sources.opml --dry-run` (then remove `--dry-run`)
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

- Triggers on push to `main` and on a schedule (every 8 hours UTC)
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
- `ARCHIVE_LAYOUT` (optional: `monthly` to store archives under `archives/YYYY-MM/`)
- `FAILURE_BACKOFF_THRESHOLD` (default `3`)
- `FAILURE_BACKOFF_BASE_HOURS` (default `24`)
- `FAILURE_BACKOFF_MAX_HOURS` (default `168`)
- `RUN_HISTORY_DAYS` (default `30`, set `0` to disable)
- `RSS_CONTENT_MAX_CHARS` (default `8000`, max chars kept from RSS long content)
- `RSS_CONTENT_MIN_CHARS` (default `200`, minimum chars to store RSS long content)
- `RSS_CONTENT_STRIP_BOILERPLATE` (default `1`, remove common “read more / subscribe / cookie” boilerplate lines from RSS long content)
- `FETCH_CONCURRENCY` (default `4`, max concurrent RSS fetches)
- `FETCH_HOST_CONCURRENCY` (default `2`, per-host fetch concurrency)
- `FETCH_MIN_INTERVAL_MINUTES` (default `0`, skip refetching a source too soon)
- `FETCH_RETRIES` (default `2`, retry transient failures like 429/5xx)
- `FETCH_RETRY_DELAY_MS` (default `500`)
- `FETCH_RETRY_MAX_DELAY_MS` (default `8000`, also caps `Retry-After`)
- `INDEX_READ_CONCURRENCY` (default `32`, max concurrent article reads during indexing)
- `INDEX_DEDUPE_URL_ALIASES` (default `1`, dedupe articles by canonical URL variants such as `http/https`, `www`, and extra tracking params)
- `STORIES_WINDOW_HOURS` (default `48`, clustering window for `/trending/`)
- `STORIES_MAX_ARTICLES` (default `800`, max articles considered for clustering)
- `STORIES_MIN_SOURCES` (default `2`, minimum distinct sources per story)
- `STORIES_LIMIT` (default `200`, max story clusters)
- `TOP_WINDOW_HOURS` (default `48`, ranking window for `/trending/`)
- `TOP_LIMIT` (default `200`, max items)
- `SITE_URL` (site origin for canonical/feeds/sitemap, e.g. `https://shouyun.top`; do not include `/<repo>/`)
- `PATH_PREFIX` (for GitHub Pages project sites, e.g. `/<repo>/` or `/`)
- `GOOGLE_SITE_VERIFICATION` (optional: Google Search Console verification token)
- `ANALYTICS_PROVIDER` (optional: `cloudflare` or `ga4`)
- `CLOUDFLARE_WEB_ANALYTICS_TOKEN` (optional)
- `GA_MEASUREMENT_ID` (optional)
- `CONTACT_EMAIL` (optional: shown on `/contact/`)

## Amazon shop module (optional)

This repo can optionally render a small `/shop/` page (Amazon affiliate links), while keeping the existing RSS → `data/` → Eleventy build flow unchanged.

**Config**

- Edit `amazon.config.json`
  - Set `"enabled": true`
  - Add items via `"items": [{ "asin": "B0..." }]`
  - Optional: organize items with `"groups"` + `"group"` / `"tags"`, and mark `"featured": true` for homepage picks
  - Set `"associateTag"` (your Amazon Associates tracking ID), or use `AMAZON_ASSOCIATE_TAG`
  - For other locales/marketplaces: update `"marketplace"` (`domain`/`host`/`region`) or set `AMAZON_PAAPI_MARKETPLACE` / `AMAZON_PAAPI_HOST` / `AMAZON_PAAPI_REGION`

**Data modes**

- Link-only (no API): if PA-API creds are missing, `npm run update` will still generate `data/amazon/items.json` with affiliate links.
- PA-API (recommended): set GitHub Secrets `AMAZON_PAAPI_ACCESS_KEY` / `AMAZON_PAAPI_SECRET_KEY` and `AMAZON_PAAPI_PARTNER_TAG` (or reuse `AMAZON_ASSOCIATE_TAG`), then scheduled updates will enrich title/image/price.

**Link routing**

- Product links on `/shop/` use `/go/<asin>/` first, which adds your `tag` consistently and can be used for click analytics (pageviews on `/go/...` and optional GA4 event `affiliate_click`).

Notes:
- Amazon PA-API access requires an Amazon Associates account and may have eligibility requirements.
- Avoid scraping Amazon pages; it often violates Amazon ToS and is brittle.

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

## Config notes

- Categories can be configured via `data/categories.json` (falls back to `src/_data/categories.js` defaults).
- `data/sources.json` supports extra optional fields:
  - `tags`: array of strings used for filtering on `/sources/`
  - `minFetchIntervalMinutes`: per-source cooldown override
  - `weight`: source weight in ranking/quality score (range `0.5`–`2`)

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
