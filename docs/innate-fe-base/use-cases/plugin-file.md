# 用例：用指定的 plugin 配置文件进壳

不改 `plugins.registry.yaml`，用 CLI 的 `--plugin-file` 指向一份本地 `plugin.json` 或 `plugin.yaml`。它和当前 profile **取并集**。只想打进这一份文件时，profile 用 `empty`。

协议：[innate.web-plugin.packaging.v1 §5](../specs/v1/innate.web-plugin.packaging.v1.md)。

本次核对时间：2026-10-12。命令在仓库根执行。

## 操作

domain 示例是已经在打包面里的 `domains/admin-tanstack/plugin.json`：

```bash
bun tools/innate-fe-cli/src/index.ts dev --profile empty --plugin-file domains/admin-tanstack/plugin.json
```

只生成接缝、不启动 Vite：

```bash
bun tools/innate-fe-cli/src/index.ts gen --profile empty --plugin-file domains/admin-tanstack/plugin.json
```

flag 可以重复。同 id 时后写的文件覆盖前面的描述。iframe 用同一 flag，不 copy 源码：

```bash
bun tools/innate-fe-cli/src/index.ts gen --profile empty --plugin-file domains/admin-tanstack/plugin.json --plugin-file apps/web-showcase/plugin.json
```

支持 `.json`、`.yaml`、`.yml`。不支持远程 URL。

## 本次 gen 输出

```text
[gen] shell=shells/webshell
[gen] --plugin-file: domains=admin-tanstack iframes=(无)
[gen] 未删除 admin-tanstack: 没有 from 原件，empty 不会销毁就地源码
[gen] plugin-file domain admin-tanstack: in-place
[gen] profile=empty 发现 1 个 domain: admin-tanstack
[gen] iframe plugins: (无)
[gen] packed features: admin-tanstack
```

写出的接缝：

- `shells/webshell/src/gen/modules.gen.ts` import `domains/admin-tanstack/src/index.ts`
- `shells/webshell/src/gen/site-features.gen.ts` 里 `admin-tanstack: true`
- `plugins.gen.ts` 仍是空数组（这次没有 iframe 文件）

`empty` 的 yaml 没有点名这个 domain。选中它只因为 `--plugin-file`。源码目录和描述文件在同一处，所以是 `in-place`，没有 copy，也没有删掉 `domains/admin-tanstack`。

这些生成文件不要提交。

## 页面上应看到的内容

描述文件里的 `ui.nav` / `ui.homeTile` 由 domain 注册进壳。当前清单是一条 **Admin**（`/admin-tanstack`），首页卡片标题也是 **Admin**。壳侧栏不展开子菜单。

## 这次浏览器

4020 上已有空壳的 Vite。写入上述接缝后，页面被 Vite overlay 挡住：

```text
Can't resolve '@fontsource-variable/inter'
in domains/admin-tanstack/src/globals.css
```

`domains/admin-tanstack/node_modules` 里当时只有 `.vite`，没有挂上 `@fontsource-variable/inter` 和 `@innate/ui`。这是依赖链接问题，不是 `--plugin-file` 没选中包。接缝已经包含这个 domain。依赖链上之后，再执行上面的 `dev` 命令，侧栏应出现 plugin.json 里的导航。

## 规则

- `--plugin-file` 不替代 profile。`admin` profile 再加一份文件，结果是 yaml 点名加上这份文件。
- 不加这个 flag 时，行为与只跑 profile 相同。见 [空壳](./empty-webshell.md)。
- domain 描述文件若指向打包面以外的目录，CLI 会把该目录 copy 进 `domains/<id>/`。已存在且不是同一目录时，需要 `--refresh` 才会覆盖。
- 不手改 `shells/webshell/src/gen/`。
