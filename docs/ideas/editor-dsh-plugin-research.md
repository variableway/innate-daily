# 调研：把「编辑」页面做成 dsh-plugin 的 spec 与步骤

> 结论先行：推荐**轨道 A（domain 插件）**——编辑器页已经是 React + TanStack
> Router + 同源 UI 组件的实现，与壳共享 React 树是阻力最小的路径；
> 只有当编辑器要拆成独立部署、被非 innate 壳复用时才考虑轨道 B（iframe）。
> 本文档只给 spec 与步骤，不含实现代码。

## 1. dsh-plugin 体系是什么

innate-fe 的插件体系由**三份协议 + 一个 CLI + 一个宿主壳**组成：

| 协议 / 工具 | 事实源 | 作用 |
|-------------|--------|------|
| `innate.plugin.v1` | `packages/plugin-protocol/src/plugin.ts` | 插件自描述清单（`plugin.json`）：id、kind、nav、entry |
| `innate.web-plugin.packaging.v1` | `packages/plugin-protocol/src/packaging.ts` | `plugins.registry.yaml`：profile 选包（这次 build 带哪些插件） |
| `innate.web-plugin.v1` | 同 plugin.ts（postMessage 常量） | iframe 轨道的运行时握手（shell ⇄ plugin） |
| `innate-fe-cli` | `innate-fe-cli/src/index.ts` | `gen` / `dev` / `build` / `registry publish`：组装打包面、链接依赖、写接缝 |
| 宿主壳 webshell | `shells/webshell` | React sidebar + 路由宿主；domain 路由挂在它的 outlet 上 |

domain 与宿主之间的**编译期契约**在 `packages/web-domain/src/index.ts`：

- `createWebDomain(id)` builder：`addRoute(outlet, factory)` 挂路由、
  `addCapability(key, value)` 向上暴露 nav / homeTile 能力；
- outlet 目前只有 `app` / `admin` 两个；
- id 必须匹配 `/^[a-z][a-z0-9-]*$/`。

## 2. 两条轨道怎么选

| | 轨道 A · domain | 轨道 B · iframe |
|---|----------------|-----------------|
| 运行形态 | 与壳共用 React 树 + 路由器，源码打进宿主包 | 独立进程独立打包，壳只给 iframe + 握手 |
| 技术约束 | 必须用壳的 React / TanStack / `@innate/ui` | 任意框架任意打包器，`dev` 脚本即可 |
| 主题 | 自动跟随壳的 token | 需自己在握手后同步 |
| 通信 | 直接函数调用（capability） | `innate.web-plugin.v1` postMessage |
| 适合 | 同技术栈的业务模块（编辑器正是） | 异构应用（Next.js 等） |

**编辑器选 A 的理由**：现在的 `/edit` 页已经是 React 组件，依赖站内
`MarkdownPreview` 与 `@ui` 组件；domain 化 = 平移组件 + 声明路由，
没有跨进程通信的设计成本。

**何时改选 B**：编辑器要发布成独立站点给非 innate 宿主嵌入，
或团队希望它独立发版、独立部署——那时 iframe + 握手协议才值得。

## 3. 编辑器 domain 化的 spec

### 3.1 文件骨架（对照 UC6 的约定）

```
editor-plugin/
├── package.json          # 包名 @innate/domain-editor（硬条件，见 3.2）
├── plugin.json           # 外观唯一事实源，壳侧栏只读它
├── tsconfig.json
├── vite.standalone.config.ts   # 独立开发入口（:4015）
└── src/
    ├── index.ts          # 必须 export webDomain
    ├── web-domain.tsx    # 路由 + capability 声明
    ├── globals.css       # 可选：进 styles.gen.css 聚合
    └── （编辑器现有组件平移进来）
```

### 3.2 package.json 硬条件（gen 的 scanDomains 逐条校验，不满足直接跳过）

| 条件 | 不满足的后果 |
|------|--------------|
| `name` 以 `@innate/domain-` 开头 | gen 跳过该包 |
| `src/index.ts` 存在且导出 `webDomain` | gen 跳过：缺 webDomain 出口 |
| `exports` 含 `"./globals.css"`（要进样式聚合时） | 样式不进聚合 |
| `pluginOrder`（缺省 100） | 只影响聚合排序 |

依赖声明：`@innate/ui`、`@innate/web-domain` 用 `workspace:*`（仓内开发）。

### 3.3 plugin.json 字段（innate.plugin.v1）

| 字段 | 值 | 说明 |
|------|-----|------|
| `protocol` | `"innate.plugin.v1"` | 固定 |
| `id` | `"editor"` | 匹配 `/^[a-z][a-z0-9-]*$/` |
| `kind` | `"domain"` | 轨道 A |
| `category` | `"writing"` | 壳侧分类 |
| `version` | semver | |
| `ui.nav` | `{ label: "编辑", path: "/editor", icon: "wrench", order: 30 }` | 壳侧栏入口；多入口用 `navItems` |
| `ui.homeTile` | `{ title, description, path }` | 壳首页卡片（可选） |
| `entry` | `"src/index.ts"` | gen 接缝的 import 点 |
| `styles` | `"src/globals.css"` | 进样式聚合（可选） |
| `order` | 数字 | 多 domain 时样式/聚合顺序 |

### 3.4 编辑器特有的迁移注意点

1. **FS Access API 在壳内可用**：`showDirectoryPicker` 只要求安全上下文
   （localhost / https）与用户手势，domain 与宿主同源同页，现有实现平移即可。
2. **bundle 只读素材要重新供给**：`/edit` 页的只读降级读的是
   innate-daily 的 `writingFiles`（构建期内联）。domain 化后这属于宿主
   数据，应改为**宿主注入的 capability**（`addCapability("writing-files", …)`），
   而不是让 domain import 宿主模块——否则依赖方向反了。
3. **collections.json 路径约定**：`src/data/collections.json` 是宿主仓的
   结构，domain 不应硬编码；建议作为 capability 传入（路径或 loader）。
4. **`@ui` 别名**：编辑器现在从 innate-daily 的 vendor 目录导入组件；
   domain 里改回 `@innate/ui`（workspace 版）。TS 类型一致，组件 API 有
   vendor 分叉的风险——迁移前先 diff 一次 vendor 与上游的差异。
5. **路由挂载**：编辑器是单页，`addRoute("app", factory)` 挂在壳的根
   outlet 即可，不需要 admin 区。

## 4. 步骤（照 UC6 路线 A）

1. **选位置**：编辑器插件源码放 examples 仓（`examples/editor`），
   宿主 registry 用 `from:` 引用；不写 `from` 就是就地 domain（`domains/editor`）。
2. **建骨架**：按 3.1 清单建文件，manifest 按 3.3 填。
3. **平移组件**：`/edit` 页与 `MarkdownPreview` 等依赖进 `src/`；
   3.4 的两个 capability 接口先定签名再搬代码。
4. **独立开发验证**：`vite.standalone.config.ts` 起独立入口（:4015），
   确认 FS 连接、编辑、预览在脱离宿主时也能跑。
5. **集成进壳**：registry 加 profile（或并入现有 profile），跑
   `cli dev --profile <x>`。CLI 的 `gen` 会：复制源码到打包面
   `domains/editor` → `pnpm install` 补 workspace 链接 → 写接缝
   （`modules.gen.ts` 路由 + `styles.gen.css` 样式）→ 起壳（:4020）。
6. **验证清单**：
   - `ls domains/editor/src/index.ts`（打包面存在）
   - `cat shells/webshell/src/gen/modules.gen.ts`（接缝指向打包面）
   - 壳侧栏出现「编辑」入口，路由 `/editor/*` 可达
   - 主题跟随壳切换（token 未被 vendor 版覆盖）
   - FS 连接、保存、collections 预览功能回归
7. **分发**（可选）：`cli registry publish` 把 domain 做成可安装包，
   走 UC5 的私有 registry / GitHub Packages 路线。

## 5. 开放问题

- 编辑器与宿主的 capability 接口（writing-files、collections 路径）
  需要先定一版契约，才能开始搬代码；
- vendor 版 `@innate/ui` 与 workspace 版的 diff 是否会引发样式回归；
- iframe 轨道下 `FileSystemDirectoryHandle` 无法经 postMessage 传递，
  编辑器若走轨道 B，FS 操作必须在 iframe 内自行完成（可行，但
  「连哪个目录」的引导体验要在 iframe 里重做一遍）。

## 6. 资料索引

- 协议实现：`innate-fe/packages/plugin-protocol/src/{plugin,packaging,nav}.ts`
- domain 契约：`innate-fe/packages/web-domain/src/index.ts`
- UC3 集成 domain：`innate-fe/docs/use-cases/03-domains-in-shell.md`
- UC6 新建项目：`innate-fe/docs/use-cases/06-create-new-project-with-cli.md`
- UC2 iframe 轨道：`innate-fe/docs/use-cases/02-apps-in-shell.md`
- UC9 profile 打包与独立分发：`innate-fe/docs/use-cases/09-profile-packaging-and-independent-domains.md`
