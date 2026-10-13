import { useNavigate, useSearch } from "@tanstack/react-router"
import { BlogPageClient } from "../../components/writing/blog-page-client"
import {
  WritingEmptyState,
  WritingErrorState,
  WritingLoadingState,
} from "../../components/writing/writing-status"
import { useWritingContent } from "../../lib/content/use-writing-content"
import type { WritingSearch } from "../../router"

export function WritingPage() {
  const { posts, loading, error } = useWritingContent()
  const search = useSearch({ strict: false }) as WritingSearch
  const navigate = useNavigate()

  if (loading) return <WritingLoadingState />
  if (error) return <WritingErrorState message={error} />
  if (posts.length === 0) {
    return <WritingEmptyState message="No published posts." />
  }

  const list = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || "",
    date: new Date(post.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    category: post.category,
    tags: post.tags,
    readingTime: post.readingTime || 1,
    author: post.author,
    content: post.content,
    toc: post.toc,
    type: post.type,
    vault: post.vault,
    folder: post.folder,
  }))

  return (
    <BlogPageClient
      posts={list}
      filters={search}
      onFiltersChange={(next) => {
        // search params 不接受 null：空值统一转成 undefined（即从 URL 移除）。
        navigate({
          to: "/writing",
          search: {
            folder: next.folder ?? undefined,
            category: next.category ?? undefined,
            tag: next.tag ?? undefined,
          },
          replace: true,
        })
      }}
    />
  )
}
