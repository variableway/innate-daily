# 字体现状审查与建议：对照 `fonts.md` 调研结论复核当前 website 实现

> 审查日期：2026-10-31
> 审查对象：`innate-daily`（写作站 + Collections）的实际字体实现
> 对照文档：[`fonts.md`](./fonts.md)（调研日期 2026-10-13）
> 结论性质：审查 + 建议。**P0/P1/P2 已于同日实施**，下文标注了实施结果与实测复验数据。
> 文中所有数字均为在本地 dev server（4016）实测所得。

---

## 一、结论速览

调研文档的**方向是对的，但落地进度落后于文档**，而且文档写作之后布局变了，带来了新的、更要紧的问题。

| 优先级 | 问题 | 现状 | 状态 |
| --- | --- | --- | --- |
| **P0** | **主题切换会静默换掉整套字体** | 切到 Marshmallow / Art Deco 后 body 变成 `Gabriela` / `Delius Swash Caps`（**这些字体根本没打包**，实际回退到系统字体） | ✅ **已修复**：应用层显式覆盖 token，实测 12 种主题×明暗组合全部生效 |
| **P0** | **阅读列行长过长** | 有 ToC：89 拉丁/48 汉字；无 ToC：**112 拉丁/60 汉字** | ✅ **已修复**：收窄到 42rem（字号保持 15px/1.75）→ 实测 **84 拉丁/45 汉字** |
| **P1** | **中文没有 webfont** | 中文走系统字体（苹方/雅黑），三端观感不一致 | ✅ **已修复**：引入 Noto Sans SC 作为**最后兜底**（实测思源黑体排在苹方前会让 macOS 观感变差，已回退顺序） |
| **P1** | **代码块中文注释等宽对齐失效** | 中英 advance 比 1.667（非整数倍），注释列错位 | ⏸ **未做**：需 Sarasa Mono SC（不在 npm）；实测中文几乎全是行尾注释，影响小于预期 |
| **P2** | **mermaid 硬编码字体栈** | `mermaid-block.tsx:18-19` 写死，不跟 token | ✅ **已修复**：改读 `var(--font-sans)` |
| **P2** | **正文未设 font-family** | `.markdown-content` 继承 body，等于正文没有自己的字体层 | ✅ **已修复**：显式声明 `font-family: var(--font-sans)` |
| **P3** | 正文衬线化（方案 B） | 未落地 | **暂缓**，等 P0/P1 做完再评估 |

一句话：**调研文档列的「最小改动路径」（JetBrains Mono + 中文 webfont）其实只做了一半——代码块字体换了，中文字体没换；而真正影响观感的 P0 问题（主题覆盖、行长）调研文档没有覆盖，因为文档写作后布局从 ~640px 变成了 718/896px。**

---

## 二、调研文档的落地情况核对

`fonts.md` 的方案 A 建议「装 2 个包、改 3 处」。逐项核对：

### ✅ 已落地

| 文档要求 | 实际实现 | 状态 |
| --- | --- | --- |
| 装 `@fontsource-variable/jetbrains-mono` | `package.json` 已有 | ✅ |
| 装 `@fontsource-variable/noto-sans-sc` | `package.json` 5.3.1 | ✅ **本次补上** |
| `--font-mono` token 切到 JetBrains Mono | `src/globals.css:149-151` | ✅ |
| 代码块 `font-family: var(--font-mono)` | `src/globals.css:250` | ✅ |
| `--font-sans` token 补中文字体 | `"Noto Sans SC Variable"` 优先于 `"PingFang SC"` | ✅ **本次补上** |
| 应用层接管 body 字体（绕过 `@innate/ui` 硬编码 `Inter`） | `src/globals.css` 未分层 `body` 规则 | ✅ |
| 应用层重声明 token（挡住主题覆写） | `src/globals.css` `:root, :root[data-theme]` | ✅ **本次补上** |

### ❌ 未落地

| 文档要求 | 现状 |
| --- | --- |
| 方案 B：正文换 Source Serif 4 | 未装、未启用（P3，暂缓） |
| 方案 C：Sarasa Mono SC 中英 1:2 等宽 | 未装（P1，见第六节） |

---

## 三、P0：主题切换会静默换掉整套字体（已修复）

### 现象

`@innate/ui` 的 `shadcn-studio.css` 里，Marshmallow 与 Art Deco 两个主题各自覆写了 `--font-sans` / `--font-mono`：

```css
/* node_modules/@innate/ui/src/themes/shadcn-studio.css:33-35 */
:root[data-theme="marshmallow"] {
  --font-sans: Gabriela, "Geist Fallback", ui-sans-serif;
  --font-mono: "Geist Mono", "Geist Mono Fallback", ui-monospace;
}
/* :104-106 art-deco */
:root[data-theme="art-deco"] {
  --font-sans: "Delius Swash Caps", sans-serif;
  --font-mono: "Delius Swash Caps", monospace;
}
```

但 `@innate/ui` 的 package.json 里**只依赖了 `@fontsource-variable/inter` 一个字体包**——`Gabriela`、`Geist Mono`、`Delius Swash Caps` 全都没有打包。

实测（dev server，切换 `data-theme` 后读计算样式）：

| 主题 | body 计算 font-family | 实际加载的字体 | `n` 宽 @100px |
| --- | --- | --- | --- |
| shadcn-stone（默认） | `"Inter Variable", …` | Inter Variable ✅ | 59.1 |
| marshmallow | `Gabriela, "Geist Fallback", …` | **只有 Inter / JB Mono** | 55.9（已回退系统字体） |
| art-deco | `"Delius Swash Caps", sans-serif` | **只有 Inter / JB Mono** | 55.9（已回退系统字体） |

代码块同样被顶掉：

| 主题 | 代码块计算 font-family |
| --- | --- |
| shadcn-stone | `"JetBrains Mono Variable", …` ✅ |
| marshmallow | `"Geist Mono", "Geist Mono Fallback", ui-monospace` ❌ |
| art-deco | `"Delius Swash Caps", monospace` ❌ |

### 为什么应用层挡不住

`src/globals.css` 的 `@theme inline` 生成的变量落在 `@layer theme` 里，studio 主题的 `:root[data-theme=…]` 覆写**不在任何 layer 内**（实测确认 studio 主题文件 `@layer` 计数为 0），未分层样式的优先级高于 `@layer` 内的一切。所以光有 `body { font-family: var(--font-sans) }`（`src/globals.css:156`）是不够的——它照样会取到被顶掉的变量值。

### 修复（已实施并复验）

在应用层、**任何 `@layer` 之外**、且**位于 studio 主题之后**的位置显式重声明 token。`src/globals.css` 里 studio 主题规则出现在 offset 281017，应用层的 `:root[data-theme]` 规则在 292692，源码顺序靠后 → 同特异性时胜出。

```css
/* src/globals.css —— 放在既有 @theme inline 之后 */
/* studio 主题（marshmallow / art-deco）会用未打包的字体名覆写 --font-sans/--font-mono，
   导致 Inter / JetBrains Mono 被静默替换。这里用未分层规则重新钉住本站的字体选择。 */
:root,
:root[data-theme] {
  --font-sans:
    "Inter Variable", "PingFang SC", "Noto Sans SC", "Microsoft YaHei",
    sans-serif;
  --font-mono:
    "JetBrains Mono Variable", ui-monospace, SFMono-Regular, Menlo, Consolas,
    monospace;
}
```

复验结果（12 种主题×明暗组合，全部通过）：

```
✅ shadcn-stone/light  body=Inter Variable  code=JetBrains Mono Variable
✅ shadcn-stone/dark   body=Inter Variable  code=JetBrains Mono Variable
✅ marshmallow/light    body=Inter Variable  code=JetBrains Mono Variable
✅ marshmallow/dark     body=Inter Variable  code=JetBrains Mono Variable
✅ art-deco/light       body=Inter Variable  code=JetBrains Mono Variable
✅ art-deco/dark        body=Inter Variable  code=JetBrains Mono Variable
✅ notion/light         body=Inter Variable  code=JetBrains Mono Variable
✅ notion/dark          body=Inter Variable  code=JetBrains Mono Variable
✅ linear/light         body=Inter Variable  code=JetBrains Mono Variable
✅ linear/dark          body=Inter Variable  code=JetBrains Mono Variable
✅ default/light        body=Inter Variable  code=JetBrains Mono Variable
✅ default/dark         body=Inter Variable  code=JetBrains Mono Variable
```

> 附带收益：这一条也顺带挡住了将来 `@innate/ui` 上游新增主题时的同类回归。

---

## 四、P0：阅读列行长过长（已修复）

`fonts.md` 写作时阅读列约 640px，布局调整后变成了 718px（有 ToC）/ 896px（无 ToC）。**修复前实测行长**（15px 正文，`avgLatinChar=8.03px`、`avgHanChar=15px`）：

| 场景 | 视口 1600 | 视口 2000 | 视口 2400 | 舒适区 |
| --- | --- | --- | --- | --- |
| 有 ToC | 718px → 89 拉丁 / 48 汉字 | 784px → 98 / 52 | 784px → 98 / 52 | 拉丁 60–80，中文 30–45 |
| 无 ToC | 896px → **112 拉丁 / 60 汉字** | 896px → 112 / 60 | 896px → 112 / 60 | 同上 |

拉丁超出舒适区上限 **40%**（112 vs 80），中文超出 **33%**（60 vs 45）。超长行会让眼睛回扫时找错行，长文阅读体验直接受损——这是「工具感偏重」之外的第二个根因，调研文档没有覆盖。

### 已实施的改动

1. `src/components/writing/blog-viewer.tsx` —— 正文列统一收窄到 `max-w-[42rem]`（672px），有 ToC / 无 ToC 两种情况用同一宽度；ToC 侧栏维持 `13rem`
2. `src/globals.css` `.markdown-content` —— 字号最终保持 `0.9375rem` / `1.75`（15px / 1.75），与改动前一致
   （中途曾提到 16px / 1.8，见第五节：那是配合「思源黑体优先」的判断，中文回到苹方后已调回）

### 复验结果（15px 正文，42rem 列）

| 视口 | 场景 | 列宽 | 拉丁/行 | 汉字/行 |
| --- | --- | --- | --- | --- |
| 1600px | 有 ToC | 672px | 84 | 45 |
| 1600px | 无 ToC | 672px | 84 | 45 |
| 2000px | 有 ToC / 无 ToC | 672px | 84 | 45 |
| 2400px | 有 ToC / 无 ToC | 672px | 84 | 45 |

**84 拉丁 / 45 汉字**——仍在舒适区上沿（拉丁 60–80、中文 30–45），且不随视口变宽而劣化。

---

## 五、P1：中文没有 webfont，三端观感不一致（已修复，但**字体顺序已回退**）

### 现状

`--font-sans` 里的 `"PingFang SC", "Noto Sans SC", "Microsoft YaHei"` 都只是**回退栈**：macOS 用苹方、Windows 用微软雅黑、Linux 可能什么都没有。调研文档指出的根因依然成立——Inter 的 x-height、字重、灰度与雅黑差异明显，一句话里中英文「两个人写的」；雅黑小字号 hinting 弱、发灰发虚。

当前文档全部是中文内容（`docs/content/research/ui/*.md` 6 篇 + `docs/use-cases/**` 2 篇），所以这个问题的影响面比调研时更大。

### 体积实测

调研文档写的是「Noto SC 全分片 10–25MB，单次 < 1MB」。实测更准：

| 指标 | 实测值 |
| --- | --- |
| `@fontsource-variable/noto-sans-sc` 5.3.1 unpacked | 4.6MB（112 文件，98 个分片进产物） |
| `@font-face` 分片数 | 101 |
| **真实中文文档实际下载** | **19 个分片**（随用字命中） |
| 字体总下载量 | 随文档用字在 13KB ~ 1.1MB 之间浮动 |

也就是说：不是「每篇都下 4.6MB」，而是按用字命中分片——短文档只下几十 KB。

### 实施后被推翻：思源黑体排在苹方前面反而更难看

最初把 `"Noto Sans SC Variable"` 放在 `"PingFang SC"` **前面**（为了三端一致）。
实测反馈是「不如原来的舒服」。复核后确认这不是错觉，而是**字体设计本身的差异**：

| 指标（100px 字号下测量） | Noto Sans SC | 苹方 PingFang SC |
| --- | --- | --- |
| 中文字宽 | 1000（全角 1em） | 1000（全角 1em） |
| fontBoundingBoxAscent | **116** | 106 |
| fontBoundingBoxDescent | 29 | 34 |
| 字面占位比 | 1.16 | 1.06 |

思源黑体的中文字面比苹方**大一号**、笔画更重，标点两侧没有苹方那种呼吸空间。
在 macOS 上苹方是针对屏幕优化的系统字体，质感明显更精细——为「三端一致」牺牲本地观感并不划算。

> 顺带澄清：**中文「都是等宽方块」不是 mono 的问题**。CJK 字体天然按全角 1em 排布，
> 苹方和思源黑体的中文字宽完全相同（实测同为 1000/100px）。
> 真正的等宽字体只有代码块用的 JetBrains Mono。

另外验证过：把 Noto 的可变字重从 400 调到 380 / 350，视觉几乎没有变化——
`wght` 轴（100–900）确实存在且生效，但字面大小是字体设计，改字重救不回来。

### 最终实施（苹方优先，Noto 降为最后兜底）

```css
/* src/globals.css 顶部 */
@import "@fontsource-variable/noto-sans-sc";
```

```css
--font-sans:
  "Inter Variable", "PingFang SC", "Microsoft YaHei", "Noto Sans SC Variable",
  sans-serif;
```

效果：

- **macOS** 用苹方（精致），**Windows** 用雅黑，**没有中文字体的系统**才落到 Noto
- Noto 仍在依赖里，不白装；但 macOS 上浏览器**不会下载它的任何分片**
  （苹方已覆盖全部汉字，`unicode-range` 分片自然不会命中）
- 字体总下载量实测 **87KB**（Noto 分片下载数 = **0**），与引入 webfont 之前完全一致
- 部署体积代价：产物多 4.5MB（98 个分片落盘），但 GitHub Pages 单文件上限 100MB，无压力

配套注意：
- **不 preload CJK 分片**（101 片，不可预测）
- fontsource v5 默认 `font-display: swap`
- 如果将来要在 Windows 上也拿到更精致的观感，正解是引入**更接近苹方气质**的中文字体
  （如霞鹜文楷 Screen / HarmonyOS Sans SC），而不是思源黑体

### 正文字号同步调回 15px / 1.75

字号从 15px 提到 16px、行高 1.75 → 1.8 是在「Noto 优先」的前提下做的判断
（调研文档方案 B 的建议：中文小字号会糊）。既然中文回到苹方，16px 就显得偏胀，
已调回 `0.9375rem` / `1.75`，与改动前一致。

---

## 六、P1：代码块中文注释等宽对齐失效（未做）

### 实测

`pre code` 实际 13px（`src/globals.css:261` 的 `0.8125rem`）：

| 指标 | 值 |
| --- | --- |
| 拉丁 advance | 7.8px |
| 中文 advance | 13px（回退到系统中文黑体） |
| 比值 | **1.667**（非整数倍 → 等宽对齐失效） |
| 80 列拉丁宽度 | 624px（容器 684px，装得下） |

JetBrains Mono 本身不含中文字形，中文必然回退到系统字体，advance 比值随系统字体而变——**Mac 和 Windows 上错位程度还不一样**。

### 影响面

仓库现有代码块里中文的出现位置统计：

| 文件 | 含中文行 | 行中（注释） | 行首/独立行 |
| --- | --- | --- | --- |
| `docs/use-cases/build-it-own/build-innate-daily.md` | 28 | 28 | 0 |
| `docs/use-cases/toolchain/innate-fe-cli-pages-pack.md` | 24 | 15 | 1 |
| `docs/content/research/ui/site-optimization-analysis.md` | 13 | 13 | 0 |
| `docs/content/research/ui/fonts.md` | 10 | 10 | 0 |

**中文几乎全部是行尾注释**（行中），不是独立占行的中文块。这让问题的影响比想象中小：行尾注释错位只是让注释起点参差不齐，不破坏代码本身的列对齐。

不过 `build-innate-daily.md` 里有 mermaid 风格的 ASCII 流程图（`A["① 安装<br/>…"] --> B["② 打包…"]`），中文标签在行中会让箭头连接线错位——这是实际可见的问题。

### 建议

按成本从低到高：

1. **零成本**：接受现状，或在代码块里尽量把中文注释放到独立行 / 避免在 ASCII 图里混中文
2. **低成本**：把中文注释里容易错位的部分改成英文或符号（如 `① 安装` → `1. install`）
3. **方案 C（调研文档）**：装 Sarasa Mono SC，中英严格 1:2 等宽
   - 注意：Sarasa **不在 npm 正规渠道**，需从 GitHub Releases 下载，自行子集化后放 `public/fonts/`
   - 成本明显高于 Noto Sans SC，**不建议现在做**

> 调研文档推荐的 Noto Sans SC **不能**解决这个——它是无衬线 proportional，不是等宽。

---

## 七、P2：mermaid 硬编码字体栈（已修复）

`src/components/mermaid-block.tsx:18-19`：

```tsx
fontFamily:
  '"Inter Variable", "PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif',
```

这行写死了字体栈，**不跟 `--font-sans` token**。当前值恰好与 token 一致所以看不出问题，但一旦按 P1 引入 `"Noto Sans SC Variable"`（注意带 `Variable` 后缀，fontsource 注册名），mermaid 就会漏掉新字体——图内中文继续走系统字体，与正文不一致。

已改为运行时读 token（沿用同文件读 `--mermaid-*` 的既有模式）：

```tsx
fontFamily:
  read("--font-sans") ||
  '"Inter Variable", "PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif',
```

复验：图表内文字计算 font-family = `Inter Variable`，与 token 一致。

---

## 八、P2：正文没有自己的字体层（已修复）

`src/globals.css:159-164`：

```css
.markdown-content {
  color: var(--foreground);
  font-size: 0.9375rem;
  line-height: 1.75;
}
```

**没有 `font-family`**，完全继承 body。这意味着正文和 UI 骨架共用同一套字体，没有「chrome 管无衬线、正文管阅读」的分工——而这正是调研文档第五节的核心原则（"UI 与正文用两套字体是阅读产品的成熟做法"）。

已显式声明，为后续换衬线留出接口：

```css
.markdown-content {
  color: var(--foreground);
  font-family: var(--font-sans);
  font-size: 1rem;
  line-height: 1.8;
}
```

---

## 九、已经正确、不需要动的部分

审查中逐项验证过，以下都是对的，**不建议改**：

| 项 | 实测结果 |
| --- | --- |
| Inter Variable 已正确加载 | `Inter Variable normal 100 900` ✅ |
| JetBrains Mono Variable 已正确加载 | `JetBrains Mono Variable normal 100 800` ✅ |
| 代码块连字生效 | DOM 截图比对 `font-variant-ligatures: none` vs `normal` 渲染结果**不同**（`=>` 合并为单字形），`normal` 为默认值即生效 ✅ |
| `code` / `pre` / `kbd` 都走 mono | ✅ `src/globals.css:250` |
| JetBrains Mono 字体文件带 `calt` 特性 | fontTools 实测：latin 分片 GSUB 含 `calt` ✅ |
| `@innate/ui` body 硬编码 `Inter` 已被应用层接管 | 构建产物中 `body{font-family:Inter,ui-sans-serif,…}` 后紧跟 `body{font-family:var(--font-sans)}` ✅ |
| `html { @apply font-sans }` 走的是 token | 构建产物：`html{font-family:Inter Variable,PingFang SC,…}` ✅ |
| 字体子集化合理 | 实际只下载 inter-latin 47KB + jetbrains-mono-latin 40KB，latin-ext 等未用到 ✅ |
| 无 preload 造成阻塞 | 87KB 字体无 preload，未见 FOIT ✅ |

> 调研文档 6.1 提到「代码块统一 JetBrains Mono 并获得连字」——连字这一点实测确实拿到了，不是纸面收益。

---

## 十、剩余待办

| 步骤 | 内容 | 成本 |
| --- | --- | --- |
| **6** | 代码块中文注释治理（第六节）——优先改文档内容，Sarasa 暂缓 | 低 |
| **7** | 评估正文衬线化（方案 B：Source Serif 4 + Noto Serif SC） | — **暂缓**，等实际观感反馈 |

### 已完成的步骤

| 步骤 | 内容 | 落地位置 |
| --- | --- | --- |
| 1 | 应用层重声明 `--font-sans` / `--font-mono` | `src/globals.css` `:root, :root[data-theme]` |
| 2 | 阅读列收窄到 42rem（字号保持 15px/1.75） | `src/components/writing/blog-viewer.tsx` + `src/globals.css` |
| 3 | mermaid 字体栈改读 token | `src/components/mermaid-block.tsx` |
| 4 | `.markdown-content` 显式声明 font-family | `src/globals.css` |
| 5 | 引入 Noto Sans SC（最后兜底，顺序见第五节） | `package.json` + `src/globals.css` `@import` |

> 装包注意：本机 `.npmrc` 把 `@innate` scope 指向 `127.0.0.1:4873`（当前不可达），但 npmjs 官方源可达，用 `pnpm add <pkg> --registry=https://registry.npmjs.org` 即可。注意用 `pnpm` 而不是 `npm`——本仓库是 pnpm 布局，npm 的 arborist 会因 `node_modules/.pnpm` 的 symlink 结构报 `Cannot read properties of null (reading 'matches')`。

---

## 附：复核用的实测脚本

```bash
cd /Users/patrick/innate/innate-apps/innate-daily
PW_DRIVER_DIR=/tmp/claude/pw-driver CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  node /tmp/font-metrics.mjs     # 各视口下阅读列宽度、拉丁/汉字每行字符数、实际下载字体
PW_DRIVER_DIR=/tmp/claude/pw-driver CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  node /tmp/code-exact.mjs        # 代码块字体、字号、中英 advance 比值
PW_DRIVER_DIR=/tmp/claude/pw-driver CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  node /tmp/theme-font.mjs        # 各主题下 body/--font-sans 计算值
PW_DRIVER_DIR=/tmp/claude/pw-driver CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  node /tmp/code-theme-check.mjs  # 各主题下代码块字体
PW_DRIVER_DIR=/tmp/claude/pw-driver CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  node /tmp/fix-verify.mjs        # 验证应用层覆盖 token 后所有主题统一
PW_DRIVER_DIR=/tmp/claude/pw-driver CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  node /tmp/final-verify.mjs      # 行长 + 12 组主题字体 + 字体下载体积总验收
```
