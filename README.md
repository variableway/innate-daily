# daily-work — Writing 静态站（@innate/wip）

Vite + React 19 + TanStack Router（hash 路由）的写作内容浏览工作台。位于 `apps/daily-work/`。

## 快速开始

在 **fe-templates 根**（workspace 能解析 `@innate/ui`）：

```bash
pnpm --filter @innate/wip dev
# → http://localhost:4016/#/   聚合本仓 content/ + docs/ + use-cases/

VITE_WRITING_SOURCE=docs pnpm --filter @innate/wip dev
# 仅 docs 模式：只内联本仓 docs/ 目录
```

或在本目录直接 `./dev.sh`（自动选择 workspace 根或本仓 node_modules 启动）。

## 在哪里写文件

内容在**构建期**经 `import.meta.glob(?raw)` 内联进 bundle（运行时无 fs、无网络请求）。把 Markdown / MDX 文件放到以下目录即可被站点收录：

| 目录         | 用途                                            |
| ------------ | ----------------------------------------------- |
| `content/`   | 本仓内容源（演示内容在 `content/demo/`）        |
| `docs/`      | 文档内容源（cli / modules / specs / use-cases） |
| `use-cases/` | use-case 内容源（当前为空占位）                 |

通过 `VITE_WRITING_SOURCE` 控制内联范围：未设置 / `all`（默认，聚合全部）、`docs`（仅 docs/）、`use-cases`（use-cases/ + content/）。

- Markdown 渲染：react-markdown + remark-gfm + rehype-highlight + rehype-slug；mermaid 以 ESM min 产物别名接入（`MermaidBlock`，主题跟随站点）。
- 路由：hash 路由（`createHashHistory`）：`/`、`/writing`（列表）、`/writing/$slug`（详情）、`/landing`。

## 命令

```bash
pnpm --filter @innate/wip dev            # dev（4016）；docs 模式见上
pnpm --filter @innate/wip build          # vite build + 404 兜底 → dist/
pnpm --filter @innate/wip preview        # 预览 dist
pnpm --filter @innate/wip typecheck      # tsc --noEmit
pnpm --filter @innate/wip lint           # oxlint src
pnpm --filter @innate/wip test           # vitest run
node scripts/write-content-index.mjs     # 刷新 site/ 静态输出
```
