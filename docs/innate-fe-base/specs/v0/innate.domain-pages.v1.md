# innate.domain-pages.v1 — 文稿仓静态站

文稿仓（如 `apps/innate-daily`）不 clone fe-templates。它只声明「用哪份 UI + 哪几页 markdown」，由 `innate-fe-cli pages pack` 下载 **pages-kit** release 叠站。

操作步骤、最小文件树、本机 / CI 命令：[用例 7](../use-cases/07-innate-daily-static-pages.md)。

| 字段     | 值                                                                                           |
| -------- | -------------------------------------------------------------------------------------------- |
| 协议名   | `innate.domain-pages.v1`                                                                     |
| 登记文件 | 文稿仓根 **`plugin.registry.yaml`**（单数，避免和 webshell 的 `plugins.registry.yaml` 撞名） |
| UI + CLI | fe-templates rolling release **`pages-kit`**：`writing-shell.zip` + `innate-fe-cli-*`        |

```yaml
protocol: innate.domain-pages.v1
version: 1
template:
  repo: variableway/innate-fe-templates
  release: pages-kit
  shell: writing-shell.zip
site:
  title: Innate Daily
  defaultPath: /
  home: ./pages/home.md
domains:
  - id: writing
    content: ./content
    mount: content
    path: /writing
pages:
  outDir: site
```

## 字段

| 路径                | 必填 | 说明                                                                   |
| ------------------- | ---- | ---------------------------------------------------------------------- |
| `template.repo`     | 是   | GitHub `owner/repo`，可写完整 URL，CLI 会收成短名                      |
| `template.release`  | 否   | 默认 `pages-kit`                                                       |
| `template.shell`    | 否   | 默认 `writing-shell.zip`                                               |
| `site.title`        | 否   | 写入 `site.json`，给壳顶栏用                                           |
| `site.defaultPath`  | 否   | 打开根 URL 落到哪，默认 `/`                                            |
| `site.home`         | 是   | 首页 markdown，pack 后为 `site/pages/home.md`，路由 `/`                |
| `site.landing`      | 否   | 遗留字段，解析时忽略。落地页就是 writing（`/landing` = `/writing`）    |
| `domains[].id`      | 是   | `[a-z][a-z0-9-]*`；`writing` 是第一块内容集合                          |
| `domains[].content` | 否   | 默认 `./content`                                                       |
| `domains[].mount`   | 否   | 叠进产物的目录名，默认 `content`                                       |
| `domains[].path`    | 否   | 壳上的列表路径，默认 `/<id>`                                           |
| `pages.outDir`      | 否   | 产物目录，默认 `site`。这里的 `pages` 是 pack 配置，不是 markdown 列表 |

`site.home` 指向的文件必须存在，否则 `pages pack` 失败。文章集合仍走 `domains[]`，不要把长文放进 `pages/`。

## Pack

```bash
# 在 innate-daily 根（或 --dir）
innate-fe-cli pages pack
# → site/   再由 GitHub Action 上传 Pages
```

`pages pack` 解析 zip 的顺序：`--shell` → `PAGES_SHELL_ZIP` → 旁路已有 zip → `gh release download`（需 `FE_TEMPLATES_TOKEN` 或 `GH_TOKEN`）。不跑 `pnpm install`，不 clone 大仓。fe-base 上的 Writing GitHub Pages 直接构建 `apps/innate-daily`（`VITE_WRITING_SOURCE=docs`），不走这份 zip。

叠完后产物至少包含：

```text
site/index.html
site/site.json
site/pages/home.md
site/content/*.md
site/content/index.json
```

`site.json` 由 registry 生成，壳运行时读取，禁止在 zip 里写死文稿路径。
