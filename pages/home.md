# Innate Daily

写作与内容浏览工作台的首页。

这里聚合本仓的内容源：

- **/writing** —— 三栏写作台：目录树、文章列表、正文预览
- **content/research/** —— 调研笔记（UI / 字体 / 站点分析等）
- **use-cases/** —— 自建指南与工具链用法

## 快速开始

```bash
./dev.sh            # 本地开发（:4016）
pnpm build          # 构建静态站 → dist/
```

或用 innate-fe-cli 打包 GitHub Pages 产物（见 `use-cases/fe-cli-pages-pack.md`）：

```bash
innate-fe-cli pages pack --dir <本仓路径>
```
