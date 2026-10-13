# shadcn — 更新 @innate/ui 的 shadcn 原语

跨平台的 shadcn/ui 原语更新入口，替代旧的 bash 脚本 `packages/ui/scripts/update-shadcn.sh`。

## 子命令

| 子命令       | 用途                                       |
| ------------ | ------------------------------------------ |
| `diff`       | 预览上游改动（只读）                       |
| `update`     | 批量覆盖已安装原语，修 alias，跑 typecheck |
| `add <name>` | 新增或刷新单个原语，修 alias               |

## diff

预览 shadcn 上游对已安装组件的改动，不写盘。

```bash
innate-fe-cli shadcn diff
```

透传 `npx shadcn@latest diff`。

## update

批量更新 `packages/ui/src/components/ui/` 下所有已安装的 shadcn 原语。

### 用法

```bash
innate-fe-cli shadcn update [--dry-run]
```

### 参数

| 参数        | 说明                         |
| ----------- | ---------------------------- |
| `--dry-run` | 只打印将要执行的命令，不写盘 |

### 做了什么

1. 扫描 `packages/ui/src/components/ui/*.tsx`（跳过 `*.test.tsx` 和自研文件）
2. 对每个组件跑 `npx shadcn@latest add <name> --overwrite --yes`
3. 修 alias：把 shadcn 写出的 `@/...` import 改成相对路径
4. 跑 `pnpm --filter @innate/ui typecheck`

### 自研文件清单

以下文件不是 shadcn 原语，update 会跳过：

- `locale-provider.tsx`
- `locale-selector.tsx`
- `domain-page-layout.tsx`
- `direction.tsx`

> 新增自研文件时，需要在 `tools/innate-fe-cli/src/commands/shadcn.ts` 的 `VENDORED_UI_FILES` 里登记。

### alias 修复规则

shadcn CLI 按 `components.json` 的 aliases 写 import，但包内部必须用相对路径。`fixAliases` 会自动转换：

| shadcn 写出的                | 修复为            |
| ---------------------------- | ----------------- |
| `@/components/ui/<x>`        | `./<x>`           |
| `@/components/<x>`           | `../<x>`          |
| `@/lib/utils`                | `../../lib/utils` |
| `@/lib/<x>`                  | `../../lib/<x>`   |
| `@/hooks/<x>`                | `../../hooks/<x>` |
| `@innate/ui`（仅 cn import） | `../../lib/utils` |

无法映射的 alias 会打印 `⚠ 未识别的 alias import，需手动修`。

### use case

```bash
# 预览上游改动
innate-fe-cli shadcn diff

# 批量更新
innate-fe-cli shadcn update

# 只看计划
innate-fe-cli shadcn update --dry-run
```

更新后需要：

1. `git diff` 检查改动
2. 如果 typecheck 失败，检查是否有未修干净的 alias 或上游 API 变更

## add

新增或刷新单个 shadcn 原语。

### 用法

```bash
innate-fe-cli shadcn add <name> [--overwrite] [--dry-run]
```

### 参数

| 参数          | 说明                                        |
| ------------- | ------------------------------------------- |
| `<name>`      | shadcn 组件名（如 `accordion`、`calendar`） |
| `--overwrite` | 覆盖已存在的文件（默认不覆盖）              |
| `--dry-run`   | 只打印命令                                  |

### use case

```bash
# 新增一个组件
innate-fe-cli shadcn add accordion

# 刷新已存在的组件
innate-fe-cli shadcn add button --overwrite
```

新增后还需要：

1. 在 `packages/ui/src/index.ts` 里补导出
2. （可选）在 showcase 里加 demo
