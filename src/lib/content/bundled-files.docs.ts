/**
 * docs 构建模式：读 docs/ 下除 use-cases 外的全部展区
 * （tutorials / research / ideas …）。
 * 目录结构本身即是分区，见 parse-post.ts 的 vault 推导。
 */
const docFiles = {
  ...import.meta.glob("../../../docs/tutorials/**/*.{md,mdx}", {
    query: "?raw",
    eager: true,
    import: "default",
  }),
  ...import.meta.glob("../../../docs/research/**/*.{md,mdx}", {
    query: "?raw",
    eager: true,
    import: "default",
  }),
  ...import.meta.glob("../../../docs/ideas/**/*.{md,mdx}", {
    query: "?raw",
    eager: true,
    import: "default",
  }),
} as Record<string, string>

export const writingSource = "docs" as const

export const writingFiles: Record<string, string> = docFiles
