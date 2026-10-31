---
title: "v0 Portfolio 画廊模板改造为首页的方案分析"
slug: portfolio-landing-analysis
date: 2026-10-13
author: Innate Team
category: research
tags: [landing, portfolio, v0, gallery, homepage]
status: published
excerpt: 把 v0 的交互式画廊模板（网格 + 悬停动效 + 灯箱）改造为本站首页：每个内容目录就是一件「展品」，点击直达对应笔记列表。
---

## 一、模板解析：它提供了什么

v0 模板 `portfolio-YKgWkverPTw` 的核心是一个**交互式画廊首页**：

| 要素 | 模板做法 | 视觉目标 |
| ---- | -------- | -------- |
| 布局 | 响应式网格 / 轮播，展示多件作品 | 画廊感、陈列感 |
| 悬停 | 微妙放大 + 阴影渐显 + 标题 tooltip | 展品「活过来」 |
| 点击 | 打开灯箱/模态，大图 + 淡入淡出 | 聚焦单件作品 |
| 光标 | 自定义 SVG 光标 + 磁性吸附 | 高级感、把玩玩性 |
| 风格 | 平面极简、白底、轻阴影、圆角 | 与 base-vega 天然兼容 |
| 强调色 | `#44ffbb` 薄荷绿（高光/hover） | 单一品牌记忆点 |
| 动效 | CSS transition 或 Framer Motion | 物理感、克制 |

## 二、概念映射：目录 = 展品

这个模板与本站的结合点非常自然——**画廊里的「艺术品」就是内容目录**。当前内容树已有真实分组：

```
content/
├── demo/          → 「示例与演示」展区
└── research/
    └── ui/        → 「UI 研究」展区
docs/              → 「文档」展区（docs 构建模式）
use-cases/         → 「用例」展区（当前为空）
```

映射关系：

| 画廊概念 | 本站对应 | 数据来源（现成） |
| -------- | -------- | ---------------- |
| 一件展品卡片 | 一个目录（folder） | `buildFolderTree(posts)` 已有目录树 |
| 展品标题 | 目录名（可读化，如 `research/ui` →「Research · UI」） | folder id |
| 展品缩略图 | 由目录名 hash 生成的**生成式 SVG 封面**（延续 label-color 的思路，与模板的 SVG 艺术品定位完全契合） | `label-color.ts` 的 hash 机制可复用 |
| 展品副信息 | 文章数、最近更新日期、最新 3 篇标题 | posts 元数据已具备 |
| 点击灯箱 | **两种路线**（见下） | — |
| 分类筛选栏 | category chips（复用彩色 badge） | `countByCategory` |

### 点击交互的两种路线

- **路线 A（推荐，简单）**：点击目录卡片 → 直接跳转 `/writing` 并带上该目录的筛选状态。不做灯箱。
- **路线 B（还原模板）**：点击 → 灯箱展示该目录的「精选文章摘要」（标题 + excerpt），灯箱内再放「进入列表」按钮。展示效果更接近模板，但多一层交互。

建议第一版走 A，把灯箱留给后续「文章速览」功能（那样灯箱里放的是单篇文章预览，比目录摘要更有用）。

## 三、需要改动的代码

### 3.1 路由与页面（`src/router.tsx`）

现状 `/` 和 `/landing` 都指向 `WritingPage`——**首页其实不存在**。改造：

- 新建 `src/pages/landing/page.tsx`：`/` 与 `/landing` 指向它
- 页面结构：Hero（站名 + 一句话简介 + 文章总数）→ 目录画廊网格 → 分类 chips → 「进入全部笔记」按钮

### 3.2 筛选状态 URL 化（关键前置改造）

现状 `blog-page-client.tsx` 的 `filterFolder / filterCategory / filterTag` 都是本地 `useState`，从首页点击目录卡片**无法**把筛选状态带过去。需要：

- 用 TanStack Router 的 `validateSearch` 给 `/writing` 加 search params（`?folder=research/ui&category=research`）
- `BlogPageClient` 的初始 filter 状态从 search params 读取，变化时同步回 URL
- 附带收益：筛选结果可分享、可收藏（这正是之前优化清单里的 P2 项）

### 3.3 画廊卡片组件（`src/components/landing/gallery-card.tsx`）

- 卡片 = 生成式 SVG 封面 + 目录名 + 文章数 + 最新文章标题
- 悬停：`scale(1.02)` + 阴影渐显 + 标题 tooltip（复用 `@innate/ui` 的 `Tooltip`/`HoverCard`）
- 动效只用 CSS transition（150–250ms，尊重 `prefers-reduced-motion`）；暂不上 Framer Motion，避免为首页一个页面引入 ~40KB

### 3.4 生成式 SVG 封面（最有模板灵魂的部分）

模板展示的是「SVG 艺术品」，本站没有封面图——正好用**算法生成**：

- 输入：目录名 hash（复用 label-color 的 hash → hue）
- 输出：参数化 SVG（波浪 / 网格点阵 / 同心弧，2–3 套生成器按 hash 选择）
- 好处：零图片资源、构建期内联、暗色模式自动适配（用 token 色）；每个目录视觉唯一且稳定
- 实现位置：`src/lib/landing/cover-art.ts`（纯函数，可单测）

### 3.5 强调色 `#44ffbb` 的接入

不直接写 raw hex（违反仓库纪律），两个合规做法：

1. 换算为 oklch 后覆盖 `--primary` / `--accent`（仅 landing 页作用域，或全站）：`#44ffbb` ≈ `oklch(0.87 0.19 165)`
2. 或沉淀为 `@innate/ui` 的新主题变体（改动父仓，成本高）

建议做法 1，且**只用于 hover/高光**：薄荷绿大面积使用会与笔记站的克制气质冲突。若最终全站主题定了 notion 暖纸风，薄荷绿与暖纸色不协调——届时可换成同明度的暖色强调（如 `oklch(0.78 0.16 80)`），保留「单一强调色」的设计手法而非颜色本身。

### 3.6 不建议照搬的部分

| 模板特性 | 决策 | 理由 |
| -------- | ---- | ---- |
| 自定义 SVG 光标 / 磁性吸附 | ❌ 不做 | 工具型站点的光标应可预期；磁性效果干扰点击精度 |
| 鼠标跟随发光 / 背景视差 | ❌ 不做 | 性能开销与「克制」定位冲突 |
| 灯箱展示目录 | ⏸️ 暂缓 | 路线 A 先直达列表；灯箱留给文章速览 |
| 轮播 | ❌ 不做 | 目录数量少（<10），网格一目了然，轮播徒增交互成本 |

## 四、实施步骤（约 1–1.5 天）

> ✅ 2026-10-13 已全部落地（步骤 1–5），实测：30/30 测试通过、构建通过、`#/writing?folder=content` 点击穿透正常。

1. `/writing` 路由 search params 化（folder / category / tag）——前置改造，独立可测 ✅
2. 生成式 SVG 封面 `cover-art.ts` + 单测 ✅（waves / arcs / grid 三种生成器，5 个单测）
3. `GalleryCard` + 画廊网格 + Hero，组装 `src/pages/landing/page.tsx` ✅
4. 路由切换：`/` → LandingPage，原列表保留在 `/writing` ✅
5. 全站过一遍暗色模式 + 移动端（网格 1→2→3 列响应式） ✅（暗色 token 化自动适配）
6. 更新 `docs/` 与 README 中的路由说明 —— 待做

落地偏差记录：

- 强调色未引入 `#44ffbb`：当前默认主题为 notion 暖纸风，按 3.5 的预案保留了「单一强调色」手法但沿用主题 `primary` token，未写死薄荷绿。
- 内容源已切换为 `all` 模式（content + docs + use-cases 三个 vault），因此首页展区为三个 vault 顶层目录，点击后可在侧栏继续下钻子目录。

## 五、风险与注意点

- **bundle**：landing 页不引入新依赖（不装 framer-motion），SVG 生成是纯字符串拼接，增量 < 5KB
- **空目录**：`use-cases/` 为空——画廊卡片应只在目录有文章时渲染，或显示「即将推出」占位
- **docs 构建模式**：`VITE_WRITING_SOURCE=docs` 时目录树完全不同（cli/modules/specs/…），画廊照常工作，验证了「目录即展区」抽象的通用性
- **主题联动**：画廊卡片底色、阴影必须全部走 token，保证 11 个主题变体下都成立（这是本站的架构红利，也是约束）
