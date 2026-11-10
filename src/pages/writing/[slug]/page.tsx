import { buttonVariants, cn } from "@ui"
import { useParams } from "../../../lib/routing"
import { BlogViewer } from "../../../components/writing/blog-viewer"
import { AppLink as Link } from "../../../lib/routing"
import { useWritingContent } from "../../../lib/content/use-writing-content"
import {
  WritingEmptyState,
  WritingErrorState,
  WritingLoadingState,
} from "../../../components/writing/writing-status"

export function WritingDetailPage() {
  const { slug } = useParams()
  const { posts, loading, error } = useWritingContent()
  const post = slug ? posts.find((item) => item.slug === slug) : undefined

  if (loading) return <WritingLoadingState />
  if (error) return <WritingErrorState message={error} />
  if (!post) {
    return <WritingEmptyState message="Post not found." />
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 px-6 pt-4">
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          Back to notes
        </Link>
      </div>
      <div className="min-h-0 flex-1">
        <BlogViewer
          title={post.title}
          content={post.content}
          excerpt={post.excerpt || ""}
          date={new Date(post.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
          author={post.author}
          category={post.category}
          tags={post.tags}
          readingTime={post.readingTime || 1}
          toc={post.toc}
          showToc
        />
      </div>
    </div>
  )
}
