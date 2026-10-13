export type WritingSource = "all" | "use-cases" | "docs"
export type WritingVault = "content" | "docs" | "use-cases"

export function resolveWritingSource(raw: string | undefined): WritingSource {
  if (raw === "docs") return "docs"
  if (raw === "use-cases") return "use-cases"
  return "all"
}
