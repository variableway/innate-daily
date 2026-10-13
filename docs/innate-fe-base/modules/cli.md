# innate-fe-cli

`innate-fe-cli` 是本仓库的**打包与编排 CLI**，用 Bun 实现。负责：选包、copy domain、生成接缝文件、启动 dev server、静态打包。

- 入口：[`tools/innate-fe-cli/src/index.ts`](../../tools/innate-fe-cli/src/index.ts)
- 运行方式：`bun tools/innate-fe-cli/src/index.ts <command>`

## 子命令

| 命令           | 说明                                                             |
| -------------- | ---------------------------------------------------------------- |
| `scan`         | 扫描当前 profile 选中的 domain 和 iframe，打印清单               |
| `gen`          | 应用 profile（copy domain）+ 生成接缝文件                        |
| `dev`          | 启动 webshell dev server（自动 gen）                             |
| `prepare`      | 准备 iframe 插件（静态导入 / 构建）                              |
| `verify-flags` | 校验 feature flags 与打包面一致                                  |
| `build`        | 构建 webshell（vite build）                                      |
| `preview`      | 预览构建产物（vite preview，端口 4173）                          |
| `import`       | 导入外部插件到 `public/plugins/`                                 |
| `assemble`     | 组装 `deploy/` 目录（shell dist + 静态插件 + domain standalone） |
| `all`          | 一键：scan → gen → prepare → build → assemble                    |
| `pages`        | 文稿仓 Pages 打包/部署                                           |

## 通用参数

| 参数                  | 说明                         |
| --------------------- | ---------------------------- |
| `--root <dir>`        | 指定仓库根目录               |
| `--dry-run`           | 只打印要执行的操作，不写盘   |
| `--continue-on-error` | 某步骤失败时继续执行后续步骤 |

## gen：核心命令

```bash
innate-fe-cli gen --profile <name> [--refresh] [--check] [--watch] [--skip-apply]
```

### 参数

| 参数                | 说明                                                                       |
| ------------------- | -------------------------------------------------------------------------- |
| `--profile <name>`  | 选择 profile（`empty` / `admin` / `iframe-apps` / `apps` / `e2e` / `all`） |
| `--refresh`         | 按 `from` 覆盖已存在的打包面                                               |
| `--check`           | 不写盘，校验生成文件是否与扫描结果一致，不一致则 exit 1                    |
| `--watch`           | 监听 `domains/` 变化自动重新生成                                           |
| `--skip-apply`      | 只写接缝文件，不改 `domains/`                                              |
| `--domains <dir>`   | 指定打包面目录（默认 `domains/`）                                          |
| `--out <dir>`       | 指定接缝输出目录（默认 `shells/webshell/src/gen/`）                        |
| `--registry <yaml>` | 指定 registry yaml（默认 `plugins.registry.yaml`）                         |

### 做了什么

1. **applyProfile**：根据 profile 把 domain 插件 copy 到打包面 `domains/<id>/`（就地包不 copy）
2. **writeGenerated**：扫描打包面 + iframe 插件，写出接缝文件

### 生成的接缝文件

| 文件                   | 内容                                           |
| ---------------------- | ---------------------------------------------- |
| `modules.gen.ts`       | import 各 domain 的 `entry`，导出 `webModules` |
| `styles.gen.css`       | 聚合各 domain 的 `styles`                      |
| `site-features.gen.ts` | 选中的插件 id → `true`                         |
| `plugins.gen.ts`       | iframe 运行期清单（`packedIframePlugins`）     |

> 接缝文件是**生成物**，禁止手改。修改后跑 `innate-fe-cli gen` 重新生成。

## dev：启动开发服务器

```bash
innate-fe-cli dev --profile <name>
```

等价于先 `gen --profile <name>`，再启动 webshell 的 vite dev server。

根 `package.json` 的快捷方式：

| 命令                       | 等价于                                       |
| -------------------------- | -------------------------------------------- |
| `pnpm run dev`             | `pnpm --filter @innate/webshell dev`（空壳） |
| `pnpm run dev:admin`       | `innate-fe-cli dev --profile admin`          |
| `pnpm run dev:iframe-apps` | `innate-fe-cli dev --profile iframe-apps`    |
| `pnpm run dev:apps`        | `innate-fe-cli dev --profile apps`           |

## verify-flags：校验

```bash
innate-fe-cli verify-flags --profile <name>
```

校验 feature flags（`site-features.gen.ts`）与打包面一致，防止「构建机上的 `domains/` 是脏的」。

## build + assemble + preview：静态打包

```bash
innate-fe-cli all --profile apps    # 一键打包
innate-fe-cli preview               # 预览，http://localhost:4173
```

`all` 执行：scan → gen → prepare → build → assemble。

`assemble` 把 `shells/webshell/dist/` 复制到 `deploy/`，加上静态插件和 domain standalone 产物，生成 `deploy/manifest.json`。

## import：导入外部插件

```bash
innate-fe-cli import <id> --from <dir|git-url> [--name x] [--trust-source] [--build-command cmd]
innate-fe-cli import --remove --from <id>
```

把外部 iframe 插件导入到 `public/plugins/`，并登记到 `static-manifests.json`。

## 代码结构

```text
tools/innate-fe-cli/src/
  index.ts              入口，子命令分发
  root.ts               仓库根路径与 paths()
  commands/
    cli.ts              scan/build/preview/import/assemble/all
    gen.ts              gen 子命令
    dev.ts              dev 子命令
    prepare.ts          prepare 子命令
    verify-flags.ts     verify-flags 子命令
    pages.ts            pages 子命令
    shadcn.ts           shadcn 子命令（更新 @innate/ui 原语）
  lib/
    packaging.ts        读 plugins.registry.yaml，applyProfile
    registry.ts         扫描打包面，写接缝文件
    catalog.ts          扫描 apps/*/plugin.json
    verify-flags.ts     flag 对账
    plugin-files.ts     --plugin-file 解析
```

## 详细用法

每个命令的 use case 驱动用法见 [`docs/cli/`](../cli/README.md)。

## 不做的事

- 不发布为独立 npm 包（仓内独立项目）
- 不做远程插件拉取（只处理本地路径和 git url）
