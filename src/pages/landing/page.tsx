import { useMemo } from "react"
import { useNavigate } from "@tanstack/react-router"
import { SoftArrowRight, SoftArrowUpRight } from "../../components/icons/soft-icons"
import { Badge, Button, ThemeSelector } from "@ui"
import { GalleryCard } from "../../components/landing/gallery-card"
import {
  WritingEmptyState,
  WritingErrorState,
  WritingLoadingState,
} from "../../components/writing/writing-status"
import { useWritingContent } from "../../lib/content/use-writing-content"
import { countByCategory, postZoneId } from "../../lib/writing/filter-posts"
import { labelChipStyle, labelColorValue } from "../../lib/writing/label-color"
import { categoryMeta } from "../../lib/writing/category-meta"
import { collectionCoverUrl } from "../../lib/collections/cover"
import { coverArtSvg } from "../../lib/landing/cover-art"
import { getAllCollections } from "../../lib/collections/data"

/**
 * Landing：画廊式首页。
 * - 作品（Collections）作为独立展区放在最前：卡片可跳转作品墙，
 *   并展示「n 篇相关笔记」——按作品 tags 与笔记 tags 的交集计算，
 *   点击携带 ?tag= 进入 /writing 列表。
 * - 展区（docs/ 第一层目录 + use-cases）作为 Notes 画廊，点击携带 ?folder=。
 * - Categories chips 同理携带 ?category=。
 */
export function LandingPage() {
  const { posts, loading, error } = useWritingContent()
  const navigate = useNavigate()

  const categories = useMemo(() => countByCategory(posts), [posts])
  const collections = useMemo(() => getAllCollections(), [])

  /** 展区（zone）：docs/ 第一层目录 + use-cases，label 剥掉 docs/ 前缀。 */
  const zoneGroups = useMemo(() => {
    const map = new Map<string, typeof posts>()
    for (const post of posts) {
      const id = postZoneId(post)
      map.set(id, [...(map.get(id) ?? []), post])
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, list]) => ({
        id,
        name: id.replace(/^docs\//, ""),
        count: list.length,
        latest: [...list]
          .sort((a, b) => (a.date < b.date ? 1 : -1))
          .slice(0, 3)
          .map((post) => post.title),
      }))
  }, [posts])

  /** 作品 → 相关笔记：笔记 tags 与作品 tags 的交集；顺带给出跳转用的 tag。 */
  const relatedByCollection = useMemo(() => {
    const map = new Map<string, { count: number; tag: string | null }>()
    for (const item of collections) {
      const matched = posts.filter((post) =>
        post.tags.some((tag) => item.tags.includes(tag))
      )
      const tag =
        item.tags.find((t) => matched.some((post) => post.tags.includes(t))) ?? null
      map.set(item.id, { count: matched.length, tag })
    }
    return map
  }, [posts, collections])

  if (loading) return <WritingLoadingState />
  if (error) return <WritingErrorState message={error} />
  if (posts.length === 0) {
    return <WritingEmptyState message="No published posts." />
  }

  function openZone(id: string) {
    navigate({ to: "/writing", search: { folder: id } })
  }

  function openCategory(id: string) {
    navigate({ to: "/writing", search: { category: id } })
  }

  return (
    <div className="bg-background flex h-full min-h-0 flex-col overflow-hidden">
      <header className="border-border flex h-12 shrink-0 items-center gap-2 border-b px-4 sm:px-6">
        <span className="text-muted-foreground hidden text-sm font-semibold sm:inline">
          Innate Notes
        </span>
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
              作品在前，展区在后。
              共 {posts.length} 篇笔记，{zoneGroups.length} 个展区，
              {categories.length} 个分类，{collections.length} 个作品。
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ to: "/writing", search: {} })}
              >
                进入全部笔记
                <SoftArrowRight data-icon="inline-end" />
              </Button>
              {collections.length > 0 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate({ to: "/collections", search: {} })}
                >
                  进入全部作品
                  <SoftArrowRight data-icon="inline-end" />
                </Button>
              ) : null}
            </div>
          </section>

          {collections.length > 0 ? (
            <section className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                  Collections · 作品
                </h2>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs transition-colors"
                  onClick={() => navigate({ to: "/collections", search: {} })}
                >
                  查看全部
                  <SoftArrowRight className="size-3.5" data-icon />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {collections.map((item) => {
                  const meta = categoryMeta(item.category)
                  const related = relatedByCollection.get(item.id)
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className="plaza-card collection-card"
                      data-tile={item.id}
                      onClick={() => navigate({ to: "/collections", search: {} })}
                    >
                      {item.thumbnail ? (
                        <span
                          className="plaza-media collection-cover"
                          style={{
                            backgroundImage: `url(${collectionCoverUrl(item.thumbnail)})`,
                          }}
                          aria-hidden="true"
                        />
                      ) : (
                        <span
                          className="plaza-media"
                          aria-hidden="true"
                          dangerouslySetInnerHTML={{
                            __html: coverArtSvg(item.title, meta.hue, { slice: true }),
                          }}
                        />
                      )}
                      <div className="plaza-card-body">
                        <div className="plaza-kicker">
                          <span style={{ color: labelColorValue(item.category, meta.hue) }}>
                            {item.category}
                          </span>
                          <span className="plaza-dot" aria-hidden="true" />
                          <span>{item.date}</span>
                        </div>
                        <h3 className="plaza-title">{item.title}</h3>
                        <p className="plaza-judgment">{item.description}</p>
                        <div className="plaza-chips">
                          {item.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="label-chip"
                              style={labelChipStyle(tag)}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        {related && related.count > 0 ? (
                          <span
                            role="button"
                            tabIndex={0}
                            title={`按 tag「${related.tag}」筛选相关笔记`}
                            className="text-muted-foreground hover:text-foreground mt-1 inline-flex cursor-pointer items-center gap-1 text-xs transition-colors"
                            onClick={(event) => {
                              event.stopPropagation()
                              if (related.tag) {
                                navigate({
                                  to: "/writing",
                                  search: { tag: related.tag },
                                })
                              }
                            }}
                          >
                            {related.count} 篇相关笔记
                            <SoftArrowRight className="size-3.5" data-icon />
                          </span>
                        ) : null}
                      </div>
                      <span className="plaza-go" aria-hidden="true">
                        <SoftArrowUpRight size={14} />
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          ) : null}

          <section className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                Notes
              </h2>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs transition-colors"
                onClick={() => navigate({ to: "/writing", search: {} })}
              >
                查看全部
                <SoftArrowRight className="size-3.5" data-icon />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {zoneGroups.map((zone) => (
                <GalleryCard
                  key={zone.id}
                  name={zone.name}
                  count={zone.count}
                  latest={zone.latest}
                  onOpen={() => openZone(zone.id)}
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
                    style={labelChipStyle(category.id)}
                    onClick={() => openCategory(category.id)}
                  >
                    {category.id}
                    <span className="text-muted-foreground ml-1 tabular-nums">
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
