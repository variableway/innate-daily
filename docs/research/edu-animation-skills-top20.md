---
title: "调研：EDU Animation Skill Top 20"
slug: edu-animation-skills-top20
date: 2026-11-10
author: Innate Team
category: research
tags: [research, edu, animation, agent-skill, top20, issue-12, manim, remotion]
status: draft
excerpt: "教育动画方向的 Top 20 项目：以 innate-feeds edu-animate 域的 skills.sh 实测数据（443 skill）为底，按安装量/星数/活跃度选出代表性项目，覆盖 Manim/Remotion/GSAP/白板/黏土/数学讲解等品类，并给 edu-animate 域的策展建议。"
---

# EDU Animation Skill Top 20

> 一手数据：innate-feeds 的 **edu-animate 域采集器**（skills.sh sitemap 20,000 条 →
> 领域过滤 443 条，实测 2026-11-01，见 innate-feeds
> `docs/research/edu-animation-sources.md`）+ 本轮 GitHub 检索补位。
> 安装量来自 skills.sh 详情页 JSON-LD；星数为 2026-11 快照。

## 0. 总榜（按综合影响力排）

| # | 项目 | 安装量 | 星数 | 一句话定位 | 品类 |
|---|---|---|---|---|---|
| 1 | heygen-com/hyperframes（faceless-explainer） | 521k | 81.8k | HeyGen 无真人解说视频 skill | 解说视频 |
| 2 | heygen-com/hyperframes（hyperframes-animation） | 1,005k | 81.8k | 安装量断层第一的动画 skill | 动画全家桶 |
| 3 | remotion-dev/skills（remotion-best-practices） | 723k | 6.7k | Remotion 官方最佳实践 | 代码渲染视频 |
| 4 | OpenMontageInc/OpenMontage | — | 79k | agentic 视频生产系统（12 产线/700+ skill 文件） | 产线集合 |
| 5 | greensock/gsap-skills | — | 18k | GSAP 官方技能 | 网页动画 |
| 6 | 0xsline/OpenChatCut | — | 3k | 对话式剪辑 + Remotion 渲染 | 剪辑工具 |
| 7 | Vincentwei1021/video-talkcraft | — | 2.2k | 口播解说：字级配音同步 + 108 动效配方卡 | 解说视频 |
| 8 | iart-ai/motion-skills | — | 1.3k | 50 个动效 skill / 14 安装包 | 技能包 |
| 9 | adithya-s-k/manim_skill | — | 1.3k | Manim 3B1B 风格动画 | 数学动画 |
| 10 | haidrrrry/claude-remotion-skill | — | 909 | Remotion 动效视频（剪辑/B-roll/字幕） | 代码渲染视频 |
| 11 | liyupi/ai-promo-video-maker | — | 459 | 一句话 4K 宣传片（节拍剪辑+旁白校验） | 宣传视频 |
| 12 | shuyicc/MathLens | — | 348 | 数学题→Manim 讲解视频全流程 | 数学讲解 |
| 13 | Bomx/super-video-maker-skill | — | 342 | 多供应商视频产线（HeyGen/Seedance/Remotion） | 产线集合 |
| 14 | ApliroAI/manim-video-lab | — | 23 | 生产级 Manim 动画工作流 | 数学动画 |
| 15 | iart-ai/manim-skills | — | 18 | Manim CE 技能（方程/函数/3B1B 风格解说） | 数学动画 |
| 16 | Aaryan-Kapoor/video-production-skill | — | 17 | 教育视频全栈产线（research→QC→archive） | 产线定义 |
| 17 | dxawdc/code-video | — | 11 | 九技术栈代码出视频（Canvas/GLSL/Manim/Blender…） | 代码渲染视频 |
| 18 | jjietay/clayducation | — | 7 | 软 3D 黏土风有声教学视频（吉祥物+脚本双检） | 风格化教学 |
| 19 | Karl-Dai/sketch-video-skill | — | 0 | 手绘科普视频（SRT→白板动画，含可复现 QA） | 白板视频 |
| 20 | Songjun113/video-explainer | — | 0 | 第一性原理→分镜→Manim 机理动画 | 科普解说 |

> 候补：techdou/whiteboard-video（SRT→白板视频，多生图供应商）、
> braindesmond5-boop/claude-explainer-video（按实测语音时间戳做动画对齐，思路新）、
> zhuyansen/awesome-claude-video-skills（180 仓策展+安全分级，找项目先看它）、
> frankxai/awesome-motion-design-agent-skills（104★，GSAP/Motion/Lottie/Rive 策展）。

## 1. 品类地图（443 条实测数据的分布 + 头部项目落位）

innate-feeds 采集的 443 条 skill 按八分类（多标签）分布：

```text
动画工具链   396 ████████████████████████████████████
视觉与插画   114 ███████████▊
视频制作     111 ███████████▏
分镜与脚本    91 █████████▏
科普解说      81 ████████▏
动效设计      82 ████████▎
三维与游戏     44 ████▍
课堂教学      15 ▏▌        ← 明显洼地
```

**Top 20 项目落位**：代码渲染视频（Remotion 系）与解说视频（explainer）占头部；
数学动画（Manim 系）形成独立簇；**课堂教学类只占 3.4%**——做「教」的 skill 远少于
做「动画」的 skill，与 [edu-teachable 报告](./edu-teachable-skills-top20.md)的
「B 类空白」判断互相印证。

## 2. 重点项目细看

### 2.1 hyperframes（81.8k★ / 安装量 1M+）——explainer 的工业标准

- HeyGen 官方；同一仓多个 skill（animation / faceless-explainer / motion-graphics /
  remotion-to-hyperframes）霸榜安装量 top4 中的 4 席。
- 无真人出镜（faceless）解说视频是**教育内容创作者的最大单一场景**。
- 边界：绑 HeyGen 商业服务（积分），开源仓只是组合物与工作流，渲染依赖付费 API。

### 2.2 remotion-dev/skills + claude-remotion-skill——代码渲染双档位

- 官方 skills（6.7k★，723k 安装）：最佳实践、正确 API、渲染管线。
- 第三方 claude-remotion-skill（909★）：面向「一个 prompt 出片」的完整制作流
  （剪辑/B-roll/字幕/声音设计），带成品验收。
- **启示**：官方管「写得对」、第三方管「做得完」——两层分工在 innate 的映射：
  fe-ui 管组件正确，另需一层「页面做得完」的产线技能。

### 2.3 MathLens（348★）——教育动画里最贴「edu」的项目

- 输入一道数学题（图/文）→ 题目分析 → 可视化讲解设计 → 配音脚本 → Manim 成片；
  单条 1-10 分钟视频、成本 ¥0.2-1。
- 关键结构：**教学设计先于动画**（先拆解题步骤、再设计每步的视觉呈现），
  不是「先做动画再配文字」。
- **启示**：edu-animate 域若做纵深，这种「学科垂直 + 全流程 + 成本封顶」的定位
  比通用动画工具更有辨识度。

### 2.4 video-talkcraft——手法库的极致

- 108 张动效配方卡在线画廊（vincentwei1021.github.io/video-talkcraft）——
  每张卡可预览、可复用；SHOTBOOK 分镜本 + 字级人声对齐（对齐的是**实测语音时间戳**，
  非手写时间轴）。
- 三重验收对抗「PPT 感」。
- 与 teachable 报告 §2.3 同一项目——横跨两个 topic，说明「配方卡」是
  动画 skill 里最可迁移的结构资产。

### 2.5 clayducation / sketch-video-skill——风格差异化小样本

- clayducation：软 3D 黏土 + 沉默吉祥物；**两个 agent 分工**（一个写脚本、
  一个在配音前审脚本）——教育内容的质量门禁意识。
- sketch-video-skill：手绘白板风（SRT 字幕→白板动画），含可复现 QA；
  白板风格是教育视频里「认知负荷最低」的形态（common craft 范式）。
- 共同点：星数低但**风格卡位清晰**——在 faceless 大潮下做「有人味」的分支。

### 2.6 code-video——技术栈瑞士军刀

- 九种渲染栈（Canvas/GLSL/Three.js/p5.brush/GSAP/Remotion/Manim/Blender…）
  + 代码配乐 + AI 旁白 + 逐帧审片 + 一键出片。
- 「逐帧审片」= 视频版的截图验收（对应前端 skill 的浏览器检查），验收思想跨介质复现。

## 3. 横向对比

| 维度 | hyperframes | Remotion 系 | Manim 系 | 白板/黏土 | 产线集合 |
|---|---|---|---|---|---|
| 产出形态 | 真人感解说 | 通用动画视频 | 数学/机理动画 | 手绘/定格风 | 按产线定 |
| 教育适配 | 泛知识 | 泛 | **学科最优** | 低认知负荷 | 可编排 |
| 成本模型 | 付费 API | 本地渲染（CPU 重） | 本地渲染（重） | 轻-中 | 混合 |
| 上手门槛 | 低（prompt 出片） | 中（会 React） | 高（懂 Manim API） | 低 | 中 |
| 开源纯度 | 低（绑服务） | **高** | **高** | 高 | 中 |

**结构性观察**：

1. **验收机制正在视频 skill 里普及**（三重验收 / 逐帧审片 / QC 管线）——与前端
   anti-slop 的「真实浏览器检查」完全同构，2026 年 skill 的标配从「知识」变成「知识+验收」。
2. **教育性 ≠ 观赏性**：头部项目全部优化「好看」，「讲得清楚」（教学设计）只有
   MathLens / video-explainer / clayducation 在做且都不大——**edu 与 animation 的
   交叉点恰是洼地**。
3. 官方 skill 的挤压效应明显：GSAP/Remotion/HeyGen 官方入场后，第三方只能做
   「工作流层」（怎么用一个或多个库完成完整产出）。

## 4. 对 innate（edu-animate 域）的策展建议

innate-feeds 的 edu-animate 域已有 443 条索引与八分类，本轮建议：

1. **分类表微调**：把「课堂教学 15 条」的洼地在 UI 上显式标注（「稀缺品类」），
   引导贡献；或在 collector 里加 `pedagogy-first` 标记（先教学设计后动画的项目）。
2. **收录候补**（当前 443 条之外的增量）：Karl-Dai/sketch-video-skill、
   jjietay/clayducation、braindesmond5-boop/claude-explainer-video、
   ApliroAI/manim-video-lab、dxawdc/code-video——slug 若不命中现有领域关键词，
   可扩 `EDU_DOMAIN_KEYWORDS`（如 sketch/claymation/explainer-video）。
3. **安装量旁注**：innate-feeds 已同时展示 stars/license——建议再加「是否绑付费 API」
   字段（hyperframes 类项目易误导），一行 metadata 即可。
4. **排序策略**：域内默认按 stars（已有），可加「安装量/星数比」暴露
   高安装低星的服务型项目。
5. **与 innate-daily 联动**：edu-animate 域的「科普解说视频」分类与
   innate-daily 的可视化 explain 研究（[visual-explain-research.md](./visual-explain-research.md)）
   共享配方：一篇文章的概念图（静态）→ 动画版（Manim/Remotion）的转化路径，
   可作为 docs → 视频内容的实验线。

## 5. 参考链接

- innate-feeds edu-animate 采集实测：<https://github.com/variableway/innate-feeds/blob/main/docs/research/edu-animation-sources.md>
- edu-animate 域设计：<https://github.com/variableway/innate-feeds/blob/main/docs/arch-design/edu-animate-domain.md>
- hyperframes：<https://github.com/heygen-com/hyperframes>
- remotion 官方 skills：<https://github.com/remotion-dev/skills>
- MathLens：<https://github.com/shuyicc/MathLens>
- video-talkcraft（108 配方卡画廊）：<https://github.com/Vincentwei1021/video-talkcraft>
- OpenMontage：<https://github.com/OpenMontageInc/OpenMontage>
- awesome-claude-video-skills：<https://github.com/zhuyansen/awesome-claude-video-skills>
