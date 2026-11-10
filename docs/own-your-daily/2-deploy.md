---
title: "拥有你自己的 Daily · 2/4 · 如何直接部署"
slug: own-your-daily-2-deploy
date: 2026-11-10
author: Innate Team
category: guide
tags: [own-your-daily, deploy, github-pages, 入门]
status: draft
excerpt: "系列第二篇：把站点放上 GitHub Pages。全程只做三件事：fork、开一次 Pages 开关、推送。之后每次保存文章，网站自动更新。"
---

# 拥有你自己的 Daily · 2/4 · 如何直接部署

这一篇的目标：**你的站有了一个正式网址**，形如
`https://你的用户名.github.io/仓库名/`。

你不需要买服务器，不需要懂运维。网站托管在 GitHub Pages 上，
构建和发布由 GitHub 自动完成。

## 开工前，你只需要两样东西

1. **一个 GitHub 账号**（免费注册）
2. **这个仓库在你名下**——打开仓库页面，右上角 **Fork** 按钮点一下，
   它就复制到了你的账号下

## 它会走的路，先给你看一眼

```mermaid
flowchart LR
    A["① Fork<br/>仓库到你名下"] --> B["② 开 Pages 开关<br/>一次性设置"]
    B --> C["③ 推送任何改动<br/>写文章也算"]
    C --> D["GitHub 自动构建"]
    D --> E["正式网址上线"]
```

## ① Fork

在仓库页面点 **Fork**。默认选项就行，确认后你得到
`github.com/你的用户名/innate-daily`。

> 这个仓库是独立的：所有依赖都在公开 npm 源上，fork 之后
> GitHub 的构建机器直接就能装包构建，不需要任何额外权限或内部配置。
> 这是它作为"给每个人的模板"的底线。

## ② 打开 Pages 开关（只做一次）

在你 fork 的仓库里：**Settings → Pages**，找到 **Build and deployment**，
把 **Source** 选成 **GitHub Actions**。

就这一个开关。仓库已经自带构建脚本（`.github/workflows/deploy-pages.yml`），
GitHub 检测到它会自动执行。

## ③ 推送任何改动

之后每次往 `main` 分支推送改动——无论是写了新文章、改了配置、
还是加了作品——GitHub 都会自动：拉取你的仓库 → 安装依赖 → 构建 → 发布。

**你要做的：** 推送之后等一两分钟，打开仓库的 **Actions** 标签页，
看到最新的运行变成绿色 ✓，就是发布完成了。

## 验收

浏览器打开 `https://你的用户名.github.io/innate-daily/`，
看到站点首页——上线。

用手机也打开一次。这个地址就是你的站，可以写进简历、发给朋友。

## 三个最常见的卡点

| 现象 | 多半是 | 怎么办 |
|------|--------|--------|
| Actions 页面是灰的，没在跑 | Pages 开关没开，或没选 GitHub Actions | 回到 ② 检查 Source |
| Actions 跑完是红色 ✗ | 构建报错（多半是最近改动的格式问题） | 点进失败的运行看红色步骤的日志最后一行 |
| 网址打开是 404 | 部署还没完成，或开关开完还没触发过构建 | 等 2 分钟刷新；还不行手动跑：Actions 页选这个 workflow → Run workflow |

对 AI 编程助手说这一句也能解决大部分问题：

```text
我的 GitHub Actions 部署失败了，帮我打开仓库看看运行日志，
找到失败原因，修好后再推送。
```
