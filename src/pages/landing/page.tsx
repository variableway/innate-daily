import { useMemo } from "react"
import { useNavigate } from "@tanstack/react-router"
import { ArrowRight, PenLine } from "lucide-react"
import { Badge, Button, ThemeSelector } from "@innate/ui"
import { GalleryCard } from "../../components/landing/gallery-card"
import {
  WritingEmptyState,
  WritingErrorState,
  WritingLoadingState,
} from "../../components/writing/writing-status"
import { useWritingContent } from "../../lib/content/use-writing-content"
import { buildFolderTree } from "../../lib/writing/folder-tree"
import { countByCategory, postFolderId } from "../../lib/writing/filter-posts"
import { labelChipStyle } from "../../lib/writing/label-color"
import { categoryMeta } from "../../lib/writing/category-meta"
import { getAllCollections } from "../../lib/collections/data"

/**
 * Landing：画廊式首页。
 * - Collections（AI 生成的站点收藏）作为独立展区放在最前。
 * - Notes（内容目录）作为独立展区放在下面，点击携带 ?folder= 进入 /writing 列表。
 * - Categories chips 同理携带 ?category=。
 */
export function LandingPage() {
  const { posts, loading, error } = useWritingContent()
  const navigate = useNavigate()

  const folders = useMemo(() => buildFolderTree(posts), [posts])
  const categories = useMemo(() => countByCategory(posts), [posts])
  const collections = useMemo(() => getAllCollections(), [])

  /** 各展区的最新文章标题（按日期倒序取 3 条）。 */
  const latestByFolder = useMemo(() => {
    const map = new Map<string, string[]>()
    const sorted = [...posts].sort((a, b) => (a.date < b.date ? 1 : -1))
    for (const node of folders) {
      map.set(
        node.id,
        sorted
          .filter((post) => {
            const id = postFolderId(post)
            return id === node.id || id.startsWith(`${node.id}/`)
          })
          .slice(0, 3)
          .map((post) => post.title)
      )
    }
    return map
  }, [posts, folders])

  if (loading) return <WritingLoadingState />
  if (error) return <WritingErrorState message={error} />
  if (posts.length === 0) {
    return <WritingEmptyState message="No published posts." />
  }

  function openFolder(id: string) {
    navigate({ to: "/writing", search: { folder: id } })
  }

  function openCategory(id: string) {
    navigate({ to: "/writing", search: { category: id } })
  }

  return (
    <div className="bg-background flex h-full min-h-0 flex-col overflow-hidden">
      <header className="border-border flex h-12 shrink-0 items-center gap-2 border-b px-4 sm:px-6">
        <PenLine className="size-4" data-icon />
        <span className="text-sm font-semibold">Innate Notes</span>
        <div className="ml-auto">
          <ThemeSelector />
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-10 sm:px-6 sm:py-14">
          <section className="flex flex-col gap-3">
            <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
              Notes, curated like a gallery.
            </h1>
            <p className="text-muted-foreground max-w-xl text-sm leading-relaxed sm:text-base">
              Collections 在前，Notes 在后。
              共 {posts.length} 篇笔记，{folders.length} 个目录，
              {categories.length} 个分类，{collections.length} 个收藏。
            </p>
            <div className="mt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ to: "/writing", search: {} })}
              >
                进入全部笔记
                <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
          </section>

          {collections.length > 0 ? (
            <section className="flex flex-col gap-3">
              <h2 className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                Collections
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {collections.map((item) => (
                  <GalleryCard
                    key={item.id}
                    name={item.title}
                    count={item.tags.length}
                    latest={[item.description, ...item.tags]}
                    onOpen={() => navigate({ to: "/collections" })}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section className="flex flex-col gap-3">
            <h2 className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
              Notes
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {folders.map((node) => (
                <GalleryCard
                  key={node.id}
                  name={node.name}
                  count={node.count}
                  latest={latestByFolder.get(node.id) ?? []}
                  onOpen={() => openFolder(node.id)}
                />
              ))}
            </div>
          </section>

          {categories.length > 0 ? (
            <section className="flex flex-col gap-3">
              <h2 className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                Categories
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((category) => (
                  <Badge
                    key={category.id}
                    variant="outline"
                    className="label-chip cursor-pointer"
                    style={labelChipStyle(category.id, categoryMeta(category.id).hue)}
                    onClick={() => openCategory(category.id)}
                  >
                    {category.id}
                    <span className="ml-1 tabular-nums opacity-70">
                      {category.count}
                    </span>
                  </Badge>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  )
}
