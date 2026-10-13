# 用例：把独立 app 以 iframe 插件挂进壳

独立 app 自己的进程提供页面，壳只负责侧栏入口和 iframe 宿主。示例是 [`apps/web-showcase`](../../apps/web-showcase)（`@innate/web-showcase`，Next.js，live 地址 http://localhost:4003 ）。

showcase 来自 `iframe-apps` profile 和它应用根的 [`plugin.json`](../../apps/web-showcase/plugin.json)（`iframeSrc: http://localhost:4003/`，`origins: ["http://localhost:4003"]`），**不用** `--plugin-file`。协议见 [innate.web-plugin.iframe-onboarding](../specs/v1/innate.web-plugin.iframe-onboarding.md)。

本次核对时间：2026-10-12。命令在仓库根执行，页面在浏览器里点过。

## 操作

前提：4003 与 4020 端口空闲。要跑两个进程：showcase 自己 + 壳。

1. 先单独确认 iframe 应用能独立跑：

   ```bash
   pnpm --filter @innate/web-showcase dev
   ```

   浏览器打开 <http://localhost:4003>，确认 showcase 自己能开（自己的侧栏和主题切换，没有任何壳的 UI）。这一步失败先修 showcase，不要先查壳。

2. 保持 showcase 运行，另开一个终端按 profile 起壳（不要加 `--plugin-file`）：

   ```bash
   bun tools/innate-fe-cli/src/index.ts dev --profile iframe-apps
   ```

   这条命令会：重写壳的 gen 接缝（不提交）→ 在 4020 启动壳（`shells/webshell`，registry 顶层 `shell: shells/webshell`）。4003 已在监听时会打印 `web-showcase 已在 :4003` 并跳过再起一份；profile 里其它 iframe（wandesk-ui 静态构建、admin-nextjs `:4012`）也会被处理，失败不影响本用例。

   也可以直接 `pnpm run dev:iframe-apps`（等价）。

3. 浏览器打开 <http://localhost:4020> 验收：

   - 侧栏有 **UI Showcase**（现有 `ui.nav` 没有 `group`，仍正常显示、可点击）。
   - 点击进入 `/plugins/web-showcase`，主内容区是内嵌的 showcase 页面（"Design system preview"），不是空白 iframe。

## 预期结果

- showcase 在 4003 独立可开；壳在 4020 侧栏有 UI Showcase，`/plugins/web-showcase` 内嵌页面可见。
- iframe 空白时先排查：4003 是否在监听、`plugin.json` 的 `origins` 是否与 `iframeSrc` 的 origin 完全一致——这是对接问题，不是加协议字段。

## 相关

- 打成静态文件再 `import` 进 `public/plugins/`（路径 B，部署形态）不在本用例，见归档 [06-build-and-preview](../archieve/use-cases/06-build-and-preview.md)。
- 带后端 API 的 Next app（`admin-nextjs`）为什么不能走路径 B：见 iframe 对接协议文档。
