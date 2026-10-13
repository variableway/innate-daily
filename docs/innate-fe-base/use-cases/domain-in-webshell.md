# 用例：domain 打进 Web Shell

`domains/admin-tanstack` 以 domain 插件编译进壳。壳侧栏只有一条 **Admin**，不展开子菜单。场景页在 domain 自己的导航里。

本次核对时间：2026-10-12。命令在仓库根执行，页面在浏览器里点过。

## 清单

[`domains/admin-tanstack/plugin.json`](../../domains/admin-tanstack/plugin.json) 用单个 `ui.nav`，没有 `navItems`，也没有 `group`：

```json
"ui": {
  "nav": {
    "label": "Admin",
    "path": "/admin-tanstack",
    "icon": "LayoutDashboard",
    "order": 20
  }
}
```

`src/web-domain.tsx` 用 `parsePluginManifest` / `resolveNavItems` 把这条入口交给壳。路由仍由 domain 代码声明。`/admin-tanstack` 会转到 `/admin-tanstack/scenes`。

依赖只指向 `packages/`（`@innate/ui`、`@innate/web-domain`、`@innate/plugin-protocol`、`@innate/admin-composites`、`@innate/scene-*`）。源码不 import `shells/webshell`。

## 登记

[`plugins.registry.yaml`](../../plugins.registry.yaml) 的 `admin` profile 只点名这个 domain，没有 iframe：

```yaml
admin:
  domains:
    - id: admin-tanstack
  iframes: []
```

## 操作

```bash
pnpm run dev:admin
```

等价于：

```bash
bun tools/innate-fe-cli/src/index.ts dev --profile admin
```

不要加 `--plugin-file`。壳在 http://localhost:4020 。

只对账、不写盘：

```bash
bun tools/innate-fe-cli/src/index.ts gen --profile admin --check
```

当前接缝若还是空壳，`--check` 会报生成文件不一致。先跑上面的 `dev:admin`（或去掉 `--check` 的 `gen --profile admin`）再对账。

## 本次命令输出

```text
[gen] shell=shells/webshell
[gen] admin-tanstack: in-place
[gen] profile=admin 发现 1 个 domain: admin-tanstack
[gen] iframe plugins: (无)
[gen] packed features: admin-tanstack, wandesk-ui
```

`admin-tanstack` 是就地源码，没有 copy。yaml 没有选中 iframe。`wandesk-ui` 来自壳里已经存在的静态导入清单 `shells/webshell/src/plugins/static-manifests.json`，不是这次 profile 的 `iframes`。

生成文件在 `shells/webshell/src/gen/`，不要提交。

## 页面核对

| 位置            | 实际结果                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------- |
| 壳侧栏          | **首页**、**Admin**。Admin 下面没有场景子菜单                                               |
| 首页            | 有一张 **Admin** 卡片                                                                       |
| 点击 Admin      | 进入 `/admin-tanstack/scenes`，标题是「ToB 场景总览」                                       |
| domain 内部导航 | 点「工作台列表」进入 `/admin-tanstack/workspace-list`，页面标题是「工作台列表」，搜索框可见 |

壳侧栏里还会看到 **Wandesktop**，那是上面的静态导入，不是 Admin 的子菜单。

## 检查

```bash
pnpm --filter @innate/domain-admin-tanstack typecheck
pnpm --filter @innate/domain-admin-tanstack test
```

本次两条都通过。
