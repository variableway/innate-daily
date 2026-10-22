# GitHub Pages 部署

`@innate/daily`（`apps/daily-work/`）是一个纯静态 SPA，通过两条独立的 CI 线部署到 GitHub Pages。本文说明部署原理、配置项与操作步骤。

## 两条部署线

| 线 | 触发仓 | Workflow | 构建模式 | 产物去向 |
| --- | --- | --- | --- | --- |
| **本仓 Pages** | `daily-work` 仓 push | [`.github/workflows/deploy-pages.yml`](../../.github/workflows/deploy-pages.yml) | 默认（`content/` + `docs/` + `use-cases/`） | 本仓 GitHub Pages |
| **fe-base Pages** | `innate-fe-base` 父仓 push | [`.github/workflows/deploy-writing-pages.yml`](../../../../.github/workflows/deploy-writing-pages.yml) | `VITE_WRITING_SOURCE=docs`（仅 `docs/`） | fe-base GitHub Pages |

两条线互不干扰：本仓 Pages 用于 daily-work 独立仓的内容展示；fe-base Pages 用于父仓聚合的文档站。

## 前提条件

1. **GitHub Pages 已启用**：仓库 Settings → Pages → Source 选 **GitHub Actions**。
2. **`@innate/ui` 可获取**：
   - 本仓 Pages：通过 sparse checkout 从 `fe-templates` 仓拉取 `packages/ui`，需配置仓库变量 `FE_TEMPLATES_REPO`（默认 `variableway/innate-fe-templates`）和密钥 `FE_TEMPLATES_TOKEN`（私有仓时需要）。
   - fe-base Pages：`@innate/ui` 是 workspace 成员（`workspace:*`），直接 `pnpm install` 即可。
   - 本仓 Pages 里站点是**被注入**到 `fe-templates` workspace 的（`apps/daily-work`），它自己的 `.npmrc`（`@innate` 指向本机 `127.0.0.1:4873` 私有源）与 `pnpm-workspace.yaml` 都不生效——pnpm 只读 workspace 根的设置。因此 workflow 会在 workspace 根的 `pnpm-workspace.yaml` 追加 `linkWorkspacePackages` / `preferWorkspacePackages`，让 `@innate/ui@^0.1.0` 链接到 sparse checkout 出来的 `packages/ui`，而不是去 npm 上找一个从未发布的包。
3. **Node 22 + pnpm 12**：Workflow 中已固定版本。

## 部署原理

### 1. 相对路径构建（`PUBLIC_PATH=./`）

`vite.config.ts` 中 `base: process.env.PUBLIC_PATH ?? "./"`。Pages 站点通常位于子路径（如 `https://<user>.github.io/<repo>/`），使用相对路径 `./` 让所有资源引用适配任意子路径，无需为每个仓库硬编码 base。

### 2. Hash 路由（`createHashHistory`）

路由使用 hash 模式（`#/writing/slug`），URL 的 pathname 部分始终指向 `index.html`，因此**不需要**服务端路由回退。这是静态托管（GitHub Pages）下 SPA 的标准做法。

### 3. 构建期内容内联（`import.meta.glob(?raw)`）

所有 Markdown / MDX 在构建期通过 `import.meta.glob("...", { query: "?raw" })` 内联进 bundle。运行时无 fs 读取、无网络请求，产物是纯静态文件，可直接托管到 Pages。

`VITE_WRITING_SOURCE` 环境变量决定内联哪些内容源（见 [内容源与构建矩阵](#内容源与构建矩阵)）。

### 4. `404.html` 兜底

`package.json` 的 `build` 脚本在 `vite build` 后复制 `dist/index.html → dist/404.html`。虽然 hash 路由不依赖此兜底，但保留它可应对直接访问子路径时 Pages 返回 404 的边缘情况。

## 内容源与构建矩阵

| `VITE_WRITING_SOURCE` | 内联内容 | 使用场景 |
| --- | --- | --- |
| 未设置 / `all` | `content/` + `docs/` + `use-cases/` | 本仓 Pages（默认） |
| `docs` | 仅 `docs/` 整棵 | fe-base Pages（只展示父仓文档） |
| `use-cases` | `use-cases/` + `content/` | use-case 专项展示 |

`vite.config.ts` 通过 `#writing-files` alias 切换打包模块：

```ts
{
  find: "#writing-files",
  replacement: path.resolve(pkgDir, `src/lib/content/bundled-files.${writingSourceMode()}.ts`),
}
```

## 本仓 Pages 部署步骤

**触发方式**：向 `daily-work` 仓的 `main`/`master` 分支 push 以下路径之一：

- `use-cases/**`、`docs/**`、`src/**`
- `index.html`、`package.json`、`vite.config.ts`
- `.github/workflows/deploy-pages.yml`

或在 Actions 页面手动运行 **Deploy writing to GitHub Pages** workflow。

**Workflow 执行流程**：

1. Checkout 本仓到 `site/` 目录。
2. Sparse checkout `fe-templates` 仓的 `packages/ui`、`packages/tsconfig`、`package.json`、`pnpm-workspace.yaml`、`pnpm-lock.yaml` 到 `templates/`。
3. 在 `templates/` 下：`mv ../site apps/daily-work`，组装成最小 workspace。
4. `pnpm install --filter @innate/daily...` 安装依赖。
5. `PUBLIC_PATH=./ pnpm --filter @innate/daily build` 构建。
6. 上传 `templates/apps/daily-work/dist` 为 Pages artifact。
7. `actions/deploy-pages@v5` 部署到 GitHub Pages。

## fe-base Pages 部署步骤

**触发方式**：向 `innate-fe-base` 父仓的 `main`/`master` 分支 push 以下路径之一：

- `apps/daily-work/**`
- `packages/ui/**`
- `.github/workflows/deploy-writing-pages.yml`

或在 Actions 页面手动运行 **Deploy writing Pages** workflow。

**Workflow 执行流程**：

1. Checkout 父仓（含 submodules）。
2. `pnpm install --frozen-lockfile` 安装全部 workspace 依赖。
3. `PUBLIC_PATH=./ VITE_WRITING_SOURCE=docs pnpm --filter @innate/daily build` 构建（仅内联 `docs/`）。
4. 上传 `apps/daily-work/dist` 为 Pages artifact。
5. `actions/deploy-pages@v5` 部署到 GitHub Pages。

## 本地验证构建产物

部署前可在本地验证构建产物能否在子路径下正常运行：

```bash
# 在 fe-templates 根（workspace 可解析 @innate/ui）
PUBLIC_PATH=./ pnpm --filter @innate/daily build
pnpm --filter @innate/daily preview
# → http://localhost:4016/  验证 hash 路由跳转、资源加载、内容渲染
```

如需模拟 Pages 子路径，可用任意静态服务器把 `dist/` 挂到子路径下：

```bash
npx serve dist -l 4016
# 访问 http://localhost:4016/  应正常跳转至 http://localhost:4016/#/
```

## 常见问题

### Q: 部署后页面空白，控制台报资源 404？

检查 `vite.config.ts` 的 `base` 是否为 `./`。若硬编码了绝对路径（如 `/`），在 Pages 子路径下资源会 404。确保构建时设置了 `PUBLIC_PATH=./`。

### Q: 直接访问 `https://<user>.github.io/<repo>/#/writing/xxx` 正常，但访问 `https://<user>.github.io/<repo>/` 不跳转？

检查 `index.html` 中的 hash 兜底脚本是否存在：

```html
<script>
  if (!location.hash || location.hash === "#") {
    location.replace(
      location.pathname.replace(/\/index\.html$/, "/") +
        location.search +
        "#/"
    )
  }
</script>
```

该脚本确保访问根路径时自动跳转到 `#/`。

### Q: 本仓 Pages 构建失败，报 `@innate/ui` 找不到？

确认 `FE_TEMPLATES_REPO` 仓库变量和 `FE_TEMPLATES_TOKEN` 密钥已配置。若 `fe-templates` 是公开仓，token 可省略（使用 `github.token`）。

如果日志是 `ERR_PNPM_FETCH_404 ... Failed to resolve @innate/ui@^0.1.0`，说明 pnpm 没有把 `@innate/ui` 链接到 sparse checkout 出来的 `packages/ui`，而是去 registry 找了一个从未发布的包。检查 workflow 里 `Install and build` 步骤追加 workspace 根设置的那两行是否还在：

```bash
printf '\nlinkWorkspacePackages: true\npreferWorkspacePackages: true\n' >> pnpm-workspace.yaml
```

pnpm 12 只从 workspace 根的 `pnpm-workspace.yaml` 读这两项设置：写在站点自己的 `pnpm-workspace.yaml` 里无效，写成 `npm_config_*` 环境变量也无效。

### Q: 如何只重新部署而不 push 代码？

在仓库 Actions 页面选择对应 workflow，点击 **Run workflow** 手动触发。

## 相关文件

| 文件 | 作用 |
| --- | --- |
| [`vite.config.ts`](../../vite.config.ts) | `base`、`#writing-files` alias、构建模式 |
| [`package.json`](../../package.json) | `build` 脚本（含 `404.html` 复制） |
| [`index.html`](../../index.html) | hash 路由兜底脚本 |
| [`src/router.tsx`](../../src/router.tsx) | `createHashHistory` hash 路由 |
| [`.github/workflows/deploy-pages.yml`](../../.github/workflows/deploy-pages.yml) | 本仓 Pages 部署 workflow |
| [`.github/workflows/deploy-writing-pages.yml`](../../../../.github/workflows/deploy-writing-pages.yml) | fe-base Pages 部署 workflow |
