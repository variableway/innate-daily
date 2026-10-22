import type { PostMeta } from "./types"

/**
 * 统一换行符：Windows 检出（core.autocrlf=true）下 markdown 是 CRLF，
 * 而 `.` 不匹配 \r、`$` 也不在 \r 前结束，直接按 "\n" 切行会让
 * frontmatter 与标题匹配全部落空（标题退化成文件名）。
 */
function normalizeEol(content: string): string {
  return content.replace(/\r\n/g, "\n")
}

function unquote(value: string): string {
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

function parseYamlValue(raw: string): unknown {
  const value = raw.trim()
  if (!value || value === "null" || value === "~") return undefined
  if (value === "true") return true
  if (value === "false") return false
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value)
  if (value.startsWith("[") && value.endsWith("]")) {
    return value
      .slice(1, -1)
      .split(",")
      .map((item) => unquote(item))
      .filter((item) => item.length > 0)
  }
  return unquote(value)
}

function parseYamlBlock(block: string): Record<string, unknown> {
  const data: Record<string, unknown> = {}
  for (const line of block.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (!match?.[1]) continue
    const parsed = parseYamlValue(match[2] ?? "")
    if (parsed !== undefined) data[match[1]] = parsed
  }
  return data
}

export function parseFrontmatter(content: string): { meta: PostMeta; body: string } {
  // Windows 检出（core.autocrlf=true）下是 CRLF，且可能带 BOM：
  // 先剥 BOM、统一成 LF，后续按行匹配才不会整体落空。
  const normalized = normalizeEol(content.replace(/^﻿/, ""))
  const match = normalized.match(/^--- ?\n([\s\S]*?)\n--- ?\n?([\s\S]*)$/)
  const data = match?.[1] ? parseYamlBlock(match[1]) : {}
  const body = (match?.[2] ?? normalized).trim()

  const tags = uniqueStrings([
    ...stringList(data.tags),
    ...stringList(data.label),
    ...stringList(data.labels),
  ])

  return {
    meta: {
      title: String(data.title || "Untitled"),
      slug: String(data.slug || ""),
      date: String(data.date || new Date().toISOString()),
      updated: data.updated ? String(data.updated) : undefined,
      author: String(data.author || "Anonymous"),
      category: data.category ? String(data.category) : "",
      tags,
      excerpt: data.excerpt ? String(data.excerpt) : undefined,
      cover: data.cover ? String(data.cover) : undefined,
      featured: Boolean(data.featured),
      editorsPick: Boolean(data.editorsPick),
      readingTime:
        typeof data.readingTime === "number"
          ? data.readingTime
          : estimateReadingTime(body),
      status:
        data.status === "draft" || data.status === "archived"
          ? data.status
          : "published",
    },
    body,
  }
}

/**
 * 从正文派生摘要：跳过标题与代码块，取第一个自然段，
 * 去掉链接、行内代码、强调等 markdown 记号后截断。
 */
export function deriveExcerpt(content: string, maxLength = 120): string {
  const paragraph: string[] = []
  let inFence = false

  for (const line of normalizeEol(content).split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
      if (paragraph.length > 0) break
      inFence = !inFence
      continue
    }
    if (inFence) continue

    const text = line.trim()
    if (!text) {
      if (paragraph.length > 0) break
      continue
    }
    if (/^#{1,6}\s/.test(text)) {
      if (paragraph.length > 0) break
      continue
    }
    paragraph.push(text)
  }

  const raw = paragraph
    .join(" ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/<\/?[A-Za-z][^>]*>/g, "")
    .replace(/[*_~]+/g, "")
    .replace(/\s+/g, " ")
    .trim()

  if (!raw) return ""
  if (raw.length <= maxLength) return raw
  return `${raw.slice(0, maxLength).trimEnd()}…`
}

export function extractToc(
  content: string
): Array<{ level: number; text: string; id: string }> {  const headings: Array<{ level: number; text: string; id: string }> = []
  const seenIds = new Map<string, number>()
  const lines = normalizeEol(content).split("\n")

  for (const line of lines) {
    const heading = line.match(/^(#{2,3})\s+(.+)$/)
    if (heading?.[1] && heading[2]) {
      const level = heading[1].length
      const text = heading[2].trim()
      let id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")

      const seenCount = seenIds.get(id) || 0
      seenIds.set(id, seenCount + 1)
      if (seenCount > 0) {
        id = `${id}-${seenCount}`
      }

      headings.push({ level, text, id })
    }
  }

  return headings
}

function estimateReadingTime(content: string): number {
  const wordCount = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(wordCount / 200))
}

export function parseMatter(raw: string): {
  data: Record<string, unknown>
  content: string
} {
  const normalized = normalizeEol(raw)
  const match = normalized.match(/^--- ?\n([\s\S]*?)\n--- ?\n?([\s\S]*)$/)
  if (!match?.[1]) return { data: {}, content: raw }
  return { data: parseYamlBlock(match[1]), content: match[2] ?? "" }
}

function stringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter((item) => item.length > 0)
  if (typeof value === "string" && value.trim()) return [value.trim()]
  return []
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)]
}
