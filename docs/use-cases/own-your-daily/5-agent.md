---
title: "拥有你自己的 Daily · 5/5 · 让 Agent 替你跑完全程"
slug: own-your-daily-5-agent
date: 2026-11-10
author: Innate Team
category: guide
tags: [own-your-daily, agent, skills, 入门]
status: draft
excerpt: "系列收官：装上四个 skill，建仓库、部署、发文、加作品全部交给 Agent。你不再需要学配置——只需要了解它——但 Node 打包部署的完整链路，你会在一次有结果的旅程里全部亲眼见一遍。"
---

# 拥有你自己的 Daily · 5/5 · 让 Agent 替你跑完全程

前四篇里有不少"配置部分"：frontmatter 字段、Pages 开关、
collections.json 的字段表……如果每篇都要先读懂再动手，
大多数人会停在第 1 篇。

这一篇是另一种走法：**把仓库自带的四个 skill 装给你的 Agent，
你只负责说话和验收**。走完一遍你会发现——配置不用背，认得就行；
但 Node 打包部署的完整链路（install → 检查 → build → 发布），
你会在一次有结果的旅程里全部亲眼见一遍。

## 以前手动做 vs 现在交给 Agent

| 事情 | 以前（手动） | 现在（Agent + skill） |
|------|-------------|----------------------|
| 建远程仓库 | 注册账号、配 SSH、记 git 命令 | 说一句"建个仓库"，账号问题它问你答 |
| 部署上线 | 读 Actions 文档、盯构建日志 | 说"部署"，它检查、构建、等绿、来汇报 |
| 写文章 | 先学 frontmatter 和 Markdown 规范 | 说主题和署名，它按站点规范写好 |
| 加作品 | 改 JSON、放封面、防逗号翻车 | 报作品信息，它填好并预览给你看 |

变化不是"少学了知识"——是你把**执行**外包给了 Agent，
把**判断**（要不要、对不对、好不好）留给了自己。

## 第 0 步：安装 skills（两分钟）

本仓库的 `skills/` 目录里有四个现成的 skill，把每个文件夹复制进
你的 Agent 技能目录即可：

| skill | 干什么 | 复制到 |
|-------|--------|--------|
| `skills/create-repo/` | 建 GitHub / Gitee 仓库（注册登录会来问你） | `~/.codex/skills/create-repo/` 或 `~/.claude/skills/create-repo/` |
| `skills/deploy/` | 部署 + 完工汇报 | 同上，目录名 `deploy` |
| `skills/writing/` | 按本站规范写作 | 同上，目录名 `writing` |
| `skills/collections/` | 作品加入 Collections | 同上，目录名 `collections` |

对 Agent 说一句验证装好了：

```text
列出你现在可用的技能，有没有 create-repo / deploy / writing / collections？
```

> **写作 skill 是可以换的**：`writing` 里的风格指引只是本仓库的
> 偏好，改成你自己的风格文件即可——这个设计本身就是为了让
> skill 属于你，而不是属于我们。

## 走一遍全程（四站，你出手不超过四次）

```mermaid
flowchart LR
    A["① 建仓库<br/>账号问题它问你答"] --> B["② 部署<br/>完工后它来汇报"]
    B --> C["③ 发文<br/>主题 + 署名"]
    C --> D["④ 加作品<br/>报信息 + 验收"]
    D --> E["成品：你的站<br/>文章 + 作品墙"]
```

### ① 建仓库

```text
用 create-repo 帮我把这个项目推到一个新建的 GitHub 仓库。
```

它先检查环境。缺账号时它会停下来，给你注册链接等你——**这一步
必须你出手**，Agent 永远不会替你碰账号。公开还是私有，它会问你，
一句话解释差别，你选就行。

### ② 部署

```text
用 deploy 把站点部署上线。
```

它会先本地构建（绿了才推），然后推送、等 GitHub Actions 构建，
最后给你一份**人话汇报**：本次改了什么文件、为什么改、
结果在哪个网址。看完这份汇报，你就等于 review 了整个部署。

### ③ 发文

```text
用 writing 帮我发一篇文章。主题：（xxx）。署名：（你的名字）。
```

它会先读站点写作规范再动笔——写完问你"预览一下还是直接发布"。

### ④ 加作品

```text
用 collections 把我的作品加进首页卡片墙。作品名：（xxx），
网址：（xxx），仓库：（xxx），一句话介绍：（xxx）。
```

它按本站真实条目的样子填好 JSON、处理封面（没图就用程序化封面），
起本地预览让你确认。

## 一套下来，你"了解"了什么

不需要再看，但你应该认得——每样东西一句话：

| 出现过的东西 | 一句话 | 需要深究吗 |
|--------------|--------|-----------|
| `package.json` | 项目身份证 + 命令遥控器 | 不用 |
| `pnpm install` | 按清单把依赖装齐 | 不用 |
| `pnpm typecheck` / `build` | 先查错，再打包 | 不用 |
| `git push` | 把改动送上云端 | 不用 |
| GitHub Actions | 云端自动构建的机器人 | 不用 |
| GitHub Pages | 构建产物的展示架 | 不用 |
| `docs/` 与 frontmatter | 文章放哪、文章身份证 | 不用 |

它们连起来就是 Node 打包部署的全部链路：

```
写内容 → typecheck 查错 → build 打包 → push → Actions 云端构建 → Pages 上线
```

想深究任何一环时再看：[Node + TypeScript 入门](../../tutorials/basic/nodejs-typescript-101.md)
讲这些工具是怎么造的，[Markdown 写作指南](../../tutorials/basic/markdown-usage.md)
是站点写作规范的本体。不看也行——你的站已经上线了。

## 最后的验收

手机浏览器打开 `https://你的用户名.github.io/仓库名/`：

- 首页卡片墙上有你的作品；
- 文章列表里有你的文章，署名是你；
- 这一切是你在几次对话里完成的，没有手动碰过一行配置。

**这就是结果。** 这个站现在是你的——继续往里放东西就好。
