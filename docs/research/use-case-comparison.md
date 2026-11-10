---
title: "调研：use-case 分析对比——to-b 项目与 edu 项目"
slug: use-case-comparison
date: 2026-11-10
author: Innate Team
category: research
tags: [research, use-case, tob, edu-animate, admin-tanstack, scene-specs]
status: draft
excerpt: "issue #12 ③：两个具体 use-case 的分析对比——innate-fe-examples 中创建 to-b 项目的尝试（admin-tanstack / order-admin / scene-specs 体系），与 edu 项目的不同风格尝试（edu-animate / wandesk-ui），再对照业界设计 skill 的做法。"
---

# use-case 分析对比：to-b 项目与 edu 项目

> 一手材料：innate-fe 仓 `packages/skills-kit`（fe-overview / fe-starter / fe-feature）、
> `packages/scene-specs`（7 场景 spec）、innate-fe-examples 仓 `examples/*`。
> 对照系：[top10-design-skills.md](./top10-design-skills.md) 的机制清单。

## 0. 结论速览

| 问题 | 答案 |
|---|---|
| to-b 尝试现状 | **spec 驱动 + 参考实现对照**已闭环（7 场景 spec × admin-tanstack 场景视图 × order-admin CRUD 链路 × ToB 必查清单），结构正确性有硬门禁；但**视觉方向决策无机制**——spec 定组件树不定审美，7 个场景页共享同一张「克制、密度优先」的脸 |
| edu 尝试现状 | edu-animate / wandesk-ui 是**风格参考仓**（动画教学、Desktop-OS 风格），无 spec、无验收清单，风格探索全靠人肉对比；缺 oil-ui 式「方向先行 + 一次确认」流程 |
| 两者差别的本质 | to-b 把「对不对」做成了机器可查（spec 三节 + 对照实现）；edu 的「好不好看」还停在不可执行的建议——正好对应业界「结构门禁」与「审美判断」两层 |
| 可借鉴什么 | to-b：把 ToB 必查清单模式复制到新领域（如 landing/edu），「spec + 参考实现 + 必查清单」三件套是可移植模板；edu：引入方向卡（锚点=token 承诺）+ 对比页机制，风格探索从「跑 demo 人肉看」升级为「卡片选择」 |
| 风险 | edu-animate 类项目依赖重动画（GSAP/framer-motion），与 @innate/ui 语义 token 约定有张力；需要「风格试验区」与「生产组件区」的边界约定（轨道 B iframe 天然合适） |

## 1. use-case A：创建 to-b 项目（innate-fe-examples）

### 1.1 现有链路（怎么创建一个 to-b 项目）

按 fe-starter（domain 轨道）+ fe-feature（ToB 必查）：

```text
判定轨道 A（domain，TanStack 进壳）
 → examples 仓 examples/<id>/（@innate/domain-<id>）
 → ToB 页必读 packages/scene-specs/<id>-scene-spec.md 三节
    （标准组件树 / 审计与状态 / 验收清单）
 → 对照 examples/admin-tanstack/src/components/scenes/*-scene-view.tsx（同场景组合）
 → CRUD 类再对照 examples/order-admin（列表→new→详情→edit + lib/<domain>/ 分层）
 → 数据走 mock-first service + use-async 三态
 → fe-verify 收尾
```

### 1.2 七场景 spec 体系（结构契约）

| 场景 id | 布局公式 | L2/L1 生产组合（scenes.md 速查表） |
|---|---|---|
| dashboard | 筛选 → KPI 行 → 主图 → 明细表 | MetricCards / SectionCards + Chart + Table |
| workspace-list | SceneIntro → 筛选栏 → 表格 → 分页 | Table + tanstack/react-table 自建列 |
| record-detail | 头部 → 元数据网格 → 相关区 → 操作栏 | InfoListCard + Tabs / Badge / Button |
| reporting-wizard | 步骤指示 → 分步表单 → 吸底操作栏 | Form + Field + RHF + zod，放弃确认 AlertDialog |
| approval-review | 说明 → diff 表 + 上下文 → 决策栏 | Table / Badge / Button / Textarea 自组 |
| integration-health | 摘要指标 → 连接器表 → 行操作 | MetricCards + Badge / Sheet |
| policy-settings | 分组表单 → 开关 → 保存栏 | Card / Accordion / Tabs + Switch + Sonner |

批量操作另有三段惯例：行选（Checkbox + indeterminate）→ 批量条 → AlertDialog 二次确认
（order-admin `orders-table.tsx` 是参考实现）。

### 1.3 与业界对照

| 业界机制（top10 报告 §2 共性） | innate-fe to-b 现状 |
|---|---|
| 方向先行（方向卡 + 一次确认） | ❌ 无——场景决定布局，但颜色/字体/密度默认走 D0 token 全局主题 |
| 真实画面验收 | ❌ fe-verify 不含截图；spec「验收清单」是自勾 checkbox，非机器验证 |
| 持久化设计上下文 | ⚠️ scene-specs 是**结构**上下文，无**视觉**上下文（无 DESIGN.md） |
| 范围分诊 | ⚠️ fe-feature 有「何时使用」，无「小改动直达」通道 |
| 结构门禁 | ✅ **领先业界**——spec + 参考实现对照 + 必查清单的组合，比多数开源 skill 严格 |

**判断**：to-b 链路不缺结构，缺的是「同一 spec 下允许多少视觉变化」的机制。
ui-craft 的 dashboard 例子证明 ToB 页也能做审美分层（同一组件树，不同 token 密度/图表风格）。

### 1.4 可实验项（to-b）

1. **给 workspace-list 场景做一次「同 spec 双风格」试验**：同一份 spec、同一组件树，
   只换 D0 层（theme variant + 密度 token），产出两张实现对比——验证「结构契约与视觉方向
   正交」的假设，也是 @innate/ui themes/ 机制（`data-theme` variant）的价值证明。
2. **spec 验收清单机器化试点**：挑 dashboard spec 的「KPI 行存在」「筛选栏在图上方」
   两条，写成 Playwright 断言，探讨 fe-verify 视觉档位的成本。
3. admin-nextjs（iframe 轨道）与 admin-tanstack 的场景页已构成天然 A/B——
   可补一份两轨实现的差异记录（哪些差异是轨道必然，哪些是风格漂移）。

## 2. use-case B：edu 项目（不同风格的尝试）

### 2.1 现有素材

| 仓 | 定位 | 技术栈 | 风格特征 |
|---|---|---|---|
| examples/edu-animate | 教育动画参考（innate-fe topics/edu-animate 的落地尝试） | Vite 独立包（vite.standalone.config） | 重动效教学风格 |
| examples/wandesk-ui | 从 nicepkg/wandesk 抽取的 Desktop-OS 风格参考 | Vite + React 18 + React Router 7（**非** TanStack）、Tailwind 4 + 大量自定义 CSS、**无 shadcn**、可选 Tauri 2 | 多窗口 / Taskbar / Launcher / 玻璃态壁纸 |
| examples/skel-lean-ui | 精简 UI 风格参考 | — | 极简 |
| examples/web-showcase | @innate/ui live showcase（iframe 轨道参考） | Next.js | 组件 demo 站 |

关键事实（来自 wandesk-ui README）：它**不依赖 @innate/ui / scene-catalog**，
自带 `base: "./"` + HashRouter 可直接挂轨道 B——即「风格实验不污染生产组件层」
已经是现成的物理隔离。

### 2.2 edu 尝试与 to-b 尝试的差异

| 维度 | to-b（admin-tanstack 等） | edu（edu-animate / wandesk-ui） |
|---|---|---|
| 目标 | 结构正确 + 信息密度 | 风格辨识度 + 情绪/动效 |
| 契约 | scene-specs（机器可查清单） | 无 spec，README 自述 |
| 组件来源 | @innate/ui D0-L2 全链 | 可完全自带（wandesk 无 shadcn） |
| 轨道 | A domain（进壳） | B iframe 为主（隔离） |
| 验收 | fe-verify + 必查清单 | 人肉看 demo |
| 风险点 | 千页一面（视觉同质） | 与全局 token/主题体系脱钩，风格无法沉淀回 L1 |

### 2.3 与业界对照：edu 缺的正是 oil-ui / Ilm-Alan 的机制

- **缺方向卡**：edu-animate 试什么风格、为什么、和谁对标——没有书面记录。
  Ilm-Alan 的「锚点 = palette/typography/texture 锁进 CSS token」是最轻的解法：
  每次风格尝试 = 一张锚点卡 + 一份 theme preset。
- **缺对比页**：多种风格并存时靠切 dev server 人肉比。oil-ui 的对比页
  （HTML 文件 / 图片 / 运行中页面同屏，桌面/移动切换，键盘浏览，Select 回贴反馈）
  是成熟形态；可以先做一个 20 行的静态对比页模板放进 examples 仓。
- **缺评审协议**：好看与否谁来判？oil-ui 的「独立评审者（隔离上下文 + 看图）」
  和 ui-craft 的「persona 走查打分」都可直接搬到 edu 尝试的收尾。

### 2.4 可实验项（edu）

1. **edu-animate 风格锚点化**：给现有尝试补写「锚点卡」（目标情绪 / 色板 hex /
   字体对 / 动效原则 / 对标站），验证书面方向卡能否让下一次尝试少走弯路。
2. **风格对比页脚手架**：examples 仓加一个 `style-arena` 极简包（静态 HTML，
   iframe 网格 + 尺寸切换 + 键盘导航），把 edu-animate / wandesk-ui / skel-lean-ui
   同屏对比——这同时是 oil-ui 机制的本土最小实现。
3. **风格沉淀通道**：某次 edu 尝试的成熟视觉（如 wandesk 的玻璃态）要进生产时，
   走 fe-ui 的 theme preset 路径（`themes/<name>.css` + ThemeVariant），而不是整包引入——
   在 fe-overview §6「外部技能边界」里已有原则，补一条 edu 特例说明。

## 3. 跨 use-case 的统一建议

1. **两条轨道共享「方向卡」层**：无论 to-b 还是 edu，动手前一张卡
   （色/字/布局概念/原则/对标），一次确认——这是业界共识里性价比最高的缺失件。
2. **验收分级**：结构验收（机器，已有）→ 视觉验收（截图 + 清单，待建）→
   品味验收（独立评审，可选）。edu 先用第三级，to-b 补第二级。
3. **风格试验的物理边界**：轨道 B（iframe）+ 不依赖 @innate/ui = 既有事实标准，
   写进 fe-overview 即可（「风格实验仓不进 A 轨道，成熟后经 fe-ui 沉淀 token」）。

## 4. 参考实现索引

- fe-overview / fe-starter / fe-feature / fe-ui：
  innate-fe `packages/skills-kit/skills/`（含 skill-system/skill-routing.md 路由表）
- 场景速查与 ToB 必查：innate-fe `packages/skills-kit/skills/fe-feature/references/scenes.md`
- 7 场景 spec：innate-fe `packages/scene-specs/`（根目录 md 为事实源，en/zh 是副本）
- 参考实现：innate-fe-examples `examples/admin-tanstack`（场景视图）、
  `examples/order-admin`（CRUD 四页链路）、`examples/wandesk-ui`（Desktop-OS 风格）、
  `examples/web-showcase`（组件 showcase）
