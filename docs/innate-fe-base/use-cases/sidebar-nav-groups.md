# 使用说明：把 domain 分组挂到壳侧栏（如 Misc）

壳侧栏支持按**分组**渲染：nav 声明 `group` 的插件归到同名组下，组渲染一个小标题；没声明 `group` 的留在默认组（无标题）。协议事实源：[innate.plugin.v1 §3.4](../specs/v1/innate.plugin.v1.md)（`ui.nav.group` / `ui.navItems[].group`）。

当前已应用：`feed` / `collections` / `cheatsheets` / `awesome` 四个 domain 的 nav 都声明了 `group: "Misc"`，侧栏里它们出现在 **MISC** 标题下，各占一个入口。

**边界**：分组是带标题的平铺段落——不可折叠、不支持嵌套（协议明确的非目标）。要「可展开/收起的子菜单」需要改壳 + 协议，当前不支持。

本次核对时间：2026-10-12。页面在浏览器里看过（`gen --profile all` + 壳 `:4020`）。

## 怎么做

1. 在 domain 的 `src/web-domain.tsx` 的 nav capability 里加 `group` 字段：

   ```ts
   .addCapability("nav", {
     label: "Feed",
     path: BASE_PATH,
     icon: "Newspaper",
     order: 31,
     group: "Misc", // ← 加这一行
   })
   ```

   iframe 插件不用改代码，在它的 `plugin.json` 里写 `"ui": { "nav": { ..., "group": "Misc" } }`。

2. 排序规则：`order` 决定组内顺序；组与组之间按「组内首个入口在全局排序中的位置」排，默认组排最前（Home 在其中）。

3. 重新生成接缝并起壳验证（用包含这些 domain 的 profile，内置 `all` 最省事）：

   ```bash
   bun tools/innate-fe-cli/src/index.ts gen --profile all --skip-apply
   pnpm --filter @innate/webshell exec vite --port 4020
   ```

   浏览器打开 <http://localhost:4020>：侧栏出现 MISC 标题，下面是 Feed / Collections / Cheatsheets / Awesome（按 order 排序），点击各自跳转 `/feed` 等路由。

## 预期结果

- 声明同名的 `group` 的入口聚合到同一标题下；默认组入口照旧无标题。
- 不声明 `group` 的插件（如 `making`、iframe 们）不受影响，仍在默认组。
