---
name: run-innate-daily
description: Run, drive, and screenshot the innate-daily writing-site SPA (Vite + React, port 4016, hash routes). Use when asked to run/start the app, preview it, take UI screenshots, or verify a change in the real running app.
---

innate-daily（`@innate/daily`）是 Vite + React 的纯静态写作站，hash 路由 SPA。Agent 驱动路径：后台起 `pnpm dev`（**严格端口 4016**），再用本目录的 `driver.mjs`（playwright-core + 无头系统 Chrome/Edge）访问路由、等待关键文本、截图、汇总控制台报错。`chromium-cli` 在本环境不存在，别找，直接用 driver。所有路径相对仓库根目录。

## Prerequisites

- Node ≥ 20.11（本机验证 v24.16）+ pnpm
- 系统 Chrome 或 Edge（自动发现常见安装路径；`CHROME_PATH` 可覆盖）
- playwright-core —— 一次性装在**仓库外**的驱动目录，不污染本仓依赖：

```bash
mkdir -p "$TEMP/claude/pw-driver" && cd "$TEMP/claude/pw-driver" && npm init -y >/dev/null && npm i playwright-core
```

## Setup

```bash
pnpm install --prefer-offline
```

## Build

```bash
pnpm build   # vite build + 404 兜底 → dist/，约 18s；chunk >500kB 警告是常态
```

## Run (agent path)

起服务（已在跑则跳过；strictPort，起第二个必失败）：

```bash
pnpm dev &
timeout 30 bash -c 'until curl -sf http://localhost:4016 >/dev/null; do sleep 1; done'
```

跑驱动（参数是**不带斜杠的页面名**，各页自带等待文本；第二参数可覆盖等待文本）：

```bash
node .claude/skills/run-innate-daily/driver.mjs             # collections，等待 "Spark CLI"
node .claude/skills/run-innate-daily/driver.mjs writing     # /#/writing，等待 "All Notes"
node .claude/skills/run-innate-daily/driver.mjs landing     # /，等待 hero 标题
```

截图 → `.claude/skills/run-innate-daily/shots/<page>.png`（collections / writing / root，已 gitignore）。退出码：`0` 找到文本；`1` 超时（仍截图留证）；`2` 服务未起。

停服务（Windows git-bash，注意 `//` 双斜杠）：

```bash
netstat -ano | grep ":4016" | grep LISTENING   # 取最后一列 PID
taskkill //F //PID <pid>
```

## Run (human path)

```bash
pnpm dev   # → http://localhost:4016/（hash 路由：/#/writing、/#/collections）；Ctrl-C 停
```

## Test

```bash
pnpm test
```

预期 11 个文件 41 用例、**恰好 1 例失败**（`src/test/content.test.ts` 的 tools-for-thinkers 标题断言）——main 上即如此，属存量问题，不是你改坏的。同类存量：`pnpm lint` 缺 oxlint 依赖直接失败；`pnpm typecheck` 有 7 条 `@types/node` 缺失的 config 报错（`src/` 干净）。

## Gotchas

- **git-bash 参数转换**：MSYS 会把含 `/` 的命令行参数改写成 Windows 路径——`"/#/writing"` 变 `C:/Program Files/Git/#/writing`，连 `"#/writing"`、`"--route=/#/writing"` 都会被转。所以驱动只收裸页面名（`collections` / `writing` / `landing`）；误传 `/#/x` 形式驱动会尝试自我修复，但别依赖。
- **每页恰 1 条 favicon 404**：`index.html` 不引用图标也无 favicon 文件，浏览器自动请求 `/favicon.ico` 落空——存量无害，驱动照常 PASS。
- **/collections 的 iframe CSP 报错是预期**：右栏查看器用 `<iframe src={item.url}>` 预览收藏的外站（`src/components/collections/collection-viewer.tsx`）。GitHub 发 `frame-ancestors 'none'` 拒绝嵌入 → 控制台报 violation、loading 圈不消失，出口是「Open site」链接。别修。
- **选择器陷阱**：宽屏三栏下页面有 2 个 `<section>`，`section.nth(1)` 是右侧详情栏，中列列表是 `section.first()`；侧栏 Recent 段不受筛选影响——用整页文本定位会误报「过滤失效」。
- **首访慢**：Vite 按需编译，首次 goto 可能 10s+。用 `waitForSelector`（driver 内置 30s），别用固定 sleep。
- **npm 装 playwright-core 可能超 3 分钟**：前台命令超时就挪后台装。
- **React 受控输入**：对搜索框（`#collections-search`）要用 playwright 的 `fill`（走 input 事件管线），别用 `eval el.value=`，后者不触发 onChange。

## Troubleshooting

- **驱动退出码 2（server 未起）**：`pnpm dev` 没在跑或被杀了。检查 `netstat -ano | grep 4016`，没有监听就重新后台起服务。
- **`EADDRINUSE` / vite 启动即退**：4016 已有服务在跑（strictPort），直接跑驱动即可，不用再起。
