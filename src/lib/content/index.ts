import { writingFiles } from "#writing-files"
import {
  parseWritingFile,
  sortPostsByDate,
  type WritingPost,
} from "./parse-post"
import type { PostMeta } from "./types"

export type { WritingPost }

function allPosts(): WritingPost[] {
  return sortPostsByDate(
    Object.entries(writingFiles).map(([filePath, raw]) =>
      parseWritingFile(filePath, raw)
    )
  )
}

export function getWritingMeta(options?: {
  status?: PostMeta["status"] | "all"
}): WritingPost[] {
  const status = options?.status ?? "published"
  return status === "all" ? allPosts() : allPosts().filter((post) => post.status === status)
}

export function getWriting(slug: string): WritingPost | undefined {
  return allPosts().find((post) => post.slug === slug)
}
