import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type Ref,
} from "react"
import {
  Button,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Kbd,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  ThemeSelector,
  cn,
  useIsMobile,
} from "@innate/ui"
import { useNavigate } from "@tanstack/react-router"
import type { CollectionItem } from "../../lib/collections/types"
import { CollectionsList } from "./collections-list"
import { CollectionsCards } from "./collections-cards"
import { CollectionViewer } from "./collection-viewer"
import { AppSwitcher } from "../app-switcher"
import { PanelIcon } from "../panel-icon"
import { LayoutCapsule, type LayoutMode } from "../layout-capsule"
import {
  SoftGlobe,
  SoftLayers,
  SoftSearch,
  SoftStar,
  type SoftIcon,
} from "../icons/soft-icons"
import { labelColorValue } from "../../lib/writing/label-color"
import { prettyLabel } from "../../lib/writing/pretty-label"
import { sourceIcon, sourceLabel } from "../../lib/collections/source"
import { categoryMeta } from "../../lib/writing/category-meta"
import { getWritingMeta } from "../../lib/content"
import type { WritingPost } from "../../lib/content/parse-post"
import { useMediaQuery } from "../../lib/use-media-query"

/** 侧栏最多两个 recent 列表（Recent items / Recent notes），每个最多 5 条。 */
const RECENT_LIMIT = 5

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
  sources: string[]
  filters: CollectionsFilter
  onFiltersChange: (next: CollectionsFilter) => void
}

type NavPanelHandle = NonNullable<
  ComponentProps<typeof ResizablePanel>["panelRef"]
> extends Ref<infer T>
  ? T
  : never

/** /collections：与 /writing（content 模块）同构的三栏布局——
    侧栏筛选 + 中列列表 + 右侧 iframe 查看器，宽屏可拖拽、中屏 Sheet、窄屏双态切换。 */
export function CollectionsPageClient({
  collections,
  categories,
  sources,
  filters,
  onFiltersChange,
}: CollectionsPageClientProps) {
  // collections 已由 data.ts 按日期倒序，「最近」段直接取前 5 条（与 /writing 一致）。
  const recent = useMemo(() => collections.slice(0, RECENT_LIMIT), [collections])
  // 日常笔记同样按日期倒序，取最新 5 条；点进去深链到 /writing?slug=。
  const recentNotes = useMemo(
    () => getWritingMeta({ status: "published" }).slice(0, RECENT_LIMIT),
    []
  )
  const isMobile = useIsMobile()
  const isWide = useMediaQuery("(min-width: 1280px)")
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const filterTag = filters.tag ?? null
  const filterCategory = filters.category ?? null
  const filterSource = filters.source ?? null
  const filterFeatured = filters.featured === "true"
  const [activeId, setActiveId] = useState(collections[0]?.id ?? "")
  const [mobileDetail, setMobileDetail] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  // 条目区展示形态：默认卡片墙，胶囊可切到紧凑列表（与 /writing 的 Plaza 同款交互）。
  const [stage, setStage] = useState<LayoutMode>("cards")
  const navPanelRef = useRef<NavPanelHandle | null>(null)
  const [navCollapsed, setNavCollapsed] = useState(false)

  const countBy = useMemo(() => {
    const byCategory = new Map<string, number>()
    const bySource = new Map<string, number>()
    let featured = 0
    for (const item of collections) {
      byCategory.set(item.category, (byCategory.get(item.category) ?? 0) + 1)
      bySource.set(item.source, (bySource.get(item.source) ?? 0) + 1)
      if (item.featured) featured += 1
    }
    return { byCategory, bySource, featured }
  }, [collections])

  const filteredCollections = useMemo(() => {
    const q = query.trim().toLowerCase()
    return collections.filter((item) => {
      if (filterCategory && item.category !== filterCategory) return false
      if (filterTag && !item.tags.includes(filterTag)) return false
      if (filterSource && item.source !== filterSource) return false
      if (filterFeatured && !item.featured) return false
      if (q) {
        const haystack = `${item.title} ${item.description} ${item.tags.join(" ")}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [collections, query, filterCategory, filterTag, filterSource, filterFeatured])

  // 筛选变化后当前选中项可能被滤掉：跟随 /writing 的做法回落到第一条。
  useEffect(() => {
    if (filteredCollections.length === 0) return
    if (!filteredCollections.some((item) => item.id === activeId)) {
      setActiveId(filteredCollections[0]!.id)
    }
  }, [filteredCollections, activeId])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        document.getElementById("collections-search")?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const activeItem = filteredCollections.find((item) => item.id === activeId)

  function selectItem(id: string) {
    setActiveId(id)
    if (isMobile) setMobileDetail(true)
  }

  function showAll() {
    onFiltersChange({})
  }

  const listTitle = filterCategory
    ? filterCategory
    : filterTag
      ? `#${filterTag}`
      : filterSource
        ? filterSource
        : filterFeatured
          ? "Featured"
          : "All Items"

  const sidebar = (
    <CollectionsNav
      total={collections.length}
      featuredCount={countBy.featured}
      categories={categories.map((id) => ({
        id,
        count: countBy.byCategory.get(id) ?? 0,
      }))}
      sources={sources.map((id) => ({
        id,
        count: countBy.bySource.get(id) ?? 0,
      }))}
      activeId={activeId}
      recent={recent}
      recentNotes={recentNotes}
      filterCategory={filterCategory}
      filterSource={filterSource}
      filterFeatured={filterFeatured}
      query={query}
      onQueryChange={setQuery}
      onShowAll={() => {
        showAll()
        setNavOpen(false)
      }}
      onSelectCategory={(id) => {
        onFiltersChange({ category: id })
        setNavOpen(false)
      }}
      onSelectSource={(id) => {
        onFiltersChange({ source: id })
        setNavOpen(false)
      }}
      onSelectFeatured={() => {
        onFiltersChange({ featured: "true" })
        setNavOpen(false)
      }}
      onSelectRecent={(id) => {
        selectItem(id)
        setNavOpen(false)
      }}
      onOpenNote={(slug) => {
        // 深链到日常：?slug= 会让 /writing 直接打开那一篇。
        navigate({ to: "/writing", search: { slug } })
        setNavOpen(false)
      }}
    />
  )

  const listPane = (
    <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-background">
      <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border px-4">
        <div className="flex min-w-0 items-center gap-1">
          <Sheet open={navOpen} onOpenChange={setNavOpen}>
            <SheetTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="xl:hidden"
                  aria-label="Open navigation"
                />
              }
            >
              <PanelIcon />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 gap-0 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Collections</SheetTitle>
              </SheetHeader>
              <div className="flex h-full min-h-0 flex-col">{sidebar}</div>
            </SheetContent>
          </Sheet>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="hidden xl:inline-flex"
            aria-label={navCollapsed ? "Expand navigation" : "Collapse navigation"}
            aria-expanded={!navCollapsed}
            onClick={() => {
              const panel = navPanelRef.current
              if (!panel) return
              if (panel.isCollapsed()) {
                panel.expand()
                setNavCollapsed(false)
              } else {
                panel.collapse()
                setNavCollapsed(true)
              }
            }}
          >
            <PanelIcon collapsed={navCollapsed} />
          </Button>
          <Select
            value={filterCategory ?? ""}
            onValueChange={(value: string | null) => {
              if (value) {
                onFiltersChange({ category: value })
              } else {
                showAll()
              }
            }}
          >
            <SelectTrigger
              size="sm"
              className="h-auto border-0 bg-transparent px-1 py-0 text-sm font-semibold capitalize shadow-none hover:bg-accent focus-visible:ring-0"
            >
              <SelectValue placeholder="All Items">{listTitle}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">
                <SoftGlobe className="size-4" data-icon />
                All Items
              </SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  <SoftLayers className="size-4" data-icon />
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-muted-foreground text-xs tabular-nums">
            {filteredCollections.length}
          </span>
          <LayoutCapsule mode={stage} onChange={setStage} />
        </div>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        {filteredCollections.length > 0 ? (
          stage === "cards" ? (
            <CollectionsCards
              items={filteredCollections}
              activeId={activeId}
              onSelect={selectItem}
              onTagClick={(tag) => {
                onFiltersChange({ tag })
              }}
            />
          ) : (
            <CollectionsList
              items={filteredCollections}
              activeId={activeId}
              onSelect={selectItem}
              onTagClick={(tag) => {
                onFiltersChange({ tag })
              }}
            />
          )
        ) : (
          <Empty className="h-full border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SoftGlobe />
              </EmptyMedia>
              <EmptyTitle>No items match</EmptyTitle>
              <EmptyDescription>
                Try another search, source, category, or tag.
              </EmptyDescription>
            </EmptyHeader>
            <Button type="button" variant="ghost" size="sm" onClick={showAll}>
              Clear filters
            </Button>
          </Empty>
        )}
      </ScrollArea>
    </section>
  )

  const detailPane = (
    <section className="bg-background flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      {activeItem ? (
        <CollectionViewer
          item={activeItem}
          onBack={() => setMobileDetail(false)}
          isMobile={isMobile}
          onTagClick={(tag) => {
            onFiltersChange({ tag })
            setMobileDetail(false)
          }}
          onCategoryClick={(category) => {
            onFiltersChange({ category })
            setMobileDetail(false)
          }}
          onSourceClick={(source) => {
            onFiltersChange({ source })
            setMobileDetail(false)
          }}
        />
      ) : (
        <Empty className="h-full border-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SoftGlobe />
            </EmptyMedia>
            <EmptyTitle>Select an item</EmptyTitle>
            <EmptyDescription>
              Choose a collection from the list.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </section>
  )

  if (isWide) {
    return (
      <ResizablePanelGroup className="h-full min-h-0 w-full">
        <ResizablePanel
          panelRef={navPanelRef}
          defaultSize={256}
          minSize={180}
          maxSize={384}
          collapsible
          collapsedSize={0}
          groupResizeBehavior="preserve-pixel-size"
          onResize={(size) => {
            const collapsed = size.inPixels < 1
            setNavCollapsed((prev) => (prev === collapsed ? prev : collapsed))
          }}
          className="min-h-0 overflow-hidden"
        >
          {sidebar}
        </ResizablePanel>
        <ResizableHandle className="bg-sidebar-border" />
        <ResizablePanel
          defaultSize={352}
          minSize={240}
          maxSize={560}
          groupResizeBehavior="preserve-pixel-size"
          className="min-h-0 overflow-hidden"
        >
          {listPane}
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel
          minSize={320}
          className="min-h-0 overflow-hidden"
        >
          {detailPane}
        </ResizablePanel>
      </ResizablePanelGroup>
    )
  }

  return (
    <div className="grid h-full min-h-0 w-full grid-cols-1 overflow-hidden md:grid-cols-[22rem_minmax(0,1fr)]">
      <div
        className={cn(
          "min-h-0 min-w-0 overflow-hidden border-r border-border",
          isMobile && mobileDetail && "hidden"
        )}
      >
        {listPane}
      </div>
      <div
        className={cn(
          "min-h-0 min-w-0 overflow-hidden",
          isMobile && !mobileDetail && "hidden"
        )}
      >
        {detailPane}
      </div>
    </div>
  )
}

function CollectionsNav({
  total,
  featuredCount,
  categories,
  sources,
  activeId,
  recent,
  recentNotes,
  filterCategory,
  filterSource,
  filterFeatured,
  query,
  onQueryChange,
  onShowAll,
  onSelectCategory,
  onSelectSource,
  onSelectFeatured,
  onSelectRecent,
  onOpenNote,
}: {
  total: number
  featuredCount: number
  categories: Array<{ id: string; count: number }>
  sources: Array<{ id: string; count: number }>
  activeId: string
  recent: CollectionItem[]
  recentNotes: WritingPost[]
  filterCategory: string | null
  filterSource: string | null
  filterFeatured: boolean
  query: string
  onQueryChange: (value: string) => void
  onShowAll: () => void
  onSelectCategory: (id: string) => void
  onSelectSource: (id: string) => void
  onSelectFeatured: () => void
  onSelectRecent: (id: string) => void
  onOpenNote: (slug: string) => void
}) {
  return (
    <nav
      aria-label="Collections"
      className="bg-sidebar text-sidebar-foreground flex h-full min-h-0 flex-col"
    >
      <div className="flex h-12 shrink-0 items-center gap-2 px-4">
        <AppSwitcher />
        <div className="ml-auto">
          <ThemeSelector />
        </div>
      </div>
      <div className="px-3 pb-3">
        <InputGroup>
          <InputGroupAddon>
            <SoftSearch />
          </InputGroupAddon>
          <InputGroupInput
            id="collections-search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search…"
            aria-label="Search collections"
          />
          <InputGroupAddon align="inline-end">
            <Kbd>⌘K</Kbd>
          </InputGroupAddon>
        </InputGroup>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 px-2 pb-4">
          <NavRow
            icon={SoftGlobe}
            label="All Items"
            count={total}
            active={!filterCategory && !filterSource && !filterFeatured}
            onClick={onShowAll}
          />
          <NavRow
            icon={SoftStar}
            label="Featured"
            count={featuredCount}
            active={filterFeatured && !filterCategory && !filterSource}
            onClick={onSelectFeatured}
          />
          <SectionLabel>Sources</SectionLabel>
          {sources.map((source) => (
            <NavRow
              key={source.id}
              icon={sourceIcon(source.id)}
              label={sourceLabel(source.id)}
              count={source.count}
              active={filterSource === source.id}
              onClick={() => onSelectSource(source.id)}
            />
          ))}
          <Separator className="mx-2" />
          <SectionLabel>Categories</SectionLabel>
          <ul className="flex flex-col gap-0.5">
            {categories.map((category) => (
              <li key={category.id}>
                <NavRow
                  icon={categoryMeta(category.id).icon}
                  label={prettyLabel(category.id)}
                  count={category.count}
                  active={filterCategory === category.id}
                  onClick={() => onSelectCategory(category.id)}
                  iconColor={labelColorValue(category.id, categoryMeta(category.id).hue)}
                />
              </li>
            ))}
          </ul>
          {recent.length > 0 ? (
            <>
              <Separator className="mx-2" />
              <SectionLabel>Recent items</SectionLabel>
              <ul className="flex flex-col gap-0.5">
                {recent.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onSelectRecent(item.id)}
                      className={cn(
                        "hover:bg-sidebar-accent w-full truncate rounded-md px-2 py-1.5 text-left text-[13px]",
                        item.id === activeId && "bg-sidebar-accent font-medium"
                      )}
                    >
                      {item.title}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {recentNotes.length > 0 ? (
            <>
              <Separator className="mx-2" />
              <SectionLabel>Recent notes</SectionLabel>
              <ul className="flex flex-col gap-0.5">
                {recentNotes.map((post) => (
                  <li key={post.slug}>
                    <button
                      type="button"
                      onClick={() => onOpenNote(post.slug)}
                      title={post.title}
                      className="hover:bg-sidebar-accent w-full truncate rounded-md px-2 py-1.5 text-left text-[13px]"
                    >
                      {post.title}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </ScrollArea>
    </nav>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-muted-foreground px-2 text-[11px] font-semibold tracking-wider uppercase">
      {children}
    </p>
  )
}

function NavRow({
  icon: Icon,
  label,
  count,
  active,
  onClick,
  iconColor,
}: {
  icon: SoftIcon
  label: string
  count?: number
  active: boolean
  onClick: () => void
  iconColor?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-active={active}
      className={cn(
        "hover:bg-sidebar-accent flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium"
      )}
    >
      <Icon
        className="size-4 shrink-0"
        data-icon="inline-start"
        style={iconColor ? { color: iconColor } : undefined}
      />
      <span className="min-w-0 flex-1 truncate text-left">{label}</span>
      {count !== undefined ? (
        <span className="text-muted-foreground text-xs tabular-nums">{count}</span>
      ) : null}
    </button>
  )
}
