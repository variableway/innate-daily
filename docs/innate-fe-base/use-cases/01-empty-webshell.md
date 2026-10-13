# 用例：启动一个完全空白的 Web Shell

仓库里只有宿主壳，不挂任何 domain 或 iframe。壳源码在 `shells/webshell`，端口 4020。

本次核对时间：2026-10-12。命令在仓库根执行，页面在浏览器里点过。

## 登记

[`plugins.registry.yaml`](../../plugins.registry.yaml)：

```yaml
defaultProfile: empty
shell: shells/webshell

profiles:
  empty:
    domains: []
    iframes: []
```

`pnpm-workspace.yaml` 包含 `shells/*`，所以根脚本能找到包 `@innate/webshell`。

## 操作

```bash
pnpm run dev
```

根脚本是 `pnpm --filter @innate/webshell dev`。壳的 dev 脚本接着做两件事：

1. `bun ../../tools/innate-fe-cli/src/index.ts gen --profile empty --skip-apply`
2. 启动 Vite

只想对账、不写盘时：

```bash
bun tools/innate-fe-cli/src/index.ts gen --profile empty --check
```

## 本次命令输出

`gen --profile empty --check` 退出码 0：

```text
[gen] shell=shells/webshell
[gen] profile=empty 发现 0 个 domain: (无)
[gen] iframe plugins: (无)
[gen] packed features: (无)
[gen] check 通过
```

`pnpm run dev` 随后写出空接缝（不要提交这些生成文件）：

```text
[gen] --skip-apply：跳过 applyProfile，不改 domains/
[gen] shell=shells/webshell
[gen] profile=empty 发现 0 个 domain: (无)
[gen] iframe plugins: (无)
[gen] packed features: (无)
[gen] 写入 shells\webshell\src\gen\modules.gen.ts
[gen] 写入 shells\webshell\src\gen\styles.gen.css
[gen] 写入 shells\webshell\src\gen\site-features.gen.ts
[gen] 写入 shells\webshell\src\gen\plugins.gen.ts
```

Vite：

```text
Local: http://localhost:4020/
```

`webModules`、`packedIframePlugins`、`packedSiteFeatures` 都是空。

## 页面核对

打开 http://localhost:4020/ 。

| 位置     | 实际结果                                                                            |
| -------- | ----------------------------------------------------------------------------------- |
| 顶栏     | 品牌「工作台」，徽章 **0 个插件**                                                   |
| 侧栏     | 只有 **首页**。没有 Admin、UI Showcase 或其他业务项。侧栏正文是「（暂无启用插件）」 |
| 首页标题 | 插件式 Web 工作台                                                                   |
| 首页卡片 | 没有插件卡片，正文是「（暂无启用插件）」                                            |

交互：

- 点击「首页」仍停在 `/`。
- 「收起侧边栏」后按钮变为「展开侧边栏」，业务项没有出现；再展开后侧栏恢复「首页」和空插件提示。

## domains 没有被这次启动改写

`--skip-apply` 跳过 `applyProfile`。启动前后 `git status --short -- domains` 的文件列表一致，没有新增 domain 目录，也没有把业务 copy 进打包面。

`domains/` 里原有的未提交改动不是这次空壳启动写入的。

## 不做的事

- 不使用 `admin`、`iframe-apps`、`apps` profile。
- 不手改 `shells/webshell/src/gen/`。
- 不把具名 profile 的接缝提交进仓库。
