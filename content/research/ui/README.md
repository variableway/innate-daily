# research/ui

daily-work 的 UI / 视觉方向调研存档。调研结论只记录选型依据与接入方法，不代表已落地；落地时以 `src/globals.css` 实际代码为准。

| 文档 | 主题 | 日期 |
| --- | --- | --- |
| [fonts.md](./fonts.md) | 阅读向字体选型：英文 / 中文 / 等宽 Top 10、推荐组合、针对本仓库的修改方法 | 2026-10 |
| [portfolio-landing-analysis.md](./portfolio-landing-analysis.md) | v0 画廊模板改造为本站首页的方案分析 | 2026-10 |
| [site-optimization-analysis.md](./site-optimization-analysis.md) | 站点 UI/UX、组件策略与 Tauri 桌面编辑器方案体检 | 2026-10 |
| [ui-beautification-top10.md](./ui-beautification-top10.md) | UI 美化 Top 10：软化线框与丰富配色 | 2026-10 |
| [ai-slop-ui-ux.md](./ai-slop-ui-ux.md) | AI slop 调研：AI 生成 UI/UX 的同质化现象、自查清单与反 slop 实践 | 2026-10 |

落地进度：JetBrains Mono 已按用户选择升级为全站主字体（2026-10-13，`--font-sans` / `--font-mono` 均以 JB Mono 打头，并显式接管 body 字体，见 `src/globals.css`）；中文字体与衬线正文方案尚未实施。

已知上游问题：`@innate/ui` 的 body 规则硬编码 `Inter, ui-sans-serif…` 且不走 `--font-sans` token，族名与 fontsource 注册的 `Inter Variable` 也不匹配——任何消费方在应用层覆盖 `--font-sans` 都不会影响 body，需像本应用一样显式写 `body { font-family: var(--font-sans) }` 接管。
