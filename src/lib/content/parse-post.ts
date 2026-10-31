import { deriveExcerpt, extractToc, parseFrontmatter } from "./parser"
import type { PostMeta } from "./types"
import {
  resolveWritingSource,
  type WritingSource,
  type WritingVault,
} from "./writing-source"

export type { WritingVault }

export interface WritingPost extends PostMeta {
  slug: string
  type: "md" | "mdx"
  content: string
  toc: Array<{ id: string; text: string; level: number }>
  vault: WritingVault
  folder: string
  /** frontmatter 里声明的原始分类（仅留作参考；分组以目录为准）。 */
  metaCategory?: string
}

export function sourceFromFilePath(
  filePath: string,
  source: WritingSource = resolveWritingSource(import.meta.env.VITE_WRITING_SOURCE)
): {
  vault: WritingVault
  relative: string
} {
  const normalized = filePath.replace(/\\/g, "/")
  const useCasesIdx = normalized.lastIndexOf("/use-cases/")
  const docsIdx = normalized.lastIndexOf("/docs/")
  const contentIdx = normalized.lastIndexOf("/content/")

  if (useCasesIdx >= 0 && useCasesIdx > docsIdx && useCasesIdx > contentIdx) {
    return {
      vault: "use-cases",
      relative: normalized.slice(useCasesIdx + "/use-cases/".length),
    }
  }
  if (docsIdx >= 0 && docsIdx > contentIdx) {
    return {
      vault: "docs",
      relative: normalized.slice(docsIdx + "/docs/".length),
    }
  }
  if (contentIdx >= 0) {
    let relative = normalized.slice(contentIdx + "/content/".length)
    if (relative.startsWith("writing/")) relative = relative.slice("writing/".length)
    return { vault: "content", relative }
  }
  return {
    vault: "content",
    relative: normalized.split("/").pop() ?? "untitled.md",
  }
}

/** @deprecated use sourceFromFilePath().relative */
export function contentRelativePath(filePath: string): string {
  return sourceFromFilePath(filePath).relative
}

export function fallbackSlug(
  filePath: string,
  source?: WritingSource
): string {
  const { vault, relative } = sourceFromFilePath(filePath, source)
  const stem = relative.replace(/\.(md|mdx)$/i, "").replace(/\/+/g, "-")
  return `${vault}-${stem}`
}

function folderFromRelative(relative: string): string {
  const parts = relative.split("/").slice(0, -1)
  return parts.join("/")
}

/**
 * 分类 = 目录第一层（「目录即分类」）。
 * 文档根统一为 docs/ 之后，目录结构本身就是分区，
 * frontmatter 里的 category 不再作为分组维度，只留作参考。
 */
export function categoryFromFolder(folder: string, vault: string): string {
  const first = folder.split("/").filter(Boolean)[0]
  return first || vault
}

function titleFromBody(body: string, filePath: string): string {
  const heading = body.match(/^#\s+(.+)$/m)
  if (heading?.[1]) return heading[1].trim()
  const name = sourceFromFilePath(filePath).relative.split("/").pop() ?? "untitled.md"
  return name.replace(/\.(md|mdx)$/i, "")
}

export function parseWritingFile(
  filePath: string,
  raw: string,
  source?: WritingSource
): WritingPost {
  const name = filePath.split(/[/\\]/).pop() ?? "untitled.md"
  const type: "md" | "mdx" = name.endsWith(".mdx") ? "mdx" : "md"
  const { vault, relative } = sourceFromFilePath(filePath, source)
  const folder = folderFromRelative(relative)
  const { meta, body } = parseFrontmatter(raw)
  const title =
    meta.title && meta.title !== "Untitled" ? meta.title : titleFromBody(body, filePath)
  const category = categoryFromFolder(folder, vault)
  return {
    ...meta,
    title,
    slug: meta.slug || fallbackSlug(filePath, source),
    category,
    metaCategory: meta.category && meta.category !== category ? meta.category : undefined,
    vault,
    folder,
    type,
    content: body,
    toc: extractToc(body),
    excerpt: meta.excerpt || deriveExcerpt(body),
  }
}

export function sortPostsByDate(posts: WritingPost[]): WritingPost[] {
  return [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}
