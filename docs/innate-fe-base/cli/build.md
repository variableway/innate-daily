# build / preview / assemble / all — 静态打包

这四个命令覆盖从构建到部署的完整流程。

## build

构建 webshell（vite build）。

### 用法

```bash
innate-fe-cli build [--profile <name>] [--with-standalone]
```

### 参数

| 参数                | 说明                                   |
| ------------------- | -------------------------------------- |
| `--profile <name>`  | 选择 profile（决定壳目录）             |
| `--with-standalone` | 同时构建每个 domain 的 standalone 产物 |

### 做了什么

1. 在配置的壳目录下直接跑 `vite build`（不经过 `pnpm --filter @innate/webshell build`，因为其 prebuild 会 gen empty 冲掉接缝）
2. 可选：对每个 domain 跑 `pnpm --filter <pkg> build:standalone`

### use case

```bash
innate-fe-cli build --profile apps
```

---

## preview

预览构建产物，一个端口端起整个应用。

### 用法

```bash
innate-fe-cli preview [--profile <name>]
```

### 前置条件

必须先 `build`（或 `all`），否则 `dist/index.html` 不存在会报错。

### use case

```bash
innate-fe-cli build --profile apps
innate-fe-cli preview
# → http://localhost:4173
```

端口固定 4173（`--strictPort`），不冲突。

---

## assemble

把 webshell 构建产物和静态插件组装到 `deploy/` 目录。

### 用法

```bash
innate-fe-cli assemble [--profile <name>] [--bundle-domains]
```

### 参数

| 参数               | 说明                                                          |
| ------------------ | ------------------------------------------------------------- |
| `--profile <name>` | 选择 profile                                                  |
| `--bundle-domains` | 把各 domain 的 standalone 产物也复制到 `deploy/domains/<id>/` |

### 做了什么

1. 清空 `deploy/`
2. 把 `apps/webshell/dist/` 复制到 `deploy/`
3. 静态插件已在 `dist/plugins/` 里（build 时 vite 处理）
4. 可选：复制 domain standalone 产物到 `deploy/domains/<id>/`
5. 写 `deploy/manifest.json`（含 git HEAD、domain 列表、静态插件列表）

### use case

```bash
innate-fe-cli assemble --profile apps --bundle-domains
```

输出 `deploy/manifest.json`：

```json
{
  "generatedAt": "2026-10-12T...",
  "gitHead": "abc123...",
  "domains": [
    { "id": "admin-tanstack", "package": "@innate/domain-admin-tanstack" }
  ],
  "staticPlugins": ["web-showcase", "wandesk-ui"]
}
```

---

## all

一键打包：scan → gen → prepare → build → assemble。

### 用法

```bash
innate-fe-cli all [--profile <name>] [--with-standalone] [--dry-run]
```

### 参数

| 参数                | 说明                                      |
| ------------------- | ----------------------------------------- |
| `--profile <name>`  | 选择 profile                              |
| `--with-standalone` | 构建 domain standalone + bundle 到 deploy |
| `--dry-run`         | 只打印计划                                |

### 执行顺序

```text
scan → gen → prepare → build → assemble
```

如果传了 `--with-standalone`，`build` 会同时构建 domain standalone，`assemble` 会自动开启 `--bundle-domains`。

### use case

#### 完整打包 apps profile

```bash
innate-fe-cli all --profile apps
```

#### 完整打包 + domain standalone

```bash
innate-fe-cli all --profile apps --with-standalone
```

#### 只看计划

```bash
innate-fe-cli all --profile apps --dry-run
```

完成后输出：

```
✔ 完成：deploy
  一个端口预览：innate-fe-cli preview  →  http://localhost:4173
```

## 完整流程示例

```bash
# 1. 打包
innate-fe-cli all --profile apps

# 2. 预览
innate-fe-cli preview

# 3. 部署 deploy/ 到任意静态服务器
```
