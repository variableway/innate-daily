# daily-work — Writing 静态站（@innate/daily）

Vite + React 19 + TanStack Router（hash 路由）的写作内容浏览工作台。位于 `apps/daily-work/`。

## 快速开始

在 **fe-templates 根**（workspace 能解析 `@innate/ui`）：

```bash
pnpm --filter @innate/daily dev
# → http://localhost:4016/#/   聚合本仓 docs/ 全部内容

VITE_WRITING_SOURCE=docs pnpm --filter @innate/daily dev
# 仅 docs/content/（调研笔记）

VITE_WRITING_SOURCE=use-cases pnpm --filter @innate/daily dev
# 仅 docs/use-cases/（自建指南 / 工具链用法）
```

或在本目录直接 `./dev.sh`（自动选择 workspace 根或本仓 node_modules 启动）。

## 在哪里写文件

内容在**构建期**经 `import.meta.glob(?raw)` 内联进 bundle（运行时无 fs、无网络请求）。把 Markdown / MDX 文件放到以下目录即可被站点收录：

| 目录                | 用途                                                             |
| ------------------- | ---------------------------------------------------------------- |
| `docs/content/`     | 调研笔记（`docs/content/research/ui/`）→ vault `content`           |
| `docs/use-cases/`   | 自建指南与工具链用法（`build-it-own/`、`toolchain/`）→ vault `use-cases` |
| `docs/pages/`       | 站点首页文档（`home.md`，构建产物落到 `site/pages/`）               |

文档根已统一为 `docs/`，子目录结构直接决定 vault 与目录树（「目录即展区」）。
通过 `VITE_WRITING_SOURCE` 控制内联范围：未设置 / `all`（默认，`docs/**`）、`docs`（仅 `docs/content/**`）、`use-cases`（仅 `docs/use-cases/**`）。

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
node scripts/write-content-index.mjs     # 刷新 site/ 静态输出
```
