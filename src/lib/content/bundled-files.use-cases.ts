/**
 * use-cases 构建模式：只读 docs/use-cases/（自建指南 / 工具链用法）。
 */
const useCaseFiles = import.meta.glob("../../../docs/use-cases/**/*.{md,mdx}", {
  query: "?raw",
  eager: true,
  import: "default",
}) as Record<string, string>

export const writingSource = "use-cases" as const

export const writingFiles: Record<string, string> = useCaseFiles
