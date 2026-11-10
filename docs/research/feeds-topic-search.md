---
title: "调研：用 innate-feeds 查前端设计相关 topic"
slug: feeds-topic-search
date: 2026-11-10
author: Innate Team
category: research
tags: [research, feeds, github-search, topic]
status: draft
excerpt: "issue #12 ①：innate-feeds 是什么、能查什么、怎么查；前端设计 skill 相关的检索词表与去重方法。"
---

# 用 innate-feeds 查前端设计相关 topic

> [innate-feeds](https://github.com/variableway/innate-feeds)（variableway/innate-feeds）：
> GitHub **trending / starred / 社区 issues digest** 的浏览与检索工作台（Bun + Hono + SQLite，
> 静态模式部署 GitHub Pages）。

## 0. 结论速览

| 问题 | 答案 |
|---|---|
| feeds 能查什么 | 三类快照：trending（日/周/月）、starred（带 starred_at、增量同步）、issues digest（ruanyf/weekly + GitHubDaily，90 天） |
| 怎么查 topic | ①UI 侧筛选（language/topics/snapshot date/stars 区间/搜索，按 stars/updated/created/starred 排序）②数据侧 `bun run data:update` 落 SQLite / 导出 JSON |
| 本轮怎么用的 | 研究环境没有 feeds 的 SQLite 快照，等价路径 = **GitHub search API 直接检索 + gh CLI**（下文词表同样适用 feeds UI 的搜索框） |
| 检索词表 | 见 §3：三大主题（design skill / agent skill 生态 / 可视化 explain） |

## 1. innate-feeds 的检索模型

- 数据源：GitHub trending（**无历史 API**，只有当日日/周/月快照）、starred 增量、digest issues；
- 筛选：language、**topics**、snapshot 日期、stars 区间、关键词；排序 stars / updated / created / starred；
- 两种形态：
  - **API 模式**：Hono + SQLite（`~/.innate/feeds.db`），磁盘缓存优先、后台刷新；
  - **静态模式**：GitHub Pages + 预导出 JSON，浏览器直连 GitHub 补充实时数据。
- README 领域素材：`topics/`（dsh / edu-animate / ux-design）是**产品内的话题页目录**，
  不是 GitHub topic 镜像——查外部项目还是走 GitHub search。

> 注意：feeds 的 trending 是**当天切片**，做历史趋势要靠每日 `data:update` 积累；
> issues digest 覆盖 ruanyf/weekly 与 GitHubDaily 两个中文社区源。

## 2. 研究 vs 产品的检索分工

| 需求 | 用什么 |
|---|---|
| 日常浏览今天什么火 | feeds UI（trending / digest） |
| 「某 topic 下 top N 项目」结构化调研 | GitHub search API（`sort=stars`）或 feeds UI 搜索框 + 手工整理 |
| 长期跟踪某方向 | feeds starred 分类 + 定期 `data:update:window` |

本轮（issue #12 ②③④）属于结构化调研，主用 GitHub search API，词表如下。

## 3. 前端设计 skill 检索词表（可直接贴进 feeds 搜索框）

### 3.1 设计判断力 / anti-slop（本轮主战场）

```text
frontend design skill ai agent
claude code frontend design
ui design skill claude
anti-slop ui
design taste skill
frontend-design skill          ← Anthropic 官方技能名
```

命中样本：Leonxlnx/taste-skill（112k★）、oil-oil/oil-ui（3k★）、
superdesigndev/superdesign-skill、educlopez/ui-craft、Ilm-Alan/frontend-design。

### 3.2 设计系统 / token / 治理

```text
topic:design-systems topic:ai
design tokens extract skill
DESIGN.md design system        ← xjli360/awesome-design-md-ecommerce（1632 份品牌设计系统）
figma design system mcp
```

### 3.3 可视化 / explain（对应 issue ④）

```text
explorable explanations         ← idyll-lang、awesome-explorables、explorableexplanations.github.io
interactive visualization algorithm learning
mermaid excalidraw react-flow diagram documentation
visual explanation concept tutorial
```

### 3.4 agent skill 生态本身

```text
agent skills standard            ← agentskills.io 徽标生态
npx skills add                   ← vercel-labs/skills 安装器事实标准
claude code skills collection    ← helloianneo/awesome-claude-code-skills 等合集
```

### 3.5 EDU teachable / EDU animation（对应追加的 Top 20 报告）

```text
teachable skill agent            ← kepano/obsidian-skills、AgentHandover、feynman-tutor
education skill agent teaching   ← university-teacher-skills、edu-agent-skills（苏格拉底）
tutor skill learning student     ← 一对一辅导类
manim skill agent                ← manim_skill、MathLens、manim-skills
remotion skill agent video       ← remotion-dev/skills、video-talkcraft、OpenMontage
animation skill lottie rive      ← motion-design 策展类
explainer video skill education  ← hyperframes、faceless-explainer
whiteboard animation skill       ← 白板/手绘风（common craft 范式）
```

另有一条**非搜索**的检索路径：innate-feeds 的 edu-animate 域采集器
（skills.sh sitemap 20,000 条 → 领域过滤，实测 443 条 / 128 仓库），
比 GitHub search 更全（skills.sh 上大量 skill 不在独立仓里）——
详见 [edu-animation-skills-top20.md](./edu-animation-skills-top20.md) §0 与
innate-feeds `docs/research/edu-animation-sources.md`。

### 3.6 方法论修正：滚雪球与新仓盲区（来自复加调研的教训）

`teachable skill agent` 检索曾漏掉 ywEdAi/teachable-figures（303★），
复盘出 Top-N 检索的三个盲区（详见
[explorable-teachable-figures-addendum.md](./explorable-teachable-figures-addendum.md)）：

1. **星数截断**：per_page=10 + sort=stars 会把 300★ 段的新兴子生态头部截掉；
2. **词汇体系偏差**：目标项目的自述词（predict, try, explain / misconception /
   isometric / explorable）与领域名词（teachable / education）零交集——
   词表要三层：领域名词 + **自述动词** + **产出形态词**；
3. **新仓无信号**：仓龄 <1 月、无 topics 的项目在相关度/star 排序里都不抬——
   「星数 <500 且仓龄 <1 月」要单独人工过一遍。

Top-N 之后**必做引用滚雪球**：读榜单项目的 upstream / fusion / credits / inspired-by 段
（范本：teachable-figures 的 `references/sources-and-fusion.md`）。
该轮滚雪球挖出的「可交互教学图」子生态清单见复加报告 §3.2（15 个项目）。

## 4. 去重与排序方法（多词表合并）

1. 每个 query 取 top 10（`sort=stars, order=desc`），记录 `stars / full_name / description / pushed_at`；
2. 以 `full_name` 去重；description 二次归类（判断力 / 流程 / 治理 / 视觉工具 / 合集）；
3. 剔除：教程站、与「设计 skill」无关的同名项目（如 FrontAgent 平台类只作背景）；
4. 保留「近 90 天有 push」的活跃项目（`pushed_at` 过滤），避免统计僵尸仓库；
5. 最终 top 10 见 [top10-design-skills.md](./top10-design-skills.md)。

## 5. 后续可沉淀

- 把 §3 词表落成 feeds 的 `topics/ux-design` 索引页素材（产品内话题页）；
- 「design skill」检索定期跑一次（月度），观察格局变化（新入局者、停止维护者）。
