# innate.plugin.v1 — 插件自描述协议（增强版）

本文件定义**插件如何自描述**、与打包层如何协同、以及壳如何消费 `ui` 露出项。
它是 [`innate.web-plugin.packaging.v1`](./innate.web-plugin.packaging.v1.md) 的配对协议：打包层管「选谁 / 进哪」，本文管「插件长什么样」。

| 字段     | 值                                                                                    |
| -------- | ------------------------------------------------------------------------------------- |
| 协议名   | `innate.plugin.v1`（清单字符串**不变**；本文为增强版文档）                            |
| 文档修订 | **v1 增强**（相对 [`../v0/innate.plugin.v1.md`](../v0/innate.plugin.v1.md)）          |
| 清单文件 | 每个插件包根目录一个 `plugin.json`（或 CLI `--plugin-file` 指向的 `.json` / `.yaml`） |
| 登记文件 | [`plugins.registry.yaml`](../../../plugins.registry.yaml)（选包；见 packaging）       |
| 生成器   | [`tools/innate-fe-cli`](../../../tools/innate-fe-cli)                                 |
| 协议包   | `packages/plugin-protocol`（`@innate/plugin-protocol`）                               |

---

## 0. 相对 v0 的增量（本修订）

| 能力             | 字段                                   | 说明                                                   |
| ---------------- | -------------------------------------- | ------------------------------------------------------ |
| **sidebar 分组** | `ui.nav.group` / `ui.navItems[].group` | 可选字符串；缺省 `"default"`。非默认组在壳侧渲染组标题 |
| **多入口**       | `ui.navItems`                          | 可选数组；存在且非空时**优先于**单对象 `ui.nav`        |
| **menu 路由**    | `path`（已有）                         | 分组只影响渲染结构，不改变 `Link to={path}` 跳转语义   |

打包层增量（`shell`、`--plugin-file`）见 [packaging](./innate.web-plugin.packaging.v1.md)，**不**改本文必填字段。

---

## 1. 要解决什么

```text
① 自描述   plugin.json / plugin.yaml（id / kind / category / entry / ui …）
② 选择     plugins.registry.yaml + CLI（见 packaging）
③ 打包     读清单 → 打包面 / 登记 → gen → 宿主 build
④ 露出     壳从 packedPlugins 读 ui → sidebar / homeTile（代码管路由，清单管外观）
```

**代码管路由，清单管外观：**

- `entry` 导出的 `webDomain` 只声明**路由**（`addRoute`）；
- `ui.nav` / `ui.navItems` / `ui.homeTile` 只在清单声明，**不再**在代码里 `addCapability("nav", ...)`。

---

## 2. 三层职责与边界

| 层                   | 负责                                             | 不负责                            |
| -------------------- | ------------------------------------------------ | --------------------------------- |
| 自描述 `plugin.json` | 我是谁、怎么打包、对外露出什么（含分组与多入口） | 路由树、视图实现、iframe 握手细节 |
| 选择 packaging       | 这次 build 认哪些插件、用哪个壳                  | 插件内部长什么样                  |
| 壳运行时             | 按清单渲染 nav / tile；iframe 握手               | 替插件写业务路由                  |

---

## 3. 协议：清单文件（`innate.plugin.v1`）

### 3.1 位置与发现

- 约定位置：与 `package.json` 同级的 `plugin.json`。
- 打包器默认扫描 `apps/<id>/plugin.json`（一层子目录）；e2e 夹具由 CLI 另扫，**不**在 yaml 里配扫描根。
- 额外入口：`innate-fe-cli … --plugin-file <path>`，路径可为 `.json` / `.yaml` / `.yml`（见 packaging §5）。

### 3.2 公共字段

| 字段       | 必填 | 类型                   | 说明                                                       |
| ---------- | ---- | ---------------------- | ---------------------------------------------------------- |
| `protocol` | ✅   | `"innate.plugin.v1"`   | 固定值                                                     |
| `id`       | ✅   | string                 | 匹配 `/^[a-z][a-z0-9-]*$/`；仓内包通常等于目录名与包名后缀 |
| `kind`     | ✅   | `"domain" \| "iframe"` | 决定打包与加载方式                                         |
| `category` | ✅   | string                 | 分类标签（选择维度，不是目录层）                           |
| `version`  | ✅   | string                 | 语义化版本                                                 |
| `name`     | ➖   | string                 | 展示名，缺省用 `id`                                        |
| `ui`       | ➖   | object                 | 对外露出的界面入口，见 §3.4                                |

`icon` 是 lucide 图标名（宿主自行映射）。

### 3.3 `kind: "domain"`

| 字段     | 必填 | 说明                                                                 |
| -------- | ---- | -------------------------------------------------------------------- |
| `entry`  | ✅   | 导出 `webDomain` 的模块，相对描述文件所在目录（默认 `src/index.ts`） |
| `styles` | ➖   | 需要聚合的 CSS，相对插件根（默认 `src/globals.css`，存在才进聚合）   |
| `order`  | ➖   | 打包 / 挂载排序权重，小者靠前（默认 100）                            |

包名约定**不变**：`@innate/domain-<id>`。

```json
{
  "protocol": "innate.plugin.v1",
  "id": "showcase-demo",
  "kind": "domain",
  "category": "examples",
  "version": "0.1.0",
  "entry": "src/index.ts",
  "styles": "src/globals.css",
  "order": 10,
  "ui": {
    "nav": {
      "label": "Showcase",
      "path": "/showcase-demo",
      "icon": "layout-grid",
      "order": 10,
      "group": "工具"
    },
    "homeTile": {
      "title": "Showcase",
      "description": "演示一个 domain 的路由与能力",
      "path": "/showcase-demo"
    }
  }
}
```

多入口示例：

```json
{
  "protocol": "innate.plugin.v1",
  "id": "admin-tanstack",
  "kind": "domain",
  "category": "admin",
  "version": "0.1.0",
  "entry": "src/index.ts",
  "ui": {
    "navItems": [
      {
        "label": "Dashboard",
        "path": "/admin",
        "icon": "layout-dashboard",
        "order": 10,
        "group": "管理"
      },
      {
        "label": "Settings",
        "path": "/admin/settings",
        "icon": "settings",
        "order": 20,
        "group": "管理"
      }
    ]
  }
}
```

### 3.4 `ui`：nav / navItems / homeTile

#### 3.4.1 `PluginNavUi`

| 字段    | 必填 | 类型   | 说明                                                                 |
| ------- | ---- | ------ | -------------------------------------------------------------------- |
| `label` | ✅   | string | 侧栏文案                                                             |
| `path`  | ➖   | string | 路由路径；domain 常用；iframe 运行时路径通常由壳写成 `/plugins/<id>` |
| `icon`  | ➖   | string | lucide 图标名                                                        |
| `order` | ➖   | number | 组内排序，小者靠前                                                   |
| `group` | ➖   | string | **新增**。分组名；缺省 `"default"`                                   |

#### 3.4.2 `PluginUi`

| 字段       | 必填 | 说明                                                          |
| ---------- | ---- | ------------------------------------------------------------- |
| `nav`      | ➖   | 单入口对象（向后兼容）                                        |
| `navItems` | ➖   | **新增**。多入口数组                                          |
| `homeTile` | ➖   | `{ title, description, path }`；进首页 tile（本修订不改渲染） |

**解析规则（协议包 `parseUi` / 等价逻辑）：**

1. 若 `navItems` 存在且为非空数组 → 使用 `navItems`（忽略 `nav` 作为侧栏来源）。
2. 否则若 `nav` 存在 → 视为单元素数组。
3. 否则该插件无 sidebar 入口。
4. 每一项按 `PluginNavUi` 校验；`group` 缺省规范化为 `"default"`（实现可在解析时写入或缺席时由壳视为 default）。

`navItems` 与 `nav` 同时存在时：**侧栏以 `navItems` 为准**；不要求删除 `nav`，但文档与生成物应以数组结果为准。

#### 3.4.3 壳侧分组渲染

壳 registry（如 `ShellNavItem`）携带 `group?: string`。导出：

```ts
export interface ShellNavGroup {
  readonly name: string
  readonly items: readonly ShellNavItem[]
}

export function groupNavItems(items: readonly ShellNavItem[]): ShellNavGroup[]
```

规则：

| 规则       | 行为                                                                                |
| ---------- | ----------------------------------------------------------------------------------- |
| 分组键     | `group` 缺省或 `"default"` → 默认组                                                 |
| 组内排序   | 按 `order`，再按 `label`（与现有扁平排序一致）                                      |
| 组间顺序   | 按组首次出现顺序，或按组名稳定排序（实现择一并在测试中固定）                        |
| 默认组标题 | **不渲染**组标题（视觉与仅有 `ui.nav` 的旧行为一致）                                |
| 非默认组   | 渲染组标题（如 `text-muted-foreground`）；折叠侧栏时标题 `sr-only` 或隐藏，只显图标 |
| 路由       | `path` 不变；`Link to={item.path}`；分组不影响跳转                                  |
| 非目标     | 组不可折叠为手风琴；不支持嵌套 group；不改 `homeTile`                               |

示意：

```text
[Home]
──────
内容          ← 非 default 组标题
  Feed
  Collections
──────
管理
  Admin
  Settings
──────
Showcase      ← default 组：无标题，项仍按 order
```

### 3.5 `kind: "iframe"`

同一份 schema，运行时字段不同。**不 copy 源码**，只进产物清单。

| 字段        | 必填 | 说明                                            |
| ----------- | ---- | ----------------------------------------------- |
| `runtime`   | ✅   | 固定 `"iframe"`                                 |
| `iframeSrc` | ✅   | 绝对 URL 或相对路径                             |
| `origins`   | ✅   | 白名单；`iframeSrc` 为相对路径时必须含 `"self"` |

`ui.nav` / `ui.navItems` 同样适用。`toIframeRuntimeManifest` 须透传 `group`（及多入口时每一项的 nav 字段；若运行时清单仍是单 `nav`，则取解析后的第一项或实现约定的主入口，并在壳侧从 `packedPlugins` 读完整 `ui`——**优先**让壳消费完整 `PluginManifest.ui`，避免丢 `navItems`）。

握手行为不变（见 packaging 与 iframe-onboarding）：

- 禁止 `targetOrigin="*"`；
- 信封 `{ source: "innate-plugin", v: 1, channel }` → 宿主回 `{ source: "innate-shell", v: 1, channel: "shell:ack" }`。

### 3.6 校验

`@innate/plugin-protocol` 导出 `parsePluginManifest(raw: unknown, ctx?: string): PluginManifest`：

- 字段缺失 / 类型错误 / `id` 不合法 / 相对路径缺 `"self"` → **抛错并指出 ctx（插件目录或文件路径）**；
- `ui.nav.group` 可选字符串；
- `ui.navItems` 可选数组，元素按 `PluginNavUi` 校验；
- 不加 `group` / `navItems` 的现有清单**仍合法**。

打包器与壳共用同一函数，**禁止各写一份校验**。

---

## 4. 协议包：`@innate/plugin-protocol`

纯 TS、零运行时依赖，三处共用：

| 使用方                         | 用途                                        |
| ------------------------------ | ------------------------------------------- |
| `tools/innate-fe-cli`          | 读 / 校验清单，决定 import 与 copy          |
| 宿主壳（如 `shells/webshell`） | 读生成物，渲染 nav / tile；校验 iframe 信封 |
| 外部工具                       | 生成 / 编辑清单                             |

导出面（增强后）：

```ts
export const PLUGIN_PROTOCOL = "innate.plugin.v1" as const
export type PluginKind = "domain" | "iframe"

export interface PluginNavUi {
  readonly label: string
  readonly path?: string
  readonly icon?: string
  readonly order?: number
  readonly group?: string
}

export interface PluginUi {
  readonly nav?: PluginNavUi
  readonly navItems?: readonly PluginNavUi[]
  readonly homeTile?: PluginHomeTileUi
}

export function parsePluginManifest(raw: unknown, ctx?: string): PluginManifest
export function isPluginManifest(raw: unknown): raw is PluginManifest
/** 侧栏有效入口：navItems 优先，否则 nav 单元素，否则 [] */
export function resolveNavItems(
  ui: PluginUi | undefined
): readonly PluginNavUi[]
export function groupNavItems<T extends NavGroupable>(
  items: readonly T[]
): NavGroup<T>[]
```

实现包：[`packages/plugin-protocol`](../../../packages/plugin-protocol)（README 含 packaging 导出）。

`IframeRuntimeManifest.nav` 透传 `group?: string`。常量（`WEB_PLUGIN_PROTOCOL`、`PLUGIN_MESSAGE_SOURCE`、`SHELL_*`）继续收敛在本包。

---

## 5. 与打包层的衔接

选包、宿主壳、`--plugin-file`、生成物路径见 [packaging](./innate.web-plugin.packaging.v1.md)。

壳侧渲染链：

```text
plugins.gen.ts (packedPlugins)
  → 按 features[id] === true 过滤
  → resolveNavItems(ui) → ShellNavItem[]（含 group）
  → groupNavItems(...) → sidebar
```

L1 / L2 分层**不变**。`ui` 只在**已进包且 L2 未关**时生效。

---

## 6. 产物自证（可选延续）

构建结束后可写 `dist/plugins.manifest.json`（id / kind / category / version），规则同 v0。本修订不强制改其字段；侧栏分组信息不要求写入产物自证文件。

---

## 7. 非目标

- 不改 iframe 握手信封、origin 白名单规则。
- 不改 `createWebDomain` 的 outlet 形状与 `addRoute` 签名。
- 不做远程拉取插件清单。
- 不实现组可折叠手风琴、嵌套 group。
- 不改 `homeTile` 渲染。
- 不因本修订更换协议字符串（仍为 `innate.plugin.v1`）。
