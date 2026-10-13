---
title: "站点优化分析：UI/UX、组件策略与 Tauri 桌面编辑器方案"
slug: site-optimization-analysis
date: 2026-10-13
author: Innate Team
category: research
tags: [ui-ux, design-system, tauri, markdown-editor, optimization]
status: published
excerpt: 对 daily-work 写作站的 UI/UX、组件使用与设计系统做全面体检，给出 Top 10 Skill 与 Top 10 UI 方案的利弊对比，并规划一个基于 Tauri 的本地 Markdown 编辑器桌面版。
---

## 一、现状盘点

### 1.1 技术架构现状

本站（`apps/daily-work`）是一个 **Vite + React 19 + TanStack Router（hash 路由）** 的纯静态 SPA，定位为个人笔记 / blog 的写作工作台：

- **内容管线**：构建期通过 `import.meta.glob(?raw)` 把 `content/` 与 `use-cases/` 的 md/mdx 内联进 bundle，运行时零 fs、零网络请求。
- **渲染栈**：react-markdown + remark-gfm + rehype-highlight + rehype-slug + mermaid（ESM min 别名接入，主题跟随站点）。
- **UI 体系**：唯一来源是父仓 `@innate/ui`（shadcn/ui + Base UI 包装，Tailwind v4，`base-vega` 风格，lucide 图标），本站不持有 `components/ui/` 拷贝。
- **部署**：GitHub Pages 双流水线（本仓默认模式 / fe-base docs 模式），`PUBLIC_PATH=./` + hash 路由 + 404 兜底。
- **写作工作台 UI**：可折叠宽侧栏（folder-nav 目录树）、resizable 双栏、文章 TOC、分类/标签彩色 badge（hue 由名称 hash 生成）、正文派生摘要、阅读宽度控制、writing 状态标记、`Ctrl/⌘+K` 聚焦搜索。

### 1.2 设计系统现状（D0）

- 语义 token 全部来自 `@innate/ui/globals.css`，本站只做**浅色面提亮一档**的覆盖（oklch），不改上游主题。
- 标签配色走「hash 生 hue + 统一明度/彩度」策略，任意生成色都和谐可读——这是一个很聪明的做法。
- Mermaid 配色单独用 hex token（mermaid 内部不支持 oklch），暗色变体用 `.dark[data-theme]` 同级选择器胜出，处理得当。
- Markdown 排版样式是手写的 `.markdown-content` 系列（约 180 行），补回了 Tailwind preflight 清掉的标题、列表、引用、表格、代码高亮样式。

## 二、UI/UX Design 分析

### 2.1 做得好的地方

1. **信息架构清晰**：`/`、`/writing`、`/writing/$slug`、`/landing` 四条路由，侧栏目录树 + 列表 + 详情三栏心智模型接近 Obsidian / Notion，符合笔记工具的直觉。
2. **响应式策略完整**：`useIsMobile` + `useMediaQuery(1280px)` 双断点，移动端用 Sheet 抽屉承载导航与详情，桌面端用 Resizable 双栏。
3. **键盘友好**：`Ctrl/⌘+K` 聚焦搜索已落地，符合工具型产品习惯。
4. **空状态与加载反馈**：使用了 `Empty` 系列组件与 `writing-status`，不是裸文本。

### 2.2 可优化点（按优先级）

| 优先级 | 问题                                                 | 建议                                                                         |
| ------ | ---------------------------------------------------- | ---------------------------------------------------------------------------- |
| P0     | 内容是构建期内联的，文章一多 bundle 会膨胀，首屏变慢 | 引入按 slug 的代码分割或内容索引懒加载（`site/content/index.json` 已有雏形） |
| P0     | 搜索只是客户端字符串过滤                             | 升级为 FlexSearch / Pagefind 全文索引，支持高亮摘要                          |
| P1     | 无深色模式切换入口暴露在写作页（token 已就绪）       | 在侧栏底部放 `ThemeSelector`，复用 `@innate/ui` 现成实现                     |
| P1     | TOC 无滚动监听高亮（scroll-spy）                     | IntersectionObserver 实现当前章节高亮                                        |
| P1     | 移动端详情页缺少「返回列表」的明显手势/按钮          | 顶栏加返回键 + 边缘滑动手势                                                  |
| P2     | 无阅读进度条、无字数/时长提示（摘要已有派生逻辑）    | 详情页顶部细进度条，frontmatter 区加 reading time                            |
| P2     | 标签/分类筛选后 URL 不变化，无法分享筛选状态         | 筛选状态同步到 hash query                                                    |
| P2     | 无 RSS / sitemap                                     | 构建脚本顺带生成 `rss.xml` 与 `sitemap.xml`                                  |
| P3     | 代码块无复制按钮、无行号                             | 在 `markdown-renderer` 包一层 CodeBlock 组件                                 |
| P3     | 缺少「最近更新 / 相关文章」闭环                      | 列表页底部加相关文章（按共享标签打分）                                       |

### 2.3 UX 原则建议

- **写作站的核心体验是「读」**：正文字号 0.9375rem / 行高 1.75 已不错，建议阅读宽度锁定在 65–72 字符，西文 Inter + 中文 PingFang/Noto 的字体栈已合理，可再为代码块引入等宽可变字体。
- **减少装饰**：个人笔记站应克制动效，只在视图切换（列表↔详情）加 150ms 的 fade/slide，遵循 `prefers-reduced-motion`。
- **可访问性**：补齐 focus-visible 环、aria-label（侧栏折叠按钮）、对比度审计（label-chip 的 12% 底色在深色模式下需验证）。

## 三、UI 组件使用分析

### 3.1 当前使用情况

从 `blog-page-client.tsx` 等文件看，已使用 `@innate/ui` 的组件：`Button / Empty 系列 / InputGroup 系列 / Kbd / Resizable 系列 / ScrollArea / Separator / Sheet 系列 / cn / useIsMobile`。

**评价**：

- ✅ 遵守了「不在 app 里拷 components/ui」的架构纪律，依赖方向正确（App → L1 → D0）。
- ✅ 没有用 raw hex（除 mermaid token 的合理例外），颜色全部走语义 token。
- ⚠️ **使用率偏低**：`@innate/ui` 提供 50+ 组件，本站实际只用了约 12 个。`command`（命令面板）、`tooltip`、`dropdown-menu`、`badge`、`skeleton`、`dialog`、`tabs` 都还没用上。
- ⚠️ 已有 `Kbd` 展示了 `⌘K` 提示，但搜索只是 Input——**升级为 `Command` 命令面板**是性价比最高的一步：搜索 + 跳转 + 筛选 + 主题切换全部收进一个面板。

### 3.2 组件升级清单（推荐顺序）

1. `Command`：替换现有搜索框，支持模糊匹配标题/标签/分类，`⌘K` 全局唤起。
2. `Badge`：统一 label-chip 的呈现，语义化 variant。
3. `Tooltip`：侧栏折叠后图标按钮的说明。
4. `Skeleton`：路由切换与 mermaid 渲染占位。
5. `DropdownMenu`：文章卡片的「复制链接 / 导出 / 查看源码」。
6. `Dialog`：移动端「关于本站 / 快捷键说明」。
7. `Tabs`：详情页「正文 / 大纲 / 元信息」切换（窄屏时）。

## 四、UI 设计分析

### 4.1 视觉语言现状

- 整体是 **base-vega 极简白**：接近全白的背景、细边框、低饱和，典型「文档工具」气质，与个人笔记定位吻合。
- 标签色是唯一的色彩来源，hue 随机但 L/C 锁定——建议把 hue 也固定到一张 8–12 色的策划色板上，让分类色稳定可记忆（如「insight 永远是蓝」「research 永远是紫」）。
- 字体：Inter Variable + 中文系统字体，字重 600 的标题层级清晰；`letter-spacing: -0.03em` 的大标题处理得当。

### 4.2 设计改进方向

1. **建立「编辑色板」**：为分类/标签定义固定映射，减少随机 hue 带来的记忆负担。
2. **暗色模式精修**：mermaid 暗色 token 已有，但 `.markdown-content` 的代码高亮色（`--chart-1/2/4`）在暗色下需逐一验证对比度（WCAG AA 4.5:1）。
3. **封面与卡片视觉**：个人 blog 可为 frontmatter 增加 `cover` 字段，列表页卡片支持封面图缩略，提升浏览欲。
4. **排版细节**：段落两端对齐慎用（中文可 `text-align: justify` + `text-justify: inter-ideograph`）；中英文混排加 `autospace` 或在构建期用 remark 插件插入空隙。
5. **品牌识别**：`landing` 页是唯一的品牌展示位，值得投入一页精心设计的 Hero（大字标题 + 最近文章 + 订阅入口）。

## 五、Top 10 Skill（适合本优化方向的技能）

> 按「对本项目产出价值的密度」排序，含好处与坏处。

| #   | Skill                      | 适用场景                                   | 好处                                                                   | 坏处                                                                 |
| --- | -------------------------- | ------------------------------------------ | ---------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 1   | **webapp-building**        | 重构/新增 React 页面与复杂交互组件         | 与本站技术栈（React + TS + Tailwind + shadcn）完全同构，产出可直接落地 | 偏重新建工程，对既有 workspace 约束（@innate/ui 唯一来源）需人工对齐 |
| 2   | **theme-kit**              | 建立编辑色板、暗色精修、主题变体           | 10 种预设主题 + 自定义生成，正好补「分类固定色板」短板                 | 预设风格偏展示型，文档站的克制美学需手动收敛                         |
| 3   | **dev-guide-writer**       | 把优化过程沉淀为教程/速查表                | 结构化产出（前置知识→步骤→报错→拓展），适合写进 blog                   | 偏通用模板，深度技术细节仍需自己补                                   |
| 4   | **deep-research**          | 竞品调研（Obsidian/Notion/Bear 的笔记 UX） | 多维检索 + 结构化报告，避免拍脑袋设计                                  | 周期长，对「改一个搜索框」这类小决策过重                             |
| 5   | **kimi-design**            | landing 页 Hero 图、文章封面、信息图       | DSL 构造设计稿，可导出图片/PPTX，封面图流水线化                        | 位图产物，不是可交互 UI；风格需与 base-vega 调和                     |
| 6   | **humanizer-zh**           | blog 正文润色                              | 去 AI 痕迹，个人笔记的「人味」是核心竞争力                             | 只处理文本，不碰结构与事实                                           |
| 7   | **kimi-slides**            | 把 research 笔记转成分享 deck              | PPTD 流水线成熟，适合把长文二次利用                                    | 与站点本体优化无直接关系，属衍生场景                                 |
| 8   | **bloom-quiz-maker**       | 笔记的主动回忆卡片化（学习类笔记）         | 笔记 → 测验的转换能提升内容粘性                                        | 受众窄，只适合教程/学习类文章                                        |
| 9   | **github-topn-researcher** | 选型调研（编辑器内核、搜索库对比）         | 结构化排名 + 许可证检查，选型决策快                                    | 数据以 GitHub 为主，对设计类判断无能为力                             |
| 10  | **xhs-note-creator**       | 把 blog 文章分发到小红书                   | 一键卡片图 + 平台风格文案，扩大笔记触达                                | 与「个人站优化」主线无关，属运营侧                                   |

**结论**：1–3 是本次优化的主力（建站、定色、写文档），4/9 用于关键选型前的调研，5/6 用于内容质量，7/8/10 是可选的衍生渠道。

## 六、Top 10 UI 方案（组件库 / UI 技术选型）

> 场景分两类：**A = 现有网站优化**（React 生态），**B = Tauri 桌面编辑器**（前端栈可沿用 React）。按推荐度排序，均附好处与坏处。

| #   | UI 方案                                     | 场景            | 好处                                                                              | 坏处                                                                              |
| --- | ------------------------------------------- | --------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 1   | **shadcn/ui + Base UI（现方案，继续深化）** | A+B             | 已是仓库唯一来源；copy-in 模式无版本锁定；token 体系成熟；无障碍由 Base UI 兜底   | 组件需自行组装，无「开箱即用」的高级件（DataGrid 等）；依赖父仓节奏               |
| 2   | **Radix UI Themes**                         | A+B             | 与 shadcn 同源的 primitives 之上提供完整主题系统，暗色/间距/字号开箱即用          | 与现有 D0 token 体系重叠甚至冲突；风格偏「Radix 味」，定制成本高                  |
| 3   | **Mantine**                                 | B               | 100+ 组件最全（RichText、Dropzone、Spotlight 命令面板现成），编辑器类应用省时     | 自有样式体系（CSS-in-JS → CSS modules），与 Tailwind 双体系并存增加包体与心智负担 |
| 4   | **Ark UI / Zag.js**                         | A+B             | 无头状态机，跨框架（未来想换 Solid/Svelte 做 Tauri 前端可复用逻辑）               | 生态年轻，文档与示例密度不如 Radix                                                |
| 5   | **Tailwind CSS v4（继续）**                 | A+B             | 已落地；v4 的 CSS-first 配置与 token 天然契合                                     | 样式可读性依赖纪律；复杂组件仍需 primitives 支撑                                  |
| 6   | **CodeMirror 6**                            | B（编辑器内核） | 模块化、虚拟化长文档、Markdown 高亮/折叠/快捷键生态成熟，Tauri 编辑器事实标准之一 | API 学习曲线陡；所见即所得需自研层                                                |
| 7   | **TipTap（ProseMirror）**                   | B（所见即所得） | WYSIWYG 体验好，扩展生态丰富，类 Notion 编辑体验                                  | 与 Markdown 源码双向同步是持久痛点；包体大；简单版编辑器可能杀鸡用牛刀            |
| 8   | **Milkdown**                                | B（备选内核）   | ProseMirror 之上的 Markdown-first 编辑器，源码/所见即所得双模式                   | 社区规模小于 TipTap；中文文档少                                                   |
| 9   | **FlexSearch / Pagefind**                   | A（站内搜索）   | FlexSearch 轻量（运行时索引）；Pagefind 构建期生成、零依赖静态搜索                | FlexSearch 需自建中文分词；Pagefind 需额外构建步骤                                |
| 10  | **Framer Motion（motion）**                 | A+B（动效）     | 声明式动效、布局动画（列表↔详情共享元素过渡）体验极佳                             | 包体约 30–50KB；笔记站应克制使用，只用于视图切换                                  |

**选型结论**：

- **网站侧**：坚守 1（shadcn + Base UI）+ 5（Tailwind v4），引入 9（搜索）与 10（克制动效），不引入第二套组件体系。
- **桌面编辑器侧**：1 + 5 打底，编辑器内核首选 **6 CodeMirror 6（源码模式）**，未来要 WYSIWYG 再叠加 7/8；避免同时引入 Mantine 这类全量库造成双体系。

## 七、Tauri 本地 Markdown 编辑器方案

### 7.1 定位

一个**简单版本**的本地 Markdown 编辑器桌面应用：直接读写本仓 `content/` 目录，写作 → 预览 → 提交（git）一体化，让本站从「纯静态浏览」升级为「本地写作 + 静态发布」的闭环。

### 7.2 架构

```
┌────────────────────────────────────────────┐
│  Tauri Shell (Rust)                        │
│  ├── fs: 读写 content/**/*.md(x)           │
│  ├── git: status / add / commit (git2)     │
│  ├── watcher: notify crate 监听目录变更    │
│  └── frontmatter: serde_yaml 校验          │
├────────────────────────────────────────────┤
│  前端 Webview（复用本站栈）                 │
│  ├── Vite + React 19 + TanStack Router     │
│  ├── @innate/ui + Tailwind v4（同款 UI）   │
│  ├── CodeMirror 6（Markdown 源码编辑）     │
│  ├── react-markdown 预览（复用现有渲染器） │
│  └── 双栏：编辑 | 实时预览                 │
└────────────────────────────────────────────┘
```

**关键设计决策**：

1. **复用而非分叉**：前端直接复用本站的 `markdown-renderer`、`folder-tree`、`label-color` 等模块（抽成共享包或 path alias），预览效果与线上 100% 一致——这是相对 Typora/Obsidian 的最大差异点：「所见即所得 = 所见即所发布」。
2. **简单优先**：第一版不做 WYSIWYG，左侧 CodeMirror 源码 + 右侧实时预览，分屏比例可调（复用 Resizable）。
3. **frontmatter 表单化**：标题/slug/date/category/tags/status 用表单编辑（复用 `@innate/ui` 的 form/input/select/switch），避免手写 YAML 出错。
4. **图片粘贴**：截图粘贴自动存入 `content/assets/<slug>/` 并插入相对路径——本地编辑器相对纯 web 的核心优势。
5. **git 集成**：底部状态栏显示分支与未提交数，一键「提交并推送」（复用现有 deploy-pages 流水线完成发布）。

### 7.3 目录规划

```
apps/
└── daily-work-desktop/          # 新 app，pnpm workspace 成员
    ├── src/                     # React 前端（复用 daily-work 模块）
    ├── src-tauri/               # Rust 后端
    │   ├── src/main.rs
    │   ├── src/fs.rs            # 内容读写 + frontmatter 校验
    │   ├── src/git.rs           # git2 封装
    │   └── tauri.conf.json
    └── package.json
```

### 7.4 实施计划（4 个 Sprint）

| Sprint     | 目标     | 交付                                                                                                            |
| ---------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| S1（1 周） | 骨架打通 | Tauri 工程初始化；窗口 + 双栏布局；fs 读写 content/；文件树（复用 folder-tree）                                 |
| S2（1 周） | 编辑闭环 | CodeMirror 6 接入（Markdown 高亮/快捷键）；react-markdown 实时预览（复用渲染器，含 mermaid）；自动保存 + 脏标记 |
| S3（1 周） | 写作体验 | frontmatter 表单；新建文章模板；图片粘贴落盘；`⌘K` 文章跳转；dark mode 同步系统                                 |
| S4（1 周） | 发布闭环 | git status/commit/push；与 deploy-pages 流水线衔接说明；打包签名（先 macOS/Windows 免签名 dev build）           |

### 7.5 风险与权衡

| 风险         | 说明                                                            | 缓解                                                         |
| ------------ | --------------------------------------------------------------- | ------------------------------------------------------------ |
| 包体与构建链 | Tauri 需 Rust 工具链，CI 打包三平台较慢                         | 先只做本地 dev build，发布走手动                             |
| 模块复用边界 | `src/lib/content` 依赖 `import.meta.glob`，桌面端要换成 fs 读取 | 抽象 `ContentSource` 接口：web 端 glob 实现 / 桌面端 fs 实现 |
| 维护成本翻倍 | 两个 app 同步演进                                               | 编辑器只做「写作」一件事，浏览功能不回迁                     |
| 范围蔓延     | WYSIWYG、插件系统都是无底洞                                     | S1–S4 之外的需求进 backlog，逐季度评审                       |

## 八、行动清单（Next Actions）

**本周可做（网站侧）**：

1. [ ] 搜索框升级为 `Command` 命令面板（`⌘K`）
2. [ ] TOC scroll-spy 高亮
3. [ ] 写作页接入 `ThemeSelector`（暗色切换）
4. [ ] 代码块加复制按钮
5. [ ] 分类/标签 hue 固定色板（8–12 色）

**本月可做（编辑器侧）**：

1. [ ] 抽象 `ContentSource` 接口，验证 web/desktop 双实现可行
2. [ ] Tauri 工程脚手架 + 双栏编辑器 PoC（S1）
3. [ ] CodeMirror 6 vs Milkdown 的最终内核决策（用 github-topn-researcher 做一轮对比）
