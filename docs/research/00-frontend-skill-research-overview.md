---
title: "前端设计 SKILL 研究：总览与结论"
slug: frontend-skill-research-overview
date: 2026-11-10
author: Innate Team
category: research
tags: [research, skill, frontend, design, issue-12]
status: draft
excerpt: "对应 issue #12 的总纲：前端设计相关 SKILL 的四路调研（feeds topic 检索、Top 10 项目分析、use-case 对比、可视化 explain），给出分报告索引与统一结论。"
---

# 前端设计 SKILL 研究：总览与结论

> 对应 [issue #12](https://github.com/variableway/innate-daily/issues/12)。
> 四个子题各有分报告，本文是索引 + 跨报告结论。

## 分报告索引

| # | 报告 | 对应 issue 条目 |
|---|---|---|
| 1 | [feeds-topic-search.md](./feeds-topic-search.md) | ① 通过 innate-feeds 查询相关 topic 的方法与词表 |
| 2 | [top10-design-skills.md](./top10-design-skills.md) | ② Top 10 项目分析与对比报告 |
| 3 | [use-case-comparison.md](./use-case-comparison.md) | ③ use-case 分析对比（to-b 项目、edu 项目不同风格） |
| 4 | [visual-explain-research.md](./visual-explain-research.md) | ④ 用可视化方式 explain 问题/教程/concept 的可用内容 |
| 5 | [edu-teachable-skills-top20.md](./edu-teachable-skills-top20.md) | 追加：EDU Teachable Skill Top 20（教 agent 教/学/做教学材料） |
| 6 | [edu-animation-skills-top20.md](./edu-animation-skills-top20.md) | 追加：EDU Animation Skill Top 20（基于 feeds edu-animate 域 443 条实测数据） |
| 7 | [explorable-teachable-figures-addendum.md](./explorable-teachable-figures-addendum.md) | 复加：从 teachable-figures 滚雪球挖出的「可交互教学图」子生态（15 项目 + 检索方法修正） |

## 结论速览

| 问题 | 答案 |
|---|---|
| **业界在设计什么形态的「前端 skill」** | 三类：①**审美/判断力注入**（taste、anti-slop——Anthropic frontend-design、taste-skill、oil-ui）②**流程编排**（方向探索→灰度结构→实现→真实截图验收→独立评审）③**设计系统治理**（token/DESIGN.md/finalize 门禁）。头部项目共同点：**不止给规则，还带「验收闭环」**——真实浏览器截图 + checker/gate 脚本 + 独立评审者 |
| **innate-fe 现有 fe-* skills 的位置** | 已有「结构正确性」闭环（fe-verify + scene-specs + 对照实现），缺「视觉判断力」层：没有审美方向决策、没有真实截图验收、没有 anti-slop 校准。这是与 top 项目最大的差距，也是最小可补的口 |
| **use-case 对比结论** | to-b（admin-tanstack/order-admin）走 spec 驱动、密度优先，与 ui-craft/superdesign 的 dashboard 思路可对齐；edu-animate 风格探索缺「方向先行」机制，oil-ui 的「先定北极星 + 默认一个方向一次确认」流程可直接借鉴 |
| **可视化 explain 选型** | 站内已有 mermaid（react-markdown 管线）；结构图补 react-flow（xyflow）、手绘风补 excalidraw、交互叙事参考 Idyll/curvenote；不需要新框架，走「MD 内嵌 + 组件按需」即可 |
| **EDU teachable 格局** | 「教对象」（把领域知识打包给 agent）是红海且官方入场（kepano 51k★/GSAP 18k★/Remotion/HeyGen）；「教学法」（让 agent 会教）几乎空白；配方卡（video-talkcraft 108 张动效卡）是最可迁移的结构资产 |
| **EDU animation 格局** | 基于 feeds edu-animate 域 443 条实测：代码渲染（Remotion 系）与解说视频（hyperframes 安装量 1M+）占头部；**课堂教学类仅 3.4% 是明显洼地**——做「讲清楚」的 skill 远少于做「好看」的 skill |
| **可交互教学图子生态**（复加） | teachable-figures（303★）融合 anatomy（26.3k★）与 iso-figure（346★）两个上游，叠「predict→try→explain」教学循环 + 学习科学 checklist——「教学循环层」几乎只有这一个成熟样本，是 EDU × 可视化之间最大的空地；单文件 HTML + 真浏览器验收是全子生态的收敛形态 |
| **检索方法论**（复加） | Top-N 检索有三个盲区：星数截断、词汇体系偏差（领域名词 ≠ 项目自述动词/形态词）、新仓无信号；Top-N 后必做**引用滚雪球**（读 upstream/fusion/credits 段）——教训已回填 feeds-topic-search §3.6 |
| **落地建议（最小闭环）** | 1) 新增 `fe-visual-review`（或扩展 fe-verify）：截图验收 + anti-slop 清单；2) fe-feature/fe-starter 增补「方向先行」一节（引用 Anthropic skill 的 plan→review→build→critique 两遍法）；3) explain 内容用 mermaid 优先，复杂交互单页 demo |

## 与既有研究的关系

- [executable-tutorials-research](../ideas/executable-tutorials-research.md)（issue #9）解决「内容怎么可执行」；
  本轮解决「内容与页面怎么好看、可解释」——两者正交，可组合：
  可执行教程 + 视觉验收 = 完整的内容工程闭环。

## 开放问题（待定）

1. `fe-visual-review` 是否独立成 skill，还是并进 fe-verify（增加浏览器步骤）？
   —— 独立更符合现有「一个技能一个职责」的路由表设计。
2. 截图验收依赖 headless 浏览器（Chrome/Playwright），CI 里的成本与稳定性待验证。
3. oil-ui 的「对比页」模式（多方向同屏）是否值得做成 innate-fe 的脚手架能力（`pnpm explore`）？
