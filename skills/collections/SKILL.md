---
name: daily-collections
description: 把作品加入 daily 站的 Collections 作品墙。当用户说"把 xxx 加进作品墙 / collections / 首页卡片"时使用。
---

# 把作品加入 Collections

Collections 是站点首页的作品墙：每个作品一张卡片，带封面、描述、
标签。数据全部在 `src/data/collections.json`。

## 以本站现有条目为模板

动手前先读 `src/data/collections.json`。下面是本站自己的条目
（innate-daily 把自己也收录了——这正是最好的示例）：

```json
{
  "id": "innate-daily",
  "title": "Innate Daily — 日常写作与 Collections 工作台",
  "description": "Vite + React + TanStack Router 的个人写作站：首页是 Plaza 卡片墙……",
  "url": "https://variableway.github.io/innate-daily/",
  "repo": "https://github.com/variableway/innate-daily",
  "repoVisibility": "public",
  "source": "github",
  "category": "工具效率",
  "tags": ["react", "vite", "writing", "dashboard"],
  "thumbnail": "collections-covers/innate-daily.webp",
  "date": "2026-10-26",
  "featured": true
}
```

## 字段速记

| 字段 | 要求 |
|------|------|
| `id` | 全表唯一，短英文小写 |
| `title` | 名字 + 一句话说清它是什么 |
| `description` | 两三句：解决什么问题、特别在哪 |
| `url` / `repo` | 作品网址 / 仓库地址 |
| `repoVisibility` | `public` 或 `private`，影响站内徽章 |
| `category` | 用已有分类，侧栏按它分组 |
| `thumbnail` | `collections-covers/文件名`；不放则站点自动生成程序化封面 |
| `featured` | `true` 上首页首屏，新作品建议开 |

## 流程

1. **向用户要信息**：作品名、网址、仓库地址、一句话描述、想放的分类——
   一次问全，不要挤牙膏；
2. 封面图两种处理：用户给了图 → 放进 `public/collections-covers/`
   （推荐 webp），`thumbnail` 指过去；没有图 → 省略字段，用程序化封面；
3. 按模板追加 JSON（**最后一个字段后面不能有逗号**，改完自己先
   校验一遍语法）；
4. 起本地预览，打开 `/#/collections` 让用户确认卡片显示正常，
   然后走部署 skill 发布。

## 验收

本地 `/#/collections` 侧栏出现新作品、点卡片能打开详情；
上线后首页卡片墙可见。
