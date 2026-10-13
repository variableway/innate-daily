# prepare — 准备 iframe 静态产物

把相对路径的 iframe 插件打成静态产物并 import 到 `public/plugins/<id>/`。

## 什么时候用

当 iframe 插件的 `iframeSrc` 是**相对路径**（同源静态）时，需要先 build 再 import，webshell 才能通过 `/plugins/<id>/` 访问。

如果 `iframeSrc` 是 `http://localhost:...`，dev 模式下会自动启动，不需要 prepare。

## 用法

```bash
innate-fe-cli prepare [--profile <name>] [--id <id>]... [--force] [--dry-run]
```

## 参数

| 参数               | 说明                                                               |
| ------------------ | ------------------------------------------------------------------ |
| `--profile <name>` | 选择 profile（不传 `--id` 时处理该 profile 的全部同源静态 iframe） |
| `--id <id>`        | 可重复；只处理指定的 iframe id                                     |
| `--force`          | 即使 `public/plugins/<id>/` 已存在也重建                           |
| `--dry-run`        | 只打印计划                                                         |

## 做了什么

对每个选中的 iframe：

1. 检查 `public/plugins/<id>/index.html` 是否已存在（`--force` 跳过）
2. 跑 `pnpm --filter <pkg> build`
3. 找到 build 产物中的 `index.html`（尝试 `dist/`、`out/` 等）
4. import 到 `public/plugins/<id>/`

## use case

### 准备 profile 下所有 iframe

```bash
innate-fe-cli prepare --profile iframe-apps
```

### 只准备一个 iframe

```bash
innate-fe-cli prepare --id wandesk-ui
```

### 强制重建

```bash
innate-fe-cli prepare --id wandesk-ui --force
```

### 只看计划

```bash
innate-fe-cli prepare --dry-run --profile apps
```

## 注意

- 只处理 `iframeSrc` 是相对路径的 iframe（同源静态）
- 远程 URL 的 iframe 不需要 prepare
- `dev` 命令会自动调用 prepare，不需要手动跑
