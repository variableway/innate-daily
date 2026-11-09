# daily-work — Writing 静态站（@innate/daily）

Vite + React 19 + TanStack Router（hash 路由）的写作内容浏览工作台。位于 `apps/daily-work/`。

## 快速开始

在 **fe-templates 根**（workspace 能解析 `@innate/ui`）：

```bash
pnpm --filter @innate/daily dev
# → http://localhost:4016/#/   聚合本仓 docs/ 全部内容

VITE_WRITING_SOURCE=docs pnpm --filter @innate/daily dev
# 仅 docs/*.md（站点说明文档）

VITE_WRITING_SOURCE=use-cases pnpm --filter @innate/daily dev
# 仅 docs/use-cases/（用例文章）
```

或在本目录直接 `./dev.sh`（自动选择 workspace 根或本仓 node_modules 启动）。

## 本地私有源（@innate/ui 供给链）

`@innate/ui` 没发到 npm，本地开发走 **127.0.0.1:4873 的 Verdaccio 私有源**。
每个命令（`dev` / `build` / `test` / …）都自带 `pnpm run setup` 前置，自动完成：
起私有源 → 发布基础仓 `@innate/*` → 装依赖 → 同步到最新版本，**无需手工恢复**。

```bash
pnpm run setup          # 手动跑一遍供给链（幂等，正常时几秒）
pnpm run setup:latest   # 基础仓改了源码还没升版本时：强制重发再同步（本地版本号会递增）
```

- 首次使用需要 `innate-fe-cli`，并配置基础仓：`innate-fe-cli fe-root set <innate-fe 路径>`。
- 基础仓发新版后：`pnpm run setup` 即可跟上（`@innate/ui` 约束为 `*`，永远解析最新发布）。
- CI 不走这条链路（deploy-pages 用注入式 workspace 链接 `packages/ui`，守卫会自动跳过）。

## 在哪里写文件

内容在**构建期**经 `import.meta.glob(?raw)` 内联进 bundle（运行时无 fs、无网络请求）。把 Markdown / MDX 文件放到以下目录即可被站点收录：

| 目录                | 用途                                                       |
| ------------------- | ---------------------------------------------------------- |
| `docs/*.md`         | 站点说明文档（`markdown-usage.md` 等）→ vault `docs`        |
| `docs/use-cases/`   | 用例文章（`golang-cli-101`、`nodejs-typescript-101`）→ vault `use-cases` |

文档根已统一为 `docs/`，子目录结构直接决定 vault 与目录树（「目录即展区」）。
通过 `VITE_WRITING_SOURCE` 控制内联范围：未设置 / `all`（默认，`docs/**`）、`docs`（仅 `docs/*.md`）、`use-cases`（仅 `docs/use-cases/**`）。

写作规范（frontmatter 字段、基本语法、mermaid 图表）见 [`docs/markdown-usage.md`](docs/markdown-usage.md)。

- Markdown 渲染：react-markdown + remark-gfm + rehype-highlight + rehype-slug；mermaid 以 ESM min 产物别名接入（`MermaidBlock`，主题跟随站点）。
- 路由：hash 路由（`createHashHistory`）：`/`、`/writing`（列表）、`/writing/$slug`（详情）、`/landing`。

## 命令

```bash
pnpm --filter @innate/daily dev            # dev（4016）；docs 模式见上
pnpm --filter @innate/daily build          # vite build + 404 兜底 → dist/
pnpm --filter @innate/daily preview        # 预览 dist
pnpm --filter @innate/daily typecheck      # tsc --noEmit
pnpm --filter @innate/daily lint           # oxlint src
pnpm --filter @innate/daily test           # vitest run
pnpm --filter @innate/daily setup          # 供给链自检（各命令已自动前置）
```

以上每个命令都前置 `pnpm run setup`（见「本地私有源」一节）；在本目录直跑
`pnpm dev` / `pnpm test` 等效果相同。
