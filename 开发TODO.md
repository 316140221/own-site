# 开发TODO（5轮迭代循环）

> 使用方式：每一轮都按「计划 → 实现 → 验收 → 更新文档」走一遍；完成一轮后立刻开始下一轮。  
> 说明：本文档先规划 **5 轮**；第 5 轮完成后继续按同样节奏做第 6 轮、第 7 轮……（不要因为“5 轮”而停止迭代）。

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
