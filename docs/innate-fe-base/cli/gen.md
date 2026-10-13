# gen — 选包 + 生成接缝文件

`gen` 是最核心的命令：根据 profile 把 domain 插件 copy 到打包面，并生成宿主壳需要的接缝文件。

## 基本用法

```bash
innate-fe-cli gen [--profile <name>] [flags]
```

不传 `--profile` 时使用 `plugins.registry.yaml` 的 `defaultProfile`。

## 参数

| 参数                   | 说明                                                                       |
| ---------------------- | -------------------------------------------------------------------------- |
| `--profile <name>`     | 选择 profile（`empty` / `admin` / `iframe-apps` / `apps` / `e2e` / `all`） |
| `--refresh`            | 按 `from` 覆盖已存在的打包面                                               |
| `--check`              | 不写盘，校验生成文件是否与扫描结果一致，不一致则 exit 1                    |
| `--watch`              | 监听 `domains/` 变化自动重新生成                                           |
| `--skip-apply`         | 只写接缝文件，不改 `domains/`                                              |
| `--plugin-file <path>` | 可重复；从指定 plugin.json 打包，与 profile 并集                           |
| `--domains <dir>`      | 指定打包面目录（默认 `domains/`）                                          |
| `--out <dir>`          | 指定接缝输出目录（默认 `apps/webshell/src/gen/`）                          |
| `--registry <yaml>`    | 指定 registry yaml（默认 `plugins.registry.yaml`）                         |

## 做了什么

1. **applyProfile**：根据 profile 把 domain 插件 copy 到 `domains/<id>/`（就地包不 copy）
2. **writeGenerated**：扫描打包面 + iframe 插件，写出接缝文件

## use case

### 生成 admin profile 的接缝

```bash
innate-fe-cli gen --profile admin
```

输出示例：

```
[gen] shell=apps/webshell
[gen] admin-tanstack: copy
[gen] profile=admin 发现 1 个 domain: admin-tanstack
[gen] iframe plugins: (无)
[gen] packed features: admin-tanstack
[gen] 写入 apps/webshell/src/gen/modules.gen.ts
[gen] 写入 apps/webshell/src/gen/styles.gen.css
[gen] 写入 apps/webshell/src/gen/site-features.gen.ts
[gen] 写入 apps/webshell/src/gen/plugins.gen.ts
```

### 只生成接缝，不改 domains/

当 `domains/` 已经是你想要的状态，只想刷新接缝文件：

```bash
innate-fe-cli gen --profile admin --skip-apply
```

### 校验接缝是否过期

CI 中用 `--check` 确保生成文件与源码一致：

```bash
innate-fe-cli gen --profile admin --check
```

不一致时会列出差异并 exit 1：

```
[gen] 打包面有未在 yaml 声明的 domain: some-domain
[gen] 以下生成文件与扫描结果不一致（可能被手改或过期）：
  - modules.gen.ts
请运行 `innate-fe-cli gen --profile admin` 重新生成。
```

### 从指定 plugin.json 打包

不修改 `plugins.registry.yaml`，临时把某个插件加入构建：

```bash
innate-fe-cli gen --profile empty --plugin-file apps/web-showcase/plugin.json
```

可重复传 `--plugin-file`：

```bash
innate-fe-cli gen --profile empty \
  --plugin-file apps/web-showcase/plugin.json \
  --plugin-file apps/wandesk-ui/plugin.json
```

domain 和 iframe 都支持：如果 plugin.json 的 `kind` 是 `domain`，会 copy 到打包面；如果是 `iframe`，会加入运行期清单。

### 监听变化自动重新生成

开发时边改 domain 边自动刷新接缝：

```bash
innate-fe-cli gen --profile admin --watch
```

### 覆盖已存在的打包面

`domains/` 里已有某个 domain，但 `plugins.registry.yaml` 里它的 `from` 变了，需要重新 copy：

```bash
innate-fe-cli gen --profile admin --refresh
```

### iframe 插件用 `from` 指定非默认目录

iframe 插件默认从 `apps/`、`shells/webshell/e2e/fixtures/` 扫描。位于 `examples/` 等其他目录的 iframe app，在 profile 里加 `from` 字段：

```yaml
profiles:
  examples:
    domains: []
    iframes:
      - id: skel-lean-ui
        from: examples/skel-lean-ui
```

`from` 相对 repo root，也支持绝对路径。`gen`、`dev`、`prepare` 都会从该目录读取 `plugin.json` 与 `package.json`。

## 生成的文件

| 文件                   | 内容                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------- |
| `modules.gen.ts`       | `import { webDomain as ... } from "../../../domains/<id>/<entry>"`，导出 `webModules` |
| `styles.gen.css`       | `@import "../../../domains/<id>/<styles>";` 聚合                                      |
| `site-features.gen.ts` | `export const packedSiteFeatures = { "<id>": true }`                                  |
| `plugins.gen.ts`       | iframe 运行期清单（`packedIframePlugins`）                                            |
