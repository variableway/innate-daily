const docsFiles = import.meta.glob("../../../docs/**/*.{md,mdx}", {
  query: "?raw",
  eager: true,
  import: "default",
}) as Record<string, string>

export const writingSource = "docs" as const

export const writingFiles: Record<string, string> = docsFiles
