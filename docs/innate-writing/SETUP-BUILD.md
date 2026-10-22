# daily-work 构建修复指南：innate-fe-cli 正确用法 + 私有 registry 安装

> 状态（2026-10-21 二次更新）：**路线 0 已实跑验证通过** ✅
> `innate-fe-cli install` 完成：发布 `@innate/ui@0.1.0`、`@innate/web-domain@0.1.0` 到本地 Verdaccio
> （127.0.0.1:4873）→ 写 `.npmrc` → `workspace:*` 改写为 `^0.1.0` → `pnpm install` 成功；
> `pnpm dev` 启动正常（http://localhost:4016 首页完整渲染），`pnpm build` 2.7s 构建成功。
> 当日还修复了 Verdaccio 引导：本机 `pnpm dlx` 会把 js-yaml 5.2.2 解析成 4.3.1 内容导致启动即崩，
> CLI 已改为默认 `npx --yes verdaccio`（`FE_VERDACCIO_BOOTSTRAP=pnpm` 可切回）。
>
> **GitHub Pages 部署已修复并验证（2026-10-21）** ✅：旧模板仓 `innate-fe-templates` 已删除导致 CI 404；
> 已把 workflow 默认源与仓库变量 `FE_TEMPLATES_REPO` 指向 `variableway/innate-fe`，并给注入式安装加
> `--no-frozen-lockfile`（提交 `2787428`）。部署全绿，https://variableway.github.io/innate-wip/ 已上线新内容。
> 注意：本地私源专用文件（`package.json` 的 `^0.1.0`、`.npmrc`、`pnpm-lock.yaml`、`pnpm-workspace.yaml`）
> **不要提交**——CI 依赖已提交的 `workspace:*` 走 base 仓工作区安装。
>
> 适用环境：Windows / Git Bash，本机路径以 `D:\innate-workspace` 为准。

## 0. TL;DR：当前有两个独立问题

1. **`innate-fe-cli install` 报"找不到仓库根"**
   - CLI 此前没有 `install` 子命令（现已加上）；当时报错的另一层原因是 daily-work 是独立 git 仓库，不在 innate-fe-base 仓库内，向上找不到 `plugins.registry.yaml`。
   - **装依赖现在可以用 `innate-fe-cli install`（见路线 0），或直接 `pnpm install`。**

2. **daily-work 不能 build（`pnpm build` / `vite build`）**
   - `package.json` 里 `"@innate/ui": "workspace:*"` 只在 pnpm workspace 内可解析；daily-work 现在是独立仓库，`pnpm install` 会直接失败。
   - 残留的 `node_modules/@innate/ui` 是一个**断掉的符号链接**，指向 `D:\innate-spark\base\innate-fe-base\packages\ui` —— 这是仓库迁移前的旧路径，现已不存在（base 仓现在在 `D:\innate-workspace\framework\innate-fe`）。
   - 即使手动把符号链接改指新路径，`@innate/ui` 自己的 dependencies（clsx、class-variance-authority、tailwind-merge、@base-ui/react、lucide-react 等）不在 daily-work 的 node_modules 里，build 仍然会缺模块。必须让包管理器把 ui 的依赖一并装上。

**修复路线（按推荐顺序）：**

| 路线 | 做法 | 适合 |
| --- | --- | --- |
| 0. **innate-fe-cli install（推荐）** | 一条命令：发布 `@innate/*` 到本地 Verdaccio → 写本仓 `.npmrc` → 把 `workspace:*` 改写为 `^0.1.0` → `pnpm install` | 本地私有源，机器无关，改完基础仓源码可 `--bump patch` 重发 |
| 1. 本地 link | `workspace:*` 改 `link:` 协议指向本机 innate-fe 的 packages/ui | 应急、完全离线 |
| 2. GitHub Packages | 把 `@innate/ui` 发布到 `npm.pkg.github.com`，本仓用 scoped registry 安装 | 团队远端共享（本机暂不采用） |
| 3. pages pack | 不跑 vite，用 `innate-fe-cli pages pack` 出静态站 | 只想要产物、不想管 npm 依赖 |

---

## 1. 仓库布局（本机现状）

```
D:\innate-workspace\
├─ framework\innate-fe\            ← innate-fe-base 仓（GitHub: variableway/innate-fe）
│  ├─ plugins.registry.yaml        ← base 仓标记（CLI 根探测目标，注意是复数）
│  ├─ innate-fe-cli\               ← CLI 源码（bun 项目，零 npm 运行时依赖）
│  ├─ bin\innate-fe-cli.exe        ← 编译出的 binary
│  ├─ packages\ui\                 ← @innate/ui（本仓需要的 UI 包）
│  └─ shells\webshell\             ← 壳
└─ apps\daily-work\                ← 本仓（GitHub: variableway/innate-wip），独立 git 仓库
   ├─ plugin.registry.yaml         ← 文稿仓标记（单数，protocol: innate.domain-pages.v1）
   └─ package.json                 ← @innate/wip，依赖 "@innate/ui": "workspace:*"（已断）
```

全局命令 `innate-fe-cli` 实际是 `C:\Users\anyda\.local\bin\innate-fe-cli`，即 `framework\innate-fe\bin\innate-fe-cli.exe` 的拷贝。

## 2. 错误逐一解释

### 2.1 `innate-fe-cli install` → 「找不到仓库根（向上未找到 plugins.registry.yaml）」

两层原因：

1. `install` 不是子命令。`-h` 列出的有效命令：`scan | gen | dev | prepare | verify-flags | build | preview | import | assemble | all | pages | shadcn`。未匹配的子命令会落入兜底命令组（`runCli`），它第一步就做仓库根探测，于是报错在"找不到仓库根"而不是"未知命令"。
2. 根探测规则（源码 `innate-fe-cli/src/root.ts`）：从当前目录**向上找 `plugins.registry.yaml`**。daily-work 向上只有自己的 `plugin.registry.yaml`（单数、文稿仓格式，协议是 `innate.domain-pages.v1`，和 base 仓的 `innate.web-plugin.packaging.v1` 是两套东西），文件名都对不上，永远找不到。

结论：base 类命令（gen/dev/build/prepare 等）必须在 `framework\innate-fe` 内运行，或加 `--root <该目录>`。daily-work 能直接用的只有 `pages` 子命令（见 3.1）。

### 2.2 `pnpm build` 失败的根因

- `"@innate/ui": "workspace:*"`：workspace 协议只在有 `pnpm-workspace.yaml` 的仓内可解析。daily-work 是独立仓库 → `pnpm install` 直接失败（不支持 workspace 协议）。
- `node_modules/@innate/ui` → 符号链接指向 `D:\innate-spark\base\innate-fe-base\packages\ui`（旧路径，仓库迁移后已不存在）→ vite resolve 不到。
- `@innate/ui` 是**TS 源码包**（`main`/`exports` 都指向 `src/*.ts`），它自己的 dependencies 需要由包管理器安装到本仓 node_modules，手动补链接补不齐。

参考：本仓 CI（`.github/workflows/deploy-pages.yml`）目前的做法是 sparse checkout `variableway/innate-fe-templates` 仓的 `packages/ui` + `packages/tsconfig` + workspace 文件，把本仓挪进 `apps/daily-work`，**借 templates 仓的 workspace** 执行 `pnpm install --filter @innate/wip...` 后构建。本地不需要这么绕，见下面路线。

---

## 3. 路线 0（推荐）：`innate-fe-cli install` 一键接入本地私有源

base 仓的 CLI 本就内置本地 Verdaccio 私有源（`registry setup/start/publish/init`，状态目录 `<基础仓>/.verdaccio/`），2026-10-21 又新增了 `install` 子命令，把「发布 → 配置 → 改写 → 安装」串成一条命令。在本仓根目录：

```bash
cd /d/innate-workspace/apps/daily-work

innate-fe-cli install --dry-run    # 先预览：发布顺序 / .npmrc / 改写计划
innate-fe-cli install              # 实际执行（首次会自动拉起 Verdaccio；同版本已发布则跳过）
innate-fe-cli install --dev        # 装完直接 pnpm dev → http://localhost:4016
```

它依次做五件事：

1. **定位基础仓**（优先级从高到低）：`--root <dir>` > 环境变量 `INNATE_FE_ROOT` > 配置文件 `.innate-fe-cli.json`（本仓目录或 `~`，内容 `{"feRoot":"D:/innate-workspace/framework/innate-fe"}`）> 自动发现（当前目录向上找 `framework/innate-fe`、`base/innate-fe`、`innate-fe`）。按本机布局，自动发现即可命中 `D:\innate-workspace\framework\innate-fe`，无需任何配置。
2. **发布**：把基础仓 `packages/` 下可发布的 `@innate/*` 按拓扑序 `pnpm publish` 到 `http://127.0.0.1:4873`（当前是 `@innate/ui` → `@innate/web-domain`）；registry 未运行会自动拉起并注册本机账号；同版本已存在则跳过。
3. **写本仓 `.npmrc`**：`@innate:registry=http://127.0.0.1:4873/`（本地源不需要 token，这个文件可以提交入库）。
4. **改写 `package.json`**：`"@innate/ui": "workspace:*"` → `"^0.1.0"`（幂等：已是普通范围的不动）。
5. **`pnpm install`**：从私有源装 `@innate/ui` 及其全部传递依赖（clsx、cva、tailwind-merge 等），一并解决"断链 + 缺依赖"两个问题。

之后：

- 启动：`pnpm dev`（:4016）；构建：`pnpm build`。
- 改了基础仓 ui 源码后：`innate-fe-cli install --bump patch`（升版本再发再装；同版本号发布会跳过，装到的仍是旧包）。
- 只想用 registry 上已有版本：`innate-fe-cli install --no-publish`。
- Verdaccio 管理：`innate-fe-cli registry status` / `registry stop`（需在基础仓内或加 `--root` 运行）。

前提：全局 `innate-fe-cli` 是含 `install` 的新版本（2026-10-21 已更新到 `~/.local/bin/innate-fe-cli`）；源码模式等价命令：`bun /d/innate-workspace/framework/innate-fe/innate-fe-cli/src/index.ts install`。

---

## 4. 路线 3（零依赖、立刻能跑）：`innate-fe-cli pages pack`

`pages` 是唯一不要求在 base 仓内的子命令：它从当前目录向上找 `plugin.registry.yaml`，本仓根就有。

执行流程（源码 `innate-fe-cli/src/commands/pages.ts`）：

1. 解析本仓 `plugin.registry.yaml`：`template.repo = variableway/innate-fe-templates`，`release = pages-kit`，`shell = writing-shell.zip`；
2. 确定 shell zip 来源，优先级从高到低：
   - `--shell <zip>` 命令行参数；
   - 环境变量 `PAGES_SHELL_ZIP`；
   - 文稿仓根目录旁边的同名文件（`daily-work/writing-shell.zip`）；
   - 都没有 → `gh release download pages-kit --repo variableway/innate-fe-templates --pattern writing-shell.zip`，缓存到 `~/.cache/innate-fe-cli/pages-kit/`；
3. 解压 zip 到 `site/`，叠 `pages/home.md`、写 `site.json`、把 `content/` 等域的 markdown 拷进挂载点；
4. 产物 `site/` 可直接发 GitHub Pages。

下载那一步**必须有 token**（环境变量三选一，按顺序取）：`FE_TEMPLATES_TOKEN` → `GH_TOKEN` → `GITHUB_TOKEN`。注意：CLI 是通过 `gh release download` 子进程带 `GH_TOKEN` 环境变量下载的，本机 `gh` 虽已登录（qdriven），但 keyring 里的 token 不会自动传给子进程，所以要显式导出。

```bash
cd /d/innate-workspace/apps/daily-work
export GH_TOKEN="$(gh auth token)"    # 或设置 FE_TEMPLATES_TOKEN
innate-fe-cli pages pack --dry-run     # 先看计划
innate-fe-cli pages pack               # 实际执行 → site/
```

局限：`pages pack` 用的是**预构建**的 shell zip（pages-kit release 里的产物），本仓 `src/` 下的 React 代码改动不会体现；它只叠 markdown。要构建本仓自己的 Vite 站，走路线 1 或 2。

---

## 5. 路线 1：本地 link 修复（最快恢复 `pnpm build`）

让 pnpm 以本地目录方式装 `@innate/ui`，并自动装齐它的全部依赖。pnpm 的 `link:` 协议会建立链接**且**安装被链接包的 dependencies，正好解决"缺 ui 的传递依赖"问题。

一步一步：

```bash
cd /d/innate-workspace/apps/daily-work
```

1. 改 `package.json` 第 21 行：

   ```diff
   -    "@innate/ui": "workspace:*",
   +    "@innate/ui": "link:../../framework/innate-fe/packages/ui",
   ```

   （`link:` 相对路径以 `package.json` 所在目录为基准；也可以写绝对路径 `link:D:/innate-workspace/framework/innate-fe/packages/ui`，但相对路径对同盘协作更友好。）

2. 清掉断链和旧安装：

   ```bash
   rm -rf node_modules
   ```

3. 安装：

   ```bash
   pnpm install
   ```

4. 验证：

   ```bash
   ls -l node_modules/@innate/ui     # 应指向 framework/innate-fe/packages/ui
   pnpm build                        # vite build + 404 兜底 → dist/
   pnpm preview                      # :4016
   ```

优缺点：

- ✅ 10 分钟恢复；ui 源码改动即时生效（链接的是源码）。
- ❌ 机器相关：`package.json` 这个改动**不要提交**（或提交前换回 registry 版本号），否则 CI 和协作者会挂。CI 目前走自己的 sparse-checkout 流程，不受本地影响。

---

## 6. 路线 2（远端正式方案，本机暂不采用）：GitHub Packages 私有 npm 仓库

把 `@innate/ui` 发布到 GitHub 的 npm registry（`https://npm.pkg.github.com`），本仓像装普通包一样装它。机器无关、CI 可用、版本可追溯。

### 6.0 作用域限制与解法：`--publish-as`（已实现并本地验证 ✅）

GitHub Packages 要求包名 scope 等于 owner。`innate` 组织名已被占用（2026-10-21 确认，且 gh 无法创建/改名组织，只能网页操作），但**不需要改任何包名**：CLI 已实现发布身份参数——monorepo 里继续叫 `@innate/*`，发布时临时改写为 `@variableway/*`（连同内部依赖引用与 `workspace:` 协议展开），发完自动还原 package.json（git 无痕）。已在本地 Verdaccio 完整验证（发布 + 消费方安装均通过）。

### 6.1 创建 PAT（Personal Access Token）

入口：GitHub → Settings → Developer settings → Personal access tokens → **Tokens (classic)** → Generate new token。发布侧 scopes：`write:packages`（含 read）；源仓库私有则加 `repo`。安装侧：`read:packages`。（当前 gh 活跃账号 qdriven 的 token 无 packages scope，必须新建。）

### 6.2 发布（一条命令）

```bash
export NPM_TOKEN=ghp_你的PAT     # Windows PowerShell: $env:NPM_TOKEN="..."

innate-fe-cli registry publish --url https://npm.pkg.github.com --publish-as @variableway --token "$NPM_TOKEN"
```

不需要给 packages/ui 加 `publishConfig`（CLI 已在命令行指定 registry）。发布产物：`@variableway/ui`、`@variableway/web-domain`。同版本已存在会自动跳过；改过源码先 `--bump patch`。

### 6.3 安装侧（daily-work 切换到 GitHub Packages）

```bash
export NPM_TOKEN=ghp_你的PAT     # read:packages

cd /d/innate-workspace/apps/daily-work
innate-fe-cli install --url https://npm.pkg.github.com --publish-as @variableway
```

install 会自动：写 `.npmrc`（`@variableway:registry=` + `${NPM_TOKEN}` 占位，旧 `@innate:` 行移除）→ 把 package.json 的 `@innate/ui: workspace:*` 改写为 `@variableway/ui: ^0.1.0` → `pnpm install`。**还差一步手工**：源码 import 换名（install 不改源码）：

```bash
grep -rl '@innate/ui' src/ | xargs sed -i 's#@innate/ui#@variableway/ui#g'
```

### 6.4 后续版本更新流程

```bash
# 发布侧（base 仓改完 packages/ui 代码后，任意目录）
innate-fe-cli --root D:/innate-workspace/framework/innate-fe registry publish \
  --url https://npm.pkg.github.com --publish-as @variableway --bump patch --token "$NPM_TOKEN"

# 安装侧
innate-fe-cli install --url https://npm.pkg.github.com --publish-as @variableway --no-publish
```

### 6.5 CI 同步改造（可选）

`deploy-pages.yml` 可从"sparse checkout templates 仓借 workspace"简化为：`actions/setup-node` 加 `registry-url: https://npm.pkg.github.com` + `NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}`（同 org 包只读够用）+ `pnpm install && pnpm build`。

> **当前状态**：本仓日常走路线 0（本地 Verdaccio，`@innate/ui` 原名）。切 GitHub Packages 是独立决定，命令见上，切换随时可做、可逆（重跑不带 `--publish-as` 的 install 即回本地源原名）。

---

## 7. innate-fe-cli 速查（daily-work 视角）

| 需求 | 命令 | 在哪跑 |
| --- | --- | --- |
| 一键装依赖（发布 + 配置 + 改写 + 安装） | `innate-fe-cli install`（`--dev` 装完起 dev） | 本仓根 |
| 一键流程预览 | `innate-fe-cli install --dry-run` | 本仓根 |
| 出静态站（零 npm 依赖） | `innate-fe-cli pages pack` | 本仓内任意目录（向上找 `plugin.registry.yaml`） |
| 干跑看计划 | `innate-fe-cli pages pack --dry-run` | 同上 |
| 用本地 zip 不下载 | `innate-fe-cli pages pack --shell /path/to/writing-shell.zip` | 同上 |
| base 仓命令（gen/dev/build/registry…） | 先 `cd /d/innate-workspace/framework/innate-fe`，或任意位置加 `--root /d/innate-workspace/framework/innate-fe` | base 仓 |
| 重编 CLI binary | base 仓根 `pnpm run cli:build` → `bin\innate-fe-cli.exe`，拷到 `~/.local/bin` | base 仓 |

## 8. 常见错误对照表

| 报错 | 原因 | 处理 |
| --- | --- | --- |
| 找不到仓库根（向上未找到 plugins.registry.yaml） | 在 base 仓外跑了 base 类命令 | cd 到 `framework/innate-fe`，或加 `--root` |
| 找不到 innate-fe 基础仓（install） | 四种定位方式都没命中 | `--root` / `INNATE_FE_ROOT` / `.innate-fe-cli.json` 任选其一配置 |
| 找不到文稿仓（向上未找到 plugin.registry.yaml） | `pages` 在非文稿仓目录运行 | cd 到 daily-work |
| 下载 …/writing-shell.zip 需要 FE_TEMPLATES_TOKEN 或 GH_TOKEN | release 下载缺 token | `export GH_TOKEN="$(gh auth token)"` |
| workspace 协议解析失败 / ERR_PNPM_WORKSPACE_OPTION_NOT_SET 等 | 独立仓里用了 `workspace:*` | `innate-fe-cli install`（路线 0），或改 `link:`（路线 1）/ registry 版本号（路线 2） |
| Cannot find module '@innate/ui'（或 /globals.css） | node_modules 里的断链 symlink | `rm -rf node_modules` 后跑 `innate-fe-cli install` |
| 409 Conflict "this package is already present" | 重复发布 registry 上已存在的版本（此前 CLI 识别不了 verdaccio 的措辞，已修复为发布前预检跳过） | 直接重跑 `innate-fe-cli install` 即可（自动跳过）；要发新版加 `--bump patch`；只装依赖加 `--no-publish` |
| 401 / EAUTH 发布或安装失败（远端源） | PAT 缺对应 scope，或 `.npmrc` 没配 token | 核对 6.1 的 scopes 与 6.2/6.4 的 `.npmrc` |

## 9. 操作前待确认（决策清单）

1. **选路线**：路线 0 `innate-fe-cli install`（本地私有源，已实现待执行）/ 本地 link（应急）/ GitHub Packages（远端，暂不采用）/ 仅 pages pack（零依赖）。路线 0 验证通过后，1/2 可作 fallback。
2. **执行路线 0**：在 daily-work 根目录跑 `innate-fe-cli install --dry-run` 确认计划，再去掉 `--dry-run` 实跑；成功后 `pnpm build` 验证产物，`pnpm dev` 验证启动。
3. **若将来走路线 2，先定 scope 策略**：`innate` org 是否创建（选项 A）？名字被占则用选项 C（发布改名为 `@variableway/ui`，本仓 import 同步改）。
4. **CI 是否同步切私有源**（6.6）：本地路线 0 验证通过后再考虑。
