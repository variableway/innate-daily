---
title: "调研：前端设计 SKILL Top 10 项目分析"
slug: top10-design-skills
date: 2026-11-10
author: Innate Team
category: research
tags: [research, top10, design-skill, agent-skill, comparison]
status: draft
excerpt: "issue #12 ②：前端设计相关 skill 的 Top 10 项目逐个分析（机制、可借鉴点、边界），横向对比表，以及对 innate-fe skills-kit 的启示。"
---

# 前端设计 SKILL Top 10 项目分析

> 检索方法见 [feeds-topic-search.md](./feeds-topic-search.md)；
> 星数与活跃度为 2026-11 检索快照。
> 入选标准：①星数与近期活跃（近 90 天有 push）②代表性机制（不是纯合集）③与 innate-fe 场景相关。

## 0. 总榜

| # | 项目 | 星数 | 一句话定位 | 类型 |
|---|---|---|---|---|
| 1 | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | 112k | 反 AI-slop 网站审美，带浏览器 checker 与 finish gate | 审美 + 验收闭环 |
| 2 | [oil-oil/oil-ui](https://github.com/oil-oil/oil-ui) | 3k | 设计判断力 skill：方向探索、对比页、真实截图打磨 | 流程编排 |
| 3 | [Owl-Listener/designer-skills](https://github.com/Owl-Listener/designer-skills) | 3.3k | 273 个设计技能 / 33 插件的市场（研究→系统→UI→交互→交付） | 技能合集 |
| 4 | [wilwaldon/Claude-Code-Frontend-Design-Toolkit](https://github.com/wilwaldon/Claude-Code-Frontend-Design-Toolkit) | 1.3k | 70+ 工具的策展目录（skills/MCP/CLAUDE.md tricks） | 精选清单 |
| 5 | [Anionex/agent-vision-toolkit](https://github.com/Anionex/agent-vision-toolkit) | 1.3k | 给纯文本模型「眼睛」：截图问答、UI 还原、GUI 自动化 | 视觉工具箱 |
| 6 | [superdesigndev/superdesign-skill](https://github.com/superdesigndev/superdesign-skill) | 969 | 产品设计 agent skill：读代码上下文、无限画布迭代 | 商业产品 skill |
| 7 | [educlopez/ui-craft](https://github.com/educlopez/ui-craft) | 442 | 设计工程系统：10 项验收栏 + 可评分 critique（0-100） | 验收 + 评分 |
| 8 | [Ilm-Alan/frontend-design](https://github.com/Ilm-Alan/frontend-design) | 163 | 8 个美学锚点：调色/字体/纹理锁进 CSS token | 轻量方向卡 |
| 9 | [Moh4696/open-3d-skills](https://github.com/Moh4696/open-3d-skills) | 318 | 3D / 动效网站的 8 个技能（three.js 场景、滚动电影、60fps 录制） | 专项技能 |
| 10 | [anthropics/…/frontend-design](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/frontend-design) | 官方 | Anthropic 官方设计 skill：两遍法（plan→review→build→critique） | 官方基线 |

> 合集类（awesome-claude-code-skills 等）与平台类（FrontAgent）只作背景不入榜；
> ux-skill（Laith0003，152 规则离线 linter）、cinematic-ui、design-taste（合并味）作为候补在 §3 提及。

## 1. 逐个分析

### 1.1 taste-skill（112k★）——审美规则 + 硬门禁的极端形态

- **机制**：SKILL.md 定「九条家规」（一屏一 section、左右等边、真实照片、
  真实产品 UI、hover 微动效、每页 1-2 个「dealt moment」…）；
  `references/` 30+ 份细则（layout-v4、copy、photos、motion、sections…）；
  `scripts/` 可执行检查（gate.mjs finish gate、consistency、copy-lint、perf）。
- **关键设计**：用 **Stop hook** 在会话收尾强制跑 gate——「没过 checker 不算完成」写进了宿主生命周期。
- **边界**：强绑「公司官网/落地页」品类（page-type: place/product/service/software），
  对后台/ToB 密度型页面不适配；规则量巨大，维护成本高。
- **可借鉴**：①验收必须机器可执行（gate 脚本 + hook 时机）②「品类决定一切」的
  分型表（innate-fe 的 scene-specs 同构）③AI 生成页面的「tells 清单」。

### 1.2 oil-ui（3k★，中文）——把设计流程做成协议

- **机制**：一条主流程「产品事实 → 主角/动作 → 素材/概念 → 灰度结构 → 实现 → 真实画面评审」，
  每步有门槛，没过不往后走；`references/` 按需加载（18 份）而非通读。
- **关键设计**：
  - **默认只推荐一个方向、全流程只确认一次**（防过度提问）；
  - 显式要求比较时才开「多方向对比页」（Python 生成，桌面/移动切换、键盘浏览、Select 回贴）；
  - **独立评审者协议**：主 agent 只交接材料，评审者带隔离上下文看图打分；
  - 范围分诊表（小改动 / 新界面 / 存量优化 / 截图还原 / 只读评审），小改动直接改不走全流程。
- **边界**：核心是「设计判断」不是组件库；交互/表单/弹窗规则划在 skill 外（项目自己的规范优先）。
- **可借鉴**：①范围分诊表（现有 fe-* 缺「小改动直达」通道）②灰度结构先行
  （先线框后排视觉）③「真实画面评审」= 没看截图不算验收。

### 1.3 designer-skills（3.3k★）——设计全工序的技能市场

- 273 skills / 76 commands / 33 plugins，按设计阶段分五集合（research → systems → UI → interaction → delivery），
  有 INDEX.md「按处境查技能」+ start-here 路由命令。
- **可借鉴**：「按处境路由」与 innate-fe 的 skill-routing.md 同构；
  差别在它按**设计阶段**切，innate-fe 按**工程轨道**（starter/feature/ui/verify/merge）切。

### 1.4 Claude-Code-Frontend-Design-Toolkit（1.3k★）——策展目录

- 70+ 工具按意图分 10 节（design skills / theming / animation / UX intelligence /
  design-to-code / testing-eyes / docs-context / framework / deploy / stacks）。
- **关键情报**：它把 **Anthropic 官方 frontend-design** 列为「首先安装」的基线——
  官方 skill 的定位是「先选美学方向再写代码，堵默认 Inter+紫渐变+圆角卡」。

### 1.5 agent-vision-toolkit（1.3k★）——视觉能力的 harness 化

- 论点：**视觉能力可以住在 harness 而不是模型里**。CLI 工具（图片问答 / 长截图 OCR /
  UI 还原 / GUI 自动化）+ skill（教 agent 何时用哪个）+ 可选代理无缝集成。
- **可借鉴**：fe-verify 若加「截图验收」，本质就是给 innate-fe 的 agent 装眼睛；
  该项目的「工具 CLI + 使用时机 skill」两层结构可直接模仿。

### 1.6 superdesign-skill（969★）——商业产品的 skill 化

- 读代码上下文 → 采风格参考 → 无限画布生成/迭代 UI/幻灯片/图形；跨会话记忆
  （项目、草稿、提取组件、预算化的源上下文包）。
- **可借鉴**：跨会话设计上下文（对应 innate-fe 场景 = `DESIGN.md` / 项目级方向卡持久化）。

### 1.7 ui-craft（442★）——可评分的设计验收

- 四级梯子（Ask → Direct → Persist → Enforce）：装完即生效 → 定向命令 →
  `/brief` `/tokens` 持久上下文 → `/finalize` + review agents + CI 门禁 + 确定性 0-100 评分。
- critique = Nielsen 10 启发式 × 6 设计定律 × 5 persona 走查，每条发现带业务影响标签。
- **可借鉴**：**梯子分级**正是 innate-fe 的现状映射——已有 rung 0/1（skills 体系），
  缺 rung 2（设计上下文持久化）和 rung 3（可评分门禁）。

### 1.8 Ilm-Alan/frontend-design（163★）——锚点即 token

- 8 个美学锚点，每个把 palette/typography/texture **锁到具体 CSS token**，选锚点=承诺 token 组合。
- 轻到只有一个 SKILL.md；证明「方向卡」不需要重工程。
- **可借鉴**：与 `@innate/ui` 的 themes/*.css（data-theme variant）天然对齐——
  一个锚点 ≈ 一份 theme preset + 一段用法约定。

### 1.9 open-3d-skills（318★）——专项技能包样板

- 3D/动效站八个技能：three.js 场景从代码生成、滚动电影、透明视频、光标绑定、
  分解视图、AI 动效资产、浏览器检查、60fps 录制。
- **可借鉴**：innate-fe 的 edu-animate 方向如果要 skill 化，这就是「一个专项一个技能包」的样板。

### 1.10 Anthropic 官方 frontend-design——官方基线

- **两遍法**：先出紧凑 token 方案（4-6 个命名色值 / 字体角色 / ASCII 线框 / 原则），
  **对着 brief 审一遍自己的方案**（「如果任何部分像我对任意类似页面会产出的默认——改掉它」），
  确认相对独特后才写代码；写完自我批评（截图回看、Chanel 减法）。
- **AI 生成页五个 tells**（奶油底+赤陶强调、近黑底+酸绿、报纸风 hairline、
  SaaS 圆角卡套装、模板 chrome：全大写 eyebrow / 中点 meta / `→` 后缀）——
  这份清单本身就是最可复用的 anti-slop 校准资产。
- **可借鉴**：两遍法可以低成本并入 fe-feature 工作流（写页前先出方向卡并自审）。

## 2. 横向对比

| 维度 | taste-skill | oil-ui | 官方 fe-design | ui-craft | superdesign | Ilm-Alan |
|---|---|---|---|---|---|---|
| 核心产出 | 上线级官网 | 设计判断 + 对比页 | 独特方向 + 代码 | 评分 + 门禁 | 无限画布草稿 | 8 张方向卡 |
| 验收闭环 | **gate 脚本 + Stop hook**（最强） | 独立评审 + 截图协议 | 自审两遍法 | 0-100 确定性评分 | 人工看画布 | 无 |
| 形态 | skill + scripts + refs | skill + refs + py/mjs 工具 | 纯 prompt skill | skill + CLI + MCP | skill + 商业 CLI | 纯 prompt |
| 对 ToB 后台 | 弱（面向官网） | 中（含后台） | 中 | **强**（dashboard 例子） | 中 | 弱 |
| 中文生态 | 否 | **是** | 否 | 否 | 否 | 否 |
| 持久化设计上下文 | 无（每次重来） | `.oil-ui` 工作区 | 建议记笔记 | `/brief` `/tokens` `/remember` | 跨会话记忆 | 无 |

**共性**（>1 个头部项目同时具备）：

1. **方向先行**：写代码前先定视觉方向并让用户确认一次（官方、oil-ui、Ilm-Alan、taste-skill）。
2. **真实画面验收**：截图/浏览器检查，不看图不算完（taste-skill、oil-ui、ui-craft、vision-toolkit）。
3. **按需加载参考**：references 拆细，用时才读（taste-skill 30+、oil-ui 18 份）。
4. **范围分诊**：小改动跳过重流程（oil-ui 最明确）。
5. **持久化设计上下文**：DESIGN.md / brief / tokens / 跨会话记忆（ui-craft、superdesign、toolkit 提倡）。

## 3. 对 innate-fe skills-kit 的启示

### 3.1 现状定位

innate-fe 的 fe-* 体系解决的是**结构正确性**（轨道判定、分层依赖、spec 对照、verify 闭环），
在「设计判断力」维度上是空白——恰好是这批项目的共同主战场。对照 ui-craft 的梯子：

| 梯 | 业界 | innate-fe 现状 |
|---|---|---|
| 0 Ask | 装完即好 | ✅ fe-overview 基座 + 场景表 |
| 1 Direct | /craft 定向 | ✅ fe-feature / fe-ui / fe-starter |
| 2 Persist | /brief /tokens | ❌ 无项目级设计上下文文件 |
| 3 Enforce | CI 门禁 + 评分 | ⚠️ fe-verify 只验结构，不验视觉 |

### 3.2 建议吸收的五个机制（按性价比排序）

1. **anti-slop 清单进技能**：把官方 5 tells + taste-skill 家规摘译成
   `fe-feature/references/` 的一节（中文，含「何时豁免」）；成本最低。
2. **两遍法进工作流**：fe-feature 做「新页面/改版」时加一步「先出方向卡（色/字/布局/原则）
   → 对 brief 自审 → 再写码」；复用现有 checklist 风格即可。
3. **截图验收**：fe-verify 增加「视觉检查」档位（可选）：dev server + 截图 + 三态/空态核对；
   参考 agent-vision-toolkit 的「工具 + 时机」分层。需先解决 headless 浏览器依赖。
4. **设计上下文持久化**：项目根 `DESIGN.md`（方向、token 语义、参考站、禁止项），
   fe-overview §7 事实源纪律加一行；对应 oil-ui 的设计说明 / ui-craft 的 /brief。
5. **范围分诊表**：skills 路由补「小改动直达」行（改文案/调数量/删元素不走全流程），
   减少技能体系的执行摩擦。

### 3.3 明确不抄的

- taste-skill 的品类分型全表与 30+ 细则——维护成本高，且 innate-fe 主战场是 ToB 后台不是官网；
- Stop hook 强门禁——宿主绑定太深（Claude Code 专属），innate-fe 是多 agent 环境（Cursor/Kimi/Claude）；
- 商业化对比页生成器（oil-ui Pro / superdesign）——先手写 HTML 对比页验证需求。

## 4. 参考链接

- Anthropic 官方 skill 源码：
  <https://github.com/anthropics/claude-plugins-official/tree/main/plugins/frontend-design>
- taste-skill gate 机制：<https://github.com/Leonxlnx/taste-skill>（skills/taste-skill/scripts/gate.mjs）
- oil-ui 主流程：<https://github.com/oil-oil/oil-ui>（SKILL.md 主流程节）
- ui-craft 梯子：<https://github.com/educlopez/ui-craft>
- agent-vision-toolkit：<https://github.com/Anionex/agent-vision-toolkit>
- vercel-labs skills 安装器（`npx skills add` 生态）：<https://github.com/vercel-labs/skills>
