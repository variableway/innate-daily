---
title: "拥有你自己的 Daily · 1/4 · 在哪里写"
slug: own-your-daily-1-write
date: 2026-11-10
author: Innate Team
category: guide
tags: [own-your-daily, writing, 入门]
status: draft
excerpt: "系列第一篇：这个站点 fork 下来就是你自己的。文章写在哪里？三个答案——GitHub 网页上直接写、本地写作台写、或者让 Agent 替你写。"
---

# 拥有你自己的 Daily · 1/4 · 在哪里写

这个仓库是一个**独立**的写作站模板：所有依赖都来自公开的 npm 源，
不需要任何内部权限，fork 下来就是你自己的站。

四篇文章带你走完从"拥有"到"发表"的全过程：

1. **在哪里写**（本篇）
2. [如何直接部署](own-your-daily-2-deploy.md)
3. [马上看到效果](own-your-daily-3-see-it.md)
4. [把自己的作品加入 Collections](own-your-daily-4-showcase.md)

## 文章 = 一个 Markdown 文件

站点的每一篇文章，就是 `docs/` 目录下的一个 `.md` 文件。
文件放对位置、开头写几行"身份证"，文章就会出现在站点上。

目录本身就是分类：`docs/` 放站点自己的说明，
`docs/use-cases/` 放用例文章——你想加自己的目录（比如 `docs/essays/`），
建一个文件夹就行，文件夹名就是栏目名。

每个文件的开头长这样（我们叫它"身份证"）：

```markdown
---
title: "文章标题"
slug: my-first-post
date: 2026-11-10
author: 你的名字
status: published
---

# 文章标题

正文从这里开始，就是普通的 Markdown。
```

只需要记住两条规矩：

- **`status: published` 才会显示**——写 `draft` 的文章站点上看不见，适合存稿；
- **图片要用网络链接**——`![说明](https://…/img.png)` 可以，
  你电脑里的图片路径不行。

完整的字段说明和语法（表格、代码高亮、画图）都在
[Markdown 写作指南](../basic/markdown-usage.md)，用到再查，不用背。

## 三种写法，按你的情况挑

### 写法 A · 在 GitHub 网页上直接写（零安装）

fork 之后，你在浏览器里就能写：打开你自己仓库的 `docs/use-cases/` 页面，
点 **Add file → Create new file**，文件名起成 `my-first-post.md`，
把上面的模板粘进去开始写。写完拉到下面点 **Commit changes**——
就是"保存并发布"。

这一条路什么都不用装。写完之后发生了什么，见[部署篇](own-your-daily-2-deploy.md)。

### 写法 B · 在本地写作台写

仓库自带一个写作台：本地跑起站点后，浏览器打开 `http://localhost:4016/#/writing`
（跑起来的方法见[效果篇](own-your-daily-3-see-it.md)）。左边是文件夹，
右边是实时预览，写完的文章落回 `docs/` 目录。

### 写法 C · 让 Agent 替你写

把这段话发给你的 AI 编程助手（Claude Code、Codex……）：

```text
读 docs/basic/markdown-usage.md 了解这个站的发文规范，然后帮我在
docs/use-cases/ 新建一篇文章。主题：（你想写什么）。
署名：（你的名字）。写完用一句人话告诉我文件放在哪、
下一步怎么让它出现在我的网站上。
```

第一句"先读规范"是关键——规则由仓库里的文档解释，你不用当传话筒。

## 验收

不管用哪种写法，验收标准只有一个：

> 你的文章出现在站点上，署名是你，手机能打开。

怎么让站点更新，正是下一篇要讲的事。
