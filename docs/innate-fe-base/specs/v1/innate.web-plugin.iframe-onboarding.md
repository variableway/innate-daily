# iframe 插件协议对接（轨道 B）— v1

把一个独立 app 挂进宿主壳，**只改插件侧自描述 + yaml 选包（或 `--plugin-file`）**。壳布局、路由器、`AppShell` **不必改**。本文是对接清单；字段以 [`innate.plugin.v1`](./innate.plugin.v1.md) 为准，选包以 [`innate.web-plugin.packaging.v1`](./innate.web-plugin.packaging.v1.md) 为准。

仓内对照：`apps/web-showcase`（Next 静态可导出）、`apps/admin-nextjs`（Next 带 API / auth，只能 live）、`apps/wandesk-ui`（Vite 同源静态）。

Next.js 不能做成 domain，原因见历史用例说明（`docs/archieve/use-cases/why-iframe-domain.md` 或后续重写的 `docs/context/`）。

相对 [`../v0/innate.web-plugin.iframe-onboarding.md`](../v0/innate.web-plugin.iframe-onboarding.md)：补充 `shell`、`--plugin-file`、侧栏 `group` / `navItems`；接缝路径改为相对配置的宿主壳。

---

## 1. yaml 点名不够

`plugins.registry.yaml` 的 `iframes: [{ id }]` 只是**选择**。CLI 用这个 id 去 `apps/<id>/plugin.json` 里找自描述。没有清单时 `gen` 会失败。

也可用描述文件直接进包（不必改 yaml）：

```bash
bun tools/innate-fe-cli/src/index.ts gen --profile empty --plugin-file apps/admin-nextjs/plugin.json
```

发现规则（实现：`tools/innate-fe-cli/src/lib/catalog.ts`）：

| 规则   | 要求                                                                     |
| ------ | ------------------------------------------------------------------------ |
| 位置   | `apps/<id>/plugin.json`，与 `package.json` 同级；或 `--plugin-file` 路径 |
| `id`   | 匹配 `/^[a-z][a-z0-9-]*$/`；仓内扫描时须等于目录名                       |
| `kind` | `"iframe"`                                                               |
| 扫描   | 固定扫 `apps/` 一层子目录 + e2e 夹具；**不**从 yaml 读扫描根             |

每个 profile 是独立选单。`--plugin-file` 与 profile **并集**；同 id 时文件优先。

---

## 2. 必改：`plugin.json`（自描述）

```json
{
  "protocol": "innate.plugin.v1",
  "id": "<目录名>",
  "kind": "iframe",
  "category": "apps",
  "version": "0.1.0",
  "name": "侧栏展示名",
  "runtime": "iframe",
  "iframeSrc": "http://localhost:<port>/",
  "origins": ["http://localhost:<port>"],
  "ui": {
    "nav": {
      "label": "侧栏名",
      "icon": "Lucide图标名",
      "order": 40,
      "group": "应用"
    }
  }
}
```

| 字段            | 对接含义                                                                                                                                           |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `iframeSrc`     | 壳 iframe 的 `src`。本机 URL → `dev` 会按 `package.json` 的 `scripts.dev` 另起进程；相对路径 `/plugins/<id>/…` → 同源静态，走 `prepare` / `import` |
| `origins`       | postMessage 白名单。必须包含 `iframeSrc` 的 origin；相对路径必须含 `"self"`                                                                        |
| `ui.nav`        | 壳侧栏文案 / 图标 / 排序 / 可选 `group`。运行期路径由壳写成 `/plugins/<id>`，**不要**在这里写业务深链                                              |
| `ui.navItems`   | 可选多入口（见 plugin spec）；iframe 通常仍用单 `nav`                                                                                              |
| `scripts.dev`   | 本机 URL 时必有，否则 CLI 只登记、不起进程                                                                                                         |
| `scripts.build` | 仅相对路径 iframe 的 `prepare` 需要                                                                                                                |

壳 **不改** 业务 `src/`（除 `@generated` 接缝）。握手 `shell:hello` → `shell:ack` **可选**。

---

## 3. 按应用形态选路径

|             | 路径 A：live iframe                                                   | 路径 B：同源静态                                   |
| ----------- | --------------------------------------------------------------------- | -------------------------------------------------- |
| `iframeSrc` | `http://localhost:<port>/`                                            | `/plugins/<id>/index.html`                         |
| `origins`   | `[ "http://localhost:<port>" ]`                                       | `[ "self" ]`                                       |
| 何时用      | 有 API Route、鉴权、Prisma、RSC 等**不能** `output: 'export'` 的 Next | 纯静态或已设 `base: "./"` 的 Vite                  |
| CLI         | `dev` 另起 `pnpm --filter <pkg> dev`                                  | `prepare`：build 再拷进壳的 `public/plugins/<id>/` |

**有服务端能力的 Next 只能走路径 A。**

---

## 4. 宿主壳与接缝路径

登记文件可设 `shell`（缺省 `shells/webshell`）。`gen` 写出：

```text
<shellDir>/src/gen/plugins.gen.ts
<shellDir>/src/gen/site-features.gen.ts
```

默认仍是 `shells/webshell/src/gen/`。具名 profile 的接缝不要提交进默认树。

---

## 5. Next.js 运行时条件（跨 origin）

壳嵌 live iframe 时是**跨 origin**。插件侧需要：

| 项                  | 做什么                                                        |
| ------------------- | ------------------------------------------------------------- |
| `allowedDevOrigins` | 允许壳 origin 拉 `/_next/*` 与 HMR                            |
| 不要挡嵌入          | 不要设 `X-Frame-Options: DENY` / CSP `frame-ancestors 'none'` |
| 鉴权 cookie         | iframe 内请求打向插件自己的 origin                            |
| 握手                | 可选                                                          |

不要把 Next 改成 `createWebDomain`。

---

## 6. 实例：`admin-nextjs`

1. `apps/admin-nextjs/plugin.json` — live `:4012`。
2. `plugins.registry.yaml` 的 `iframe-apps.iframes` 点名（或 `--plugin-file`）。
3. `package.json` 有 `"dev": "next dev --port 4012"`。
4. `next.config` 有 `allowedDevOrigins`。

```bash
bun tools/innate-fe-cli/src/index.ts dev --profile iframe-apps
```

打开壳上的 `/plugins/admin-nextjs`。不要改壳源码即可完成对接。
