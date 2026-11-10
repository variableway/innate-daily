---
title: "调研：EDU Teachable Skill Top 20"
slug: edu-teachable-skills-top20
date: 2026-11-10
author: Innate Team
category: research
tags: [research, edu, teachable, agent-skill, top20, issue-12]
status: draft
excerpt: "「可教学技能」方向的 Top 20 项目：教 agent 去教（课程/教案/教学法）、教 agent 学会教学对象（工具链技能）、以及把学习本身做成 skill（费曼/苏格拉底/记忆）三类，含机制分析与对 innate 的启示。"
---

# EDU Teachable Skill Top 20

> 「Teachable Skill」取双关：①**可教的技能**——把知识打包成 agent skill（教 agent 某领域正确做法）；
> ②**教得会的技能**——让 agent 具备教学能力（出课、辅导、出题）。
> 检索词与去重方法见 [feeds-topic-search.md](./feeds-topic-search.md) §3；
> 星数为 2026-11 快照，`pushed` 为最后推送日。

## 0. 总榜

| # | 项目 | 星数 | 活跃 | 一句话定位 | 类别 |
|---|---|---|---|---|---|
| 1 | [OpenMontageInc/OpenMontage](https://github.com/OpenMontageInc/OpenMontage) | 79k | 🟢 11-09 | 首个开源 agentic 视频生产系统：12 产线 / 100+ 工具 / 700+ skill 文件 | 教对象·全集型 |
| 2 | [kepano/obsidian-skills](https://github.com/kepano/obsidian-skills) | 51k | 🟢 | 官方技能：教 agent 用 Obsidian CLI 与开放格式（MD/Bases/Canvas） | 教对象·官方 |
| 3 | [greensock/gsap-skills](https://github.com/greensock/gsap-skills) | 18k | 🟢 | GSAP 官方 AI 技能：正确用法/常见动画模式/插件 | 教对象·官方 |
| 4 | [0xsline/OpenChatCut](https://github.com/0xsline/OpenChatCut) | 3k | 🟢 | 本地优先对话式 AI 剪辑：多轨时间线 + Skills + MCP + Remotion | 教对象·工具链 |
| 5 | [Vincentwei1021/video-talkcraft](https://github.com/Vincentwei1021/video-talkcraft) | 2.2k | 🟢 11-09 | 口播视频 skill：字级配音同步 + 108 动效配方卡 + 反 PPT 镜头系统 + 三重验收 | 教对象·配方卡 |
| 6 | [morganlinton/BeautifulRust](https://github.com/morganlinton/BeautifulRust) | 1.8k | 🟢 | 教 agent 写/审/移植地道 Rust + 实测过的 clippy 配置 | 教对象·代码风格 |
| 7 | [zhuyansen/awesome-claude-video-skills](https://github.com/zhuyansen/awesome-claude-video-skills) | 1.8k | 🟢 11-09 | 视频类 skill 策展：180 仓按类型分，逐个安全分级（中/英） | 策展清单 |
| 8 | [iart-ai/motion-skills](https://github.com/iart-ai/motion-skills) | 1.3k | 🟡 10-25 | 50 个动效/动画/视频 skill，14 个可安装包（动字/数据可视化/解说/Manim） | 教对象·包管理 |
| 9 | [adithya-s-k/manim_skill](https://github.com/adithya-s-k/manim_skill) | 1.3k | ⚪ 01 月 | Manim agent skills：3Blue1Brown 风格动画 | 教对象·单工具 |
| 10 | [new-silvermoon/awesome-android-agent-skills](https://github.com/new-silvermoon/awesome-android-agent-skills) | 1k | 🟢 | 标准化教 agent 现代 Android 开发（Kotlin/Compose） | 教对象·平台 |
| 11 | [haidrrrry/claude-remotion-skill](https://github.com/haidrrrry/claude-remotion-skill) | 909 | 🟢 | 教 Claude 用 Remotion 做动效视频：剪辑/B-roll/字幕/声音设计 | 教对象·单工具 |
| 12 | [sandroandric/AgentHandover](https://github.com/sandroandric/AgentHandover) | 732 | 🟢 | 观察你的工作、自改进技能、教会 agent「不用你说也会做」 | 教学法·观察学习 |
| 13 | [marckohlbrugge/37signals-skills](https://github.com/marckohlbrugge/37signals-skills) | 796 | 🟢 | 从 DHH 代码评审里萃取的「37signals 方式写 Rails」 | 教对象·风格萃取 |
| 14 | [remotion-dev/skills](https://github.com/remotion-dev/skills) | 6.7k | 🟢 | Remotion 官方技能仓（skills.sh 安装量 723k 的 remotion-best-practices 所在） | 教对象·官方 |
| 15 | [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) | 81.8k | 🟢 11-10 | HeyGen 视频 skill 全家桶（安装量 top：animation/explainer/motion-graphics） | 教对象·全家桶 |
| 16 | [liyupi/ai-promo-video-maker](https://github.com/liyupi/ai-promo-video-maker) | 459 | 🟢 | 一句话产 4K 产品宣传片：调研→样图→节拍剪辑→旁白→审图 | 教对象·流水线 |
| 17 | [shuyicc/MathLens](https://github.com/shuyicc/MathLens) | 348 | 🟢 | 数学题→Manim 讲解视频全流程（分析/可视化/配音/成片，单条 <1 元） | 教学法·题目讲解 |
| 18 | [EtherealMingo/university-teacher-skills](https://github.com/EtherealMingo/university-teacher-skills) | 20 | 🟢 10-21 | 高校教师 22 子技能（教案/课件/出题/成绩分析）+ 中文 office 产出层 | 教学法·教师全景 |
| 19 | [koukekoukej-glitch/feynman-tutor](https://github.com/koukekoukej-glitch/feynman-tutor) | 36 | ⚪ 05 月 | 费曼技巧反转：让**你**教 AI，暴露自己理解漏洞 | 教学法·反转 |
| 20 | [yugash007/edu-agent-skills](https://github.com/yugash007/edu-agent-skills) | 10 | ⚪ 05 月 | 把 agent 变成苏格拉底式导师/主动学习同伴（一条命令） | 教学法·苏格拉底 |

> 候补：Bomx/super-video-maker-skill（342★，HeyGen 头像+Seedance+Remotion 多供应商）、
> Karl-Dai/sketch-video-skill（手绘科普视频）、Aaryan-Kapoor/video-production-skill（17★，
> 全栈教育视频产线：research→storyboard→narration→render→QC→archive，流程定义完整）、
> xdelin/awesome-agent4edu（教育 AI agent 大合集）、jjietay/clayducation（软 3D 黏土教学视频）。

## 1. 三类「teachable」的划分

```text
A 教对象（把领域知识打包给 agent）     —— 产能主力，星数最高
   A1 官方技能（kepano/gsap/remotion/heygen）：厂商自己教，最权威
   A2 风格萃取（BeautifulRust/37signals）：从人审代码里蒸馏品味
   A3 配方卡（video-talkcraft 108 张动效卡）：把「手法」结构化成可检索资产
B 教学法（让 agent 会教人）           —— 数量少、星数低，但方向独特
   B1 全景教师包（university-teacher-skills 22 技能）
   B2 反转学习（feynman-tutor：人教 AI）
   B3 对话式引导（edu-agent-skills 苏格拉底）
C 教学内容产线（agent 做教学材料）     —— 与 EDU Animation 交集最大
   MathLens（题目→视频）、ai-promo-video-maker（产品→宣传片）
```

**格局判断**：A 类是红海（官方入场后第三方很难赢）；B 类几乎空白（star 都很低但
方向没人占）；C 类正在爆发（视频渲染 skill 化是 2026 最快增长的品类之一）。

## 2. 重点项目细看

### 2.1 OpenMontage（79k★）——「700+ skill 文件」的超级集合体

- 12 条生产管线、100+ 工具、700+ agent skill 与制作知识文件；GitHub Trending Repo of the Day。
- 关键机制：**管线（pipeline）作为一等公民**——不是给 agent 一堆零散 skill，
  而是按产线组织（如「YouTube 短视频产线」「播客产线」），skill 是产线里的工序。
- 对 innate 的启示：skills-kit 的「路由表」思路正确，但可借鉴**按产出物组织产线**
  （如「一篇文章的产线」「一个 demo 页的产线」），而不是只按「任务类型」路由。

### 2.2 官方技能四件套（kepano / gsap / remotion / heygen）

| 共性 | 说明 |
|---|---|
| 厂商自己写 | 用法权威、跟版本更新；第三方抄不动 |
| 聚焦「正确使用」 | API 正确性 + 常见模式 + 反模式，不教审美 |
| 事实源链接 | 链回官方文档，不复制内容（与 innate fe-overview §7 同构） |

- heygen/hyperframes 安装量断层第一（1M+），证明「视频生成 skill」是当前最大需求入口。
- **启示**：@innate/ui 已有 fe-ui 这种「库官方技能」形态；若 innate 出对外库，
  官方 skill 应随库同仓维护（remotion-dev/skills 模式），而不是分离仓库。

### 2.3 video-talkcraft（2.2k★）——配方卡范式

- 108 张动效配方卡 = **手法库可检索化**；SHOTBOOK 分镜结构；三重验收。
- 「反 PPT 镜头系统」是对 AI 生成视频最大病（幻灯片感）的直接对抗——与前端
  anti-slop 同一思想在视频领域的映射。
- **启示**：innate 的 scene-specs（7 场景）本质就是「布局配方卡」；可同样做
  「动效配方卡」「配色配方卡」，每张卡 = 意图 + 组成 + 何用/何时不用的三段式。

### 2.4 AgentHandover（732★）——观察即教学

- 观察用户实际操作 → 自动沉淀技能 → 自改进。最接近「teachable」字面义：
  agent 被教会的成本趋近于「你正常干活」。
- **启示**：与 oil-ui 的「跨会话记忆」、superdesign 的「预算化上下文包」同一方向——
  技能的终极形态是**从本项目历史里长出来的**，不是写死分发的。

### 2.5 university-teacher-skills（20★）——教师全景包

- 22 子技能覆盖教学/科研/指导/行政/考核 + 自建中文 office 产出层
  （Word 原生批注/课件/成绩分析）；有「给老师的第一课」新手文档。
- 星数低但完成度高、中文生态稀缺。**启示**：面向「职业角色」的技能包
  （不是面向技术领域）是被低估的品类；innate-daily 若做「写作教师包」可参考其
  「22 技能 + 产出层 + 新手第一课」三层结构。

### 2.6 feynman-tutor（36★）——反转教学

- 让用户教 AI，AI 装不懂追问——用户暴露自己知识漏洞。学习科学依据最扎实的一个。
- **启示**：innate-daily 的教程可加「反向模式」：读者向 AI 解释刚学的概念，
  AI 追问边界情况——比测验题更轻、比复述更有效。

## 3. 横向对比

| 维度 | 官方技能 | 风格萃取 | 配方卡 | 教学法 | 产线集合 |
|---|---|---|---|---|---|
| 代表 | gsap-skills | BeautifulRust | video-talkcraft | feynman-tutor | OpenMontage |
| 星数带 | 18k–81k | 0.7k–1.8k | 2.2k | 10–36 | 79k |
| 知识来源 | 厂商文档 | 人工评审数据 | 手法枚举 | 学习科学 | 工序编排 |
| 维护成本 | 随版本走 | 低（一次性萃取） | 中（持续补卡） | 低 | 高 |
| 可复制作法 | ❌（只有官方能做） | ✅ | ✅ | ✅ | ⚠️（工程量大） |

**共性问题**：全部缺「学习效果」度量——没有项目验证「用了这个 skill 学得更好/教得更好」，
最多验证「产出物更好看」。教学有效性还是空白（对应 ui-craft 的 0-100 评分思路在
教育侧没有等价物）。

## 4. 对 innate 的启示（按优先级）

1. **配方卡资产化**（借 video-talkcraft）：把 scene-specs 的三段式推广到
   动效/配色/图表等新配方类型；每张卡可独立安装/引用。
2. **教育内容产线**（借 OpenMontage 管线思维）：innate-daily 的教程生产已有
   「可执行教程」方案（issue #9），可再组织成显式产线：
   选题→大纲→草稿→可视化→可执行块→校对，每道工序一个技能。
3. **反向学习模式**（借 feynman-tutor）：低成本试验，一篇教程加一个
   「你来解释」环节即可验证。
4. **官方技能同仓**（借 remotion-dev/skills）：@innate/ui 的 fe-ui 已是雏形；
   未来对外库的技能放库仓内 `skills/` 目录。
5. **不做**：通用教师包（university-teacher-skills 已占位且非 innate 场景）、
   视频全家桶（hyperframes/OpenMontage 断层领先）。

## 5. 参考链接

- OpenMontage：<https://github.com/OpenMontageInc/OpenMontage>
- video-talkcraft：<https://github.com/Vincentwei1021/video-talkcraft>
- AgentHandover：<https://github.com/sandroandric/AgentHandover>
- feynman-tutor：<https://github.com/koukekoukej-glitch/feynman-tutor>
- university-teacher-skills：<https://github.com/EtherealMingo/university-teacher-skills>
- awesome-claude-video-skills（安全分级策展）：<https://github.com/zhuyansen/awesome-claude-video-skills>
