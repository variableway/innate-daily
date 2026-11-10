---
title: "调研：可执行教程的制作、导航与「点击即本地运行」"
slug: executable-tutorials-research
date: 2026-11-09
author: Innate Team
category: research
tags: [research, tutorial, executable, runme, innate-executable, pipeline]
status: draft
excerpt: "针对 issue #9 的一次方案调研：参考 innate-executable 与业界模式，确认可执行教程如何快速批量制作、如何组织导航、如何与终端/文本编辑器联动，以及读者在教程里点击什么就能把内容在本地运行/安装起来。"
---

# 调研：可执行教程的制作、导航与「点击即本地运行」

> 对应 [issue #9](https://github.com/variableway/innate-daily/issues/9)。
> 本轮**不设计具体教程内容**，只解决四个结构性问题：怎么快速做出这种教程、
> 怎么导航、怎么和终端/编辑器联动、点击什么能在本地跑/装起来。
> 一手材料：本地 `apps/innate-executable`（variableway/innate-executable）源码 + 业界方案检索。

## 0. 结论速览

| 问题 | 答案 |
|---|---|
| **怎么快速制作** | 教程 = 一篇 MD（frontmatter + `{executable}` 标记块）+ 一个可运行模板工程；「先写幂等脚本/工程，再包教程文本」是 innate-executable 的既定工作流；新增教程走脚手架命令生成骨架 |
| **怎么导航** | 系列/学习路径做独立数据层（innate-executable 用 courses JSON + 侧边栏树）；静态站更轻：frontmatter `series` / `seriesOrder` 推导 |
| **怎么和终端/编辑器联动** | 浏览器**没有**唤起本地终端的标准通道（wt.exe 是 CLI 不是 URI scheme）；实际只有三条路：复制到剪贴板、编辑器深链（`vscode://`）、自有桌面应用自定义协议 |
| **点击什么就能本地运行/安装** | 分层：①复制一行安装命令（`npx degit` 落盘模板工程）②Runme 深链（VS Code 里变可运行 notebook）③innate-executable 桌面 deep link（应用内真 PTY）④WebContainers 浏览器内试跑（仅 Node、托管受限） |

核心事实：**「点击即本地运行」只有两条真路径——编辑器（Runme / deep link）
和自有桌面应用（PTY）；纯静态站能全覆盖的只有「复制 / 落盘」层。**
因此推荐分层组合：L0+L1 是普惠底座，L2 是 innate-executable 的主场。

## 1. innate-executable 是怎么解的

### 1.1 内容制作

- 教程 = `playground/apps/desktop/public/tutorials/*.mdx`，文件名即 slug。
- frontmatter 约定：`title / description / difficulty / duration / category / tags / sources`，
  可选 `course / courseOrder`（解析器 `src/lib/tutorial-scanner.ts`）。
- `scripts/generate-tutorials-manifest.mjs` 在 predev/prebuild 扫描生成
  `tutorials-manifest.json`——**放一个文件即收录**，零登记成本。
- 生产流程（`tasks/tutorial-development-workflow.md`）：
  **幂等脚本（.sh/.ps1）→ guides 教程 → 教程 MDX**。可运行真源先行，文本后包。

### 1.2 点击运行链路

- fenced 块加 `{executable}` metastring（支持 bash/sh/python/js/powershell）
  → 渲染成带「复制/执行」按钮的 `RunnableCodeBlock`；
  另有 `<PlatformTabs unix windows>` 分平台命令、`<RunButton command>`。
- 点击后 `lib/run-command.ts:getRunCommand()` 按真实 shell 包装命令
  （bash 类走 heredoc 落临时脚本，cmd.exe 经 powershell 转写 .bat/.ps1），
  进命令队列（未就绪排队、错峰发送）→ 应用内 xterm 终端。
- **只有「发 shell 命令」一种动作**，写文件 / 安装都靠 shell 本身，无独立文件 API。

### 1.3 导航

- 系列不写在 md 里，而是数据层 `seed-courses.json` + `courses-store`
  （Zustand persist，运行时可编辑）；侧边栏系列树由它驱动，
  workspace 的 `_courses.json` / `courses/*.json` 可合并覆盖。

### 1.4 手动装内容

- `/admin/workspace`：选本地文件夹注册为 workspace，扫 `.md/.mdx`（深度 ≤3），
  workspace 同 slug 覆盖内置教程；另有单文件导入。
- **缺口：没有 CLI / 一键安装包**（`scripts/` 只有启动器和安装器 wrapper）。

### 1.5 关键边界

- 桌面端（Tauri + portable-pty）是**真终端**，能真跑 `npm install` / `go build`；
- Web 端是**假终端**（硬编码模拟，`node -v` 回显固定值），不可依赖；
- 没有 VS Code 集成、没有 deep link（自定义协议未注册）；
  根目录 `rustup-init.exe` 是未接入的素材。

## 2. 业界「点击即运行」六类模式

| 模式 | 代表 | 机制 | 前置 | 静态站适配 | 关键边界 |
|---|---|---|---|---|---|
| 编辑器可运行 md | **Runme**（stateful） | md 代码块变 notebook 单元格，在 VS Code 集成终端真实执行；`vscode://stateful.runme?repository=…&fileToOpen=…` 深链一键克隆 + 打开 | VS Code + 扩展 | **高** | 命令权限 = 用户手敲，Workspace Trust 兜底 |
| 复制即运行 | copy 按钮、`npx create-*`、brew/winget | 只进剪贴板，人粘贴兜底 | 无 | **最高** | 弃 `curl\|sh`（公认反模式）；配 OS tab + 校验命令 |
| 编辑器深链 | `vscode://vscode.git/clone?url=`、vscode.dev/redirect | 浏览器弹确认唤起 IDE | 装了对应 IDE | 中 | **终端方向无标准深链**；不能静默执行 |
| 云沙箱 | WebContainers、Codespaces/Gitpod/Colab 徽章 | 浏览器内/云端跑，模板仓库即环境 | 网络 / 账号 | 高-中 | WebContainers 要 COOP/COEP 头，**GitHub Pages 不支持**；仅 Chromium |
| 教程即脚手架 | **degit**、create-xxx、devcontainer | 一行命令把教程工程落盘初始化 | Node/git | **最高** | 低风险；天然适合批量制作 |
| 自建桌面通道 | Tauri deep-link 插件 | `myapp://run?id=` 唤起本地应用执行 | 装自研应用 | 低 | 安全模型最差（任意网页可发起）——但 innate-executable 正是这个通道 |

## 3. 建议的分层组合

```
教程正文（标准 MD + {executable} 块）
   │
   ├─ L0 全量读者：「复制」按钮 + 平台 tab + 一行安装命令
   │     npx degit variableway/<tutorial-template> my-lab   ← 落盘即「手动安装内容」
   │     cd my-lab && npm ci && npm run start               ← 可验证的下一步
   │
   ├─ L1 VS Code 用户：「在 VS Code 运行」按钮 = Runme 深链
   │     vscode://stateful.runme?repository=…&fileToOpen=README.md
   │     → 自动克隆 + 教程变可执行 notebook（编辑器/终端联动最优解）
   │
   ├─ L2 桌面用户：innate-executable deep link（innate://tutorial?id=…）
   │     → 应用内真 PTY 跑完整安装（唯一能真跑 go build / npm i 的通道）
   │
   └─ L3 免装环境：Node 教程 WebContainers 页内试跑 / Codespaces 徽章
```

### 制作流水线（快速批量出教程）

```
new:tutorial <slug>（脚手架）
   → 生成「模板工程（幂等脚本）+ 教程 MD 骨架（{executable} 块 + 步骤标题）
          + 系列登记」
   → 作者只填内容
   → CI 跑一遍脚本，验证所有可执行块都能跑
```

- 本站已有 `import.meta.glob` 构建期收录，与 innate-executable 的 manifest 扫描
  能力等价，**不需要新做收录层**。
- 导航用 frontmatter（`series` / `seriesOrder`）或一份 courses.json 即可，
  不必上「运行时可编辑」的数据层。
- 「手动安装内容」两条等价入口：网页上一行 `degit`（普通读者）；
  桌面 app 的 workspace 目录导入（innate-executable 用户）。

## 4. 要避开的坑

1. `curl | sh` 类一键执行（安全反模式；要固定版本 + SHA 校验 + 先下载可审查）。
2. 任何「自动执行不可信参数」的自定义协议深链（Electron/Tauri 都有实证 CVE）；
   真做桌面通道必须白名单参数。
3. 在 GitHub Pages 上指望 WebContainers（COOP/COEP 头配不了；
   要换托管或 coi-serviceworker，且仅 Chromium）。
4. 期待「网页按钮直接跑进本地终端」——不存在标准通道，别为此造轮子。
5. 参考 innate-executable 的 Web 端模拟终端做「站内运行」展示——它是假的，
   只能当 demo。

## 5. 参考链接

- Runme：<https://runme.dev>
- WebContainers 头配置：<https://webcontainers.io/guides/configuring-headers/>
- degit：<https://www.npmjs.com/package/degit>
- VS Code CLI/深链：<https://code.visualstudio.com/docs/editor/command-line>
- Tauri deep-link 插件：<https://v2.tauri.app/plugin/deep-linking/>
- coi-serviceworker：<https://github.com/gzuidhof/coi-serviceworker>
- curl-pipe-bash 规则：<https://semgrep.dev>
- Windows Terminal 命令行参数（无 URI scheme）：
  <https://learn.microsoft.com/en-us/windows/terminal/command-line-arguments>

## 6. 下一步（待定）

1. 确认分层组合（L0+L1 为底座，L2 接 innate-executable，L3 按需）。
2. 定教程制作约定：frontmatter 扩展字段、`{executable}` 块语法、模板工程结构。
3. 选一篇 docs/basic 教程做 L0+L1 最小验证（degit 模板 + Runme 深链实点）。
