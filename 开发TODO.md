# 开发TODO（30轮迭代循环）

> 使用方式：每一轮都按「计划 → 实现 → 验收 → 更新文档」走一遍；完成一轮后立刻开始下一轮。  
> 说明：本文档先规划 **30 轮**；第 30 轮完成后继续按同样节奏做第 31 轮、第 32 轮……（不要因为“30 轮”而停止迭代）。

## 已确认范围/约束（来自 `方案.md`）

- 内容范围：仅做「聚合 + 摘要 + 外链」，不抓取与发布全文
- 语言：首期只做英文源（后续可扩展多语言）
- 更新频率：每 8 小时
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
- [x] GitHub Actions：每 8 小时采集→构建→部署 Pages（`.github/workflows/update-and-deploy.yml`）
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
- [ ] Loop 14：URL 规范化增强（统一 `http/https`、`www`、移除更多跟踪参数/重定向规范）
- [ ] Loop 15：故事聚类（同主题多源合并展示：标题相似度/指纹哈希）
- [x] Loop 16：更强去重策略（索引阶段按 canonical URL 变体去重 + 生成旧 ID 跳转页：`INDEX_DEDUPE_URL_ALIASES=0` 可关闭）
- [x] Loop 17：采集并发与限流（`FETCH_CONCURRENCY/FETCH_HOST_CONCURRENCY` + `FETCH_MIN_INTERVAL_MINUTES`，并支持源级 `minFetchIntervalMinutes`）
- [ ] Loop 18：Sources 配置分组与标签（运营视角管理来源：主题/地区/语言）
- [x] Loop 19：搜索体验增强（Pagefind 过滤：分类/语言/来源；Search 页默认展开过滤器）
- [ ] Loop 20：可视化运行看板（趋势：新增/重复/失败、各分类/语言占比）
- [ ] Loop 21：站点性能优化（首屏 CSS/JS 精简、图片占位减少 CLS、字体策略）
- [ ] Loop 22：内容质量评分（摘要长度、来源权重、重复率、失败率），用于排序/推荐
- [ ] Loop 23：Sitemap/Feeds 分页与限制策略（防止索引膨胀，确保抓取稳定）
- [ ] Loop 24：数据归档策略增强（按月归档、可选仅保留索引 + 冷存储）
- [ ] Loop 25：新增 “Trending/Top” 聚合页（按时间窗口与多源覆盖度排序）
- [ ] Loop 26：增加 OPML 导出与导入（已提供导出 `/sources.opml`；导入待做）
- [ ] Loop 27：可配置的分类列表（从 `site.config.json`/`data/categories.json` 驱动）
- [ ] Loop 28：可访问性完善（键盘导航、对比度、aria 标签与焦点样式）
- [ ] Loop 29：隐私与安全加固（referrer 策略、CSP meta、外链安全策略统一）
- [ ] Loop 30：构建与部署优化（Actions cache、失败重试、分步产物与排障信息）
