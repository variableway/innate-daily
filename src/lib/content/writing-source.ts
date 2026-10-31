export type WritingSource = "all" | "use-cases" | "docs"
export type WritingVault = "content" | "docs" | "use-cases"

/**
 * 内容源模式。文档根已统一为 docs/，模式只决定读 docs/ 的哪棵子树：
 * - all（默认）→ docs/**
 * - docs → docs/content/**
 * - use-cases → docs/use-cases/**
 */
export function resolveWritingSource(raw: string | undefined): WritingSource {
  if (raw === "docs") return "docs"
  if (raw === "use-cases") return "use-cases"
  return "all"
}
