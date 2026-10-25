---
title: "用 innate-fe-cli 打包 GitHub Pages 产物（pages pack）"
slug: fe-cli-pages-pack
date: 2026-10-25
author: Innate Team
category: guide
tags: [toolchain, innate-fe-cli, pages, deploy]
status: published
excerpt: "实测 innate-apps 工作区里内容仓与 base/innate-fe 的 innate-fe-cli 对接：plugin.registry.yaml 契约、pages pack 流水线、上游模板断链后的 --shell 旁路，以及 pnpm 版本切换 ENOEXEC 的环境坑。全部命令可复现。"
---

# 用 innate-fe-cli 打包 GitHub Pages 产物（pages pack）

> 本文是 2026-10-25 的**实测记录**：在 `innate-apps/` 工作区里，用 `base/innate-fe` 的
> `innate-fe-cli` 对本仓执行 `pages pack`，走通了从 shell 构建、内容叠加到静态产物
> 验证的完整链路。包含一个关键事实：**上游模板仓已删除，官方下载源断链**，本文给出
> 并验证了三种旁路之一。

## 1. 场景与参与方

| 角色 | 位置 | 说明 |
| ---- | ---- | ---- |
| 文稿仓（内容方） | `innate-apps/innate-content/innate-daily`（本仓） | 只提供 `plugin.registry.yaml` + markdown 正文 |
| 基础仓（工具方） | `innate-apps/base/innate-fe` | 提供 `innate-fe-cli`（`innate-fe-cli/src/index.ts`，Bun 直跑） |
| 产物 | 本仓 `site/`（已 gitignore） | 可直接部署 GitHub Pages 的静态目录 |

分工原则：**内容仓不装 base 的依赖、不跑 base 的 pnpm**——`pages pack` 从 `--dir`
进入内容仓后自足完成，唯一跨界动作是下载/解压一个静态 shell zip。

## 2. 契约：plugin.registry.yaml（innate.domain-pages.v1）

本仓根的 `plugin.registry.yaml`：

```yaml
protocol: innate.domain-pages.v1
version: 1
template:
  repo: variableway/innate-fe-templates   # GitHub 仓库
  release: pages-kit                       # release tag
  shell: writing-shell.zip                 # 资产文件名
site:
  title: Innate Daily
  defaultPath: /
  home: ./pages/home.md                    # 首页正文（相对仓根）
domains:
  - id: writing
    content: ./content                     # 正文目录（递归收 *.md / *.mdx）
    mount: content                         # 叠加到产物内的目录名
    path: /writing
pages:
  outDir: site                             # 产物目录（相对仓根）
```

CLI 侧的解析与校验在 `innate-fe-cli/src/lib/pages-registry.ts`：协议名、version、
`template.repo` 为硬校验；`release` / `shell` 有默认值（`pages-kit` /
`writing-shell.zip`）。

## 3. pages pack 流水线（CLI 实际做的事）

源码位置 `innate-fe-cli/src/commands/pages.ts`，顺序固定：

1. **找仓**：从 cwd（或 `--dir`）向上找 `plugin.registry.yaml`；
2. **取 shell**：优先级 `--shell <zip>` > 环境变量 `PAGES_SHELL_ZIP` > 仓根同名
   zip（本仓 `.gitignore` 已备了 `writing-shell.zip` 这一行）> 从
   `template.repo@release` 下载（需要 `GH_TOKEN` / `FE_TEMPLATES_TOKEN`，缓存到
   `~/.cache/innate-fe-cli/pages-kit`）；
3. **解压** shell zip → `site/`（内置 zip 读写，不依赖系统 `unzip`）；
4. **叠首页**：`site.home` → `site/pages/home.md`（文件不存在直接报错）；
5. **写 manifest**：`site/site.json`（title / home / domains 元数据）；
6. **叠正文**：每个 domain 把 `content` 目录的 markdown 拷到
   `site/<mount>/`，并生成 `index.json`（posts 清单）；
7. **终检**：`site/index.html` 必须存在，否则整体失败。

## 4. 上游断链（2026-10-25 实测）

按 registry 默认路径走（从 `variableway/innate-fe-templates` 下载
`writing-shell.zip`）**当前不通**，实测证据：

- `gh repo view variableway/innate-fe-templates` → `Could not resolve to a
  Repository`（模板仓已删除；variableway 组织 25 个仓库里没有它的替身）；
- `variableway/innate-fe` 的 rolling release `pages-kit`（2026-10-22 起）只含
  `innate-fe-cli-darwin-arm64` / `innate-fe-cli-linux-x64` 两个 CLI 二进制，
  没有 zip；
- base 仓 #19（`6185d22`）删掉了 `scripts/pack-writing-shell.sh`（内容为直接
  `exit 1`）——writing-shell 流是旧状态遗留，现行站点路线是本仓自己的 Vite
  构建（`pnpm build` → `dist/`）。

结论：`pages pack` 的**CLI 流水线完好**，断的是**模板 zip 的供给方**。

## 5. 旁路：用 CLI 自建的 webshell 当 shell（本文实测走通的路径）

思路：`innate-fe-cli build` 只打 webshell（跳过会 gen empty 的 npm prebuild），
产物 `shells/webshell/dist` 有根 `index.html`，打 zip 后正好满足 pack 的终检。

```bash
# 0) 环境准备（一次性）：base 仓装依赖（见 §7 的 pnpm 坑）
cd <workspace>/base/innate-fe
node ~/Library/pnpm/.tools/pnpm/<ver>_tmp_*/node_modules/pnpm/bin/pnpm.mjs install

# 1) CLI 构建 webshell
bun innate-fe-cli/src/index.ts build
# ✓ built in ~3s → shells/webshell/dist/{index.html,assets/}

# 2) 打 zip（index.html 必须在 zip 根）
cd shells/webshell/dist && zip -qr /tmp/writing-shell.zip . && cd -

# 3) pack：--shell 旁路供给 zip
bun innate-fe-cli/src/index.ts pages pack \
  --dir <workspace>/innate-content/innate-daily \
  --shell /tmp/writing-shell.zip
```

实测输出：

```
  shell: /tmp/writing-shell.zip
  解压 10 个文件 → .../innate-daily/site
  site: home → .../innate-daily/site/pages
  writing: 6 posts → .../innate-daily/site/content
✔ Pages 产物: .../innate-daily/site
```

产物结构（`find site -type f` 实测）：

```text
site/
├── index.html                    # shell 的 SPA 入口（终检项）
├── assets/                       # shell 的 js / css
├── site.json                     # {"title","home","defaultPath","domains"}
├── pages/home.md                 # 首页正文（叠加）
├── content/                      # writing domain 叠加
│   ├── index.json                # 6 篇 posts 清单
│   └── research/ui/*.md
└── wandesk-ui/                   # shell 自带的静态插件（随 dist 进来）
```

静态服务验证（任起一个 http server）：

```bash
cd site && python3 -m http.server 4180
curl -s -o /dev/null -w "%{http_code}" localhost:4180/index.html     # 200
curl -s -o /dev/null -w "%{http_code}" localhost:4180/site.json      # 200
curl -s -o /dev/null -w "%{http_code}" localhost:4180/pages/home.md  # 200
curl -s -o /dev/null -w "%{http_code}" localhost:4180/content/research/ui/fonts.md  # 200
```

> 说明：webshell 是通用工作台壳，不消费 `site.json` / `content/index.json`
> 的 writing 语义——本旁路验证的是 **pack 流水线的正确性**（找仓、解压、叠加、
> manifest、终检），站点的 writing UI 仍需真正的 writing-shell 模板（见 §8）。

另两条等价旁路（未逐一实测，机制见 §3 优先级）：环境变量
`PAGES_SHELL_ZIP=/path/to.zip`；或把 zip 放本仓根（`.gitignore` 已忽略
`writing-shell.zip`，pack 自动识别）。

## 6. dry-run 与两个负面确认

```bash
# registry 解析 / outDir 解析检查，无副作用
bun innate-fe-cli/src/index.ts pages pack --dir <本仓> --dry-run
# → (dry-run) pack .../innate-daily → .../innate-daily/site

# innate-feeds 不是文稿仓（它根上是 Bun + Hono 独立 app）
cd ../innate-feeds
bun <...>/innate-fe-cli/src/index.ts pages pack --dry-run
# → 失败: 找不到文稿仓（向上未找到 plugin.registry.yaml）
bun <...>/innate-fe-cli/src/index.ts scan --root .
# → 失败: 找不到打包登记文件: .../innate-feeds/plugins.registry.yaml
```

innate-feeds 的 `registry.yaml` 是另一套协议
（`innate.web-external-sources.v1`，外部源调研登记），与 CLI 无关。feeds 要接
innate-fe 体系的路径是 `import`（把构建产物作为静态 iframe 插件导入壳）或
`registry install`（接私有 npm 源装 `@innate/*`），见 base 仓
`docs/use-cases/05`、`06`。

## 7. 环境坑记录（2026-10-25，macOS arm64）

**pnpm 版本切换 ENOEXEC**：本机 pnpm 10.33 按 `packageManager: pnpm@12.11.2`
自动切换时报 `spawnSync .../12.11.2/bin/pnpm ENOEXEC`。根因：npm 包 pnpm 的入口
文件是**故意的无 shebang sh 脚本**（等 install.js 用原生二进制替换），原生二进制
下载因网络失败没替换成功——shell 里能跑（有 sh 回退），`spawnSync`（无 shell）
不能。修复（根因级）：

```bash
export HTTPS_PROXY=<proxy> HTTP_PROXY=<proxy>
cd ~/Library/pnpm/.tools/pnpm/12.11.2_tmp_*/node_modules/pnpm
node install.js        # 拉取 Mach-O arm64 原生二进制替换 shim
```

修复后 `pnpm exec`（CLI 内部 spawnSync 路径）与直跑 pnpm 都恢复。临时替代：
`node .../pnpm/bin/pnpm.mjs install`（init.sh 的同款回退）。

**base 仓依赖**：`pnpm install`（578 包）+ `bun innate-fe-cli/src/index.ts build`
即可，无需跑完整 `pnpm verify`。

## 8. 缺口与后续

| 事项 | 状态 | 说明 |
| ---- | ---- | ---- |
| `pages/home.md` 缺失 | ✅ 已补（2026-10-25） | registry 声明 `site.home` 但仓里无此文件，pack 会失败；已按站点现状补一份 |
| 模板 zip 供给 | ❌ 上游断链 | 需重建模板仓（或改 `template.repo` 指向新源），恢复「下载即 pack」 |
| webshell 旁路 | ✅ 可用 | 流水线验证用；非 writing UI 的长期方案 |
| 仓根就近 zip | ✅ 机制可用 | `.gitignore` 已备 `writing-shell.zip` 条目 |
| innate-feeds 接入 | 未开始 | 走 `import` / `registry install`，见 §6 |

## 相关

- `use-cases/build-it-own/build-innate-daily.md` —— 本仓站点本身的构建与部署（Vite 路线，现行）
- base 仓 `docs/use-cases/05-private-registry-and-github-packages.md` —— pages pack 的原始设计文档
- base 仓 `innate-fe-cli/README.md` —— CLI 全量命令
