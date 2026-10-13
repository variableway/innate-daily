# innate.web-plugin.packaging.v1 — 插件打包协议

> **历史基线。** 当前事实源见 [`../v1/innate.web-plugin.packaging.v1.md`](../v1/innate.web-plugin.packaging.v1.md)（含 `shell` / `--plugin-file`）。

本文件是 webshell **选包 / 复制进打包面 / 生成接缝 / 运行时遮罩** 的唯一事实源（增强前）。
实现请以 v1 目录为准；技能与用例只链接、不复制细节。

| 字段     | 值                                                                        |
| -------- | ------------------------------------------------------------------------- |
| 协议名   | `innate.web-plugin.packaging.v1`                                          |
| 版本     | **v1**                                                                    |
| 登记文件 | [`plugins.registry.yaml`](../../plugins.registry.yaml)                    |
| 打包面   | [`domains/`](../../domains/)（保留，不是 gitignore 软链视图）             |
| 生成器   | [`tools/innate-fe-cli`](../../tools/innate-fe-cli)（`innate-fe-cli gen`） |

本文**不**取代下列已有协议，只在它们之上补「怎么选、怎么进包」这一层：

| 已有协议                                | 职责                                               | 事实源                                                                           |
| --------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------- |
| `createWebDomain`（编译期契约）         | domain 如何声明路由与 capability                   | [`packages/web-domain/src/index.ts`](../../packages/web-domain/src/index.ts)     |
| `innate.web-plugin.v1`（运行期 iframe） | iframe manifest + origin 白名单 + postMessage 握手 | [`apps/webshell/src/plugins/types.ts`](../../apps/webshell/src/plugins/types.ts) |

v1 打包层**禁止**改 iframe 信封字段、禁止改 `createWebDomain` 的 outlet / capability 形状。

---

## 1. 要解决什么

缺的不是第三条运行时插件协议，而是：

- 从**任意开发目录**选出若干包，填进这次 build 的输入面；
- 生成 `modules.gen.ts` / `styles.gen.css` / `site-features.gen.ts`；
- 空壳与演示壳用 **profile** 切换，而不是手改 flag 文件。

```text
[任意开发目录] --yaml 选中并 copy--> domains/<id>/ --gen--> bundle
```

`domains/` 就是打包面，**继续留着**。不要新增 `categories/` 当源码家，也不要把 `domains/` 改成 gitignore 软链。

---

## 2. 两条轨道

```text
轨道 A  domain   构建期组合   源码 copy 进 domains/<id>/，再被 Vite 打进宿主包
轨道 B  iframe   运行期嵌入   只登记 manifest；yaml 用 id 过滤；不必 copy 进 domains/
```

|                  | 轨道 A domain                                                                | 轨道 B iframe                                                                           |
| ---------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 包身份           | `@innate/domain-<id>`，`src/index.ts` 导出 `webDomain`                       | `protocol: "innate.web-plugin.v1"` 的 manifest                                          |
| 如何进本次 build | 出现在 `domains/<id>/`（yaml copy 或就地开发；`all` = 扫描打包面全部合法包） | empty/demo：yaml `iframes` 选中其 `id`；`all`：`apps/*/plugin.json` ∪ 静态导入的全部 id |
| 运行时协议       | 无 postMessage；路由挂在宿主 outlet                                          | 握手 `shell:hello` → `shell:ack`，origin 白名单                                         |
| L1               | 打包面里有这个目录 ⇒ import 进 bundle                                        | 生成 features 含这个 id                                                                 |
| L2               | overlay 把已进包 id 设为 `false` ⇒ 不挂路由、无 nav/tile                     | overlay `false` ⇒ 不进 nav/tile、`/plugins/<id>` 视为未启用                             |

id 均匹配 `/^[a-z][a-z0-9-]*$/`。

---

## 3. 分层：L1 进包，L2 遮罩

```text
L1  进包     empty / 具名 profile = yaml 点名且已在 `domains/` 的包 + 本 profile iframe
             `all` = 盘上全部合法 domain + 全部已知 iframe
             → gen 写出 import 与 packedSiteFeatures（全 true）
L2  运行时   overlay JSON / 环境变量盖在 packed features 上
             → buildRegistry + createAppRouter 按 features[id] === true 派生
```

- **未进包的 id** 不会出现在 `packedSiteFeatures` 里。出现在 overlay 中视为**死开关**（`verify-flags` 失败；运行时忽略）。
- **已进包的 id** 默认 `true`。L2 可改为 `false`：导航、tile、以及该 domain 的路由树都不挂（直达 URL → 404）。iframe 同理。
- 启用判定是 **`features[id] === true`**（缺键 = 未进包 = 不启用）。不要依赖「缺键视为启用」。

壳侧 `SiteFeatureKey` 是 `string`，不和某个插件 id 绑死。

---

## 4. 登记文件

`plugins.registry.yaml`：

```yaml
protocol: innate.web-plugin.packaging.v1
version: 1
defaultProfile: empty

profiles:
  admin:
    domains:
      - id: admin-tanstack
    iframes: []
  empty:
    domains: []
    iframes: []
# CLI 另有内置 profile `all`（不必写在这里）
```

| 字段                             | 含义                                                                                                                                                                                           |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `protocol` / `version`           | 必须是本文的名字与 `1`                                                                                                                                                                         |
| `defaultProfile`                 | 无 `--profile` 时使用（克隆后默认 **empty**，`pnpm run dev` 即空壳）                                                                                                                           |
| `profiles.<name>.domains[].id`   | 打包后的目录名 `domains/<id>/`，且必须等于包名 `@innate/domain-<id>` 的后缀                                                                                                                    |
| `profiles.<name>.domains[].from` | 源路径：仓内相对根目录，或绝对路径。省略 = 就地包，已在 `domains/<id>/`                                                                                                                        |
| `profiles.<name>.iframes[].id`   | 必须已有 `apps/<id>/plugin.json`（`kind: iframe`）；**不 copy 文件**。内置 `all` 忽略此列表，改用全部已知 id。`e2e` 的 `example-external` 来自 e2e 夹具，由 CLI 固定扫描，不在 yaml 里配扫描根 |

iframe 清单不靠 yaml 的扫描根：CLI 固定扫 `apps/<id>/plugin.json`，并额外扫 `apps/webshell/e2e/fixtures/` 供 e2e。

`from` 可以指向本仓其它目录或仓外工程。被选中后 **copy 进 `domains/<id>/`**（失败再 symlink），现有 `scanDomains` → gen → vite 链不用改入口。

---

## 5. 打包面 `domains/`

- pnpm workspace 继续 `domains/*`。copy 进来的目录必须是合法 `@innate/domain-*` 包。
- **就地开发**：源码就写在 `domains/<id>/`，yaml 可省略 `from`，gen **不 copy**。本仓现成例子是 [`domains/admin-tanstack`](../../domains/admin-tanstack)。
- **外部 / 可逆示例**：yaml 写 `from`。`--profile empty` 只在「`from` 存在且不等于打包面」时删除 `domains/<id>/`，避免毁掉唯一源码。
- 默认 copy **不覆盖**已存在的打包面目录（保护就地改动）。需要按 `from` 刷新时加 `--refresh`。
- 不要把 `domains/` 整体 gitignore，也不要用软链目录结构当前提。Copy 是默认（跨盘、Windows 更稳）。

---

## 6. 生成物（均 `@generated`）

空壳接缝（空 `webModules` / 空 packed features）**入库**，所以 `pnpm run dev` 不必先跑 CLI。
`innate-fe-cli gen --profile admin`（及 `iframe-apps` / `apps` / `e2e`）会改这些文件；不要把具名 profile 的接缝提交进默认树。

| 文件                                         | 内容                                                                                                                      |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `apps/webshell/src/gen/modules.gen.ts`       | 按打包面 **相对路径** import 各包 `webDomain`（宿主 **不必** 为每个 domain 手写 `package.json` 依赖）                     |
| `apps/webshell/src/gen/styles.gen.css`       | `base(@innate/ui) → domains → app.css` 里的 domains 段，同样走相对路径                                                    |
| `apps/webshell/src/gen/site-features.gen.ts` | `packedSiteFeatures`：打包面 domain id ∪ 本 profile iframe 选择 ∪ 静态导入 id，值全 `true`。`all` 的 iframe = 清单全部 id |

L2 入口是手写的 [`site-features.ts`](../../apps/webshell/src/plugins/site-features.ts)：合并 packed + overlay，**不是**再维护一份与插件 1:1 的字面量对象。

---

## 7. Profile

| Profile         | 行为                                                                                                                                                                                                                         | 谁用                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `empty`（默认） | 不选任何 domain / iframe；生成空 modules / 空 packed features。盘上就地包（无 `from`）**保留源码、不进接缝**。`pnpm run dev` 走这条                                                                                          | 克隆即跑空壳                                                                                  |
| `admin`         | 就地点名 `admin-tanstack`（源码已在 `domains/admin-tanstack/`，不 copy）                                                                                                                                                     | `dev --profile admin`；用例 02                                                                |
| `e2e`           | `admin-tanstack` + 夹具 `example-external`（:5501）                                                                                                                                                                          | `test:e2e`                                                                                    |
| `iframe-apps`   | 无 domain；features 含 `web-showcase` + `wandesk-ui` + `admin-nextjs`（live :4012）                                                                                                                                          | `dev --profile iframe-apps`；用例 03/04；[对接清单](./innate.web-plugin.iframe-onboarding.md) |
| `apps`          | `admin-tanstack` + `web-showcase` + `wandesk-ui`                                                                                                                                                                             | `dev --profile apps`；用例 05                                                                 |
| `all`           | **内置**，yaml 不必登记。不 copy、不删打包面。扫描 `domains/` 上全部合法 `@innate/domain-*`（须有 `src/index.ts`）；iframe 取 `apps/*/plugin.json` ∪ `static-manifests.json` 的全部 id（含 e2e 夹具）。yaml 选单不作为过滤。 | 本地有额外 domain / 要一次打进全部 iframe                                                     |

```bash
pnpm run dev                                              # 空壳：gen empty --skip-apply + vite
bun tools/innate-fe-cli/src/index.ts dev --profile admin          # 就地 domain admin-tanstack
bun tools/innate-fe-cli/src/index.ts dev --profile iframe-apps    # 轨道 B：web-showcase + wandesk-ui + admin-nextjs
bun tools/innate-fe-cli/src/index.ts dev --profile apps           # 三个应用打进同一壳
bun tools/innate-fe-cli/src/index.ts dev --dry-run --profile apps # 只打印将启动的进程
bun tools/innate-fe-cli/src/index.ts prepare --profile iframe-apps
bun tools/innate-fe-cli/src/index.ts prepare --id wandesk-ui
bun tools/innate-fe-cli/src/index.ts gen                  # 默认 empty
bun tools/innate-fe-cli/src/index.ts gen --profile empty
bun tools/innate-fe-cli/src/index.ts gen --profile empty --skip-apply  # 只写空接缝，不改 domains/
bun tools/innate-fe-cli/src/index.ts gen --profile admin
bun tools/innate-fe-cli/src/index.ts gen --profile iframe-apps
bun tools/innate-fe-cli/src/index.ts gen --profile apps
bun tools/innate-fe-cli/src/index.ts gen --profile e2e
bun tools/innate-fe-cli/src/index.ts gen --profile all
bun tools/innate-fe-cli/src/index.ts gen --check          # 不写盘：yaml ↔ 打包面 ↔ 生成物（`all` 以扫描结果为期望集合）
bun tools/innate-fe-cli/src/index.ts gen --check --profile all
```

空壳 = **默认树就是空打包面 + 空接缝**。`pnpm run dev` 会重写空接缝。不是手改 `site-features.ts`。

---

## 8. `--check` 与 `verify-flags`

`bun tools/innate-fe-cli/src/index.ts gen --check`：

1. empty / 具名 profile：当前 profile **点名**的 domain id 必须出现在打包面（yamlExtras）；接缝只按点名集合生成，盘上未点名的就地包不进接缝、也不算 diskExtras 失败。`all`：跳过 yaml ↔ 磁盘对账，期望集合 = `scanDomains` 结果。
2. 三个生成文件与「本 profile 选中的 domain + 本 profile iframe 选择」一致（`all` 的 iframe = 全部已知 id）。
3. `--check` 不做 copy / 删除。 `--profile all` 必须可过（在生成物已按 `all` 写出时）。

`bun tools/innate-fe-cli/src/index.ts verify-flags`：

- 对账集合 = **打包面 id ∪ 本 profile iframe 选择 ∪ 静态导入 id ∪ overlay 键**（`all` 的 iframe = 全部已知 id）。
- `packedSiteFeatures` 的键必须等于该集合去掉 overlay（缺键 / 多键都失败）。
- overlay 里出现未进包 id → 死开关失败。

---

## 9. 包身份（轨道 A）

```text
domains/<id>/
  package.json     # name = @innate/domain-<id>
  src/index.ts     # export { webDomain } from "./web-domain"
```

宿主通过生成的相对 import 消费打包面，不再要求在 `apps/webshell/package.json` 里逐个加 `@innate/domain-*`。其它 app（如 `admin-nextjs` 复用 views）仍可对 workspace 包写 `workspace:*`。

路由与 capability 形状仍只由 `createWebDomain` 定义，见 web-domain 源码。

---

## 10. 与 `innate.web-plugin.v1` 的关系

打包层（本文）决定 **这次 build 认哪些 iframe id**。
v1 运行时协议决定 **单个 iframe 如何加载与握手**：

- `protocol: "innate.web-plugin.v1"`
- `runtime: "iframe"`，`iframeSrc` + `origins` 白名单
- 信封 `{ source: "innate-plugin", v: 1, channel }`；宿主回 `{ source: "innate-shell", v: 1, channel: "shell:ack" }`
- 禁止 `targetOrigin="*"`；相对路径必须在 `origins` 含 `"self"`

静态导入产物仍写 `static-manifests.json`，runtime 仍是 iframe。打包层只把它们的 id 并进 packed features。

---

## 11. 非目标（v1 不做）

- 不把源码家改成 `categories/`，不用软链替换 `domains/`。
- 不接 hub 的 `tools/registry/apps.yaml`。
- 不做远程 API 拉 features。
- 不在用例 1 展开 `createWebDomain` 契约课。
