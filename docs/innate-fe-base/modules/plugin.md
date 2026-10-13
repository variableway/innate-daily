# Plugin Protocol 与 Plugin 模式

本仓库的核心能力是**把业务模块按需组装进一个 web 应用**。这就是 plugin 模式。

## 什么是 plugin 模式

业务不直接写在宿主壳里，而是以**插件**的形式存在。每个插件自描述（`plugin.json`），构建时由 CLI 选择哪些插件进包，运行时由宿主壳加载。

好处：

- 业务模块可独立开发、独立测试
- 同一个壳可以组装出不同的应用（通过 profile 选择不同的插件组合）
- 插件不依赖壳，只依赖契约包

## 两条轨道

| 轨道       | 加载方式                                      | 适合                       | 技术栈约束                      |
| ---------- | --------------------------------------------- | -------------------------- | ------------------------------- |
| **domain** | 编译期组合：源码打进宿主包，路由挂宿主 outlet | TanStack / Vite 业务       | 与壳共用 React 树、路由器、主题 |
| **iframe** | 运行期组合：独立 app 自己跑，壳嵌 iframe      | Next.js 等自带打包器的应用 | 完全独立，通过 postMessage 通信 |

### domain 轨道

```text
domains/<id>/
  plugin.json          自描述
  src/index.ts         export { webDomain }
        │
        ▼  构建期
innate-fe-cli gen
        │
        ▼
shells/webshell/src/gen/modules.gen.ts   import 打包面的 webDomain
        │
        ▼
shells/webshell  router 挂载 domain 路由
```

domain 只依赖 `@innate/web-domain`，不依赖壳。

### iframe 轨道

```text
apps/<id>/
  plugin.json          自描述（innate.plugin.v1, kind: iframe）
  （独立 app，自己的 package.json / 构建）
        │
        ▼  构建期
innate-fe-cli gen
        │
        ▼
shells/webshell/src/gen/plugins.gen.ts   iframe 运行期清单
        │
        ▼
shells/webshell  /plugins/$id  嵌 iframe
```

iframe 插件不进打包面，只登记到 `plugins.gen.ts`。壳在 `/plugins/$id` 路由下嵌 iframe，通过 `innate.web-plugin.v1` 信封协议握手。

## 三个角色

| 角色       | 包 / 目录                                       | 职责                                      |
| ---------- | ----------------------------------------------- | ----------------------------------------- |
| **契约包** | `@innate/web-domain`、`@innate/plugin-protocol` | domain 声明路由/能力；iframe 自描述与握手 |
| **宿主**   | `shells/webshell`                               | sidebar、路由、iframe 宿主、能力消费      |
| **CLI**    | `tools/innate-fe-cli`                           | 选包、copy domain、生成接缝文件           |

## plugin.json 自描述

每个插件包根目录有一个 `plugin.json`，协议为 `innate.plugin.v1`。

### 公共字段

| 字段          | 必填 | 类型                              | 说明                       |
| ------------- | ---- | --------------------------------- | -------------------------- |
| `protocol`    | ✅   | `"innate.plugin.v1"`              | 固定值                     |
| `id`          | ✅   | string                            | 匹配 `/^[a-z][a-z0-9-]*$/` |
| `kind`        | ✅   | `"domain" \| "iframe"`            | 决定打包与加载方式         |
| `category`    | ✅   | string                            | 分类标签                   |
| `version`     | ✅   | string                            | 语义化版本                 |
| `name`        | ➖   | string                            | 展示名，缺省用 `id`        |
| `ui`          | ➖   | object                            | 对外露出的界面入口         |
| `ui.nav`      | ➖   | `{ label, path?, icon?, order? }` | sidebar / header 入口      |
| `ui.homeTile` | ➖   | `{ title, description, path }`    | 首页卡片                   |

### kind: "domain"

| 字段     | 必填 | 说明                                                       |
| -------- | ---- | ---------------------------------------------------------- |
| `entry`  | ✅   | 导出 `webDomain` 的模块，相对插件根（默认 `src/index.ts`） |
| `styles` | ➖   | 需要聚合的 CSS，相对插件根（默认 `src/globals.css`）       |
| `order`  | ➖   | 打包 / 挂载排序权重                                        |

### kind: "iframe"

| 字段        | 必填 | 说明                              |
| ----------- | ---- | --------------------------------- |
| `runtime`   | ✅   | 固定 `"iframe"`                   |
| `iframeSrc` | ✅   | 绝对 URL 或相对路径               |
| `origins`   | ✅   | 白名单；相对路径时必须含 `"self"` |

### 示例

```json
{
  "protocol": "innate.plugin.v1",
  "id": "my-feature",
  "kind": "domain",
  "category": "tools",
  "version": "0.1.0",
  "entry": "src/index.ts",
  "ui": {
    "nav": {
      "label": "我的功能",
      "path": "/my-feature",
      "icon": "star",
      "order": 10
    }
  }
}
```

## 选包：plugins.registry.yaml

[`plugins.registry.yaml`](../../plugins.registry.yaml) 定义 profile，决定「这次 build 认哪些插件」。

```yaml
protocol: innate.web-plugin.packaging.v1
version: 1
defaultProfile: empty

profiles:
  empty:
    domains: []
    iframes: []
  admin:
    domains:
      - id: admin-tanstack
    iframes: []
  apps:
    domains:
      - id: admin-tanstack
    iframes:
      - id: web-showcase
      - id: wandesk-ui
```

每个 profile 声明 `domains`（domain 插件 id 列表）和 `iframes`（iframe 插件 id 列表）。

CLI 内置还有一个 `all` profile：扫描 `domains/` 全部合法包 + `apps/` 下全部 iframe。

### iframe 的 `from` 字段

默认情况下，iframe 插件从固定扫描根（`apps/`、`shells/webshell/e2e/fixtures/`）查找。如果某个 iframe 插件位于其他目录（例如 `examples/` 下的示例 app），可以在 profile 中用 `from` 字段指定其目录：

```yaml
profiles:
  examples:
    domains: []
    iframes:
      - id: skel-lean-ui
        from: examples/skel-lean-ui
```

- `from` 是相对 repo root 的路径，也支持绝对路径
- 语义与 domain 的 `from` 一致
- 指定 `from` 后，CLI 直接从该路径加载 `plugin.json`，不依赖默认扫描根
- `dev` / `prepare` 命令也会从 `from` 目录读取 `package.json` 与构建产物

## 从选包到页面的数据流

```text
plugins.registry.yaml (profile)
        │
        ▼
innate-fe-cli gen --profile <name>
        │
        ├─ applyProfile: copy domain 到打包面 domains/<id>/
        │                  （就地包不 copy）
        │
        └─ writeGenerated: 写接缝文件
              │
              ├─ modules.gen.ts        import 各 domain 的 entry
              ├─ styles.gen.css         聚合各 domain 的 styles
              ├─ site-features.gen.ts   选中 id → true
              └─ plugins.gen.ts         iframe 运行期清单
                    │
                    ▼
          shells/webshell
              │
              ├─ router.tsx: collectWebDomainRoutes(webModules)
              │              → 挂载 domain 路由
              │
              ├─ registry.ts: buildRegistry(webModules, iframePlugins, features)
              │              → shellNavItems / shellHomeTiles
              │
              └─ app-shell.tsx: 渲染 sidebar（shellNavItems）
                                渲染首页 tiles（shellHomeTiles）
                                /plugins/$id: 嵌 iframe
```

## 契约包导出

### `@innate/plugin-protocol`

[`packages/plugin-protocol/src/index.ts`](../../packages/plugin-protocol/src/index.ts)

| 导出                               | 说明                                           |
| ---------------------------------- | ---------------------------------------------- |
| `PLUGIN_PROTOCOL`                  | `"innate.plugin.v1"`                           |
| `WEB_PLUGIN_PROTOCOL`              | `"innate.web-plugin.v1"`（运行期 iframe 信封） |
| `PluginKind`                       | `"domain" \| "iframe"`                         |
| `parsePluginManifest(raw, ctx?)`   | 解析并校验 plugin.json，失败抛错               |
| `isPluginManifest(raw)`            | 类型守卫                                       |
| `toIframeRuntimeManifest(m)`       | plugin.json (iframe) → 壳运行期清单            |
| `validateIframeRuntimeManifest(m)` | 运行期白名单校验                               |

### `@innate/web-domain`

见 [`web-domain.md`](./web-domain.md)。

## 不做的事

- 不做远程拉取插件清单（只扫本地）
- 不改 iframe 握手信封与 origin 白名单规则
- 不要求 domain 必须有 `ui.nav`（可以只挂路由不露导航）
