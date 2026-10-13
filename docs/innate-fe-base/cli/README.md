# innate-fe-cli 使用文档

`innate-fe-cli` 是本仓库的打包与编排 CLI，用 Bun 实现。负责：选包、生成接缝文件、启动 dev、打包。

## 运行方式

有两种方式运行 CLI：源码模式和 binary 模式。

### 方式 1：源码模式（直接运行 TypeScript）

```bash
bun tools/innate-fe-cli/src/index.ts <command> [flags]
```

需要本机已安装 Bun。无需构建，改代码立即生效。

### 方式 2：Binary 模式（编译为可执行文件）

先构建 binary：

```bash
# 构建当前平台的 binary
bun run --cwd tools/innate-fe-cli build:exe
# → bin/innate-fe-cli（Windows 上是 bin/innate-fe-cli.exe）

# 或构建指定平台
bun run --cwd tools/innate-fe-cli build:exe:win     # Windows
bun run --cwd tools/innate-fe-cli build:exe:mac     # macOS (arm64)
bun run --cwd tools/innate-fe-cli build:exe:linux   # Linux (x64)
```

然后运行：

```bash
# Windows
bin\innate-fe-cli.exe <command> [flags]

# macOS / Linux
./bin/innate-fe-cli <command> [flags]
```

Binary 模式不需要本机安装 Bun，适合分发给没有 Bun 环境的机器。

或通过根 `package.json` 的脚本：

| 快捷命令                   | 等价于                                    |
| -------------------------- | ----------------------------------------- |
| `pnpm run dev`             | webshell 空壳（不 gen profile）           |
| `pnpm run dev:admin`       | `innate-fe-cli dev --profile admin`       |
| `pnpm run dev:iframe-apps` | `innate-fe-cli dev --profile iframe-apps` |
| `pnpm run dev:apps`        | `innate-fe-cli dev --profile apps`        |

## 命令一览

| 命令           | 用途                                          | 文档                                |
| -------------- | --------------------------------------------- | ----------------------------------- |
| `scan`         | 查看当前 profile 选中了哪些插件               | [other.md](./other.md#scan)         |
| `gen`          | 应用 profile + 生成接缝文件                   | [gen.md](./gen.md)                  |
| `dev`          | gen + 启动 webshell（+ iframe 开发进程）      | [dev.md](./dev.md)                  |
| `prepare`      | 把 iframe 插件打成静态产物并 import           | [prepare.md](./prepare.md)          |
| `verify-flags` | 校验 feature flags 与打包面一致               | [other.md](./other.md#verify-flags) |
| `build`        | 构建 webshell（vite build）                   | [build.md](./build.md#build)        |
| `preview`      | 预览构建产物（:4173）                         | [build.md](./build.md#preview)      |
| `import`       | 导入/移除外部静态插件                         | [other.md](./other.md#import)       |
| `assemble`     | 组装 `deploy/` 目录                           | [build.md](./build.md#assemble)     |
| `all`          | 一键：scan → gen → prepare → build → assemble | [build.md](./build.md#all)          |
| `pages`        | 文稿仓 Pages 打包/部署                        | [other.md](./other.md#pages)        |
| `shadcn`       | 更新 `@innate/ui` 的 shadcn 原语              | [shadcn.md](./shadcn.md)            |

## 通用参数

| 参数                  | 说明                                                 |
| --------------------- | ---------------------------------------------------- |
| `--root <dir>`        | 指定仓库根目录（默认向上找 `plugins.registry.yaml`） |
| `--dry-run`           | 只打印要执行的操作，不写盘                           |
| `--continue-on-error` | 某步骤失败时继续执行后续步骤                         |

## 常见 use case

### 1. 启动空壳 webshell

```bash
innate-fe-cli dev --profile empty
```

### 2. 启动 admin profile（含 domain）

```bash
innate-fe-cli dev --profile admin
```

### 3. 启动含 iframe 插件的 profile

```bash
innate-fe-cli dev --profile apps
```

### 4. 只生成接缝文件，不改 domains/

```bash
innate-fe-cli gen --profile admin --skip-apply
```

### 5. 校验生成文件是否过期

```bash
innate-fe-cli gen --profile admin --check
```

### 6. 打包成静态站并预览

```bash
innate-fe-cli all --profile apps
innate-fe-cli preview
# → http://localhost:4173
```

### 7. 更新 shadcn 原语

```bash
innate-fe-cli shadcn diff          # 预览改动
innate-fe-cli shadcn update        # 批量更新
```

## profile 清单

在 [`plugins.registry.yaml`](../../plugins.registry.yaml) 中定义：

| profile       | domains             | iframes                  |
| ------------- | ------------------- | ------------------------ |
| `empty`       | （无）              | （无）                   |
| `admin`       | admin-tanstack      | （无）                   |
| `iframe-apps` | （无）              | web-showcase, wandesk-ui |
| `apps`        | admin-tanstack      | web-showcase, wandesk-ui |
| `e2e`         | admin-tanstack      | （无）                   |
| `all`         | domains/ 全部合法包 | apps/ 全部 iframe        |

## 生成的接缝文件

`gen` 会在 `apps/webshell/src/gen/` 下写出（或 profile 配置的壳目录）：

| 文件                   | 内容                                           |
| ---------------------- | ---------------------------------------------- |
| `modules.gen.ts`       | import 各 domain 的 `entry`，导出 `webModules` |
| `styles.gen.css`       | 聚合各 domain 的 `styles`                      |
| `site-features.gen.ts` | 选中的插件 id → `true`                         |
| `plugins.gen.ts`       | iframe 运行期清单                              |

> 接缝文件是生成物，禁止手改。修改后跑 `innate-fe-cli gen` 重新生成。
