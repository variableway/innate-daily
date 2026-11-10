---
title: "拥有你自己的 Daily · 4/4 · 把自己的作品加入 Collections"
slug: own-your-daily-4-showcase
date: 2026-11-10
author: Innate Team
category: guide
tags: [own-your-daily, collections, showcase, 入门]
status: draft
excerpt: "系列第四篇：Collections 是作品墙。做好的网站、工具、项目，填一条 JSON、放一张封面图，它就出现在首页卡片墙上，可点击、可跳转、可内嵌预览。"
---

# 拥有你自己的 Daily · 4/4 · 把自己的作品加入 Collections

文章是"写的东西"，Collections 是**做的东西**：你的网站、工具、开源项目——
每个作品一张卡片，带封面、描述、标签，出现在站点首页。

这一篇做完，你的站就从"博客"变成"主页"：访客第一眼看到的
不只是你写的字，还有你造的物。

## 一个作品 = 一条记录 + 一张封面图

作品清单在 `src/data/collections.json`，每个作品长这样：

```json
{
  "id": "my-tool",
  "title": "My Tool — 一句话说清它是什么",
  "description": "两三句介绍：解决什么问题、有什么特别之处。",
  "url": "https://你的作品网址",
  "repo": "https://github.com/你的用户名/仓库名",
  "repoVisibility": "public",
  "source": "github",
  "category": "工具效率",
  "tags": ["tag-a", "tag-b"],
  "thumbnail": "collections-covers/my-tool.webp",
  "date": "2026-11-10",
  "featured": true
}
```

字段速记：

- **`id`** —— 唯一标识，起个短英文小写名，别和已有条目重复
- **`category`** —— 用站点里已有的分类（侧栏会按它分组）
- **`thumbnail`** —— 封面图路径，固定写成 `collections-covers/文件名`
- **`featured: true`** —— 上首页卡片墙（首屏位置），新作品建议先开
- **`repoVisibility`** —— `public` 仓库标 `public`，站内徽章会标"开源 · 公开"

封面图放在 `public/collections-covers/` 目录，推荐 `.webp` 格式
（体积小加载快）。没有现成封面也没关系——不放 `thumbnail` 字段，
站点会自动生成一张程序化的封面画。

> **注意：** 封面图是站点资源，和文章插图不一样——文章插图必须是
> 网络链接，Collections 封面反而是放在仓库里的本地文件，构建时会
> 一起打包发布。

## 两种做法

### 做法 A · 让 Agent 替你加

```text
读 src/data/collections.json 现有条目了解字段格式，然后把我的作品
加进去：名称（xxx），网址（xxx），仓库地址（xxx），一句话描述（xxx）。
封面图我放在 public/collections-covers/ 下，文件名是 xxx。
加完起本地预览让我确认卡片显示正常。
```

### 做法 B · 自己动手改

打开 `src/data/collections.json`，照着最上面那条的样子复制一份，
改掉字段值，保存。JSON 严格讲语法——最后一个字段后面**不能有逗号**，
这是新手最容易翻车的地方。不确定就让 Agent 帮你看一眼。

## 验收

本地预览打开 `/#/collections`：侧栏出现你的分类和作品，
点卡片能打开详情。推送上线后，正式网址首页出现你的作品卡片——完成。

## 系列毕业：你现在拥有什么

四篇走完，你有了：

- 一个**署你名的正式网址**（部署篇）
- 一个**写了就发、发了就上**的发布流程（写作篇 + 效果篇）
- 一面**作品墙**，别人打开就知道你做过什么（本篇）

从这里出发的两个方向：

- 把网址印在名片、简历、社交主页上——它是你的一亩三分地；
- 想知道这个站背后的工具是怎么造的，延伸阅读
  [Node + TypeScript 入门](../../tutorials/basic/nodejs-typescript-101.md)——
  这个站就是一个 Node + TypeScript 项目。
  不看也完全没关系，你已经不需要它也能用这个站了。
