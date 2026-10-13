# 用例：单独开发一个应用（不进壳）

不使用 webshell、不使用 plugin 协议，只依赖 `packages/` 里的共享包（`@innate/ui`）开发并跑起一个应用。参考实现是 [`apps/skel-lean-ui`](../../apps/skel-lean-ui)（`@innate/skel-lean-ui`，Next.js，端口 4010）。

这条路径**不进壳**：`apps/skel-lean-ui` 没有 `plugin.json`，也不出现在 `plugins.registry.yaml` 的任何 profile 里；依赖方向是 app → `@innate/ui`，不 import `apps/webshell`。启动它不需要先起 webshell。

注意区分：这不是 domain 的 `dev:standalone`（那是 domain 自己的 Vite 入口，端口 4015），本用例是一个独立的 Next.js app。

## 操作

命令在仓库根执行，前提是 4010 端口空闲。

1. 安装依赖（把 `@innate/ui` 以 workspace 链接进来）：

   ```bash
   pnpm install
   ```

2. 类型检查：

   ```bash
   pnpm --filter @innate/skel-lean-ui typecheck
   ```

3. 启动 dev：

   ```bash
   pnpm --filter @innate/skel-lean-ui dev
   ```

4. 浏览器打开 <http://localhost:4010>，点开页面上至少一个使用 `@innate/ui` 的交互（按钮、输入或主题切换，以页面上实际有的为准）。

5. 停掉 dev 后构建：

   ```bash
   pnpm --filter @innate/skel-lean-ui build
   ```

## 预期结果

- 页面由 skel-lean-ui 自己渲染：自己的多页应用（首页 / playground / rules / contracts / evolution / code），**没有** webshell 的插件侧栏和 header。
- typecheck 与 build 通过。
