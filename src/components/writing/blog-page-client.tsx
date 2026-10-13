import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type Ref,
} from "react"
import {
  FileText,
  Folder,
  PanelLeft,
  PanelLeftClose,
  PanelLeftOpen,
  PenLine,
  Search,
} from "lucide-react"
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
import { BlogList, type BlogListItem } from "./blog-list"
import { BlogViewer } from "./blog-viewer"
import { FolderNav } from "./folder-nav"
import {
  countByCategory,
  filterWritingPosts,
  type WritingListFilter,
} from "../../lib/writing/filter-posts"
import { buildFolderTree } from "../../lib/writing/folder-tree"
import { labelColorValue } from "../../lib/writing/label-color"
import { categoryMeta } from "../../lib/writing/category-meta"
import { useMediaQuery } from "../../lib/use-media-query"

export interface BlogPostFull extends BlogListItem {
  content: string
  author: string
  toc: Array<{ id: string; text: string; level: number }>
  type: "md" | "mdx"
}

interface BlogPageClientProps {
  posts: BlogPostFull[]
  /** 筛选状态由 URL search params 承载（见 router.tsx 的 validateWritingSearch）。 */
  filters: WritingListFilter
  onFiltersChange: (next: WritingListFilter) => void
}

type NavPanelHandle = NonNullable<
  ComponentProps<typeof ResizablePanel>["panelRef"]
> extends Ref<infer T>
  ? T
  : never

export function BlogPageClient({
  posts,
  filters,
  onFiltersChange,
}: BlogPageClientProps) {
  const isMobile = useIsMobile()
  const isWide = useMediaQuery("(min-width: 1280px)")
  const [query, setQuery] = useState("")
  const filterTag = filters.tag ?? null
  const filterCategory = filters.category ?? null
  const filterFolder = filters.folder ?? null
  const [activeSlug, setActiveSlug] = useState(posts[0]?.slug ?? "")
  const [mobileDetail, setMobileDetail] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const navPanelRef = useRef<NavPanelHandle | null>(null)
  const [navCollapsed, setNavCollapsed] = useState(false)

  const categories = useMemo(() => countByCategory(posts), [posts])
  const folders = useMemo(() => buildFolderTree(posts), [posts])
  const folderOptions = useMemo(() => {
    const options: Array<{ id: string; name: string; depth: number }> = []
    function walk(nodes: typeof folders, depth: number) {
      for (const node of nodes) {
        options.push({ id: node.id, name: node.name, depth })
        walk(node.children, depth + 1)
      }
    }
    walk(folders, 0)
    return options
  }, [folders])
  const recent = useMemo(() => posts.slice(0, 5), [posts])
  const filteredPosts = useMemo(
    () =>
      filterWritingPosts(posts, {
        query,
        category: filterCategory,
        tag: filterTag,
        folder: filterFolder,
      }),
    [posts, query, filterCategory, filterTag, filterFolder]
  )

  useEffect(() => {
    if (filteredPosts.length === 0) return
    if (!filteredPosts.some((post) => post.slug === activeSlug)) {
      setActiveSlug(filteredPosts[0]!.slug)
    }
  }, [filteredPosts, activeSlug])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        document.getElementById("writing-search")?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const activePost = filteredPosts.find((post) => post.slug === activeSlug)

  function selectPost(slug: string) {
    setActiveSlug(slug)
    if (isMobile) setMobileDetail(true)
  }

  function showAll() {
    onFiltersChange({})
  }

  const listTitle = filterFolder
    ? filterFolder.split("/").pop() ?? filterFolder
    : filterCategory
      ? filterCategory
      : filterTag
        ? `#${filterTag}`
        : "All Notes"

  const sidebar = (
    <WritingNav
      total={posts.length}
      categories={categories}
      folders={folders}
      recent={recent}
      activeSlug={activeSlug}
      filterCategory={filterCategory}
      filterFolder={filterFolder}
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
      onSelectFolder={(id) => {
        onFiltersChange({ folder: id })
        setNavOpen(false)
      }}
      onSelectRecent={(slug) => {
        selectPost(slug)
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
              <PanelLeft />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 gap-0 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Writing</SheetTitle>
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
            {navCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          </Button>
          <Select
            value={filterFolder ?? ""}
            onValueChange={(value: string | null) => {
              if (value) {
                onFiltersChange({ folder: value })
              } else {
                showAll()
              }
            }}
          >
            <SelectTrigger
              size="sm"
              className="h-auto border-0 bg-transparent px-1 py-0 text-sm font-semibold capitalize shadow-none hover:bg-accent focus-visible:ring-0"
            >
              <SelectValue placeholder="All Notes">{listTitle}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">
                <FileText className="size-4" data-icon />
                All Notes
              </SelectItem>
              {folderOptions.map((folder) => (
                <SelectItem key={folder.id} value={folder.id}>
                  <span
                    className="flex items-center gap-1.5"
                    style={{ paddingLeft: `${folder.depth * 0.75}rem` }}
                  >
                    <Folder className="size-4 shrink-0" data-icon />
                    {folder.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="text-muted-foreground text-xs tabular-nums">
          {filteredPosts.length}
        </span>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        {filteredPosts.length > 0 ? (
          <BlogList
            items={filteredPosts}
            activeSlug={activeSlug}
            onSelect={selectPost}
            onTagClick={(tag) => {
              onFiltersChange({ tag })
            }}
          />
        ) : (
          <Empty className="h-full border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileText />
              </EmptyMedia>
              <EmptyTitle>No notes match</EmptyTitle>
              <EmptyDescription>
                Try another search, category, or tag.
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
      {activePost ? (
        <BlogViewer
          title={activePost.title}
          content={activePost.content}
          excerpt={activePost.excerpt}
          date={activePost.date}
          author={activePost.author}
          category={activePost.category}
          tags={activePost.tags}
          readingTime={activePost.readingTime}
          toc={activePost.toc}
          showToc
          onBack={() => setMobileDetail(false)}
          onTagClick={(tag) => {
            onFiltersChange({ tag })
            setMobileDetail(false)
          }}
          onCategoryClick={(category) => {
            onFiltersChange({ category })
            setMobileDetail(false)
          }}
        />
      ) : (
        <Empty className="h-full border-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>
            <EmptyTitle>Select a note</EmptyTitle>
            <EmptyDescription>
              Choose an article from the list.
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

function WritingNav({
  total,
  categories,
  folders,
  recent,
  activeSlug,
  filterCategory,
  filterFolder,
  query,
  onQueryChange,
  onShowAll,
  onSelectCategory,
  onSelectFolder,
  onSelectRecent,
}: {
  total: number
  categories: Array<{ id: string; count: number }>
  folders: ReturnType<typeof buildFolderTree>
  recent: BlogListItem[]
  activeSlug: string
  filterCategory: string | null
  filterFolder: string | null
  query: string
  onQueryChange: (value: string) => void
  onShowAll: () => void
  onSelectCategory: (id: string) => void
  onSelectFolder: (id: string) => void
  onSelectRecent: (slug: string) => void
}) {
  return (
    <nav
      aria-label="Writing"
      className="bg-sidebar text-sidebar-foreground flex h-full min-h-0 flex-col"
    >
      <div className="flex h-12 shrink-0 items-center gap-2 px-4">
        <PenLine className="size-4" data-icon />
        <span className="text-sm font-semibold">Writing</span>
        <div className="ml-auto">
          <ThemeSelector />
        </div>
      </div>
      <div className="px-3 pb-3">
        <InputGroup>
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            id="writing-search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search…"
            aria-label="Search notes"
          />
          <InputGroupAddon align="inline-end">
            <Kbd>⌘K</Kbd>
          </InputGroupAddon>
        </InputGroup>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 px-2 pb-4">
          <NavRow
            icon={FileText}
            label="Notes"
            count={total}
            active={!filterCategory && !filterFolder}
            onClick={onShowAll}
          />
          <SectionLabel>Folders</SectionLabel>
          <FolderNav nodes={folders} activeId={filterFolder} onSelect={onSelectFolder} />
          <Separator className="mx-2" />
          <SectionLabel>Recent notes</SectionLabel>
          <ul className="flex flex-col gap-0.5">
            {recent.map((post) => (
              <li key={post.slug}>
                <button
                  type="button"
                  onClick={() => onSelectRecent(post.slug)}
                  className={cn(
                    "hover:bg-sidebar-accent w-full truncate rounded-md px-2 py-1.5 text-left text-[13px]",
                    post.slug === activeSlug && "bg-sidebar-accent font-medium"
                  )}
                >
                  {post.title}
                </button>
              </li>
            ))}
          </ul>
          <Separator className="mx-2" />
          <SectionLabel>Categories</SectionLabel>
          <ul className="flex flex-col gap-0.5">
            {categories.map((category) => (
              <li key={category.id}>
                <NavRow
                  icon={categoryMeta(category.id).icon}
                  label={category.id}
                  count={category.count}
                  active={filterCategory === category.id}
                  onClick={() => onSelectCategory(category.id)}
                  iconColor={labelColorValue(category.id, categoryMeta(category.id).hue)}
                />
              </li>
            ))}
          </ul>
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
  icon: typeof FileText
  label: string
  count: number
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
        "hover:bg-sidebar-accent flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm capitalize",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium"
      )}
    >
      <Icon
        className="size-4 shrink-0"
        data-icon="inline-start"
        style={iconColor ? { color: iconColor } : undefined}
      />
      <span className="min-w-0 flex-1 truncate text-left">{label}</span>
      <span className="text-muted-foreground text-xs tabular-nums">{count}</span>
    </button>
  )
}
