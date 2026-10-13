# innate.plugin.v1 — 插件自描述、选择与打包协同

> **历史基线。** 当前事实源见 [`../v1/innate.plugin.v1.md`](../v1/innate.plugin.v1.md)（含 `ui.nav.group` / `ui.navItems`）。

本文件定义**插件如何自描述**、**构建时如何选择**、以及**打包产物如何自证**。
它是 [`innate.web-plugin.packaging.v1`](./innate.web-plugin.packaging.v1.md) 的**增量**：不取代、不重写，只补它没有的三层。

| 字段     | 值                                                                                                         |
| -------- | ---------------------------------------------------------------------------------------------------------- |
| 协议名   | `innate.plugin.v1`（插件清单）/ `innate.web-plugin.packaging.v1`（打包，沿用）                             |
| 清单文件 | 每个插件包根目录一个 `plugin.json`                                                                         |
| 登记文件 | [`plugins.registry.yaml`](../../plugins.registry.yaml)（**沿用**；iframe 发现不写扫描根，见 packaging.v1） |
| 生成器   | [`tools/innate-fe-cli`](../../tools/innate-fe-cli)                                                         |
| 协议包   | `packages/plugin-protocol`（`@innate/plugin-protocol`）                                                    |

---

## 1. 要解决什么

原始诉求：把插件源码按 `category` 归类，用 registry 选择"哪些 category 进包"。

调研结论（已实测）：

- **软链不可行**。[registry.ts](../../tools/innate-fe-cli/src/lib/registry.ts) 的 `scanDomains` 用 `readdirSync(withFileTypes).isDirectory()`，软链目录不会被识别，会被**静默跳过**（已用 `/tmp` 实验复现：软链目录未出现在"发现 N 个 domain"里）。
- **新增 `categories/` 目录层无收益**。分类是**选择的维度**，不是**存放的位置**。目录搬家还会破坏 pnpm workspace、Tailwind `@source` 与相对 import 计算。
- **"打包时能选择" 已经实现**。packaging.v1 的 `profiles` 就是选择清单。缺的是：
  1. 选择只能**逐个列 id**（`domains[].id` + `from`），不能按分类批量选；
  2. 插件**不自描述**——打包器和壳都要靠 `package.json` 包名前缀 + 约定路径 + 手写字符串去猜；
  3. 产物**不自证**——构建完没有任何文件能回答"这次到底进了哪些"。

因此本 spec 做三件事，**不动目录结构**：

```text
① 自描述   plugin.json（每个插件包自带，含 category / entry / styles / ui）
② 选择     plugins.registry.yaml（沿用；新增按 category 选）
③ 打包     registry.ts 读清单 → copy 进 domains/ → gen → vite build → dist/plugins.manifest.json
```

---

## 2. 三层职责与边界

| 层                           | 负责                                                                                               | 不负责                            |
| ---------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------- |
| 自描述 `plugin.json`         | 我是谁（id/kind/category/version）、怎么打包（entry/styles）、对外露出什么（ui.nav / ui.homeTile） | 路由树、视图实现、iframe 握手细节 |
| 选择 `plugins.registry.yaml` | 这次 build 认哪些插件                                                                              | 插件内部长什么样                  |
| 打包 `registry.ts`           | 把选中的复制进打包面、生成接缝与产物清单                                                           | 运行时是否展示（那是 L2 overlay） |

**代码管路由，清单管外观。** 这条边界是本协议最核心的一条：

- `entry` 导出的 `webDomain` 只声明**路由**（`addRoute`）；
- `ui.nav` / `ui.homeTile` 只在 `plugin.json` 声明，**不再**在代码里 `addCapability("nav", ...)`。

这样壳不需要猜、插件不需要两处同步。

---

## 3. 协议：`plugin.json`（`innate.plugin.v1`）

### 3.1 位置与发现

`plugin.json` 与 `package.json` 同级（插件包根目录）。打包器固定扫描 `apps/<id>/plugin.json`（一层子目录）。e2e 夹具由 CLI 另扫 `apps/webshell/e2e/fixtures/`，**不**在 yaml 里配扫描根。

### 3.2 公共字段

| 字段          | 必填 | 类型                   | 说明                                                      |
| ------------- | ---- | ---------------------- | --------------------------------------------------------- |
| `protocol`    | ✅   | `"innate.plugin.v1"`   | 固定值                                                    |
| `id`          | ✅   | string                 | 匹配 `/^[a-z][a-z0-9-]*$/`；必须等于目录名与包名后缀      |
| `kind`        | ✅   | `"domain" \| "iframe"` | 决定打包与加载方式                                        |
| `category`    | ✅   | string                 | 分类标签（如 `examples`、`tools`、`admin`）；**选择维度** |
| `version`     | ✅   | string                 | 语义化版本，进产物清单                                    |
| `name`        | ➖   | string                 | 展示名，缺省用 `id`                                       |
| `ui`          | ➖   | object                 | 对外露出的界面入口，见 §3.4                               |
| `ui.nav`      | ➖   | object                 | `{ label, path, icon?, order? }`；进 sidebar / header     |
| `ui.homeTile` | ➖   | object                 | `{ title, description, path }`；进首页 tile               |

`icon` 是 lucide 图标名（宿主自行映射，避免插件强依赖图标库版本）。

### 3.3 `kind: "domain"`

| 字段     | 必填 | 说明                                                               |
| -------- | ---- | ------------------------------------------------------------------ |
| `entry`  | ✅   | 导出 `webDomain` 的模块，相对插件根（默认 `src/index.ts`）         |
| `styles` | ➖   | 需要聚合的 CSS，相对插件根（默认 `src/globals.css`，存在才进聚合） |
| `order`  | ➖   | 打包 / 挂载排序权重，小者靠前（默认 100）                          |

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
      "order": 10
    },
    "homeTile": {
      "title": "Showcase",
      "description": "演示一个 domain 的路由与能力",
      "path": "/showcase-demo"
    }
  }
}
```

### 3.4 `kind: "iframe"`

同一份 schema，运行时字段不同。**不 copy 源码**，只进产物清单。

| 字段        | 必填 | 说明                                            |
| ----------- | ---- | ----------------------------------------------- |
| `runtime`   | ✅   | 固定 `"iframe"`                                 |
| `iframeSrc` | ✅   | 绝对 URL 或相对路径                             |
| `origins`   | ✅   | 白名单；`iframeSrc` 为相对路径时必须含 `"self"` |

字段与 [`innate.web-plugin.v1`](../../apps/webshell/src/plugins/types.ts) 的运行时信封一致，**握手行为不变**（§10 of packaging.v1）：

- 禁止 `targetOrigin="*"`；
- 信封 `{ source: "innate-plugin", v: 1, channel }` → 宿主回 `{ source: "innate-shell", v: 1, channel: "shell:ack" }`。

> 两套 schema 共用一个 `plugin.json` 是设计目标；若未来 iframe 出现根schema冲突的字段，**允许拆出 `innate.iframe-plugin.v1`**，`kind` 字段已为此留好分叉点。

### 3.5 校验

`@innate/plugin-protocol` 导出 `parsePluginManifest(raw: unknown): PluginManifest`：字段缺失 / 类型错误 / `id` 不合法 / 相对路径缺 `"self"` → **抛错并指出插件目录**。打包器与壳共用同一函数，**禁止各写一份校验**。

---

## 4. 协议包：`@innate/plugin-protocol`

新包 `packages/plugin-protocol`，纯 TS、零运行时依赖，**三处共用**：

| 使用方                                   | 用途                                                |
| ---------------------------------------- | --------------------------------------------------- |
| `tools/innate-fe-cli`（打包器）          | 读 / 校验 `plugin.json`，决定 import 与 copy        |
| `apps/webshell`（壳运行时）              | 读生成物里的清单，渲染 nav / tile；校验 iframe 信封 |
| 外部 registry 工具（`innate-fe-cli` 等） | 生成 / 编辑 `plugin.json` 与 registry 选择          |

导出面：

```ts
export const PLUGIN_PROTOCOL = "innate.plugin.v1" as const
export type PluginKind = "domain" | "iframe"
export interface PluginManifest {
  /* §3 字段 */
}
export function parsePluginManifest(raw: unknown): PluginManifest
export function isPluginManifest(raw: unknown): raw is PluginManifest
```

**消重目标**：`"innate.web-plugin.v1"`、`"innate-plugin"`、`"innate-shell"`、`"shell:ack"` 这些字符串目前在 [types.ts](../../apps/webshell/src/plugins/types.ts) 等处手抄，统一收敛到本包常量。

---

## 5. 选择：`plugins.registry.yaml`

沿用 packaging.v1 的 profile 结构。iframe 扫描根不进 yaml。**计划新增**按 category 批量选：

```yaml
protocol: innate.web-plugin.packaging.v1
version: 1
defaultProfile: empty

profiles:
  demo:
    categories: [examples] # 计划：按分类批量选
    domains: # 沿用：仍可逐个点名（显式清单优先）
      - id: showcase-demo
        from: examples/showcase-demo
    iframes:
      - id: example-external
  empty:
    categories: []
    domains: []
    iframes: []
```

| 字段                          | 语义                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------ |
| `profiles.<p>.categories`     | 选中所有 `category ∈ categories` 的插件（domain 与 iframe 一起选）             |
| `profiles.<p>.domains[].from` | **可省略**：就地包已在 `domains/<id>/`；iframe 从 `apps/<id>/plugin.json` 发现 |

解析顺序（`resolveProfile(p)`）：

1. 扫 `apps/*/plugin.json`（外加 e2e 夹具）得到候选 iframe；
2. 选中集合 = `categories` 命中的插件 ∪ `domains[].id` 点名的插件 ∪ `iframes[].id` 点名的插件；
3. 点名但磁盘未命中的 domain → 用 `from` 解析（保持 packaging.v1 行为）；
4. 仍未解析到 → **报错**，不静默跳过。

`--check` 对账不变：yaml 声明 ↔ 打包面 ↔ 生成物。

---

## 6. 打包流程

```text
① 读 registry + profile
        ↓
② 扫 apps/*/plugin.json → parsePluginManifest() → 候选 iframe
        ↓
③ 解析选中集合（categories ∪ 点名）
        ↓
④ kind=domain：copy 插件目录 → domains/<id>/（沿用 packaging.ts，copy 失败才 symlink）
   kind=iframe：只登记，不 copy
        ↓
⑤ gen 四个接缝文件
        ↓
⑥ vite build → dist/ + dist/plugins.manifest.json
```

### 生成的接缝文件

| 文件                   | 变化                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------- |
| `modules.gen.ts`       | 从打包面**相对路径** import 各 domain 的 `entry`（不再假设 `src/index.ts`）           |
| `styles.gen.css`       | 聚合各 domain 的 `styles`（不再假设 `src/globals.css`）                               |
| `site-features.gen.ts` | 不变：选中 id → `true`                                                                |
| `plugins.gen.ts`       | **新增**：`packedPlugins: readonly PluginManifest[]`，供壳读 `ui.nav` / `ui.homeTile` |

壳侧渲染链变为：

```text
plugins.gen.ts (packedPlugins)
  → 按 features[id] === true 过滤        ← L2 overlay 仍在此层生效
  → collectNavItems() / homeTiles()      ← 从清单读，不再从 createWebDomain 读
```

L1 / L2 分层**不变**（packaging.v1 §3）。`plugin.json` 的 `ui` 只在**已进包且 L2 未关**时生效。

---

## 7. 产物自证：`dist/plugins.manifest.json`

构建结束后写出（vite 插件或 `postbuild` 脚本，读 `packedPlugins`）：

```json
{
  "protocol": "innate.plugin.v1",
  "packaging": "innate.web-plugin.packaging.v1",
  "profile": "demo",
  "generatedAt": "2026-09-20T00:00:00.000Z",
  "plugins": [
    {
      "id": "showcase-demo",
      "kind": "domain",
      "category": "examples",
      "version": "0.1.0"
    },
    {
      "id": "example-external",
      "kind": "iframe",
      "category": "examples",
      "version": "0.1.0"
    }
  ]
}
```

用途：

- 部署方 / 外部 registry 工具**只读一个文件**就知道这次进了什么；
- CI 可断言产物与 profile 一致（防"构建机上的 `domains/` 是脏的"）；
- 不在产物里暴露源码路径，只暴露 id / kind / category / version。

`generatedAt` 之外字段必须与 `packedPlugins` **逐项相等**，由 `verify-plugins.ts` 对账。

---

## 8. 连带改动

| 位置                                                                                                   | 改动                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/plugin-protocol/`                                                                            | **新增**（§4）                                                                                                                                          |
| `apps/webshell/src/plugins/types.ts`                                                                   | iframe 类型 / 校验收敛到协议包，本文件只留壳内适配                                                                                                      |
| `apps/webshell/src/plugins/registry.ts`                                                                | 改为消费 `packedPlugins`，nav / tile 从清单读                                                                                                           |
| `apps/webshell/src/plugins/site-features.ts`                                                           | **不动**（L2 overlay 语义不变）                                                                                                                         |
| [`tools/innate-fe-cli/src/lib/registry.ts`](../../tools/innate-fe-cli/src/lib/registry.ts)             | `scanDomains` 改为读 `plugin.json`；新增 `plugins.gen.ts`；iframe 固定扫 `apps/`                                                                        |
| [`tools/innate-fe-cli/src/lib/packaging.ts`](../../tools/innate-fe-cli/src/lib/packaging.ts)           | copy 源仍是 yaml `from`；iframe 扫描根不进 yaml                                                                                                         |
| [`tools/innate-fe-cli/src/lib/verify-flags.ts`](../../tools/innate-fe-cli/src/lib/verify-flags.ts)     | 改名 `verify-plugins.ts`：flag 对账 + 产物 manifest 对账                                                                                                |
| `packages/web-domain`                                                                                  | `nav` / `homeTile` capability 相关收集函数**瘦身**（`collectNavItems` 迁到壳侧按清单实现）；`createWebDomain` 的 `addRoute` / 通用 `addCapability` 保留 |
| `domains/showcase-demo`、`examples/showcase-demo`                                                      | 各加一份 `plugin.json`；`web-domain.tsx` 移除 `nav` / `homeTile` 两个 `addCapability`                                                                   |
| `tools/innate-fe-cli` 测试快照                                                                         | 随生成物形状更新                                                                                                                                        |
| `docs/use-cases/01-start-webshell.md`                                                                  | §2 修正为 `--profile empty`（**删掉手改 flag / `--domains /tmp` 两种做法**）                                                                            |
| `docs/use-cases/02-add-domain-plugin.md`                                                               | site-features diff 改为 manifest + registry 流程                                                                                                        |
| `docs/specs/2026-09-20-course-outline.md` §4.1、`2026-09-18-interactive-use-cases-site-design.md` §2.5 | 指向本 spec，删除与 packaging.v1 冲突的讲法                                                                                                             |
| `docs/specs/innate.web-plugin.packaging.v1.md`                                                         | §4 去掉 yaml `catalog`；iframe 发现改为 CLI 固定扫 `apps/`；§6 增补 `plugins.gen.ts`；新增 §12 指向本 spec                                              |

---

## 9. 非目标

- 不建 `categories/` 目录，**不用软链**替换 `domains/`（与 packaging.v1 §11 一致）。
- 不改 iframe 握手信封、origin 白名单规则。
- 不改 `createWebDomain` 的 outlet 形状与 `addRoute` 签名。
- 不做远程拉取插件清单；iframe `plugin.json` 只扫本地 `apps/`（及 e2e 夹具）。
- 不在本次把打包器发布成独立 npm 包（仓内独立项目是 [`tools/innate-fe-cli`](../../tools/innate-fe-cli)，协议包先可复用）。
- 不改 `--check` / L1 / L2 语义。

---

## 10. 待确认

1. **`ui` 归属**：本文定"`ui` 只在 `plugin.json`"（单一来源）。替代方案是保留 `createWebDomain().addCapability("nav")` 并让清单覆盖它——但那会引入两处同步。若无异议按本文执行。
2. **`verify-flags.ts` 改名**：`verify-plugins.ts` 会同时改到 `package.json` script 与文档引用，确认可接受。
3. **iframe 扫描根**：不进 yaml。CLI 固定扫 `apps/`，并内部扫 e2e 夹具（`example-external`）。
