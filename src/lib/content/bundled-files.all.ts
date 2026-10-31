/**
 * 全部文档内容统一从仓库的 docs/ 读取。
 *
 * docs/ 是唯一的文档根，其下的子目录决定 vault（见 parse-post.ts）：
 * - docs/content/**  → vault "content"（调研笔记）
 * - docs/use-cases/** → vault "use-cases"（自建指南 / 工具链用法）
 *
 * VITE_WRITING_SOURCE 可把范围收窄到某个子树：
 * - 未设置 / "all" → docs/**
 * - "docs"         → docs/content/**
 * - "use-cases"    → docs/use-cases/**
 */
const docsFiles = import.meta.glob("../../../docs/**/*.{md,mdx}", {
  query: "?raw",
  eager: true,
  import: "default",
}) as Record<string, string>

export const writingSource = "all" as const

export const writingFiles: Record<string, string> = docsFiles
