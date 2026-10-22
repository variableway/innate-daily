# Collections（收藏集）模块

`/collections` 页面：收藏外部站点（主要是 AI agent 生成的实验性站点），与 `/writing`（content 模块）同构的三栏布局——侧栏筛选 + 中列列表 + 右侧 iframe 预览。本模块从 `examples/collections`（原 `@innate/domain-collections` domain 项目）合并而来，合并后 daily-work 是唯一事实源，examples 下不再维护。

## 数据在哪、怎么加

数据只有一个文件：[`src/data/collections.json`](../../src/data/collections.json)。加一条收藏就是在 `collections` 数组里加一个对象：

```json
{
  "id": "kebab-case-唯一标识",
  "title": "站点名",
  "description": "一句话描述（卡片和查看器都会显示）",
  "url": "https://example.com",
  "source": "kimi",
  "category": "工具",
  "tags": ["art", "shanghai"],
  "date": "2026-05-31",
  "thumbnail": "可选，暂未使用",
  "featured": true
}
```

字段约束（`src/test/collections.test.ts` 会校验，提交前先跑）：

| 字段 | 要求 | 说明 |
| --- | --- | --- |
| `id` | 必填、全文件唯一 | kebab-case；用作列表选中态与 React key |
| `title` / `description` / `url` | 必填非空 | `url` 会作为 iframe `src` 与「新窗口打开」链接；`description` 是卡片/查看器上的简要说明 |
| `source` | 必填，`kimi` \| `feishu` \| `other` | 徽标颜色由 `label-chip` 按名字哈希自动生成（与侧栏分类、landing chips 同一套配色语言），新增来源无需改代码 |
| `category` | 必填非空 | 自由文本（如「工具」「游戏」），筛选栏自动按去重值生成选项，无需注册 |
| `tags` | 可空数组 | 英文小写为佳；筛选栏按出现频次排序生成 |
| `date` | 必填，`YYYY-MM-DD` | 列表按它倒序 |
| `thumbnail` | 可选 URL | 预留字段：卡片网格移除后暂无渲染场景，保留给未来恢复封面用 |
| `featured` | 可选布尔 | 卡片加 ✦ 徽标；筛选栏有 Featured 独立开关（URL 参数 `featured=true`） |
| `lastUpdated` | 顶层字段 | 顺手更新即可，无消费逻辑 |

加完后本地验证：

```bash
pnpm --filter @innate/daily test    # 数据完整性测试
pnpm --filter @innate/daily dev     # 侧栏 Notes 下点 Collections 查看
```

## 页面行为与入口

- 路由 `/#/collections`，筛选状态落在 URL（`?source=&category=&tag=&featured=`，见 `src/router.tsx` 的 `validateCollectionsSearch`），刷新 / 分享不丢。
- 布局与 `/writing` 同构（issue #2 风格统一）：宽屏（≥1280px）三栏可拖拽（侧栏可折叠 + 列表 + 查看器），中屏侧栏收进 Sheet，窄屏列表 / 查看器双态切换；侧栏含搜索框（⌘K 聚焦）、All Items / Featured / Sources / Categories / Recent 分区，并有回到 Notes 的入口（与 writing 侧栏的 Collections 行互为镜像）。
- 列表卡片与查看器条目头走与 `BlogList` / `BlogViewer` 同款语言（圆角卡片 + 选中 ring、label-chip 哈希配色徽标，source / category / tag 徽标均可点击筛选）。
- 入口有三个：Writing 侧栏 Notes 行下的 **Collections** 行（`blog-page-client.tsx`）、landing 首页 **Collections** 展区的卡片、以及 URL 直达。
- 部分站点不允许被 iframe 嵌入（X-Frame-Options / CSP），查看器会显示「cannot be embedded」并提供新窗口打开——这是预期行为，不是 bug。
- 笔记分类的悬浮胶囊菜单（`category-menu.tsx`）在 `/collections` 页自动切到 Collections 视图，其筛选选项与页面侧栏共用同一套 URL 参数。

## 代码地图（都在 `src/` 下）

| 文件 | 职责 |
| --- | --- |
| `data/collections.json` | 数据（唯一需要日常维护的文件） |
| `lib/collections/types.ts` | `CollectionItem` / `CollectionsData` 类型 |
| `lib/collections/data.ts` | 读取与派生（排序、去重 source/category/tags） |
| `components/collections/collections-page-client.tsx` | 页面骨架：三栏布局、URL 筛选、搜索、侧栏导航 |
| `components/collections/collections-list.tsx` | 中列列表（与 BlogList 同款卡片） |
| `components/collections/collection-viewer.tsx` | 右侧 iframe 查看器（条目头与 BlogViewer 同构） |
| `pages/collections/page.tsx` | 路由组件：URL search ↔ 筛选状态 |

## 关于公用代码

合并时未复制 examples 项目的 `base-path.ts` / `domain-layout.tsx` / `routing.tsx` / `globals.css`：daily-work 已有对应物（`base-path` 的语义还不同——writing 站做路径改写，domain 版做前缀挂载）。组件全部复用 `@innate/ui`（`cn` / `ThemeSelector` / `useIsMobile`）与站内路由、主题基建，**零新增依赖**。后续若 `examples/making` 也要并入，同样走这条路：只迁业务组件与数据，基建用站内已有版本。
