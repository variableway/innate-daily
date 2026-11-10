# innate-daily — 个人写作与作品展示站（@innate/daily）

Vite + React 19 + TanStack Router（hash 路由）的纯静态写作站：
文档在构建期内联进 bundle，整站可部署到 GitHub Pages。
**依赖全部来自公开 npm 源，fork 即可构建**，不依赖任何私有包。

## 快速开始

```bash
pnpm install
pnpm dev          # → http://localhost:4016/
pnpm build        # → dist/（+ 404.html 兜底）
pnpm preview      # 本地预览 dist
```

推送 `main` 后 GitHub Actions 自动构建并发布到 GitHub Pages
（见 `.github/workflows/deploy-pages.yml`，任何推送都会触发）。

## docs/ 目录结构（目录即展区）

内容在**构建期**经 `import.meta.glob(?raw)` 内联进 bundle（运行时无 fs、
无网络请求）。`docs/` 下的**第一层目录就是展区**——底部胶囊筛选、
首页画廊、写作台目录树都按它聚合：

| 目录 | 展区 | 用途 |
| ------------------------- | ----------- | ---------------------------------------------- |
| `docs/ideas/**`           | `ideas`     | 想法与方案草稿（含 dsh-plugin 调研）           |
| `docs/research/**`        | `research`  | 调研报告（前端设计 SKILL 系列等）              |
| `docs/tutorials/basic/**` | `tutorials` | 教程（Golang CLI 入门、Node + TS 入门、写作规范） |
| `docs/use-cases/**`       | `use-cases` | 用例系列（own-your-daily 五篇：建站/部署/发文/作品/Agent 全程） |

- 文章的可见性由 frontmatter 的 `status` 控制：`published` 出现在
  正式列表；`draft` 在写作台可见（带 Draft 徽标），不进正式列表。
- 构建范围可用 `VITE_WRITING_SOURCE` 收窄：`all`（默认，`docs/**`）、
  `docs`（tutorials / research / ideas）、`use-cases`。
- 写作规范（frontmatter、GFM 语法、mermaid 图表、图片放置）见
  [`docs/tutorials/basic/markdown-usage.md`](docs/tutorials/basic/markdown-usage.md)。

## 本地编辑器

站内自带编辑入口：左上角「编辑」或 `/#/edit`。

- **连接仓库文件夹**（Chrome / Edge 的 File System Access API）后，
  可直接在 UI 里编辑 `docs/` 下任意 Markdown 与
  `src/data/collections.json`，保存即写回本地文件；
- 支持 Markdown 实时预览与 collections.json 的 JSON 校验 + 卡片预览；
- 未连接文件夹时为只读模式（浏览构建在站内的文档，支持复制 / 下载）。

编辑保存 = 写回本地文件；发布 = git push（交给 Agent 的 deploy skill
或手动 push），推送后 Pages 自动重建。

## Agent skills（`skills/`）

仓库自带四个可直接安装的 Agent skill（复制到 `~/.codex/skills/` 或
`~/.claude/skills/` 即可）：

| skill | 用途 |
| --------------- | ------------------------------------------------------ |
| `create-repo`   | 创建 GitHub / Gitee 仓库，注册登录环节交互引导         |
| `deploy`        | 部署到 Pages，完工后汇报改了什么 / 为什么 / 结果在哪   |
| `writing`       | 按本站规范写作发文（规范源：docs/tutorials/basic）     |
| `collections`   | 把作品加入首页作品墙                                   |

配套系列文章：[`docs/use-cases/own-your-daily/`](docs/use-cases/own-your-daily/1-write.md)
——从建站到上线到让 Agent 替你跑完全程，共五篇。

## 作品墙（Collections）

作品数据在 `src/data/collections.json`，封面图放
`public/collections-covers/`（不放封面则自动生成程序化封面）。
首页与 `/#/collections` 按作品 tags 与笔记 tags 的交集展示
「n 篇相关笔记」，点击直达筛选后的写作台。

## 命令

```bash
pnpm dev           # dev（4016）；VITE_WRITING_SOURCE 收窄构建范围
pnpm build         # vite build + 404 兜底 → dist/
pnpm preview       # 预览 dist
pnpm typecheck     # tsc --noEmit
pnpm lint          # oxlint src
pnpm test          # vitest run
```

UI 组件（shadcn 风格）已 vendor 进 `src/components/ui/`（统一经 `@ui`
别名导入），无需外部 UI 包。
