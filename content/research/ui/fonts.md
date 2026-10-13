# 字体调研：阅读向的英文 / 中文 / 等宽字体选型与接入方法

> 调研日期：2026-10-13
> 适用对象：`apps/daily-work`（Markdown 阅读为主的静态站，Vite + React + Tailwind 4，GitHub Pages 部署，字体走 fontsource npm 包自托管）
> 结论性质：选型依据 + 修改方法，尚未落地到 `src/globals.css`。

## TL;DR

| 层 | 推荐 | 理由 |
| --- | --- | --- |
| UI 骨架（按钮/导航/列表） | Inter（现状，保留）或 Geist | 屏幕优化、中性，UI 层不需要"性格" |
| 中文+英文正文 | **Source Serif 4 + Noto Serif SC**（阅读优先）或 Inter + Noto Sans SC（工具感） | 长文阅读衬线在高清屏上体验更好；中文思源宋体与之同源配套 |
| 代码块 | **JetBrains Mono** | 综合可读性第一梯队，OFL 开源，fontsource 有 variable 包，一行命令接入 |
| 中文注释代码块（可选进阶） | Sarasa Mono SC | 中英 1:2 等宽对齐的唯一成熟方案 |

最小改动路径：只把代码块从系统等宽栈换成 JetBrains Mono（改 2 处 + 装 1 个包），正文中文改用 Noto Sans SC webfont 统一三端观感。详见「修改方法」。

---

## 一、现状诊断

当前字体链路（`apps/daily-work`）：

- `src/globals.css:1` — `@import "@fontsource-variable/inter"`，自托管 Inter 可变字体（仅拉丁字符集）。
- `src/globals.css:86-89` — `@theme inline` 里 `--font-sans: "Inter Variable", "PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif`。
- `src/globals.css:182` — 代码块 `font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`，纯系统栈。
- `src/main.tsx:7-8` — 先 `@innate/ui/globals.css` 再本应用 `globals.css`，应用层同名 token 覆盖 shell 默认值（`packages/ui/src/globals.css:124-125` 的 `--font-sans`、`:196` 的 body 13.5px 都可被应用层压过）。

「不好看」的根因，按影响排序：

1. **中英混排不协调（最主要）**。拉丁走 Inter，中文走系统回退：macOS 是苹方、Windows 是微软雅黑。Inter 的 x-height、字重、灰度与雅黑差异明显，一句话里中英文"两个人写的"。Windows 上雅黑小字号 hinting 弱、发灰发虚，雪上加霜。
2. **代码块字体不可控**。系统栈意味着 Mac 上 SF Mono / Menlo、Windows 上 Consolas，观感割裂且 Consolas 无连字、中文注释回退到雅黑导致等宽对齐完全失效。
3. **正文工具感偏重**。Inter 是 UI 字体，长文阅读缺乏节奏；15px（0.9375rem）+ 行高 1.75 对中文尚可，但字型本身没有"读书感"。

核心判断：**这是一个阅读产品，字体预算应该花在正文与代码上，UI 骨架维持 Inter 即可。**

---

## 二、英文阅读字体 Top 10

选型标准：屏幕可读性（x-height、字重轴、hinting）、开源可自托管（优先 OFL）、fontsource 可直接装、长文阅读口碑。衬线/无衬线混合排名，各自标注。

| # | 字体 | 类型 | 许可 | 接入（fontsource，均已验证存在） | 一句话点评 |
| --- | --- | --- | --- | --- | --- |
| 1 | Inter | 无衬线 | OFL | `@fontsource-variable/inter`（现状已装） | UI 字体事实标准；正文长读偏"工具感"，保留在 UI 层最合适 |
| 2 | Geist | 无衬线 | OFL | `@fontsource-variable/geist` | Vercel 出品，比 Inter 略圆润现代，几何+人文混合；整套（Geist/Mono）气质统一 |
| 3 | Source Serif 4 | 衬线 | OFL | `@fontsource-variable/source-serif-4` | Adobe 为屏幕设计的过渡衬线，正文阅读首选之一；与思源宋体同门（Source Han 家族） |
| 4 | Literata | 衬线 | OFL | `@fontsource-variable/literata` | Google Play Books 内置阅读字体，专为长篇电子书设计，字重/光学尺寸轴全 |
| 5 | Lora | 衬线 | OFL | `@fontsource-variable/lora` | 温和的过渡衬线，博客正文经典款，中文圈"洛天依式文艺站"常用 |
| 6 | Lexend | 无衬线 | OFL | `@fontsource-variable/lexend` | 以"阅读流畅度"研究协议开发（源自 Wendy Chouji 的 readability 项目），无衬线里最"为读而设计" |
| 7 | IBM Plex Sans | 无衬线 | OFL | `@fontsource-variable/ibm-plex-sans` | 人文主义无衬线，辨识度高，比 Inter 有温度 |
| 8 | Source Sans 3 | 无衬线 | OFL | `@fontsource-variable/source-sans-3` | Adobe 屏幕无衬线，与 Source Serif 4 成对出现，做"UI 无衬线 + 正文衬线"组合很顺 |
| 9 | Figtree | 无衬线 | OFL | `@fontsource-variable/figtree` | 圆润现代，气质友好，适合"轻松笔记"类产品 |
| 10 | Open Sans | 无衬线 | Apache 2.0 | `@fontsource-variable/open-sans` | 十年验证的网页正文标准，中性偏宽，无聊但永不出错 |

遗珠：Public Sans（美国政府用字，`@fontsource-variable/public-sans`）、Merriweather、Charter、Newsreader；系统兜底衬线 `Georgia, "Times New Roman", serif` 零成本可用。

---

## 三、中文字体 Top 10

中文 webfont 的第一约束是**体积**：完整中文字体 5–20MB，必须走 unicode-range 子集分包（浏览器只下载页面实际用到的分片，单次访问通常 < 1MB）。思源系在 fontsource 有官方分包；大厂系统字体（MiSans 等）许可免费商用但非 OFL，需自行子集化或走社区 CDN。排名以「屏幕阅读可读性 + 可接入性」综合。

| # | 字体 | 类型 | 许可 | 接入方式 | 一句话点评 |
| --- | --- | --- | --- | --- | --- |
| 1 | 思源黑体 Noto Sans SC | 黑体 | OFL | `@fontsource-variable/noto-sans-sc`（官方分包，已验证 5.3.1） | 开源中文黑体基准，7 字重/可变轴，三端渲染一致性的"兜底解" |
| 2 | MiSans | 黑体 | 免费商用（非 OFL） | 官网下载 + [中文网字计划](https://chinese-font.netlify.app/zh-cn) / cn-font-split 自行子集化 | 小米 HyperOS 字体，字重 20+，中宫放松、灰度均匀，现代感最强的一档 |
| 3 | HarmonyOS Sans SC | 黑体 | 免费商用（非 OFL） | 同上，需自行子集化 | 华为系 UI 字体，笔形圆润、小字号清晰，适合搭配 Geist/Figtree |
| 4 | 思源宋体 Noto Serif SC | 宋体 | OFL | `@fontsource-variable/noto-serif-sc`（官方分包，已验证 5.3.1） | 长文阅读衬线首选；与 Source Serif 4 同门，中西混排最协调的组合 |
| 5 | 霞鹜文楷 LXGW WenKai（含 Screen 屏幕阅读版） | 楷体 | OFL | `@fontsource/lxgw-wenkai`（已验证）；Screen 版走 [lxgw-wenkai-screen-webfont](https://www.jsdelivr.com/package/npm/lxgw-wenkai-screen-webfont) 社区包 | 改自 Fontworks Klee One，"读书感"最强；Screen 版专为低分辨率屏调校，正文文艺气质拉满 |
| 6 | 霞鹜新晰黑 LXGW Neo XiHei | 黑体 | OFL | [GitHub Releases](https://github.com/lxgw/LxgwNeoXiHei) + 自行子集化 | 新一代黑体，笔画清爽、中宫适中，屏幕小字号表现好 |
| 7 | 阿里巴巴普惠体 3.0 | 黑体 | 免费商用 | 官网下载 + 自行子集化 | 字重全、商务中性，正文 UI 通吃 |
| 8 | OPPO Sans | 黑体 | 免费商用 | 官网下载 + 自行子集化 | 简洁现代，笔画收得干净 |
| 9 | HONOR Sans / vivo Sans | 黑体 | 免费商用 | 官网下载 + 自行子集化 | 大厂系统字体补充选项，风格与 MiSans/HarmonyOS 同代 |
| 10 | 得意黑 Smiley Sans | 斜体黑体 | OFL | [GitHub Releases](https://github.com/atelier-anchor/smiley-sans) | 6° 倾斜的窄斜黑体，**只适合标题/强调/封面，不要用于正文** |

选型提示：

- 「工具/文档站」气质 → 思源黑体、MiSans；「读书/笔记」气质 → 思源宋体、霞鹜文楷。
- 不想引入任何中文字体文件也有零成本方案：精修系统回退栈（见修改方法·方案 A），观感上限受制于用户系统。
- 需要自行子集化时，用 [cn-font-split](https://chinese-font.netlify.app/zh-cn)（中文网字计划）把 ttf 切成 unicode-range 分包，产出与 fontsource 同构的 CSS + woff2。

---

## 四、等宽（Mono）字体 Top 10

选型标准：小字号可读性（0l/0O/1lI 区分度）、连字与 Nerd Font 生态、中文注释回退时的兼容性、开源许可。**注意：等宽字体几乎都不含中文字形**，中文注释会回退到栈里下一个中文字体；唯一例外是 Sarasa（中英 1:2 严格等宽）。

| # | 字体 | 许可 | 接入方式 | 一句话点评 |
| --- | --- | --- | --- | --- |
| 1 | JetBrains Mono | OFL | `@fontsource-variable/jetbrains-mono`（已验证） | 综合首选：x-height 大、9° 切角提高形近字区分度、连字克制，2025 各横评常年第一梯队 |
| 2 | Geist Mono | OFL | `@fontsource/geist-mono`（已验证） | Vercel 出品，干净现代，与 Geist Sans 气质统一；风格最接近 JB Mono 的替代品 |
| 3 | Maple Mono | OFL | [GitHub Releases](https://github.com/subframe7536/maple-font)（不在 fontsource；有 CN/NF/Pro 变体） | 圆润人气王，官方即出 Nerd Font 与中文优化变体（Maple Mono NF CN 自带回退），近两年社区口碑最热的 coding font |
| 4 | Fira Code | OFL | `@fontsource-variable/fira-code`（已验证） | 连字鼻祖，字形经典耐看，生态最广 |
| 5 | IBM Plex Mono | OFL | `@fontsource/ibm-plex-mono`（静态字重包，已验证） | 人文等宽，有衬线感细节，辨识度高 |
| 6 | Source Code Pro | OFL | `@fontsource-variable/source-code-pro`（已验证） | Adobe 老牌经典，字形保守但久看不累，社区盲测常胜 |
| 7 | Cascadia Code | OFL | `@fontsource-variable/cascadia-code`（已验证） | 微软 Windows Terminal 默认字体，连字丰富，圆润偏宽 |
| 8 | Intel One Mono | OFL | `@fontsource/intel-one-mono`（已验证） | Intel 2023 出品，**以低视力可读性为设计目标**，形近字符区分度极强，无障碍首选 |
| 9 | Sarasa Mono SC / Term SC（更纱黑体） | OFL | [GitHub Releases](https://github.com/be5invis/Sarasa-Gothic) | Iosevka × 思源黑体的混血，中英 1:2 严格等宽对齐——中文注释、对齐表格、ASCII 图表的唯一成熟解 |
| 10 | Iosevka | OFL | [GitHub Releases](https://github.com/be5invis/iosevka)（Sarasa 的西文母体） | 极致可定制：宽度/字重/字形态全可构建，适合"我就要自己的字体"的玩家 |

遗珠：Roboto Mono（`@fontsource-variable/roboto-mono`）、Inconsolata（`@fontsource-variable/inconsolata`）、Martian Mono（`@fontsource-variable/martian-mono`，超宽大 x-height）、Space Mono；付费闭源不推荐用于本站：MonoLisa、Berkeley Mono、Commit Mono。

试玩工具：[programmingfonts.org](https://www.programmingfonts.org) 可在线并排实时对比所有等宽字体。

---

## 五、推荐组合（针对 daily-work 的场景矩阵）

| 方案 | UI 骨架 | 正文 | 代码块 | 气质 | 成本 |
| --- | --- | --- | --- | --- | --- |
| **A 稳妥现代**（最小改动） | Inter（现状） | Inter + Noto Sans SC | JetBrains Mono | 现代工具感 | 2 个包，改 3 处 |
| **B 阅读优先**（推荐） | Inter | Source Serif 4 + Noto Serif SC | JetBrains Mono | 书卷气，最适合"每日读写"定位 | 3 个包，改 4 处 |
| **C 文艺读书** | Inter | LXGW WenKai Screen（中文）/ 拉丁随 WenKai 内置 | Sarasa Mono SC | 手写读书感 | 需社区包 + 自行引入 |
| **D 极简统一** | Geist | Geist + MiSans（需自行子集化） | Geist Mono | Vercel 风 | MiSans 子集化有额外工序 |

共同原则：UI 与正文用两套字体（无衬线管 chrome、衬线管正文）是阅读产品的成熟做法；代码块字体独立于正文。

---

## 六、修改方法（针对本仓库）

### 6.1 方案 A：统一中文观感 + 换代码块字体（最小改动）

```bash
pnpm --filter @innate/wip add @fontsource-variable/noto-sans-sc @fontsource-variable/jetbrains-mono
```

`apps/daily-work/src/globals.css` 三处改动：

```css
/* 1. 顶部 import 区 */
@import "@fontsource-variable/inter";
@import "@fontsource-variable/noto-sans-sc";
@import "@fontsource-variable/jetbrains-mono";

/* 2. @theme inline：补中文字体与 mono token（Tailwind 4 会生成 font-mono 工具类） */
@theme inline {
  --font-sans:
    "Inter Variable", "Noto Sans SC Variable", "PingFang SC",
    "Microsoft YaHei", sans-serif;
  --font-mono:
    "JetBrains Mono Variable", ui-monospace, SFMono-Regular, Menlo, Consolas,
    monospace;
}

/* 3. 代码块从系统栈切到 token */
.markdown-content code {
  font-family: var(--font-mono);
  /* 其余属性不变 */
}
```

效果：三端（Win/mac/linux）中文统一为思源黑体，代码块统一 JetBrains Mono 并获得连字。中文字体按 unicode-range 分包，用户实际只下载用到的分片。

> 不想引入中文 webfont 的极简版：只做第 2、3 步（装 jetbrains-mono），`--font-sans` 回退栈精修为 `"Inter Variable", "PingFang SC", "HarmonyOS Sans SC", "MiSans", "Microsoft YaHei", sans-serif`（现代系统字体优先），零体积成本，观感上限取决于用户机器。

### 6.2 方案 B：正文换衬线（阅读优先，推荐）

在 6.1 基础上：

```bash
pnpm --filter @innate/wip add @fontsource-variable/source-serif-4 @fontsource-variable/noto-serif-sc
```

```css
@import "@fontsource-variable/source-serif-4";
@import "@fontsource-variable/noto-serif-sc";

/* 只切正文，UI 骨架（--font-sans）不动 */
.markdown-content {
  font-family:
    "Source Serif 4 Variable", "Noto Serif SC Variable", "Source Han Serif SC",
    "Songti SC", serif;
  font-size: 1rem;        /* 衬线正文从 0.9375rem 提到 1rem，中文衬线小字号会糊 */
  line-height: 1.8;       /* 中文衬线行距略放宽 */
  letter-spacing: 0.01em; /* 中西混排微调节奏 */
}
```

注意：`@innate/ui` 的 body 是 13.5px + `font-sans`（`packages/ui/src/globals.css:196-200`），本应用 `.markdown-content` 的选择器特异性更高、且 `globals.css` 在 `@innate/ui/globals.css` 之后导入（`src/main.tsx:7-8`），覆盖天然成立，不需要动 UI 包。

### 6.3 方案 C：霞鹜文楷正文 + 更纱黑体代码

```bash
pnpm --filter @innate/wip add @fontsource/lxgw-wenkai lxgw-wenkai-screen-webfont
```

```css
@import "lxgw-wenkai-screen-webfont/lib/lxgwwenkaiscreen.css"; /* CSS 内路径以包 README 为准 */

.markdown-content {
  font-family: "LXGW WenKai Screen", "LXGW WenKai", "Kaiti SC", "KaiTi", serif;
  font-size: 1.0625rem; /* 楷体偏小，正文再加半档 */
  line-height: 1.9;
}
```

Sarasa Mono SC 不在 npm 正规渠道，从 [GitHub Releases](https://github.com/be5invis/Sarasa-Gothic) 下载 ttf 后任选其一：

- 放 `public/fonts/`（随 dist 原样发布，注意只放用到的字重，完整家族很大）；
- 或用 cn-font-split 子集化后放 `public/fonts/`，手写 `@font-face` + `unicode-range`。

```css
.markdown-content pre code {
  font-family: "Sarasa Mono SC", "JetBrains Mono Variable", monospace;
}
```

### 6.4 体积与加载预期

| 引入 | dist 增量（全部分片落盘） | 单次访问实际下载 | 说明 |
| --- | --- | --- | --- |
| JetBrains Mono variable | ~0.3MB | ~100KB（latin 分片） | 无感 |
| Source Serif 4 variable | ~0.5MB | ~150KB | 无感 |
| Noto Sans/Serif SC variable | ~10–25MB（100+ 分片） | ~0.5–1.5MB（按用字命中） | GH Pages 无压力（单文件 < 100MB、仓库建议 < 1GB），首次访问有一次 swap 闪动 |
| LXGW WenKai | 同上量级 | 同上 | 同上 |

要点：

- fontsource v5 所有 `@font-face` 默认 `font-display: swap`，先渲染回退字体再替换，不会白屏。
- CJK 分片**不要** preload（分片太多且不可预测）；拉丁 variable 包可在 `index.html` 加 `<link rel="preload" as="font">` 进一步消除闪动，非必须。
- 消除 swap 布局抖动的进阶手段是给回退字体做 metric override（`size-adjust` / `ascent-override`，参考 Fontaine 的做法），对本站收益有限，可不做。
- 构建后用 `pnpm --filter @innate/wip build && du -sh apps/daily-work/dist` 复核体积，以产物为准。

### 6.5 验证

- `pnpm --filter @innate/wip dev` 起本地站，检查：中文正文无衬线/衬线生效、代码块连字（如 `=>` `!==`）、暗色主题（含默认 Notion 暖纸变体）下字体一致、mermaid 图（其 fontFamily 是独立配置，见 `src/components/mermaid-block.tsx:18`，如需同步改字体记得一并调整）。
- 走仓库统一验证闭环：根目录 `pnpm verify`。

---

## 七、参考来源

- [JetBrains Mono 官网](https://www.jetbrains.com/lp/mono/) / [Maple Mono GitHub](https://github.com/subframe7536/maple-font) / [Sarasa Gothic](https://github.com/be5invis/Sarasa-Gothic) / [Iosevka](https://github.com/be5invis/iosevka) / [LXGW WenKai](https://github.com/lxgw/LxgwWenKai)
- 等宽横评：[FavTutor 41 款实测](https://favtutor.com) · [Snappify 13 Best Fonts for Coding](https://snappify.com/blog/best-fonts-for-coding) · [programmingfonts.org 在线试玩](https://www.programmingfonts.org)
- 中文：[思源黑体](https://github.com/adobe-fonts/source-han-sans) · [MiSans 官网](https://hyperos.mi.com/font) · [中文网字计划（CJK webfont 子集化工具）](https://chinese-font.netlify.app/zh-cn) · [猫啃网（霞鹜系列分发）](https://www.maoken.com)
- fontsource：[@fontsource/noto-sans-sc](https://www.npmjs.com/package/@fontsource/noto-sans-sc) · [lxgw-wenkai-webfont](https://www.jsdelivr.com/package/npm/lxgw-wenkai-webfont)（unicode-range 分包机制的官方说明见 fontsource monorepo）
- 阅读可读性：[FontFabric: Best Fonts for Reading](https://www.fontfabric.com/blog/best-fonts-for-reading/) · [Untitled UI: Free UI Fonts](https://www.untitledui.com/blog/free-ui-fonts)
- 本仓库代码位置：`apps/daily-work/src/globals.css:1,86,182` · `apps/daily-work/src/main.tsx:7-8` · `packages/ui/src/globals.css:124-125,185-200`
