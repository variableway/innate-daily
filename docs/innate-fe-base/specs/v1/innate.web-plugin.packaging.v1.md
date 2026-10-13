# innate.web-plugin.packaging.v1 — 插件打包协议（增强版）

本文件是 webshell（或其它宿主壳）**选包 / 选择宿主 / 复制进打包面 / 生成接缝 / 运行时遮罩** 的唯一事实源。
实现以本文为准；技能与用例只链接、不复制细节。

| 字段     | 值                                                                                                             |
| -------- | -------------------------------------------------------------------------------------------------------------- |
| 协议名   | `innate.web-plugin.packaging.v1`                                                                               |
| 文档修订 | **v1 增强**（相对 [`../v0/innate.web-plugin.packaging.v1.md`](../v0/innate.web-plugin.packaging.v1.md)）       |
| 登记文件 | [`plugins.registry.yaml`](../../../plugins.registry.yaml)（仓根；缺省路径）                                    |
| 打包面   | [`domains/`](../../../domains/)（保留，不是 gitignore 软链视图）                                               |
| 生成器   | [`tools/innate-fe-cli`](../../../tools/innate-fe-cli)（`innate-fe-cli gen`）                                   |
| 协议包   | [`@innate/plugin-protocol`](../../../packages/plugin-protocol)（`parsePackagingRegistry` / `resolveShellDir`） |
| 宿主壳   | 由登记文件 `shell` 决定；缺省 `shells/webshell`                                                                |

本文**不**取代下列已有协议，只在它们之上补「怎么选宿主、怎么选包、怎么进包」：

| 已有协议                                | 职责                                               | 事实源                                                                                    |
| --------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `innate.plugin.v1`（自描述）            | 单个插件 `plugin.json` / `plugin.yaml`             | [`innate.plugin.v1.md`](./innate.plugin.v1.md)                                            |
| `createWebDomain`（编译期契约）         | domain 如何声明路由与 capability                   | [`packages/web-domain/src/index.ts`](../../../packages/web-domain/src/index.ts)           |
| `innate.web-plugin.v1`（运行期 iframe） | iframe manifest + origin 白名单 + postMessage 握手 | [`packages/plugin-protocol/src/index.ts`](../../../packages/plugin-protocol/src/index.ts) |

打包层**禁止**改 iframe 信封字段、禁止改 `createWebDomain` 的 outlet / capability 形状、禁止改单插件 manifest schema 的必填面（增强字段见 plugin spec）。

---

## 0. 相对 v0 的增量（本修订）

| 能力               | 落点                | 说明                                                                                               |
| ------------------ | ------------------- | -------------------------------------------------------------------------------------------------- |
| **可更换宿主壳**   | 登记文件 `shell`    | 顶层或 profile 级指定壳目录；`gen` / `build` / `assemble` / `dev` 的接缝与构建目标随之变化         |
| **从描述文件打包** | CLI `--plugin-file` | 不经 yaml 点名，直接指定本地 `plugin.json` 或 `plugin.yaml`；与 profile **并集**，同 id 时文件优先 |

其余行为（两条轨道、L1/L2、`domains/` 打包面、`--check` / `verify-flags`）与 v0 一致，除非下文显式改写。

---

## 1. 要解决什么

缺的不是第三条运行时插件协议，而是：

- 从**任意开发目录**选出若干包，填进这次 build 的输入面；
- 生成 `modules.gen.ts` / `styles.gen.css` / `site-features.gen.ts` / `plugins.gen.ts`；
- 空壳与演示壳用 **profile** 切换，而不是手改 flag 文件；
- （增强）同一仓库可维护**多个宿主壳**，按 profile 选择；
- （增强）临时 / 仓外插件可用**描述文件路径**直接进包，不必先改 yaml。

```text
[任意开发目录 | --plugin-file]
        --yaml / CLI 选中-->
[domains/<id>/ + iframe 登记]
        --gen-->
[<shell>/src/gen/*]  →  vite/build in <shell>
```

`domains/` 就是打包面，**继续留着**。不要新增 `categories/` 当源码家，也不要把 `domains/` 改成 gitignore 软链。

---

## 2. 两条轨道

```text
轨道 A  domain   构建期组合   源码 copy 进 domains/<id>/，再被宿主打包器打进壳包
轨道 B  iframe   运行期嵌入   只登记 manifest；yaml / --plugin-file 用 id 过滤；不必 copy 进 domains/
```

|                  | 轨道 A domain                                                                                   | 轨道 B iframe                                                             |
| ---------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 包身份           | `@innate/domain-<id>`，`entry` 导出 `webDomain`                                                 | `kind: "iframe"` 的自描述 → 运行期 `innate.web-plugin.v1`                 |
| 如何进本次 build | 出现在 `domains/<id>/`（yaml copy、就地开发、或 `--plugin-file`）；`all` = 扫描打包面全部合法包 | empty/demo：yaml `iframes` 或 `--plugin-file`；`all`：已知 iframe 全部 id |
| 运行时协议       | 无 postMessage；路由挂在宿主 outlet                                                             | 握手 `shell:hello` → `shell:ack`，origin 白名单                           |
| L1               | 打包面里有这个目录 ⇒ import 进 bundle                                                           | 生成 features 含这个 id                                                   |
| L2               | overlay 把已进包 id 设为 `false` ⇒ 不挂路由、无 nav/tile                                        | overlay `false` ⇒ 不进 nav/tile、`/plugins/<id>` 视为未启用               |

id 均匹配 `/^[a-z][a-z0-9-]*$/`。

---

## 3. 分层：L1 进包，L2 遮罩

```text
L1  进包     empty / 具名 profile = yaml 点名（∪ --plugin-file）且已解析的包 + 本 profile iframe
             `all` = 盘上全部合法 domain + 全部已知 iframe
             → gen 写出 import 与 packedSiteFeatures（全 true）
L2  运行时   overlay JSON / 环境变量盖在 packed features 上
             → buildRegistry + createAppRouter 按 features[id] === true 派生
```

- **未进包的 id** 不会出现在 `packedSiteFeatures` 里。出现在 overlay 中视为**死开关**（`verify-flags` 失败；运行时忽略）。
- **已进包的 id** 默认 `true`。L2 可改为 `false`：导航、tile、以及该 domain 的路由树都不挂（直达 URL → 404）。iframe 同理。
- 启用判定是 **`features[id] === true`**（缺键 = 未进包 = 不启用）。

壳侧 `SiteFeatureKey` 是 `string`，不和某个插件 id 绑死。

---

## 4. 登记文件与宿主壳（`shell`）

`plugins.registry.yaml`：

```yaml
protocol: innate.web-plugin.packaging.v1
version: 1
defaultProfile: empty
shell: shells/webshell # 可选；缺省 shells/webshell

profiles:
  admin:
    domains:
      - id: admin-tanstack
    iframes: []
  demo:
    shell: shells/custom-shell # 可选；覆盖顶层 shell
    domains: [...]
  empty:
    domains: []
    iframes: []
# CLI 另有内置 profile `all`（不必写在这里）
```

壳按约定放在 `shells/<id>/`（仓内可维护多个壳实现，profile 选一个）；仓外路径也允许，只要求接缝兼容（见 §4.2）。

| 字段                             | 含义                                                                             |
| -------------------------------- | -------------------------------------------------------------------------------- |
| `protocol` / `version`           | 必须是本文的名字与 `1`                                                           |
| `defaultProfile`                 | 无 `--profile` 时使用（克隆后默认 **empty**，`pnpm run dev` 即空壳）             |
| `shell`（顶层）                  | 宿主壳目录，相对 repo root。缺省 `shells/webshell`                               |
| `profiles.<name>.shell`          | 覆盖顶层 `shell`。解析优先级：**profile.shell > 顶层 shell > `shells/webshell`** |
| `profiles.<name>.domains[].id`   | 打包后的目录名 `domains/<id>/`，且必须等于包名 `@innate/domain-<id>` 的后缀      |
| `profiles.<name>.domains[].from` | 源路径：仓内相对根目录，或绝对路径。省略 = 就地包，已在 `domains/<id>/`          |
| `profiles.<name>.iframes[].id`   | 必须已有可发现的 `kind: iframe` 描述；**不 copy 文件**。内置 `all` 忽略此列表    |

### 4.1 `shell` 解析结果

CLI 在 `loadPackagingRegistry` / `lookupProfile` 后得到绝对路径 `shellDir`：

```text
shellDir = resolve(repoRoot, profile.shell ?? registry.shell ?? "shells/webshell")
```

`paths(shellDir)`（或等价）据此计算：

| 逻辑名                         | 路径                                                   |
| ------------------------------ | ------------------------------------------------------ |
| `webshell` / 壳根              | `<shellDir>`                                           |
| `genOut`                       | `<shellDir>/src/gen`                                   |
| `pluginsPublic` / `pluginsOut` | 相对该壳的 public / 输出约定（与现 webshell 布局对齐） |

`gen` / `build` / `assemble` / `dev` **必须**使用本次 profile 的 `shellDir`，禁止再硬编码 `shells/webshell`。

### 4.2 壳兼容性（有限要求）

- **不要求**壳必须是 Vite + TanStack；但 gen 产物接缝文件名与导出形状须与当前约定兼容（`modules.gen.ts`、`styles.gen.css`、`site-features.gen.ts`、`plugins.gen.ts`）。
- **不做**运行时切换壳；只在构建 / 开发期按 profile 选择。
- **不做**一次命令同时打包多个 shell。

iframe 清单不靠 yaml 的扫描根：CLI 固定扫 `apps/<id>/plugin.json`（及实现约定的 e2e 夹具），再与 `--plugin-file` 合并。

---

## 5. 从描述文件打包（`--plugin-file`）

### 5.1 语法

```text
innate-fe-cli gen  --profile <name> [--plugin-file <path>]...
innate-fe-cli dev  --profile <name> [--plugin-file <path>]...
innate-fe-cli all  --profile <name> [--plugin-file <path>]...
```

- flag **可重复**；每个值是本地路径（相对 repo root 或绝对路径）。
- 支持扩展名：`.json`（`plugin.json`）与 `.yaml` / `.yml`（`plugin.yaml`）。YAML 解析为对象后，与 JSON 走同一套 `parsePluginManifest`。
- **不支持**远程 URL。

### 5.2 校验

对每个路径：

1. 读文件（JSON 或 YAML）；
2. `parsePluginManifest(raw, ctx)`，`ctx` 为文件路径；
3. 失败 → 报错并 **exit 1**（必须指出文件路径）。

schema 仍是 [`innate.plugin.v1`](./innate.plugin.v1.md)；本能力**不**扩展插件字段。

### 5.3 与 profile 的合并规则

```text
选中集合 = resolveProfile(profile)  ∪  manifestsFromFiles(--plugin-file...)
同 id：--plugin-file 的描述覆盖 profile / 扫描得到的描述
```

- `--plugin-file` 是**增量**，不替代 profile。
- 「只打包指定文件」：`--profile empty --plugin-file ...`。
- 不加 `--plugin-file` 时，行为与改动前完全一致。

| kind     | 进包方式                                                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `domain` | 用 manifest 的 `id` / `entry` / `styles`；`entry` 相对**描述文件所在目录**解析为真实源码，再 copy 进打包面或按现有 gen 相对 import 规则接入 |
| `iframe` | 登记进 `plugins.gen.ts`（经 `toIframeRuntimeManifest`），**不** copy 源码                                                                   |

实现可落在 `registry.ts` 辅助函数，例如 `manifestsFromFiles(files) → { domains, iframes }`。

---

## 6. 打包面 `domains/`

- pnpm workspace 继续 `domains/*`。copy 进来的目录必须是合法 `@innate/domain-*` 包。
- **就地开发**：源码就写在 `domains/<id>/`，yaml 可省略 `from`，gen **不 copy**。
- **外部 / 可逆示例**：yaml 写 `from`，或 `--plugin-file` 指向仓外描述。被选中后 **copy 进 `domains/<id>/`**（失败再 symlink），现有 `scanDomains` → gen → build 链不用改入口形状。
- 默认 copy **不覆盖**已存在的打包面目录（保护就地改动）。需要按 `from` 刷新时加 `--refresh`。
- 不要把 `domains/` 整体 gitignore，也不要用软链目录结构当前提。

---

## 7. 生成物（均 `@generated`）

空壳接缝（空 `webModules` / 空 packed features）**入库**，所以默认 `dev` 不必先手跑具名 profile。
具名 profile 的接缝不要提交进默认树。

路径一律相对**本次** `shellDir`：

| 文件                                      | 内容                                                                  |
| ----------------------------------------- | --------------------------------------------------------------------- |
| `<shellDir>/src/gen/modules.gen.ts`       | 按打包面相对路径 import 各包 `webDomain`                              |
| `<shellDir>/src/gen/styles.gen.css`       | domains 段聚合 CSS                                                    |
| `<shellDir>/src/gen/site-features.gen.ts` | `packedSiteFeatures`：选中 domain ∪ iframe ∪ 静态导入 id，值全 `true` |
| `<shellDir>/src/gen/plugins.gen.ts`       | `packedPlugins` / iframe 运行时清单，供壳读 `ui`                      |

L2 入口仍是壳内手写的 `site-features.ts`：合并 packed + overlay。

---

## 8. Profile 与常用命令

| Profile         | 行为（示意）                                         | 谁用         |
| --------------- | ---------------------------------------------------- | ------------ |
| `empty`（默认） | 不选任何 domain / iframe（除非另加 `--plugin-file`） | 克隆即跑空壳 |
| 具名 profile    | yaml 点名 ∪ `--plugin-file`                          | 本地 / CI    |
| `all`           | **内置**；扫打包面全部合法 domain + 全部已知 iframe  | 一次打进全部 |

```bash
bun tools/innate-fe-cli/src/index.ts gen
bun tools/innate-fe-cli/src/index.ts gen --profile empty
bun tools/innate-fe-cli/src/index.ts gen --profile admin
bun tools/innate-fe-cli/src/index.ts gen --profile empty --plugin-file domains/admin-tanstack/plugin.json
bun tools/innate-fe-cli/src/index.ts gen --plugin-file ./a.json --plugin-file ./b.yaml
bun tools/innate-fe-cli/src/index.ts gen --check
bun tools/innate-fe-cli/src/index.ts dev --profile iframe-apps
bun tools/innate-fe-cli/src/index.ts verify-flags
```

---

## 9. `--check` 与 `verify-flags`

`gen --check`：

1. 当前 profile **点名 ∪ `--plugin-file`** 的 domain id 必须可解析到打包面（`all` 例外，以扫描结果为期望集合）。
2. 接缝文件与「本 profile 选中集合」一致，且写在配置的 `shellDir/src/gen/`。
3. `--check` 不做 copy / 删除。

`verify-flags`：对账集合 = 打包面 id ∪ 本 profile iframe ∪ `--plugin-file` iframe ∪ 静态导入 id ∪ overlay 键；死开关规则同 v0。

---

## 10. 包身份（轨道 A）

```text
domains/<id>/
  package.json     # name = @innate/domain-<id>
  plugin.json      # 或由 --plugin-file 指向的等价描述
  src/index.ts     # export { webDomain } ...（或 plugin.json 声明的 entry）
```

宿主通过生成的相对 import 消费打包面。路由与 capability 形状仍只由 `createWebDomain` 定义。

---

## 11. 与运行时 iframe 协议的关系

打包层决定 **这次 build 认哪些 iframe id**。
运行时协议决定 **单个 iframe 如何加载与握手**（见 plugin-protocol 常量与 [`iframe-onboarding`](./innate.web-plugin.iframe-onboarding.md)）：

- 信封 `{ source: "innate-plugin", v: 1, channel }`；宿主回 `{ source: "innate-shell", v: 1, channel: "shell:ack" }`
- 禁止 `targetOrigin="*"`；相对路径必须在 `origins` 含 `"self"`

---

## 12. 非目标

- 不把源码家改成 `categories/`，不用软链替换 `domains/`。
- 不接远程 API 拉 features / 描述文件。
- 不改 `plugin.json` 必填 schema（增强字段见 plugin spec）。
- 不实现多 shell 同时打包或运行时热切换壳。
- 不要求壳技术栈与 `shells/webshell` 完全一致（只要求接缝兼容）。
- 不改 `--check` / L1 / L2 的语义内核（仅扩展选中集合与 `shellDir`）。
