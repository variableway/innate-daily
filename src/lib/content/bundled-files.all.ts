const docsFiles = import.meta.glob("../../../docs/**/*.{md,mdx}", {
  query: "?raw",
  eager: true,
  import: "default",
}) as Record<string, string>

const contentFiles = import.meta.glob("../../../content/**/*.{md,mdx}", {
  query: "?raw",
  eager: true,
  import: "default",
}) as Record<string, string>

const useCaseFiles = import.meta.glob("../../../use-cases/**/*.{md,mdx}", {
  query: "?raw",
  eager: true,
  import: "default",
}) as Record<string, string>

export const writingSource = "all" as const

export const writingFiles: Record<string, string> = {
  ...contentFiles,
  ...docsFiles,
  ...useCaseFiles,
}
