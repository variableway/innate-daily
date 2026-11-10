---
title: "调研：用可视化方式 explain 问题、教程与概念"
slug: visual-explain-research
date: 2026-11-10
author: Innate Team
category: research
tags: [research, visualization, explain, mermaid, explorable, tutorial]
status: draft
excerpt: "issue #12 ④：用可视化解释问题/教程/concept 有哪些可用的内容与工具——图表 DSL、交互组件、可探索叙事（explorable explanations）、以及 agent 生态里已有的技能/工具，结合本站（innate-daily）现状给出选型。"
---

# 用可视化方式 explain 问题、教程与概念

> 范围：什么内容适合可视化解释、有哪些工具/内容可用、本站怎么落地。
> 关联：[executable-tutorials-research](../ideas/executable-tutorials-research.md)（issue #9，
> 「可执行」维度）——本文补「可看/可玩」维度。

## 0. 结论速览

| 问题 | 答案 |
|---|---|
| 哪些内容适合可视化 explain | 四类各有最优形态：**流程/架构**→流程图时序图；**数据/对比**→表格+图表；**时序概念**（算法/状态机/事件流）→分步动画；**因果参数**（调一个东西看另一个变）→可探索交互件（explorable） |
| 有哪些可用工具 | 图表 DSL：mermaid（91k★，本站已内建）；手绘风白板：excalidraw（135k★）；节点图：react-flow / xyflow（39k★）；可探索叙事：Idyll（2k★）、curvenote/article（200★，React 科学写作组件）；算法可视化有成套开源站可抄 |
| agent 生态现成内容 | open-3d-skills（3D/动效技能包）、agent-vision-toolkit（让 agent 看图）、awesome-explorables（1k★ 精选清单）、100+ 交互教学站源码 |
| 本站落地 | 不引入新框架：mermaid 已接（MermaidBlock，主题跟随）→ 补 ①mermaid 图型覆盖清单（时序/状态/甘特）②react-flow 按需组件（架构图交互版）③「可执行教程」里的概念图随文内嵌 ④explorable 单页 demo 走 use-case 独立文 |
| 关键判断 | **图不是越多越好**——业界 explorable 的共识是「一个交互件只教一件事」；静态 MD 教程配 1-2 张精准 mermaid 通常优于堆交互 |

## 1. 什么内容适合可视化解释（先分类再选型）

| 内容类型 | 例子 | 最优形态 | 理由 |
|---|---|---|---|
| 流程 / 架构 / 决策 | 构建管线、请求链路、技能路由 | 流程图 / 时序图（mermaid） | 拓扑是关键，静态可读 |
| 数据对比 / 演化 | top10 对比、星数趋势 | 表格 + 图表 | 精确值重要 |
| 时序概念 | 排序算法、状态机、事件循环 | **分步动画 / 播放器** | 时间维无法静态表达 |
| 因果参数 | 「n 变大时复杂度怎么变」 | **可探索交互件（explorable）** | 学习发生在「自己调参数」那一刻 |
| 空间概念 | 布局、坐标、3D 变换 | 可拖拽画布 / 3D 场景 | 需要空间直觉 |
| 抽象概念（闭包/虚拟DOM） | 多数概念文 | 图解 + 类比 + 代码对照 | 交互收益递减，讲清楚最要紧 |

> 判断口诀：**能静态说清的别动画；参数因果才交互；拓扑用图；数值用表。**

## 2. 可用工具盘点

### 2.1 图表 DSL（文本进 MD，渲染在站内）

| 工具 | 星数 | 形态 | 本站状态 |
|---|---|---|---|
| [mermaid](https://github.com/mermaid-js/mermaid) | 91k | flowchart / sequence / state / class / gantt / mindmap / timeline / quadrant / sankey | ✅ 已内建（ESM min 别名，MermaidBlock 主题跟随） |
| [excalidraw](https://github.com/excalidraw/excalidraw) | 135k | 手绘风白板，`.excalidraw` JSON 可嵌入 | 未接；适合「手稿感」架构图，react 组件可嵌 |
| [d2](https://github.com/terrastruct/d2) | — | 文本→现代风格图，CLI 渲染 | 未接；渲染需额外链路 |

### 2.2 节点 / 交互图组件（React）

| 工具 | 星数 | 适用 |
|---|---|---|
| [xyflow（react-flow）](https://github.com/xyflow/xyflow) | 39k | 可拖拽缩放的节点图：架构图交互版、组件层级、数据流 |
| [recharts / visx / chart.js] | — | 数据图表（KPI、趋势）——@innate/ui 的 Chart 已覆盖此类 |

### 2.3 可探索叙事（explorable explanations）

| 项目 | 星数 | 定位 |
|---|---|---|
| [idyll-lang/idyll](https://github.com/idyll-lang/idyll) | 2k | 「可探索解释/交互文章」的 DSL，React 组件内嵌 |
| [curvenote/article](https://github.com/curvenote/article) | 200 | 交互式科学写作 React 组件（reactive 文档） |
| [joshwcomeau/waveforms](https://github.com/joshwcomeau/waveforms) | 1.5k | 标杆作品：声波互动教学（可直接学其结构） |
| [explorableexplanations](https://github.com/explorableexplanations/explorableexplanations.github.io) | 520 | 社区门户 + 教程（怎么设计 explorable） |
| [blob42/awesome-explorables](https://github.com/blob42/awesome-explorables) | 1k | **精选清单**——找参考作品第一站 |

**共识设计原则**（来自上述社区）：一个交互件只教一个概念；默认状态就要传达主论点
（不是「点开始才有内容」）；交互即时反馈（<100ms）；配文字锚点（可离线理解）。

### 2.4 成套内容可参考的站点

- **算法/数据结构可视化**：algorithm-visualizer（react 版）等开源实现，
  「播放器 + 步骤解释面板」结构可复用；
- **机器学习可解释**：distill.pub（虽停刊，交互图范式仍是模板）、
  transformer 可视化系列（TensorPlayground / llmviz 等）；
- **CSS/布局**：css layout 类交互站（flex/grid playground 范式）——与前端教程最贴。

### 2.5 agent 生态的现成技能/工具

| 项目 | 用途 |
|---|---|
| open-3d-skills（318★） | 3D/滚动电影/透明视频等 8 个动效技能——做「视觉惊艳型」explain 页的能力包 |
| agent-vision-toolkit（1.3k★） | 反向：让 agent **看**图（截图问答/长图 OCR/UI 还原），用于验收可视化产物 |
| 各种 UI design skill（见 top10 报告） | 保证 explain 页本身不丑 |

## 3. 本站（innate-daily）落地选型

### 3.1 现状

- 渲染链：react-markdown + remark-gfm + rehype-highlight + rehype-slug；
  **mermaid 已内建**（ESM min 产物别名接入 MermaidBlock，主题跟随站点）；
- 内容全是 MD（frontmatter + 目录即展区），构建期 `import.meta.glob(?raw)` 内联；
- 教程形态已调研「可执行」方案（issue #9：{executable} 块 + Runme/degit 分层）。

### 3.2 分层方案（不换框架，增量能力）

```text
L0 静态图（默认）      mermaid：flowchart/sequence/state/timeline 已可用
                        → 补一份「图型选择清单」进 markdown-usage.md
L1 交互图（按需组件）   react-flow：架构图/组件树的交互版（拖拽+缩放+minimap）
                        → 只在「拓扑本身需要探索」时用，如 fe-* 技能路由图
L2 数据图表            @innate/ui Chart / recharts（趋势、对比）
L3 explorable（单页）  独立 demo 页（不进 MD 渲染管线），MD 文用截图+链接引用
                        → 如「闭包可视化」「虚拟 DOM diff 演示」
L4 3D/动效            open-3d-skills 思路，仅技术向主题（与 taste-skill 的
                        「shader 只进 tech 站」原则一致）
```

**取舍原则**：L0 覆盖 80% 需求；L1/L3 每个 demo 都要有明确「教学目标一句话」，
否则退回 L0；L4 仅在主题强相关时上。

### 3.3 内容规划建议（可写进 docs 的第一批）

| 主题 | 形态 | 层 |
|---|---|---|
| fe-* 技能路由判定 | flowchart（已有 mermaid 版，可加交互 L1） | L0→L1 |
| innate-fe 插件轨道（domain vs iframe） | flowchart + 对照表 | L0 |
| ToB 7 场景组件树 | 每场景一张小结构图（进 scene-spec 附录链接） | L0 |
| 排序/复杂度 explorable | 单页 demo（步进播放器 + 参数滑杆） | L3 |
| 教程类（如 nodejs-typescript-101） | 关键概念 1-2 张 mermaid（如事件循环时序） | L0 |

### 3.4 需要避开的坑

1. **为图而图**：每张图答一个「文字说不清」的问题（拓扑？时序？参数因果？），否则删。
2. **mermaid 图过巨**：一张图 >20 节点就该拆（或转 L1 交互图）；
   MD 源里图码要能盲读（节点 id 语义化）。
3. **explorable 无离线兜底**：交互挂了文字还在（社区共识「文字锚点」）。
4. **动效轰炸**：参考 taste-skill 边界——shader/重动效只进技术向内容，
   概念解释页保持安静（一个记忆点就够）。
5. **图片不可维护**：优先文本 DSL（mermaid/d2）而非截图贴图——diff 友好、agent 可改。

## 4. 参考链接

- mermaid 图型总览：<https://mermaid.js.org/intro/syntax-reference.html>
- xyflow react：<https://reactflow.dev>
- excalidraw embed：<https://docs.excalidraw.com/docs/embedding>
- Idyll：<https://idyll-lang.org>
- explorable explanations 社区：<https://explorabl.es>
- awesome-explorables：<https://github.com/blob42/awesome-explorables>
- curvenote/article：<https://github.com/curvenote/article>
- waveforms（标杆作品）：<https://github.com/joshwcomeau/waveforms>
