# 开发TODO（30轮迭代循环）

> 使用方式：每一轮都按「计划 → 实现 → 验收 → 更新文档」走一遍；完成一轮后立刻开始下一轮。  
> 说明：本文档先规划 **30 轮**；第 30 轮完成后继续按同样节奏做第 31 轮、第 32 轮……（不要因为“30 轮”而停止迭代）。

## 已确认范围/约束（来自 `方案.md`）

- 内容范围：仅做「聚合 + 摘要 + 外链」，不抓取与发布全文
- 语言：首期只做英文源（后续可扩展多语言）
- 更新频率：每 2 小时（UTC）
- 历史保留：90 天
- 成本：零成本（不使用付费 API / AI 摘要翻译）

## 迭代 1（Loop 1）：站点骨架 + 本地可预览

**目标**
- 先跑通“从数据到页面”的静态生成流程（用模拟数据也行），让后续采集接入变成替换数据源即可。

**TODO**
- [x] 确定 SSG 技术栈：Eleventy/11ty
- [x] 规划目录结构（源码、数据、构建输出、脚本）
- [x] 站点页面骨架：`/`、`/category/<name>/`、`/p/<id>/`、`/about/`
- [x] 统一 UI 基础（英文 UI、移动端适配）
- [x] 跑通构建与本地预览（无数据时也可构建）
- [x] 在 `方案.md` 增补“本地运行方式/脚本命令/目录结构说明”

**验收标准**
- 本地一条命令可生成静态站点，并能看到首页/分类页/条目页
- 页面包含：标题、来源、发布时间、摘要、外链按钮、分类标签

## 迭代 2（Loop 2）：RSS 采集 + JSON 入库 + 索引

**目标**
- 用 RSS/Atom 作为首期主数据源，实现“增量采集→规范化→落盘→索引”，并能驱动站点生成真实内容。

**TODO**
- [x] 定义 `data/sources.json`（源清单：名称、feedUrl、默认分类、语言、站点链接等）
- [x] 实现 RSS 拉取与解析（含超时/失败隔离，不因单个源失败而全失败）
- [x] 规范化数据模型（Article JSON）
- [x] 图片字段：采集时提取 `image` URL（enclosure/media/HTML img），仅存 URL；列表/详情有则展示
- [x] 写入 `data/articles/<category>/<yyyy>/<mm>/<dd>/<id>.json`
- [x] 生成索引：`data/indexes/latest.json`、`data/indexes/by-category/<category>.json`、`data/indexes/articles.json`
- [x] 去重：按 `id=sha1(canonicalUrl)` 全局去重（避免静态页 permalink 冲突；构建索引时会清理历史重复文件）
- [x] 在 `方案.md` 增补“sources/state/indexes 说明”

**验收标准**
- 配置 10 个 RSS 源后，可成功产出文章 JSON 与索引 JSON
- 静态站点首页展示最新新闻，分类页能按分类聚合

## 迭代 3（Loop 3）：增量抓取 + 保留策略 + 自动化发布（GitHub Pages）

**目标**
- 把“定时运行、增量更新、自动部署”打通，并控制仓库体积与失败恢复。

**TODO**
- [x] 增量抓取：保存 `etag/lastModified/lastFetchAt`（`data/state.json`）
- [x] URL 规范化（去 `utm_*` 等参数）提高去重效果
- [x] 保留策略：自动清理 90 天之前数据（`RETENTION_DAYS=90`）
- [x] GitHub Actions：每 2 小时采集→构建→部署 Pages（`.github/workflows/update-and-deploy.yml`）
- [x] 部署策略：数据提交回仓库（只提交 `data/`，不提交 `dist/`）

**验收标准**
- GitHub Pages 可访问最新构建页面
- Actions 定时跑通；单个源失败不会影响整体更新
- 仓库体积可控（清理策略生效）

## 迭代 4（Loop 4）：SEO + 站内搜索 + 体验优化

**目标**
- 让站点“更像一个可用的新闻聚合站”：可被搜索引擎收录、可快速检索、页面体验更好。

**TODO**
- [x] 生成 `sitemap.xml`、`robots.txt`、基础 meta/OG
- [x] GitHub Pages Project Pages：`PATH_PREFIX` 下的 sitemap/canonical/robots 仍正确
- [x] 站内搜索（零成本）：Pagefind（`npm run pagefind`）
- [x] 列表分页：首页与分类页分页

**验收标准**
- sitemap/robots 正常生成且链接有效
- 搜索可按标题/来源检索到条目

## 迭代 5（Loop 5）：扩展覆盖 + 质量控制 + 运营工具

**目标**
- 扩展来源覆盖面与内容质量，让系统长期可维护、可运营。

**TODO**
- [x] 扩展数据源：已配置 20+ RSS 源（`data/sources.json`）
- [x] 黑名单：`data/blocklist.json`（域名/标题关键字）
- [x] 质量指标：`data/indexes/fetch-stats.json` + `data/indexes/stats.json`
- [x] `About` 页面显示最近一次运行状态与文章总量

## 迭代 6+（Loop 6+）：持续迭代（不会在 5 轮后停止）

- [x] 源健康看板页面：`/sources/`（按源展示状态码/失败原因/最后成功时间/新增/重复/失败次数）
- [x] 更细分类映射：`data/category-rules.json`（构建索引时按标题/摘要/标签关键词自动归类）
- [x] 增加更多“World/Business”来源的冗余（新增 France24/UN/ProPublica/PolitiFact/Fed/CBS feeds；默认禁用持续 403 的源）
- [x] 归档策略：把 90 天之外的数据打包归档（`ARCHIVE_OLD=1` 时输出到 `archives/`，workflow 会上传 artifact）
- [x] 多语言扩展：按语言生成索引与页面（保持英文 UI；新增 `/languages/` 与 `/lang/<code>/`）

**验收标准**
- 源规模扩大后仍稳定构建；失败源可定位
- 分类更稳定，重复率明显下降

## 迭代 7（Loop 7）：订阅输出 + 分享入口（持续运营）

**目标**
- 让聚合站内容可被“外部订阅/二次分发”：提供站点级与分类/语言级 RSS 输出，方便读者与搜索引擎发现。

**TODO**
- [x] 生成站点 RSS：`/feed.xml`（最新 50 条）
- [x] 生成分类 RSS：`/category/<name>/feed.xml`
- [x] 生成语言 RSS：`/lang/<code>/feed.xml`
- [x] 在页头或 About 增加 RSS 入口（英文 UI 文案）

**验收标准**
- `feed.xml` 可被常见 RSS 阅读器订阅，条目链接与时间正确
- 分类/语言 feed 的条目与对应页面一致

## 迭代 8（Loop 8）：自愈能力 + 可观测性增强

**目标**
- 让系统在“源波动/偶发失败”时更稳：自动退避、给出更清晰的运行摘要，减少人工介入。

**TODO**
- [x] 失败退避：单源连续失败达到阈值后自动暂停一段时间（仅暂停采集，不影响全局）
- [x] GitHub Actions Summary：输出本次新增/重复/失败源列表到 `GITHUB_STEP_SUMMARY`
- [x] 保留最近 N 次运行的汇总统计（默认保留 30 天，避免仓库膨胀）

**验收标准**
- 连续失败的源会被自动退避，健康恢复后自动恢复采集
- Actions 详情页能一眼看到本次运行关键信息与失败源

## 迭代 9（Loop 9）：多语言内容接入（保持英文 UI）

**目标**
- 在 UI 文案保持英文前提下，引入非英文内容源，并按语言维度聚合展示。

**TODO**
- [ ] 扩展非英文 RSS 源（例如 `fr/es/de/ja`），并在 `data/sources.json` 标注 `language`
- [ ] 分类规则增强：对非英文内容做“最小可用”的分类映射（避免全落到 `world`）
- [ ] 质量控制：为非英文源增加黑名单/去重优化（避免标题模板化带来的重复）

**验收标准**
- `/languages/` 至少出现 2 种语言
- `/lang/<code>/` 可分页且能稳定构建（英文 UI 文案不变）

## 迭代 10（Loop 10）：采集/索引性能与多语言分类优化

**目标**
- 在不改变现有数据结构前提下，降低单次 update 的耗时与 I/O；同时让分类规则对非英文内容更友好。

**TODO**
- [x] 构建索引时并发读取文章 JSON（`INDEX_READ_CONCURRENCY` 可调）
- [x] 写入 article JSON 使用原子写入（`wx`），避免多余 `stat` 并降低并发冲突风险
- [x] HTTP 304 或非 2xx 时不读取响应 body，减少无效网络 I/O
- [x] 分类规则支持 Unicode（非 ASCII 关键词用子串匹配，适配多语言内容）
- [x] 提供 30 次循环运行脚本：`npm run loop:update`（可用 `LOOP_TIMES/LOOP_DELAY_MS` 调参）

**验收标准**
- `npm run indexes` 可稳定运行，索引输出与站点构建正常
- 多语言内容接入后（语言字段非 `en`），分类不会因分词规则过窄而失效

## 迭代 11-30（Loop 11-30）：可继续优化的方向（Backlog）

- [x] Loop 11：接入 2+ 种非英文 RSS 源（已加入 `fr/es/ja/zh`），验证 `/languages/` 与 `/lang/<code>/`
- [x] Loop 12：分类规则分语言（`data/category-rules.json` 支持 `languages.<code>`），并允许对特定语言禁用重分类
- [x] Loop 13：增强长内容抽取（清洗“read more/subscribe/cookie”等样板行；`RSS_CONTENT_STRIP_BOILERPLATE=0` 可关闭）
- [x] Loop 14：URL 规范化增强（统一 `http/https`、`www`、移除更多跟踪参数；提升去重与 ID 稳定性）
- [x] Loop 15：故事聚类（生成 `data/indexes/stories.json`，并提供 `/trending/` 聚合展示）
- [x] Loop 16：更强去重策略（索引阶段按 canonical URL 变体去重 + 生成旧 ID 跳转页：`INDEX_DEDUPE_URL_ALIASES=0` 可关闭）
- [x] Loop 17：采集并发与限流（`FETCH_CONCURRENCY/FETCH_HOST_CONCURRENCY` + `FETCH_MIN_INTERVAL_MINUTES`，并支持源级 `minFetchIntervalMinutes`）
- [x] Loop 18：Sources 配置分组与标签（支持 `sources.json` 的 `tags`，并在 `/sources/` 提供按 tag 与关键字筛选）
- [x] Loop 19：搜索体验增强（Pagefind 过滤：分类/语言/来源；Search 页默认展开过滤器）
- [x] Loop 20：可视化运行看板（新增 `/runs/`：最近运行列表 + 简单趋势条）
- [x] Loop 23：Sitemap/Feeds 分页与限制策略（防止索引膨胀，确保抓取稳定）
- [x] Loop 24：数据归档策略增强（按月归档、可选仅保留索引 + 冷存储）
- [x] Loop 25：新增 “Trending/Top” 聚合页（`/trending/` + `data/indexes/top.json`，按时间窗口与评分排序）
- [x] Loop 26：增加 OPML 导出与导入（导出 `/sources.opml`；导入 `npm run import:opml <file.opml>`）
- [x] Loop 27：可配置的分类列表（新增 `data/categories.json` 驱动分类导航与分页）
- [ ] Loop 28：可访问性完善（键盘导航、对比度、aria 标签与焦点样式）
- [x] Loop 30：构建与部署优化（Actions cache、失败重试、分步产物与排障信息）

## 迭代 31-60（Loop 31-60）：继续优化方向（Backlog）

- [x] Loop 31：首页信息架构再增强（Trending 预览、模块层级/留白与 CTA）
- [x] Loop 32：首页结构化数据完善（ItemList/链接预览与一致性校验）
- [x] Loop 33：列表页 SEO 优化（空页面 noindex、标题/描述更贴合内容）
- [x] Loop 34：站点级 OpenSearch（浏览器地址栏/站内搜索集成）
- [x] Loop 35：Search 页多语言（Pagefind UI 文案/提示语本地化）
- [ ] Loop 38：对比度与可读性（暗色主题、徽章/按钮 hover、长文本排版）
- [ ] Loop 42：站点性能度量（简单 RUM 指标、构建期统计、在 Runs 页展示）
- [ ] Loop 43：内容质量评分 v1（摘要长度/来源权重/重复率/失败率综合）
- [ ] Loop 46：语言体验（语言页描述/排序、语言徽章展示策略优化）
- [ ] Loop 47：来源页体验（站点/Feed 链接 i18n、空状态更友好）
- [ ] Loop 50：收藏/本地库体验（导入导出提示更清晰、冲突合并策略）
- [x] Loop 51：Shop 页 SEO/合规（noindex 策略评估、sponsored/nofollow 统一）
- [x] Loop 55：Sitemap lastmod 更准确（列表页按最新文章时间、减少无意义刷新）
- [x] Loop 57：数据归档增强（按月打包、冷存储可选、恢复脚本）
- [ ] Loop 58：Actions 稳定性（分步重试、失败告警、资源使用/耗时趋势 + Summary 告警阈值）

## 迭代 61-90（Loop 61-90）：继续优化方向（Backlog）

- [x] Loop 61：UI 语言默认策略优化（无设置时尝试跟随浏览器语言）
- [x] Loop 62：语言切换无闪烁（head 预置 UI lang，避免首屏文案跳变）
- [x] Loop 63：Search 过滤器标题本地化（Category/Language/Source 显示名）
- [ ] Loop 64：Search 结果摘要一致性（excerptLength、命中片段与高亮策略）
- [x] Loop 65：Legal/说明页正文 i18n（最少中英双语：About/Contact/Privacy/Terms/Takedown/Disclosure，避免夹杂开发用语）
- [ ] Loop 68：Runs 页体验增强（趋势图图例、失败源聚合、耗时分布）
- [x] Loop 74：Trending 预览增强（合并至 Loop 125）
- [x] Loop 75：Top 质量与多样性（合并至 Loop 126）
- [x] Loop 76：列表页分页 SEO（合并至 Loop 106）
- [x] Loop 77：Sitemap lastmod 精确化（列表页用最新条目时间、避免每天全刷新）
- [ ] Loop 79：图片策略优化（lazy/decoding、占位比例、失败兜底减少 CLS）
- [ ] Loop 81：工具页性能优化（工具脚本懒加载、只在工具页挂载）
- [x] Loop 84：Actions 资源告警（合并至 Loop 58）
- [ ] Loop 87：站点 UI 细节一致性（按钮/徽章/空状态统一，避免“开发者语气”）

## 迭代 91-120（Loop 91-120）：继续优化方向（Backlog）

- [x] Loop 91：构建后输出审计（禁止 dist 出现 `npm run` 等命令提示文案）
- [x] Loop 92：Core sitemap 清理（去重 /page/1/、空列表页不入 sitemap、lastmod 基于最新条目）
- [x] Loop 93：Trending 空状态策略（可选 noindex 或内容兜底，避免薄页被收录）
- [x] Loop 95：导航可访问性增强（dropdown 键盘支持、Esc 关闭、焦点管理、focus trap）
- [x] Loop 96：外链策略统一（external link 自动补齐 rel/noopener/noreferrer/nofollow，统一 referrerpolicy）
- [x] Loop 101：/languages/ 页面增强（按数量排序 + 提供各语言订阅入口）
- [x] Loop 102：/sources/ 页面增强（按 tag 聚合、失败原因/暂停原因更直观）
- [ ] Loop 103：来源 Tag 聚合页（/sources/tags/<tag>/：来源列表 + 订阅入口）
- [x] Loop 105：列表页 UI 增强（合并至 Loop 124）
- [ ] Loop 106：分页 SEO 细化（首页/分类/语言/来源的 canonical+prev/next 规则一致；/page/1/ 与首页 canonical 一致；参数页 canonical；避免重复收录）
- [x] Loop 107：图片兜底策略（合并至 Loop 129）
- [ ] Loop 110：CSS 体积与维护性（基础/页面/工具样式分层拆分 + 未用样式清理 + 关键样式内联评估）
- [ ] Loop 112：PWA/离线能力评估（manifest + service worker 可选，避免影响 SEO）
- [ ] Loop 116：数据一致性校验增强（索引与文章文件一致、死链/缺字段检测）
- [x] Loop 120：站点一致性审计升级（合并至 Loop 180）

## 迭代 121-150（Loop 121-150）：继续优化方向（Backlog）

- [x] Loop 121：Header 搜索体验（键盘快捷键 / 自动聚焦 / 清空按钮）
- [x] Loop 122：导航高亮（当前页 aria-current + 语义一致）
- [x] Loop 123：分页组件优化（首尾页/上一页/下一页按钮文案与 a11y）
- [ ] Loop 124：列表页信息密度优化（来源/语言徽章展示策略、时间/摘要可配，移动端更易读）
- [ ] Loop 125：Trending 质量优化（标题去噪、相似度阈值可配置、同源去重、coverage 展示与展开交互）
- [ ] Loop 126：Top 算法优化（时间衰减、来源多样性/同源限制、多分类覆盖、同标题去重）
- [ ] Loop 127：文章页结构化数据增强（可选 NewsArticle/BlogPosting、publisher/logo）
- [ ] Loop 129：OG 分享图生成（构建期生成默认 OG 图与文章标题图；无图兜底；列表缩略图占位）
- [ ] Loop 130：站点图标完善（apple-touch-icon、favicon 多尺寸、mask-icon）
- [ ] Loop 131：RSS/Feed 增强（摘要长度可配且截断策略统一、清洗规则一致；补齐 category/source/language）
- [x] Loop 132：新增 JSON Feed（/feed.json）与文档说明
- [x] Loop 133：Sources 页 i18n（Site/RSS/Feed/状态提示本地化）
- [x] Loop 134：Runs 页 SEO 策略评估（是否 noindex、是否入 sitemap）
- [x] Loop 135：Search 页 UX（无结果提示更友好、过滤器默认收起/展开策略）
- [ ] Loop 139：站内推荐优化（相关内容更准：同源/同类/相似标题权重调参）
- [ ] Loop 140：404 推荐优化（路径关键词/分类/语言/来源/历史热门，给出更相关入口）
- [ ] Loop 141：站点内链优化（文章页加入分类/语言/来源入口，提高抓取深度）
- [ ] Loop 142：Sitemap 分片策略评估（core/articles 之外按 source/lang/category 分片可选）
- [ ] Loop 143：Canonical/重定向审计（/p/redirect、外链 canonical、重复路径检查）
- [ ] Loop 144：安全头与隐私评估（CSP/Permissions-Policy/Referrer-Policy/COOP/COEP 最小可行集）
- [ ] Loop 146：性能优化（首屏关键 CSS、按页加载 JS/减少全站监听、工具页脚本懒加载）
- [ ] Loop 147：CLS 优化（图片占位、字体策略、卡片骨架）
- [ ] Loop 148：构建期报告（页面数、dist 大小、pagefind 索引大小、变化趋势）
- [ ] Loop 150：数据健康面板（Sources 失败率/退避/耗时趋势在 Runs 或 Sources 展示）

## 迭代 151-180（Loop 151-180）：继续优化方向（Backlog）

- [x] Loop 151：robots.txt 降噪（禁止爬虫抓取 `/pagefind/`）
- [x] Loop 152：RSS 增强 v1（Feed item 增加 category + media thumbnail）
- [x] Loop 153：构建后审计规则更精准（避免误伤正常新闻内容）
- [x] Loop 154：新增 JSON Feed（/feed.json）+ 文档说明
- [x] Loop 155：RSS channel 元信息完善（image/icon、generator、ttl 等可选）
- [x] Loop 156：Source 页链接 i18n（Site/RSS/Feed 文案本地化）
- [x] Loop 157：Runs 页 i18n 与空状态一致性（避免“开发者语气”）
- [x] Loop 159：Sitemap core 进一步去噪（可选移除低价值页，如 runs）
- [x] Loop 160：Pagefind 索引白名单策略（只索引文章页/核心页；排除工具页/空页/法律页，减少体积）
- [x] Loop 161：OG 默认图（合并至 Loop 129）
- [ ] Loop 163：文章页 meta 完善（keywords 策略、image fallback、publisher/logo）
- [x] Loop 164：Search 过滤器 label 显示名（slug→label、code→label、source id→name）
- [x] Loop 165：Search 过滤器状态持久化（记住筛选，提供一键清空）
- [x] Loop 168：导航当前页高亮（aria-current + 样式一致）
- [ ] Loop 180：CI/Actions 健康检查（sitemap/robots/敏感文案/SEO 标签缺失/空状态文案 扫描 + Summary 输出）

## 迭代 181-210（Loop 181-210）：继续优化方向（Backlog）

- [x] Loop 181：RSS item 元信息增强（dc:creator/dc:language，便于订阅器识别）
- [x] Loop 182：新增 JSON Feed（/feed.json）+ autodiscovery link
- [ ] Loop 186：列表页结构化数据（CollectionPage/ItemList 的一致性策略）
- [x] Loop 188：分类/语言/来源页 canonical/prev/next 审计（合并至 Loop 106）
- [x] Loop 192：Trending lastmod 更精确（用最新 story/top 时间而非 buildTime）

## 迭代 211-240（Loop 211-240）：继续优化方向（Backlog）

- [x] Loop 212：分类 JSON Feed（/category/<slug>/feed.json）
- [x] Loop 213：语言 JSON Feed（/lang/<code>/feed.json）
- [x] Loop 214：来源 JSON Feed（/source/<id>/feed.json）
- [x] Loop 215：Feed autodiscovery 按页指向（分类/语言/来源页自动指向对应 feed）
- [x] Loop 217：JSON Feed 元信息完善（authors、favicon、expired、hubs 可选）
- [x] Loop 220：站点入口页 /categories/（分类总览 + 最新/热度入口 + 订阅入口）
- [ ] Loop 225：列表页排序选项（最新/质量/覆盖度，URL 参数可分享）

## 迭代 241-270（Loop 241-270）：继续优化方向（Backlog）

- [x] Loop 247：Sitemap index lastmod 优化（仅在 sitemap 变更时更新）
- [x] Loop 248：Trending lastmod 精确化（基于最新 story/top 时间）
- [x] Loop 249：Core 页 lastmod 优化（静态页使用固定或文件更新时间，减少噪音）

## 迭代 271-300（Loop 271-300）：继续优化方向（Backlog）

- [x] Loop 271：Sitemap core 静态页 lastmod 降噪（静态页可省略 lastmod 或用文件更新时间）
- [x] Loop 272：Trending 页 lastmod 精确化（基于最新 story/top 时间）
- [x] Loop 273：Feeds 统一截断策略（合并至 Loop 131）

## 迭代 301-330（Loop 301-330）：继续优化方向（Backlog）

- [ ] Loop 303：Feeds 输出去重（同 canonical URL 在 feed 内只保留一条）
- [ ] Loop 304：Feeds 输出过滤（可选只输出高质量/Top，降低订阅噪音）
- [x] Loop 305：JSON Feed 元信息增强（favicon/authors/hubs/expired 可选）
- [ ] Loop 306：JSON Feed 分页/分片（避免单文件过大，支持 page 参数）
- [ ] Loop 307：分类/语言/来源 JSON Feed 更丰富（tags/authors/url 策略统一）
- [ ] Loop 308：Feed autodiscovery 精细化（分页页也指向同一个 feed）
- [x] Loop 309：RSS channel 元信息增强（image/icon/generator/ttl/copyright）
- [x] Loop 322：列表页结构化数据一致性（合并至 Loop 186）
