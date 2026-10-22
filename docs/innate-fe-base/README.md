# README

Innate FE Dev Base, Docs are use case driven. So Please find use case to quick start.

## Use cases（`shells/webshell` 宿主壳）

| 用例                     | 文档                                                                                                 | 说明                                                                          |
| ------------------------ | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1. 空壳 webshell         | [use-cases/empty-webshell.md](./use-cases/empty-webshell.md)                                         | `pnpm run dev` → `gen --profile empty --skip-apply`，壳在 `shells/webshell`   |
| 1b. 指定 plugin 配置文件 | [use-cases/plugin-file.md](./use-cases/plugin-file.md)                                               | `gen/dev --profile empty --plugin-file <plugin.json>`，与 profile 并集        |
| 2a. domain 独立跑        | [use-cases/02a-domain-standalone.md](./archieve/use-cases/02a-domain-standalone.md)                  | 完全独立的 Web，不进壳；`dev:standalone` → :4015                              |
| 2b. domain 打进壳        | [use-cases/domain-in-webshell.md](./use-cases/domain-in-webshell.md)                                 | `dev:admin`；壳侧栏一条 Admin，场景页在 domain 内部                           |
| 3. Next.js iframe        | [use-cases/03-integrate-nextjs-app.md](./archieve/use-cases/03-integrate-nextjs-app.md)              | `web-showcase` 静态可导出；`dev --profile iframe-apps`                        |
| iframe 协议对接          | [specs/v1/innate.web-plugin.iframe-onboarding.md](./specs/v1/innate.web-plugin.iframe-onboarding.md) | yaml / `--plugin-file`：`plugin.json` 字段、live vs 静态、`admin-nextjs` 实例 |
| 4. wandesk-ui iframe     | [use-cases/04-integrate-wandesk-ui.md](./archieve/use-cases/04-integrate-wandesk-ui.md)              | 同上 profile                                                                  |
| 5. 三个应用打进同一壳    | [use-cases/05-pack-all-apps.md](./archieve/use-cases/05-pack-all-apps.md)                            | `dev --profile apps`                                                          |
| 6. 打成一份静态站并预览  | [use-cases/06-build-and-preview.md](./archieve/use-cases/06-build-and-preview.md)                    | `all --profile apps` → `preview`（一个端口）                                  |
| 7. Writing 静态站        | [use-cases/07-innate-daily-static-pages.md](./archieve/use-cases/07-innate-daily-static-pages.md)                      | `apps/daily-work`；fe-base Pages 扫 `docs/`                                   |
| 为何 domain / iframe     | [context/why-iframe-domain.md](./archieve/context/why-iframe-domain.md)                              | 架构选择、限制、iframe 互通可能方案                                           |

## Usage（怎么操作）

| 主题              | 文档                                                                 | 说明                                                                         |
| ----------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 空壳启动          | [usage/empty-shell.md](./archieve/usage/1-empty-shell.md)            | 如何启动一个空白工作台                                                       |
| 侧栏分组          | [use-cases/sidebar-nav-groups.md](./use-cases/sidebar-nav-groups.md) | domain nav 声明 `group`（如 Misc）→ 壳按组渲染标题；不可折叠                 |
| 添加 domain       | [usage/add-domain.md](./archieve/usage/2-add-domain.md)              | 如何把 TanStack 业务以 domain 接进壳                                         |
| 多 domain         | [usage/multiple-domains.md](./archieve/usage/3-multiple-domains.md)  | 如何同时使用多个 domain（all / 自定义 profile）                              |
| plugin website    | [usage/plugin-website.md](./archieve/usage/4-plugin-website.md)      | 如何把独立应用以 iframe 插件嵌进壳                                           |
| 更新 `@innate/ui` | [cli/shadcn.md](./cli/shadcn.md)                                     | 跨平台更新 shadcn 原语：`innate-fe-cli shadcn diff` → `update` → review diff |
| 外部模板调研      | [usage/analysis/README.md](./archieve/usage/analysis/README.md)      | 第三方模板与 intent-driven 分析存档，不是本仓规范                            |

## 模块（`docs/modules/`）

每个目录干什么。目录见 [modules/README.md](./modules/README.md)。

| 主题                 | 文档                                             | 说明                                                    |
| -------------------- | ------------------------------------------------ | ------------------------------------------------------- |
| 模块总图             | [modules/overview.md](./modules/overview.md)     | UI 分层 → 单独开发 web → plugin 模式 → 目录对照         |
| `@innate/ui`         | [modules/ui.md](./modules/ui.md)                 | token、primitive、主题                                  |
| `@innate/web-domain` | [modules/web-domain.md](./modules/web-domain.md) | domain 与宿主的编译期契约                               |
| plugin 模式          | [modules/plugin.md](./modules/plugin.md)         | 契约包 / 宿主 / CLI / 打包面；domain 与 iframe 两条轨道 |
| 打包 CLI             | [modules/cli.md](./modules/cli.md)               | `innate-fe-cli` 与 `plugins.registry.yaml`              |

## CLI 命令（`docs/cli/`）

按 use case 写的命令用法。入口见 [cli/README.md](./cli/README.md)。

| 命令                                         | 文档                               | 说明                            |
| -------------------------------------------- | ---------------------------------- | ------------------------------- |
| `gen`                                        | [cli/gen.md](./cli/gen.md)         | 选包 + 生成接缝文件             |
| `dev`                                        | [cli/dev.md](./cli/dev.md)         | gen + 启动 webshell（+ iframe） |
| `build` / `preview` / `assemble` / `all`     | [cli/build.md](./cli/build.md)     | 静态打包与预览                  |
| `prepare`                                    | [cli/prepare.md](./cli/prepare.md) | iframe 静态产物准备             |
| `shadcn`                                     | [cli/shadcn.md](./cli/shadcn.md)   | 更新 `@innate/ui` 原语          |
| `scan` / `verify-flags` / `import` / `pages` | [cli/other.md](./cli/other.md)     | 辅助命令                        |

## 约定（`docs/context/`）

| 主题        | 文档                                                                  | 说明                                                                                                                                                                                      |
| ----------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 主题 / 样式 | [context/theme-convention.md](./archieve/context/theme-convention.md) | token 与 theme（variant）概念 + 实例；唯一定义点在 `@innate/ui`、切换入口是共享 `ThemeSelector`（webshell + 3 app 共用）；含规则/注意点清单、手工测试步骤、Tailwind 扫描范围（`@source`） |

## 相关事实源

| 内容                                                               | 位置                                                                                                 |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| **协议索引（v1 当前 / v0 基线）**                                  | [specs/README.md](./specs/README.md)                                                                 |
| plugin 模式模块边界（契约 / 壳 / CLI / 打包面）                    | [modules/plugin.md](./modules/plugin.md)                                                             |
| **插件自描述（`innate.plugin.v1`，含 nav group / navItems）**      | [specs/v1/innate.plugin.v1.md](./specs/v1/innate.plugin.v1.md)                                       |
| **打包协议（选包 / shell / `--plugin-file` / L1·L2）**             | [specs/v1/innate.web-plugin.packaging.v1.md](./specs/v1/innate.web-plugin.packaging.v1.md)           |
| **文稿仓 Pages（pages-kit / plugin.registry.yaml）**               | [specs/v0/innate.domain-pages.v1.md](./specs/v0/innate.domain-pages.v1.md)                           |
| **iframe 插件对接清单**                                            | [specs/v1/innate.web-plugin.iframe-onboarding.md](./specs/v1/innate.web-plugin.iframe-onboarding.md) |
| 宿主壳总览 / 目录结构 / 命令                                       | [shells/webshell/README.md](../shells/webshell/README.md)                                            |
| 部署（Pages 子路径 + Cloudflare + 外部插件流程）                   | [shells/webshell/docs/deploy.md](../shells/webshell/docs/deploy.md)                                  |
| domain ↔ 宿主编译期契约（`createWebDomain` / outlet / capability） | [packages/web-domain/src/index.ts](../packages/web-domain/src/index.ts)                              |
| iframe 协议类型与校验（`innate.web-plugin.v1`）                    | [packages/plugin-protocol/src/index.ts](../packages/plugin-protocol/src/index.ts)                    |
| 打包登记（profile + from + shell）                                 | [plugins.registry.yaml](../plugins.registry.yaml)                                                    |
| 打包 CLI（独立 bun 项目，可 compile 成 binary）                    | [tools/innate-fe-cli](../tools/innate-fe-cli)                                                        |
