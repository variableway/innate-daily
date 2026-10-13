# Plugin Protocol Specs — v1（增强版）

本目录是 sprint-2 之后的**当前事实源**。协议字符串仍是 `innate.plugin.v1` /
`innate.web-plugin.packaging.v1`（向后兼容字段扩展，不换协议名）。

| 文档                                                                                 | 职责                                     | 相对 [`../v0/`](../v0/) 的增量                  |
| ------------------------------------------------------------------------------------ | ---------------------------------------- | ----------------------------------------------- |
| [`innate.plugin.v1.md`](./innate.plugin.v1.md)                                       | 插件自描述 `plugin.json` / `plugin.yaml` | `ui.nav.group`、`ui.navItems`；壳侧分组渲染规则 |
| [`innate.web-plugin.packaging.v1.md`](./innate.web-plugin.packaging.v1.md)           | 选包 / 宿主壳 / 生成接缝                 | 登记文件 `shell`；CLI `--plugin-file`           |
| [`innate.web-plugin.iframe-onboarding.md`](./innate.web-plugin.iframe-onboarding.md) | iframe 对接清单                          | 链到本目录协议；可选 `group` / `navItems`       |

历史基线（不含上述增量）保留在 [`../v0/`](../v0/)。实现与文档冲突时，以**本目录**与源码为准。

## 三层边界（不变）

```text
自描述  plugin.json / plugin.yaml     → innate.plugin.v1
选择    plugins.registry.yaml + CLI   → innate.web-plugin.packaging.v1
运行时  iframe 握手 / 壳渲染          → innate.web-plugin.v1（信封）+ 壳侧 registry
```

任务 3 / 4 只动**打包层**；任务 5 只动**自描述 + 壳侧 nav 渲染**。三者字段命名空间不重叠。

TypeScript 实现包：[`packages/plugin-protocol`](../../../packages/plugin-protocol)（`@innate/plugin-protocol`）。
