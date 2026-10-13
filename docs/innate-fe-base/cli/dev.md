# dev — 启动开发环境

`dev` 按 profile 先生成接缝，再拉起 webshell，并按需启动 iframe 插件的开发进程。

## 基本用法

```bash
innate-fe-cli dev [--profile <name> | <name>] [flags]
```

`--profile` 可以省略，直接传 profile 名：

```bash
innate-fe-cli dev admin
# 等价于
innate-fe-cli dev --profile admin
```

## 参数

| 参数                   | 说明                                             |
| ---------------------- | ------------------------------------------------ |
| `--profile <name>`     | 选择 profile                                     |
| `--plugin-file <path>` | 可重复；从指定 plugin.json 打包，与 profile 并集 |
| `--dry-run`            | 只打印启动计划，不实际启动                       |

## 做了什么

1. 按 profile 执行 `gen`（生成接缝文件）
2. 分析该 profile 需要哪些 iframe 插件
3. 对每个 iframe 插件：
   - 如果是**本机 URL**（`http://localhost:...`）且有 `scripts.dev` → 启动 `pnpm --filter <pkg> dev`
   - 如果是**相对路径同源静态** → 缺产物时 build + import 到 `public/plugins/`
4. 启动 webshell dev server（前台）

domain 只进壳，不另起服务。

## use case

### 启动空壳

```bash
innate-fe-cli dev --profile empty
```

### 启动 admin（含 domain）

```bash
innate-fe-cli dev --profile admin
```

### 启动含 iframe 插件的 profile

```bash
innate-fe-cli dev --profile apps
```

输出会显示启动计划：

```
[dev] profile=apps
  gen: profile=apps
  start-iframe: web-showcase → pnpm --filter @innate/web-showcase dev
  start-iframe: wandesk-ui → pnpm --filter @innate/wandesk-ui dev
  start-webshell: pnpm exec vite
```

### 只看启动计划，不实际启动

```bash
innate-fe-cli dev --dry-run --profile apps
```

### 临时加一个 iframe 插件

```bash
innate-fe-cli dev --profile empty --plugin-file apps/web-showcase/plugin.json
```

## iframe 启动规则

| plugin.json 配置                                                        | dev 行为                                     |
| ----------------------------------------------------------------------- | -------------------------------------------- |
| `iframeSrc` 是 `http://localhost:...` + `package.json` 有 `scripts.dev` | 启动 `pnpm --filter <pkg> dev`，等待端口就绪 |
| `iframeSrc` 是相对路径 + `package.json` 有 `scripts.build`              | build 后 import 到 `public/plugins/<id>/`    |
| `iframeSrc` 是远程 URL                                                  | 不启动，直接用                               |

## 退出

`Ctrl+C` 会终止 webshell 和所有后台 iframe 进程。
