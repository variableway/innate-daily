/**
 * docs 构建模式：只读 docs/content/（调研笔记）。
 * 目录结构本身即是分区，见 parse-post.ts 的 vault 推导。
 */
const contentFiles = import.meta.glob("../../../docs/content/**/*.{md,mdx}", {
  query: "?raw",
  eager: true,
  import: "default",
}) as Record<string, string>

export const writingSource = "docs" as const

export const writingFiles: Record<string, string> = contentFiles
