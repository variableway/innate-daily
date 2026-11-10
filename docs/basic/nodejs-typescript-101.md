---
title: "Node + TypeScript 入门 · 第一课"
slug: nodejs-typescript-101
date: 2026-11-07
author: Innate Team
category: guide
tags: [use-case, node, typescript, spark-cli]
status: published
excerpt: "面向零基础的 Node/TypeScript 项目第一课：先用 docmd init 五分钟建一个文档站并马上启动，再顺着它讲项目的基本技术、怎么用第三方包、package.json / lockfile 怎么管理依赖、构建与工具链的分工，最后回到本仓库 innate-daily 看这套知识在真实项目里的样子。"
---

# Node + TypeScript 入门 · 第一课

面向零基础：先用五分钟把一个文档站**跑起来**，再顺着这个站搞懂
「一个 Node/TypeScript 项目是怎么炼成的」。

学完你应该能回答四个问题：

1. Node/TS 项目的**基本技术**是什么？
2. 怎么**使用第三方包**（别人写好的轮子）？
3. 怎么**管理依赖**（版本锁定、升级、清理）？
4. **构建与工具链**是怎么分工的？

---

## 0. 先跑起来：五分钟拥有一个文档站

不谈概念，先动手。你需要 Node.js（≥ 20）和一个终端，然后：

```bash
mkdir my-docs && cd my-docs    # 建个项目文件夹
npx @docmd/core@latest init    # 生成一个现成的文档站
npm install                    # 装依赖（第一次会花一两分钟）
npm run dev                    # 启动开发服务器
```

浏览器打开 <http://localhost:3000>——一个带侧栏、搜索和主题切换的
文档站已经在跑了。打开 `docs/index.md`，改一行字保存，页面立刻更新。

`init` 给你的东西很少，每个文件都值得打开看一眼：

| 文件 | 作用 |
|------|------|
| `package.json` | 项目声明 + 依赖清单 + 命令别名（今天的主角） |
| `docmd.config.json` | 站点配置：标题、源目录、输出目录、主题 |
| `docs/index.md` | 首页内容——文档站吃的就是 Markdown |
| `SKILL.md` | docmd 自带给 AI 助手看的操作说明，教 agent 怎么运维这个站 |

它的发布链路只有三步：

```
docs/**.md          Markdown 源文件
   │
   ├─ docmd build    ① 读 Markdown + docmd.config.json → site/
   │
   └─ site/          ② 静态 HTML + 搜索索引 + sitemap
        │
        └─ Actions  ③ push 到 main 自动发布到 GitHub Pages
```

接下来四节都用这个刚出生的项目当教材。看完之后，我们回到
你正在读的这个站（innate-daily），看它作为真实项目是怎么把
这套知识用起来的。

---

## 1. 基本技术：一个 Node 项目 = 一个 package.json

打开刚生成的 `package.json`——整个项目的"身份证 + 遥控器"就是它。
（如果你写过 Go：它同时扮演 `go.mod` 和 `Makefile` 两个角色。）

你手里这个文件的真身：

```json
{
  "name": "my-docs",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "docmd dev",
    "build": "docmd build",
    "preview": "npx serve site"
  },
  "dependencies": {
    "@docmd/core": "^0.9.8"
  }
}
```

逐字段看一遍：

| 字段 | 作用 | 备注 |
|------|------|------|
| `name` / `version` | 项目名与版本 | 私有项目随便填 |
| `private: true` | 禁止意外发布到 npm | 文档站务必加 |
| `type: "module"` | 整个项目用 ESM 语法 | 写成 `commonjs` 则用 `require` |
| `scripts` | 命令别名 | `npm run dev` = `docmd dev`，你刚才启动就用的它 |
| `dependencies` | 运行时依赖 | 进产物，全项目只有一个：docmd 本体 |
| `devDependencies` | 开发期依赖 | 不进产物（typescript、eslint…） |

> **ESM vs CJS 速记**：现代 Node 默认 ESM，写 `import` / `export`；
> 老项目用 CJS，写 `require` / `module.exports`。两者可以共存：
> `.cjs` 后缀强制 CJS，`.mjs` 后缀强制 ESM。

---

## 2. 使用第三方包

Node 的第三方包也叫「轮子」，从 npm registry 下载。**包名 = 你要用的功能**：

```bash
npm install @docmd/core          # 装一个运行时依赖
npm install -D typescript @types/node   # 装开发期依赖（-D = --save-dev）
npm install docmd@latest         # 装全局命令行工具（不写进 package.json）
```

安装后你会同时得到三样东西，**它们都是结果，不要手改**：

1. `node_modules/` —— 依赖实体落盘
2. `package.json` 的 `dependencies` —— 被自动写入
3. `package-lock.json` —— 锁文件被自动写入

### 在 TypeScript 里怎么用

```ts
// src/index.ts
import { readdir } from "node:fs/promises";
import { join } from "node:path";

export async function listDocs(root: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  return entries.filter((e) => e.isFile() && e.name.endsWith(".md"))
                .map((e) => join(root, e.name));
}
```

三个要点：

1. **`node:` 前缀**是 Node 内置模块（`node:fs`、`node:path`…）的标准写法
2. **内置模块要装类型**：`npm i -D @types/node`，否则 TS 报「找不到模块」
3. **类型来自包的 `.d.ts`**：第三方包自带类型时不用额外装 `@types/xxx`

### 找不到合适的包怎么办

- npm 生态的关键词：`cli` `parser` `markdown` `static site`
- 官方文档 <https://docs.npmjs.com>
- 实在没有就用 `child_process` 调命令行工具（很多 Node 包只是 CLI 的壳）

---

## 3. 如何管理依赖

| 文件 | 作用 | 类比（Go） |
|------|------|------------|
| `package.json` | 声明：名字、版本范围、脚本 | `go.mod`（但没有校验和） |
| `package-lock.json` | 每个依赖的**精确版本 + 哈希** | `go.sum` |
| `pnpm-lock.yaml` | pnpm 的锁文件 | 同上，格式不同 |
| `node_modules/` | 依赖实体 | `GOMODCACHE` + vendor 目录 |

常用命令：

```bash
npm install            # 按 package.json 装依赖（生成/更新 lockfile）
npm ci                 # 严格按 lockfile 装（CI 首选，永远可复现）
npm outdated           # 看哪些依赖有新版本
npm update <pkg>       # 升级某个依赖
npm uninstall <pkg>    # 移除依赖
npm audit              # 查依赖里的已知漏洞
npm audit fix          # 自动修能修的
```

### 三条好习惯

1. **`package.json` 和 lockfile 一定要提交进 Git**——CI 用 `npm ci` 才能复现你本地的构建
2. **区分 dependencies 和 devDependencies**——`typescript` 这类只服务于构建的工具不该进运行时依赖
3. **CI 里用 `npm ci` 而不是 `npm install`**——前者严格按锁文件装，不会偷偷升级

### 锁文件该用哪个

| 包管理器 | 锁文件 | 特点 |
|----------|--------|------|
| npm | `package-lock.json` | 自带，最省事 |
| pnpm | `pnpm-lock.yaml` | 硬链接共享 store，省磁盘、装得快 |
| yarn | `yarn.lock` | 生态老牌 |

> 三选一，别混用。本仓库用 pnpm（见 `pnpm-lock.yaml`）；
> 团队统一用 npm 就换成 `npm install` + `package-lock.json`。

---

## 4. 构建与工具链

Node 的构建比 Go「松」——**没有编译期**，真正需要编译的只有 TypeScript。

### tsconfig.json：把编译规则写进文件

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"]
}
```

| 选项 | 作用 | 建议 |
|------|------|------|
| `target` | 编译成哪个版本的 JS | `ES2022` |
| `module` / `moduleResolution` | 模块语法与解析方式 | `ESNext` + `bundler` |
| `outDir` / `rootDir` | 输出目录 / 源码目录 | `dist` / `src` |
| `strict` | 打开全部严格检查 | **永远开** |
| `declaration` | 生成 `.d.ts` 类型声明 | 发包时才需要 |
| `sourceMap` | 生成 sourcemap | 调试用 |

### npm scripts = Makefile 的等价物

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "typecheck": "tsc --noEmit",
    "build": "tsc",
    "test": "vitest run",
    "lint": "eslint src"
  }
}
```

```bash
npm run dev        # 开发（热重载）
npm run typecheck  # 只做类型检查，不产出文件
npm run build      # 编译到 dist/
npm test           # 跑测试
```

| 你想做的事 | Node | Go |
|------------|------|-----|
| 编译 | `npm run build`（tsc） | `go build` |
| 只查错不产出 | `tsc --noEmit` | `go vet` |
| 跑测试 | `npm test`（vitest/jest） | `go test ./...` |
| 代码风格 | `eslint` + `prettier` | `gofmt` + `golangci-lint` |
| 任务清单 | `package.json` 的 `scripts` | `Makefile` / `Taskfile.yml` |
| 交叉编译 | 一般不需要 | `GOOS=windows go build` |

> Node 项目的「交叉编译」通常不需要——产物是 JS，跨平台天然可用；
> 需要单文件可执行文件时才引入打包器（`esbuild`、`pkg`、`node --experimental-sea`）。

---

## 5. Use case：你正在读的这个站，就是这么造的

概念过了一遍，回头看一个真实项目——innate-daily，也就是你正在读的
这篇文章所在的仓库。它比文档站更进一步：不只是"把 Markdown 变成
网页"，而是一个**纯静态的 React 单页应用（SPA）**。

打开它的 `package.json`，`scripts` 长这样：

```json
{
  "scripts": {
    "dev": "vite",
    "typecheck": "tsc --noEmit",
    "build": "vite build && node -e \"…顺手复制一份 404.html 兜底…\"",
    "test": "vitest run",
    "lint": "oxlint src"
  }
}
```

（它用 pnpm 管依赖，所以根目录是 `pnpm-lock.yaml` 而不是
`package-lock.json`——锁文件"三选一别混用"的现实版。）

它和 docmd 站的关键差别在**内容怎么进网页**：docmd 构建时把 Markdown
渲染成一个个 HTML 页面；innate-daily 则是在构建期把 `docs/` 下的
Markdown **原样内联进 JS bundle**（Vite 的 `import.meta.glob`），
运行时没有文件系统、没有网络请求——整站就是一个可以放在
GitHub Pages 上的静态 SPA。细节见
[Markdown 写作指南](markdown-usage.md)。

把你学过的东西对号入座：

| 你学过的 | 在 innate-daily 里 |
|----------|-------------------|
| `npm run dev` | `pnpm dev` → <http://localhost:4016> |
| 依赖清单与锁文件 | `package.json` + `pnpm-lock.yaml` |
| TypeScript 编译选项 | `tsconfig.json`（`pnpm typecheck` 只查错、不出文件） |
| 构建产物 | `dist/`，push 后由 GitHub Actions 发布到 Pages |
| CI 三件套 | Actions 里 `pnpm install --frozen-lockfile` → `pnpm build` |

想拥有一个这样的站？「拥有你自己的 Daily」系列（从
[1/4 · 在哪里写](../own-your-daily/1-write.md) 开始）从 fork 到上线
带你走一遍，全程不需要写代码。

---

## 6. 和 Go 一次说清

| 维度 | Go | Node + TypeScript |
|------|-----|--------------------|
| 依赖清单 | `go.mod` | `package.json` |
| 锁文件 | `go.sum` | `package-lock.json` / `pnpm-lock.yaml` |
| 装依赖 | `go mod download` | `npm ci` |
| 清理依赖 | `go mod tidy` | `npm prune` / 删掉重装 |
| 编译 | `go build` | `tsc` |
| 类型检查 | 编译时自带 | `tsc --noEmit` |
| 任务清单 | `Makefile` / `Taskfile.yml` | `package.json` 的 `scripts` |
| 产物 | 单二进制，跨平台需交叉编译 | `.js` 文件，跨平台通用 |
| 分发 | `go install` / 编译后拷走 | 发布到 npm，或 `npm i -g` |

---

## 附录 A：课程 Prompt（复制给 AI 助手即可开课）

```text
你是我的 Node + TypeScript 入门导师。我是零基础。第一步请带我运行
npx @docmd/core@latest init 建一个文档站、npm install、npm run dev
马上启动，确认我能看到站点；然后以这个站为教材，按下面四课教我，每课：
概念一句话 + 一个能跑的小例子 + 一个小练习。
1) 基本技术：package.json / scripts 的分工，ESM 与 CJS 的区别
2) 使用第三方包：npm install、node: 内置模块、@types 类型包
3) 依赖管理：lockfile、npm ci 与 npm install 的区别、npm audit
4) 构建与工具链：tsconfig.json、tsc、eslint/prettier、CI 里的 npm ci
最后带我看本仓库 innate-daily 的真实实现，把四课知识对号入座。
要求：一次只讲一课；优先用真实项目文件举例；练习题要能在 5 分钟内做完；
我答完再进下一课。
```

## 附录 B：Skill（SKILL.md，可安装为 Agent 技能）

保存为 `SKILL.md`（如放到 `~/.codex/skills/nodejs-typescript-101/SKILL.md`
或 `.claude/skills/nodejs-typescript-101/SKILL.md`）即可作为
「Node/TS 第一课」技能调用：

```markdown
---
name: nodejs-typescript-101
description: Node.js + TypeScript 零基础入门第一课。当用户想学习用
  TypeScript 写工具、看懂 package.json/tsconfig.json，或要求
  "Node 入门/TS 入门/第一课"时使用。
---

# Node + TypeScript 入门第一课

第一步先用 `npx @docmd/core@latest init` 带学员建一个文档站并马上启动，
以它为教材按顺序教四课，每课一个 5 分钟练习：

1. **基本技术** — `package.json` 的 name/scripts/type、ESM 与 CJS；
   演示 `npm install` → `npm run dev`，改 docs/ 看即时更新。
2. **第三方包** — `npm install` / `-D`；`node:` 内置模块；`@types/node`
   为何必须装；演示读取 `docs/` 目录。
3. **依赖管理** — `package-lock.json` vs `pnpm-lock.yaml`；`npm ci`
   与 `npm install` 的差异；`npm audit`。
4. **构建与工具链** — `tsconfig.json` 关键项、`tsc --noEmit`、npm scripts
   当作 Makefile 用、CI 中 `npm ci` + typecheck。

收尾：带学员看本仓库 innate-daily 的真实实现（Vite SPA + 构建期内联
Markdown + GitHub Pages），把四课知识对号入座。

教学规则：一次一课；中文讲解、代码保持英文；每课结束出 1 道练习并等待
作答；全部完成后给出「继续深入」的三个方向（单元测试、类型体操、打包成单文件）。
```

---

下一步：回到你 init 出来的项目，改一篇文档、跑一遍 `npm run build`，
看看 `site/` 里出现了什么——你就完成了第一课的毕业项目。
