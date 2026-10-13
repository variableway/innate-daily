# @innate/ui

`@innate/ui` 是本仓库**唯一的 UI primitive 与 token 来源**。所有 app 和 domain 都从这里 import 组件，不在各自目录里再拷一份 `components/ui/`。

## 包定位

- 包名：`@innate/ui`
- 入口：[`packages/ui/src/index.ts`](../../packages/ui/src/index.ts)
- 样式：[`packages/ui/src/globals.css`](../../packages/ui/src/globals.css)
- 配置：[`packages/ui/components.json`](../../packages/ui/components.json)（shadcn 配置，`style: base-vega`，图标 `lucide`）

## 提供什么

### 1. Primitive 组件（L1）

基于 shadcn/ui + Base UI 包装的无业务语义组件。完整清单见 `index.ts`，主要包括：

| 类别     | 组件                                                                                                                                     |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 布局     | `card`、`separator`、`scroll-area`、`resizable`、`sidebar`、`sheet`、`drawer`                                                            |
| 表单     | `input`、`textarea`、`select`、`checkbox`、`radio-group`、`switch`、`slider`、`form`、`field`、`label`、`input-group`、`input-otp`       |
| 反馈     | `alert`、`alert-dialog`、`dialog`、`popover`、`tooltip`、`hover-card`、`sonner`、`spinner`、`skeleton`、`progress`                       |
| 导航     | `breadcrumb`、`navigation-menu`、`menubar`、`context-menu`、`dropdown-menu`、`command`、`pagination`、`tabs`、`collapsible`、`accordion` |
| 数据展示 | `table`、`badge`、`avatar`、`kbd`、`item`、`empty`、`aspect-ratio`                                                                       |
| 其他     | `button`、`button-group`、`toggle`、`toggle-group`、`calendar`、`carousel`、`chart`                                                      |

### 2. 主题与 Token（D0）

- `globals.css`：语义化 token（颜色、间距、圆角），所有组件从这里取变量
- `themes/*.css`：多个主题变体（`shadcn-default`、`shadcn-studio`、`linear`、`notion`、`webshell`）
- `ThemeProvider` + `ThemeSelector`：主题切换入口，webshell 和各 app 共用同一实现

### 3. 本仓库自研组件

不是 shadcn 上游组件，是本仓库扩展：

- `direction`：Base UI `DirectionProvider` 的薄 re-export
- `domain-page-layout`：domain 页面壳
- `locale-provider` / `locale-selector`：国际化
- `theme-provider` / `theme-selector`：主题

## 怎么用

### 安装

在 pnpm workspace 内：

```json
{
  "dependencies": {
    "@innate/ui": "workspace:*"
  }
}
```

### 引入样式

在应用入口引入 `globals.css`（只引一次）：

```ts
import "@innate/ui/globals.css"
```

### 使用组件

```tsx
import { Button, Card, Input } from "@innate/ui"

export function Demo() {
  return (
    <Card>
      <Input placeholder="输入..." />
      <Button>提交</Button>
    </Card>
  )
}
```

### 切换主题

```tsx
import { ThemeProvider, ThemeSelector } from "@innate/ui"

function App() {
  return (
    <ThemeProvider>
      <ThemeSelector />
      {/* ... */}
    </ThemeProvider>
  )
}
```

## UI 分层

```text
Apps / domains
    │  组装路由、装数据
    ▼
L2  admin-composites     页壳、表格、图表、spec 导航（跨页面组合）
    │
    ▼
L1  @innate/ui           无业务语义的 primitive ← 本包
    │
    ▼
D0  globals.css + themes  语义 token 与主题变量
```

依赖只向下：App → L2 → L1 → D0。**app 和 domain 不得新建 `components/ui` 拷贝，不得在功能 TSX 中写 raw hex 颜色。**

## 怎么更新 shadcn 组件

shadcn 上游更新时，在仓库根执行：

```bash
pnpm ui:diff      # 预览上游改动（只读）
pnpm ui:update    # 批量覆盖已安装原语
pnpm ui:add -- <name>   # 新增或刷新单个组件
```

> 计划中（见 sprint-2 任务 1）：这些命令将迁移到 `innate-fe-cli shadcn` 子命令，跨平台且自动修复 alias。

更新后需要：

1. 检查 `src/components/ui/*.tsx` 里是否有 `@/` 或包内 `from "@innate/ui"` 的错误 alias，改成相对路径
2. 检查 `globals.css` 是否被上游默认值冲掉
3. 跑 `pnpm --filter @innate/ui typecheck` 和 `test`

## 不要做的事

- 不要在 `apps/*/` 里跑 `npx shadcn add`。缺组件就加进 `@innate/ui`。
- 不要改 `components.json` 的 `style`（必须是 `base-vega`）。
- 不要跳过 `git diff` 直接提交批量更新。
