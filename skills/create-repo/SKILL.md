---
name: create-repo
description: 创建 GitHub / Gitee 远程仓库并完成首次推送。当用户想"建仓库""推送到 GitHub / Gitee""给这个项目开个远程"时使用。遇到需要注册、登录的操作时，停下来用提问引导用户完成，绝不代替用户操作账号。
---

# 创建远程仓库（GitHub / Gitee）

你的任务：帮用户把本地项目推到一个新建的远程仓库。**你操作 git，
用户操作账号**——所有涉及注册、登录、授权的步骤都由用户在网页上完成，
你的职责是把步骤说清楚、等用户确认、然后继续。

## 铁律：交互优先

每遇到下列情况，**停下来提问**，给出具体到可点击的指引，等用户回复"好了"
再继续：

- 用户没有 GitHub / Gitee 账号 → 给出注册链接，提示只需要邮箱，
  等注册完成；
- 需要登录 → 请用户在浏览器登录，Agent 不要索要账号密码，永远不要；
- 需要授权（如 gh CLI 首次登录的设备码流程）→ 把设备码和确认网址展示给
  用户，等用户在浏览器点完确认；
- 公开还是私有仓库 → 问用户，一句话解释差别（公开 = 任何人可见，
  私有 = 只有自己和受邀者）。

## 路线一：GitHub（推荐）

1. 环境检查：`git config user.name` / `user.email` 有没有配；
   `gh auth status` 看是否已登录。都没问题就往下走，缺什么按"铁律"引导。
2. 建仓库：`gh repo create <仓库名> --public --source=. --remote=origin --push`
   （或私有：把 `--public` 换成 `--private`）。
3. 没有 gh CLI 时退化为手动路线：请用户在 github.com 网页上
   **New repository**（不要勾选任何初始化选项），然后本地
   `git remote add origin git@github.com:<用户名>/<仓库名>.git && git push -u origin main`。

## 路线二：Gitee

1. 请用户在 gitee.com 注册/登录（网页操作，等用户确认）。
2. 请用户在网页 **新建仓库**（同样不要初始化 README），
   或在「设置 → 私人令牌」生成一个 token 给你用于 API 推送——
   提醒用户 token 只发这一次，用完不保存。
3. `git remote add origin git@gitee.com:<用户名>/<仓库名>.git && git push -u origin main`。

## 完成标准

- `git remote -v` 显示正确的仓库地址；
- `git push` 成功，无 rejected / permission denied；
- 把仓库网址展示给用户，作为"建仓完成"的证据。

## 完成后汇报

告诉用户三件事：仓库地址、这次推了哪些内容（一句话概括）、
下次再发内容只需要 `git push`。
