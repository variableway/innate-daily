# @innate/web-domain

`@innate/web-domain` 是 **domain 插件与宿主之间的编译期契约**。domain 只依赖这个包来声明自己的路由和能力，不依赖宿主壳。宿主通过这个包收集所有 domain 的路由和能力。

## 包定位

- 包名：`@innate/web-domain`
- 入口：[`packages/web-domain/src/index.ts`](../../packages/web-domain/src/index.ts)
- peer 依赖：`@tanstack/react-router`

## 解决什么问题

domain 插件要能独立开发、独立测试，又要能被宿主壳组装进同一个 React 树。这需要一个**契约层**：

- domain 侧：声明「我有哪些路由」「我暴露什么能力」，不 import 宿主
- 宿主侧：收集所有 domain 的路由挂到自己的路由树，收集能力渲染 sidebar / 首页

`@innate/web-domain` 就是这个契约层。

## domain 侧 API

### `createWebDomain(id)`

创建一个 domain builder。`id` 必须匹配 `/^[a-z][a-z0-9-]*$/`（小写字母开头、连字符分隔）。

```ts
import { createWebDomain, OUTLETS } from "@innate/web-domain"

export const webDomain = createWebDomain("my-feature")
  .addRoute(OUTLETS.app, (parent) =>
    parent.addRoute({ path: "/my-feature", component: MyPage })
  )
  .addCapability("nav", {
    label: "我的功能",
    path: "/my-feature",
    icon: "star",
  })
  .build()
```

### `addRoute(outlet, factory)`

把路由挂到宿主的某个 outlet。`outlet` 必须是 `OUTLETS` 里的值。

| 字段      | 类型                             | 说明                                               |
| --------- | -------------------------------- | -------------------------------------------------- |
| `outlet`  | `"app" \| "admin"`               | 挂载点                                             |
| `factory` | `(parent: AnyRoute) => AnyRoute` | 接收宿主注入的 outlet 布局路由，返回挂接后的子路由 |

### `addCapability(key, value)`

向上层暴露能力。key 不能重复。

预定义的能力 key：

| key          | value 类型                       | 用途                      |
| ------------ | -------------------------------- | ------------------------- |
| `"nav"`      | `{ label, path, icon?, order? }` | sidebar / header 导航入口 |
| `"homeTile"` | `{ title, description, path }`   | 首页卡片                  |

也可以用自定义 key 暴露其他能力。

### `disabled()`

声明式禁用该 domain（宿主也可用 feature flag 覆盖）。

### `build()`

返回不可变的 `WebDomain` 对象。

## 宿主侧 API

### `OUTLETS`

```ts
export const OUTLETS = { app: "app", admin: "admin" } as const
```

宿主提供的挂载点。domain 只能挂到这些 outlet 上。

### `collectWebDomainRoutes(domains, rootOutlets, options?)`

把所有启用 domain 的路由挂到宿主的 outlet 布局路由上。

```ts
import { collectWebDomainRoutes } from "@innate/web-domain"

const attachments = collectWebDomainRoutes(webModules, {
  app: appLayoutRoute,
  admin: adminLayoutRoute,
})
```

防亡检查：

- 重复的 domain id → 抛错
- 未知 outlet → 抛错
- 禁用的 outlet 被使用 → 抛错
- 同 outlet 下重复路由 id → 抛错

### `collectNavItems(domains)`

收集所有启用 domain 的 `nav` 能力，按 `order` 升序、同序按 `label` 排序。畸形的 nav 会抛错（不是静默跳过）。

```ts
import { collectNavItems } from "@innate/web-domain"

const navItems = collectNavItems(webModules)
// [{ domainId, label, path, icon?, order? }, ...]
```

### `collectWebDomainCapabilities(domains, key)`

按 key 拉取所有启用 domain 的能力。

```ts
const tiles = collectWebDomainCapabilities<HomeTileCapability>(
  webModules,
  "homeTile"
)
```

### `getEnabledDomains(domains)`

过滤出 `enabled === true` 的 domain。

## 类型

### `WebDomain`

```ts
interface WebDomain {
  readonly id: string
  readonly routes: readonly DomainRouteSpec[]
  readonly capabilities: Readonly<Record<string, unknown>>
  readonly enabled: boolean
}
```

### `DomainRouteSpec`

```ts
interface DomainRouteSpec {
  readonly outlet: Outlet
  readonly factory: DomainRouteFactory
}
```

## 示例

### domain 侧（`domains/my-feature/src/index.ts`）

```ts
import { createWebDomain, OUTLETS } from "@innate/web-domain"
import { createRoute } from "@tanstack/react-router"
import { MyPage } from "./pages/my-feature/page"

export const webDomain = createWebDomain("my-feature")
  .addRoute(OUTLETS.app, (parent) =>
    parent.addRoute({
      path: "/my-feature",
      component: MyPage,
    })
  )
  .addCapability("nav", {
    label: "我的功能",
    path: "/my-feature",
    icon: "star",
    order: 10,
  })
  .build()
```

### 宿主侧（`shells/webshell/src/router.tsx`）

```tsx
import { collectWebDomainRoutes } from "@innate/web-domain"
import { webModules } from "./gen/modules.gen"

const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_app",
})
const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_admin",
})

const attachments = collectWebDomainRoutes(webModules, {
  app: appLayoutRoute,
  admin: adminLayoutRoute,
})

const appChildren = attachments
  .filter((a) => a.outlet === "app")
  .map((a) => a.route)
appLayoutRoute.addChildren(appChildren)
```

## 不做的事

- 不负责渲染（渲染是宿主的事）
- 不负责数据获取（domain 页面自己处理）
- 不依赖宿主壳的任何代码（只依赖 `@tanstack/react-router`）
