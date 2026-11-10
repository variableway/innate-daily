import { getWritingMeta } from "./index"
import type { WritingPost } from "./parse-post"
import type { PostMeta } from "./types"

export function useWritingContent(status: PostMeta["status"] | "all" = "all"): {
  posts: WritingPost[]
  loading: boolean
  error: string | null
} {
  return {
    posts: getWritingMeta({ status }),
    loading: false,
    error: null,
  }
}
