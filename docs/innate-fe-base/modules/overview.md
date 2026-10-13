# 模块总图

本文档是模块文档的入口，按三个层次介绍本仓库：

1. **UI Packages**：共享的 UI 库和分层
2. **单独开发 Web**：不用 plugin 模式，直接用 UI 库开发
3. **Plugin Protocol 与 Plugin 模式**：如何把业务模块组装进一个 web 应用

---

## 1. UI Packages

本仓库的 UI 资产集中在 `packages/` 下，分层管理，所有 app 和 domain 共享同一份。

### 分层

```text
Apps / domains
    │  组装路由、装数据
    ▼
L3  scene-*               场景规范（7 个 ToB 场景）、catalog、mocks
    │
    ▼
L2  admin-composites      页壳、表格、图表、spec 导航（跨页面组合）
    │
    ▼
L1  @innate/ui            无业务语义的 primitive（Button、Card、Table…）
    │
    ▼
D0  globals.css + themes  语义 token 与主题变量
```

依赖只向下：App → L2/L3 → L1 → D0。package 不得 import 具体 app 的路由或业务服务。

### 各包职责

| 包                         | 层级    | 说明                                                                                                                                                                   |
| -------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@innate/ui`               | D0 + L1 | 唯一的 primitive 与 token 来源。shadcn/ui + Base UI + Tailwind CSS v4。包含主题（`themes/*.css`）、国际化（`locale-*`）、自研组件（`domain-page-layout` 等）           |
| `@innate/admin-composites` | L2      | 跨页面的组合件：`PageContainer`（页壳）、`DataTable`（数据表格）、`ChartAreaInteractive`（交互式图表）、`SectionCards`、`SpecPageShell`（spec 导航页壳）、`dynamicSSR` |
| `@innate/scene-specs`      | L3      | 7 个基准 ToB 场景的规范文档（markdown，给人读）：dashboard、workspace-list、record-detail、reporting-wizard、approval-review、integration-health、policy-settings      |
| `@innate/scene-catalog`    | L3      | 场景的机器可读 catalog：`createSceneCatalog`、场景文档加载（`getSceneDocument` 嵌入 spec 内容）、spec 导航生成（`createSpecNavigation`）、`scene-blocks` UI 组件       |
| `@innate/scene-mocks`      | L3      | 7 个场景的 typed mock 数据                                                                                                                                             |

详细说明见 [`ui.md`](./ui.md)。

### 如何单独使用 @innate/ui 开发 web 应用（不进壳）

见下文 [§2 单独开发 Web](#2-单独开发-web)。

---

## 2. 单独开发 Web

如果你只想用本仓库的 UI 库开发一个独立 web 应用，不需要 plugin 模式、不需要宿主壳。

### 步骤

1. **安装 `@innate/ui`**

   在 pnpm workspace 内：

   ```json
   {
     "dependencies": {
       "@innate/ui": "workspace:*"
     }
   }
   ```

2. **引入样式**

   ```ts
   import "@innate/ui/globals.css"
   ```

3. **使用组件**

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

4. **（可选）使用主题切换**

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

5. **（可选）使用 L2 组合件**

   ```json
   {
     "dependencies": {
       "@innate/admin-composites": "workspace:*"
     }
   }
   ```

   ```tsx
   import { DataTable } from "@innate/admin-composites"
   ```

### 参考实现

仓库内的独立参考 app：[`apps/skel-lean-ui`](../../apps/skel-lean-ui)（Next.js，不进壳，只用 `@innate/ui`）。

### 注意

- 不要在 app 目录里跑 `npx shadcn add`。缺组件就加进 `@innate/ui`。
- 不要在功能 TSX 里写 raw hex 颜色（`bg-white`、`text-black`），用语义 token。
- 框架不限：React / Next.js / Vite 都可以，只要支持 Tailwind CSS v4。

---

## 3. Plugin Protocol 与 Plugin 模式

如果你要把业务模块组装进一个 web 应用（宿主壳），用 plugin 模式。

### 什么是 plugin 模式

业务不直接写在宿主壳里，而是以**插件**形式存在。每个插件自描述（`plugin.json`），构建时由 CLI 选择哪些进包，运行时由宿主壳加载。

### 两条轨道

| 轨道       | 加载方式                                      | 适合                       |
| ---------- | --------------------------------------------- | -------------------------- |
| **domain** | 编译期组合：源码打进宿主包，路由挂宿主 outlet | TanStack / Vite 业务       |
| **iframe** | 运行期组合：独立 app 自己跑，壳嵌 iframe      | Next.js 等自带打包器的应用 |

### 三个角色

| 角色       | 包 / 目录                                       | 职责                                      |
| ---------- | ----------------------------------------------- | ----------------------------------------- |
| **契约包** | `@innate/web-domain`、`@innate/plugin-protocol` | domain 声明路由/能力；iframe 自描述与握手 |
| **宿主**   | `shells/webshell`                               | sidebar、路由、iframe 宿主、能力消费      |
| **CLI**    | `tools/innate-fe-cli`                           | 选包、copy domain、生成接缝文件           |

### plugin.json 自描述

每个插件包根目录有一个 `plugin.json`：

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

### 选包：plugins.registry.yaml

```yaml
profiles:
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

### 从选包到页面的数据流

```text
plugins.registry.yaml (profile)
        │
        ▼
innate-fe-cli gen --profile <name>
        │
        ├─ applyProfile: copy domain 到打包面
        └─ writeGenerated: 写接缝文件
              ├─ modules.gen.ts        import 各 domain 的 entry
              ├─ styles.gen.css         聚合各 domain 的 styles
              ├─ site-features.gen.ts   选中 id → true
              └─ plugins.gen.ts         iframe 运行期清单
                    │
                    ▼
          shells/webshell
              ├─ router.tsx: 挂载 domain 路由
              ├─ registry.ts: shellNavItems / shellHomeTiles
              └─ app-shell.tsx: 渲染 sidebar / 首页 / iframe
```

详细说明见 [`plugin.md`](./plugin.md)、[`web-domain.md`](./web-domain.md)、[`cli.md`](./cli.md)。

---

## 4. 目录对照

| 目录                         | 角色                                                                                                            |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `packages/ui/`               | `@innate/ui`：primitive + token + 主题                                                                          |
| `packages/web-domain/`       | `@innate/web-domain`：domain 契约                                                                               |
| `packages/plugin-protocol/`  | `@innate/plugin-protocol`：iframe 协议                                                                          |
| `packages/admin-composites/` | L2 组合件                                                                                                       |
| `packages/scene-*/`          | 场景资产（specs / catalog / mocks）                                                                             |
| `domains/`                   | domain 打包面（业务模块源码）                                                                                   |
| `tools/innate-fe-cli/`       | 打包 CLI                                                                                                        |
| `plugins.registry.yaml`      | profile 选包清单（含 `shell` 选壳）                                                                             |
| `shells/`                    | 宿主壳的家；`shells/webshell` 是默认壳（sidebar + router + iframe 宿主），可再建 `shells/<id>` 用 `shell:` 切换 |

> `apps/` 下其他应用（`web-showcase`、`wandesk-ui`、`admin-nextjs`、`skel-lean-ui`）是独立 app 或 iframe 插件，本文档不展开。
