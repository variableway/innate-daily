# 模块文档

本目录是 innate-fe-base 的模块说明文档。每个文档回答「这个模块是什么、解决什么问题、怎么用」。

历史参考文档在 [`../archieve/modules/`](../archieve/modules/)，内容可能过期，以本目录和源码为准。

## 文档索引

| 文档                               | 说明                                                      |
| ---------------------------------- | --------------------------------------------------------- |
| [`overview.md`](./overview.md)     | 模块总图：UI 分层 → 单独开发 web → plugin 模式 → 目录对照 |
| [`ui.md`](./ui.md)                 | `@innate/ui`：唯一的 primitive 与 token 来源              |
| [`web-domain.md`](./web-domain.md) | `@innate/web-domain`：domain 插件与宿主的编译期契约       |
| [`plugin.md`](./plugin.md)         | plugin protocol 与 plugin 模式：domain / iframe 两条轨道  |
| [`cli.md`](./cli.md)               | `innate-fe-cli`：选包、生成接缝、dev、打包                |

## 未覆盖的模块

以下模块本次未编写文档，后续按需补充：

- `apps/` 目录下各应用（`webshell`、`web-showcase`、`wandesk-ui` 等）
- `@innate/admin-composites`（L2 组合件）
- `@innate/scene-*`（场景资产）
- `@innate/agent-ui`
- `packages/skills-kit`
