import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Globe, Sparkles, X } from "lucide-react"
import {
  Button,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  ThemeSelector,
  cn,
  useIsMobile,
} from "@innate/ui"
import type { CollectionItem } from "../../lib/collections/types"
import { labelChipStyle } from "../../lib/writing/label-color"
import { CollectionsCardGrid } from "./collections-card-grid"
import { CollectionsList } from "./collections-list"
import { CollectionViewer } from "./collection-viewer"

const PAGE_SIZE = 10

/** 筛选状态由 URL search params 承载（见 router.tsx 的 validateCollectionsSearch），
    与 /writing 列表同一套交互模型，可从外链直接带筛选进入。 */
export interface CollectionsFilter {
  category?: string
  tag?: string
  source?: string
  /** "true" 时只保留精选（featured）条目。 */
  featured?: string
}

interface CollectionsPageClientProps {
  collections: CollectionItem[]
  categories: string[]
  tags: string[]
  sources: string[]
  filters: CollectionsFilter
  onFiltersChange: (next: CollectionsFilter) => void
}

export function CollectionsPageClient({
  collections,
  categories,
  tags,
  sources,
  filters,
  onFiltersChange,
}: CollectionsPageClientProps) {
  const isMobile = useIsMobile()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isMobileDetail, setIsMobileDetail] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const filterTag = filters.tag ?? null
  const filterCategory = filters.category ?? null
  const filterSource = filters.source ?? null
  const filterFeatured = filters.featured === "true"

  const filteredCollections = useMemo(() => {
    return collections.filter((item) => {
      if (filterCategory && item.category !== filterCategory) return false
      if (filterTag && !item.tags.includes(filterTag)) return false
      if (filterSource && item.source !== filterSource) return false
      if (filterFeatured && !item.featured) return false
      return true
    })
  }, [collections, filterCategory, filterTag, filterSource, filterFeatured])

  // 分页只在列表模式下生效（选中条目后的左侧窄列表）
  const totalPages = Math.ceil(filteredCollections.length / PAGE_SIZE)
  const paginatedItems = useMemo(() => {
    if (activeId === null) return filteredCollections // 卡片模式全部展示
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredCollections.slice(start, start + PAGE_SIZE)
  }, [filteredCollections, currentPage, activeId])

  // 筛选变化时重置分页
  useEffect(() => {
    setCurrentPage(1)
  }, [filterCategory, filterTag, filterSource, filterFeatured])

  const activeItem = filteredCollections.find((c) => c.id === activeId) || null

  function handleSelect(id: string) {
    setActiveId(id)
    setCurrentPage(1)
    if (isMobile) {
      setIsMobileDetail(true)
    }
  }

  function handleBack() {
    setActiveId(null)
    setIsMobileDetail(false)
  }

  const hasFilter = filterTag || filterCategory || filterSource || filterFeatured

  return (
    <div className="bg-background flex h-full min-h-0 flex-col overflow-hidden">
      {/* 页头：与站内 Writing / Landing 页同构（h-12 + ThemeSelector） */}
      <div className="border-border border-b">
        <div className="flex h-12 shrink-0 items-center gap-2 px-4 sm:px-6">
          <Globe className="text-muted-foreground size-4" data-icon />
          <div className="min-w-0">
            <span className="text-foreground text-sm font-semibold">Collections</span>
            <p className="text-muted-foreground truncate text-[11px] leading-tight">
              Random ideas and experiments from AI agents.
            </p>
          </div>
          <div className="ml-auto">
            <ThemeSelector />
          </div>
        </div>

        {/* 筛选栏：source / category / featured / tag 各自独立开关。
            未选中 chip 走 label-chip 哈希配色（与侧栏分类、landing chips 同语言），选中反色。 */}
        <div className="px-4 pb-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-1.5">
            {sources.map((source) => (
              <button
                key={source}
                type="button"
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    source: filterSource === source ? undefined : source,
                  })
                }
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors",
                  filterSource === source
                    ? "bg-foreground text-background border-transparent"
                    : "label-chip hover:opacity-80"
                )}
                style={filterSource === source ? undefined : labelChipStyle(source)}
              >
                {source}
              </button>
            ))}

            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    category: filterCategory === cat ? undefined : cat,
                  })
                }
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors",
                  filterCategory === cat
                    ? "bg-foreground text-background border-transparent"
                    : "label-chip hover:opacity-80"
                )}
                style={filterCategory === cat ? undefined : labelChipStyle(cat)}
              >
                {cat}
              </button>
            ))}

            <button
              type="button"
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  featured: filterFeatured ? undefined : "true",
                })
              }
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors",
                filterFeatured
                  ? "bg-foreground text-background border-transparent"
                  : "bg-primary/10 text-primary hover:bg-primary/20 border-transparent"
                )}
            >
              <Sparkles className="h-2.5 w-2.5" data-icon />
              Featured
            </button>

            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    tag: filterTag === tag ? undefined : tag,
                  })
                }
                className={cn(
                  "bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground rounded-full px-2 py-0.5 text-[10px] transition-colors",
                  filterTag === tag && "bg-foreground text-background hover:bg-foreground"
                )}
              >
                #{tag}
              </button>
            ))}

            {hasFilter && (
              <>
                <span className="text-muted-foreground/60 self-center text-xs tabular-nums">
                  {filteredCollections.length}/{collections.length}
                </span>
                <button
                  type="button"
                  onClick={() => onFiltersChange({})}
                  className="text-primary hover:text-primary/80 flex items-center gap-1 self-center text-xs transition-colors"
                >
                  <X className="h-3 w-3" />
                  Clear
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 内容区 */}
      {activeId === null ? (
        /* 卡片模式（默认，未选中条目） */
        <div className="min-h-0 flex-1 overflow-y-auto">
          {filteredCollections.length > 0 ? (
            <CollectionsCardGrid
              items={filteredCollections}
              onSelect={handleSelect}
              onTagClick={(tag) => onFiltersChange({ ...filters, tag })}
            />
          ) : (
            <Empty className="h-full border-0">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Globe />
                </EmptyMedia>
                <EmptyTitle>No items match</EmptyTitle>
                <EmptyDescription>
                  Try another source, category, or tag.
                </EmptyDescription>
              </EmptyHeader>
              <Button type="button" variant="ghost" size="sm" onClick={() => onFiltersChange({})}>
                Clear filters
              </Button>
            </Empty>
          )}
        </div>
      ) : (
        /* 列表 + 查看器模式（选中条目后） */
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* 左列：窄列表 */}
          <div
            className={cn(
              "border-border flex w-full shrink-0 flex-col border-r md:w-56 lg:w-64",
              isMobileDetail ? "hidden md:flex" : "flex"
            )}
          >
            <div className="border-border border-b px-3 py-2">
              <button
                type="button"
                onClick={handleBack}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
              >
                <ChevronLeft className="h-3 w-3" />
                Back to grid
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-2 py-1">
              {paginatedItems.length > 0 ? (
                <CollectionsList
                  items={paginatedItems}
                  activeId={activeId}
                  onSelect={handleSelect}
                  onTagClick={(tag) => onFiltersChange({ ...filters, tag })}
                />
              ) : (
                <div className="text-muted-foreground flex flex-col items-center justify-center py-12">
                  <Globe className="mb-2 h-8 w-8 opacity-30" />
                  <p className="text-sm">No items</p>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="border-border border-t px-3 py-2 flex items-center justify-between">
                <span className="text-muted-foreground text-[10px] tabular-nums">
                  {currentPage}/{totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className={cn(
                      "rounded p-1 transition-colors",
                      currentPage <= 1
                        ? "text-muted-foreground/30 cursor-not-allowed"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className={cn(
                      "rounded p-1 transition-colors",
                      currentPage >= totalPages
                        ? "text-muted-foreground/30 cursor-not-allowed"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 右列：查看器（iframe 预览） */}
          <div
            className={cn(
              "min-h-0 flex-1 overflow-hidden",
              isMobileDetail ? "block" : "hidden md:block"
            )}
          >
            {activeItem ? (
              <CollectionViewer
                item={activeItem}
                onBack={handleBack}
                isMobile={isMobileDetail}
                onTagClick={(tag) => onFiltersChange({ ...filters, tag })}
              />
            ) : (
              <Empty className="h-full border-0">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Globe />
                  </EmptyMedia>
                  <EmptyTitle>Select an item</EmptyTitle>
                  <EmptyDescription>
                    Choose a collection from the list.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
