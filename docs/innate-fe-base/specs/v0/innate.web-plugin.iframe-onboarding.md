# iframe 插件协议对接（轨道 B）

> **历史基线。** 当前对接清单见 [`../v1/innate.web-plugin.iframe-onboarding.md`](../v1/innate.web-plugin.iframe-onboarding.md)。

把一个独立 app 挂进 Web Shell，**只改插件侧自描述 + yaml 选包**。壳布局、路由器、`AppShell` **不必改**。本文是对接清单；字段以 [`innate.plugin.v1`](./innate.plugin.v1.md) 为准，选包以 [`innate.web-plugin.packaging.v1`](./innate.web-plugin.packaging.v1.md) 为准。

仓内对照：`apps/web-showcase`（Next 静态可导出）、`apps/admin-nextjs`（Next 带 API / auth，只能 live）、`apps/wandesk-ui`（Vite 同源静态）。

Next.js 不能做成 domain，原因见 [why-iframe-domain.md](../use-cases/why-iframe-domain.md)。

---

## 1. yaml 点名不够

`plugins.registry.yaml` 的 `iframes: [{ id }]` 只是**选择**。CLI 用这个 id 去 `apps/<id>/plugin.json` 里找自描述。没有清单时 `gen` 会失败：

```text
profile "iframe-apps" iframes 含未知 id "admin-nextjs"
（apps/ 下无 kind=iframe 的 plugin.json）
```

发现规则（实现：[`catalog.ts`](../../tools/innate-fe-cli/src/lib/catalog.ts)）：

| 规则   | 要求                                                         |
| ------ | ------------------------------------------------------------ |
| 位置   | `apps/<id>/plugin.json`，与 `package.json` 同级              |
| `id`   | 必须等于目录名，匹配 `/^[a-z][a-z0-9-]*$/`                   |
| `kind` | `"iframe"`                                                   |
| 扫描   | 固定扫 `apps/` 一层子目录 + e2e 夹具；**不**从 yaml 读扫描根 |

每个 profile 是独立选单：写进 `iframe-apps` **不会**自动进 `apps`。要打进「全应用」壳，还得在 `apps.iframes` 再写一行。

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
    "nav": { "label": "侧栏名", "icon": "Lucide图标名", "order": 40 }
  }
}
```

| 字段            | 对接含义                                                                                                                                           |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `iframeSrc`     | 壳 iframe 的 `src`。本机 URL → `dev` 会按 `package.json` 的 `scripts.dev` 另起进程；相对路径 `/plugins/<id>/…` → 同源静态，走 `prepare` / `import` |
| `origins`       | postMessage 白名单。必须包含 `iframeSrc` 的 origin；相对路径必须含 `"self"`                                                                        |
| `ui.nav`        | 壳侧栏文案 / 图标 / 排序。运行期路径由壳写成 `/plugins/<id>`，**不要**在这里写业务深链                                                             |
| `scripts.dev`   | 本机 URL 时必有，否则 CLI 只登记、不起进程                                                                                                         |
| `scripts.build` | 仅相对路径 iframe 的 `prepare` 需要                                                                                                                |

壳 **不改** `src/`（除 `@generated` 接缝）。握手 `shell:hello` → `shell:ack` **可选**：不发 hello 时页面仍展示，只是 bridge 记 timeout。

---

## 3. 按应用形态选路径

|             | 路径 A：live iframe                                                   | 路径 B：同源静态                               |
| ----------- | --------------------------------------------------------------------- | ---------------------------------------------- |
| `iframeSrc` | `http://localhost:<port>/`                                            | `/plugins/<id>/index.html`                     |
| `origins`   | `[ "http://localhost:<port>" ]`                                       | `[ "self" ]`                                   |
| 何时用      | 有 API Route、鉴权、Prisma、RSC 等**不能** `output: 'export'` 的 Next | 纯静态（showcase）或已设 `base: "./"` 的 Vite  |
| CLI         | `dev` 另起 `pnpm --filter <pkg> dev`                                  | `prepare`：build 再拷进 `public/plugins/<id>/` |

**有服务端能力的 Next 只能走路径 A。** `output: 'export'` 不允许 `app/api/**`。`admin-nextjs` 含 auth / dashboard / scenes API，因此 `plugin.json` 用 `:4012`，不把相对路径写进清单。

路径 B 的 Next 还要构建时设 `PLUGIN_BASE_PATH=/plugins/<id>`（资源前缀），见 [用例 03](../use-cases/03-integrate-nextjs-app.md)。

---

## 4. Next.js 还要对接的运行时条件

壳在 `:4020` 嵌 `:4012`，是**跨 origin**（不同端口）。插件侧需要：

| 项                  | 做什么                                                        | `admin-nextjs`                                                   |
| ------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------- |
| `allowedDevOrigins` | 允许壳 origin 拉 `/_next/*` 与 HMR                            | 已用根脚本 `scripts/next-allowed-dev-origins.js`（含 localhost） |
| 不要挡嵌入          | 不要设 `X-Frame-Options: DENY` / CSP `frame-ancestors 'none'` | 当前未设，保持即可                                               |
| 鉴权 cookie         | iframe 内请求仍打向插件自己的 origin，一般可用                | 默认 `NEXT_PUBLIC_ENABLE_REAL_AUTH !== "1"` 演示旁路             |
| 握手                | 可选                                                          | 未接入，与 showcase 相同                                         |

不要把 Next 改成 `createWebDomain`：App Router 挂不进壳的 TanStack 树。

---

## 5. 实例：`admin-nextjs`

已落地的对接（对照 §2）：

1. [`apps/admin-nextjs/plugin.json`](../../apps/admin-nextjs/plugin.json) — live `:4012`，`origins` 同 origin。
2. [`plugins.registry.yaml`](../../plugins.registry.yaml) `iframe-apps.iframes` 点名 `admin-nextjs`（**未**写入 `apps` profile）。
3. `package.json` 已有 `"dev": "next dev --port 4012"`，包名 `@innate/admin-nextjs-demo`。
4. `next.config.js` 已有 `allowedDevOrigins`。

操作：

```bash
bun tools/innate-fe-cli/src/index.ts dev --profile iframe-apps
# → 壳 :4020 + showcase :4003 + admin-nextjs :4012；wandesk 仍是同源静态
```

打开 http://localhost:4020/plugins/admin-nextjs 。侧栏 **Admin Next**。独立跑 app 仍是 `pnpm --filter @innate/admin-nextjs-demo dev`。

要进「domain + 全部产品 iframe」那次打包，在 yaml 的 `apps.iframes` 再加 `- id: admin-nextjs`。不要改壳源码。

---

## 6. 对接完成后谁写出接缝

`innate-fe-cli gen` → `apps/webshell/src/gen/plugins.gen.ts`（运行期 `innate.web-plugin.v1` 清单）+ `site-features.gen.ts`（该 id `true`）。宿主 `buildRegistry` 用这份清单画侧栏 / tile / `/plugins/$id`。具名 profile 的接缝不要提交。
