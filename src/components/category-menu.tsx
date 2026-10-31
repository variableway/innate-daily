import { useEffect, useMemo, useRef, useState } from "react"
import {
  useLocation,
  useNavigate,
  useSearch,
} from "@tanstack/react-router"
import { cn } from "@innate/ui"
import { useWritingContent } from "../lib/content/use-writing-content"
import { countByCategory } from "../lib/writing/filter-posts"
import { categoryMeta } from "../lib/writing/category-meta"
import { prettyLabel } from "../lib/writing/pretty-label"
import { sourceIcon, sourceLabel } from "../lib/collections/source"
import {
  SoftChevronLeft,
  SoftChevronRight,
  SoftChevronUp,
  SoftLayers,
  SoftPenLine,
  SoftStar,
  type SoftIcon,
} from "./icons/soft-icons"
import { labelColorValue } from "../lib/writing/label-color"
import {
  getAllCollections,
  getUniqueCategories,
  getUniqueSources,
} from "../lib/collections/data"
import type { CollectionsSearch } from "../router"

type MenuView = "notes" | "collections"

interface MenuOption {
  key: string
  label: string
  icon: SoftIcon
  /** 策展色相；undefined = 不着色。 */
  hue?: number | null
  count: number
  active: boolean
  onSelect: () => void
}

/**
 * 全局悬浮菜单：底部居中的半透明毛玻璃胶囊。
 * - 左段 Notes / Collections 视图切换；在 /collections 页自动切到 Collections 视图
 * - Notes 选项 = 笔记分类（category）；Collections 选项 = Featured / 分类 / 分组（source）
 * - 单击选项跳转对应列表页并带上筛选；超出宽度用箭头横向滑动
 * - 双击胶囊 → 向上展开全量下拉框
 */
export function CategoryMenu() {
  const { posts } = useWritingContent()
  const navigate = useNavigate()
  const pathname = useLocation({ select: (location) => location.pathname })
  const search = useSearch({ strict: false }) as {
    category?: string
    source?: string
    featured?: string
  }

  const [view, setView] = useState<MenuView>(
    pathname.startsWith("/collections") ? "collections" : "notes"
  )
  // 路由切换时联动视图（点侧栏 Collections 进入 /collections 时菜单自动跟随）。
  useEffect(() => {
    setView(pathname.startsWith("/collections") ? "collections" : "notes")
  }, [pathname])

  const noteCategories = useMemo(() => countByCategory(posts), [posts])
  const collections = useMemo(() => getAllCollections(), [])

  const stripRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)
  const [open, setOpen] = useState(false)
  // Notes/Collections 切换器的下拉开关（单击向上弹出）。
  const [viewMenuOpen, setViewMenuOpen] = useState(false)

  function selectNoteCategory(id: string | null) {
    setOpen(false)
    navigate({ to: "/writing", search: id ? { category: id } : {} })
  }

  function selectCollectionFilter(next: CollectionsSearch) {
    setOpen(false)
    navigate({ to: "/collections", search: next })
  }

  const noteOptions: MenuOption[] = useMemo(() => {
    const activeCategory = pathname.startsWith("/writing") ? (search.category ?? null) : null
    return [
      {
        key: "__all__",
        label: "All",
        icon: SoftPenLine,
        count: posts.length,
        active: activeCategory === null,
        onSelect: () => selectNoteCategory(null),
      },
      ...noteCategories.map((category) => ({
        key: category.id,
        label: category.id,
        icon: categoryMeta(category.id).icon,
        hue: categoryMeta(category.id).hue,
        count: category.count,
        active: activeCategory === category.id,
        onSelect: () =>
          selectNoteCategory(activeCategory === category.id ? null : category.id),
      })),
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteCategories, posts.length, pathname, search.category])

  const collectionOptions: MenuOption[] = useMemo(() => {
    const onCollections = pathname.startsWith("/collections")
    const activeSource = onCollections ? (search.source ?? null) : null
    const activeCategory = onCollections ? (search.category ?? null) : null
    const activeFeatured = onCollections && search.featured === "true"
    const noneActive = !activeSource && !activeCategory && !activeFeatured
    const countBy = (fn: (c: (typeof collections)[number]) => boolean) =>
      collections.filter(fn).length
    return [
      {
        key: "__all__",
        label: "All",
        icon: SoftLayers,
        count: collections.length,
        active: onCollections && noneActive,
        onSelect: () => selectCollectionFilter({}),
      },
      {
        key: "__featured__",
        label: "Featured",
        icon: SoftStar,
        count: countBy((c) => c.featured),
        active: activeFeatured,
        onSelect: () =>
          selectCollectionFilter(activeFeatured ? {} : { featured: "true" }),
      },
      ...getUniqueCategories().map((id) => ({
        key: `category:${id}`,
        label: id,
        icon: categoryMeta(id).icon,
        hue: categoryMeta(id).hue,
        count: countBy((c) => c.category === id),
        active: activeCategory === id,
        onSelect: () =>
          selectCollectionFilter(activeCategory === id ? {} : { category: id }),
      })),
      ...getUniqueSources().map((id) => ({
        key: `source:${id}`,
        label: sourceLabel(id),
        icon: sourceIcon(id),
        hue: null,
        count: countBy((c) => c.source === id),
        active: activeSource === id,
        onSelect: () =>
          selectCollectionFilter(activeSource === id ? {} : { source: id }),
      })),
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collections, pathname, search.source, search.category, search.featured])

  const options = view === "notes" ? noteOptions : collectionOptions

  function updateArrows() {
    const el = stripRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 1)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }

  useEffect(() => {
    updateArrows()
    window.addEventListener("resize", updateArrows)
    return () => window.removeEventListener("resize", updateArrows)
  }, [options, view])

  // 点击菜单外部或按 Escape 时收起所有下拉。
  useEffect(() => {
    if (!open && !viewMenuOpen) return
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setViewMenuOpen(false)
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false)
        setViewMenuOpen(false)
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open, viewMenuOpen])

  if (noteCategories.length === 0 && collections.length === 0) return null

  function slide(direction: 1 | -1) {
    const el = stripRef.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" })
  }

  const arrowButton =
    "text-muted-foreground hover:text-foreground hover:bg-accent inline-flex size-6 shrink-0 items-center justify-center rounded-full transition-colors disabled:pointer-events-none disabled:opacity-30"

  return (
    <nav
      ref={rootRef}
      aria-label="Categories"
      className="fixed bottom-3 left-1/2 z-50 -translate-x-1/2"
    >
      {open ? (
        <div className="border-border bg-popover/80 absolute bottom-11 left-1/2 mb-1 max-h-72 w-52 -translate-x-1/2 overflow-y-auto rounded-xl border p-1.5 shadow-xl backdrop-blur-md">
          {options.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={option.onSelect}
              data-active={option.active}
              className={cn(
                "hover:bg-accent flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm capitalize",
                option.active && "bg-accent font-medium"
              )}
            >
              <option.icon
                className="size-4 shrink-0"
                data-icon="inline-start"
                style={
                  option.hue !== undefined
                    ? { color: labelColorValue(option.label, option.hue) }
                    : undefined
                }
              />
              <span className="min-w-0 flex-1 truncate text-left">
                {option.label}
              </span>
              <span className="text-muted-foreground text-xs tabular-nums">
                {option.count}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      <div
        title="双击展开全部选项"
        onDoubleClick={() => setOpen((v) => !v)}
        className="border-border bg-background/60 flex h-9 max-w-[calc(100vw-2rem)] items-center gap-0.5 rounded-full border px-1.5 shadow-lg backdrop-blur-md"
      >
        {/* Notes / Collections：单击向上弹出下拉切换 */}
        <div className="relative shrink-0">
          {viewMenuOpen ? (
            <div className="border-border bg-popover/80 absolute bottom-full left-0 mb-2 w-40 rounded-xl border p-1.5 shadow-xl backdrop-blur-md">
              <ViewOption
                label="Notes"
                icon={SoftPenLine}
                count={posts.length}
                active={view === "notes"}
                onClick={() => {
                  setView("notes")
                  setViewMenuOpen(false)
                  navigate({ to: "/writing", search: {} })
                }}
              />
              <ViewOption
                label="Collections"
                icon={SoftLayers}
                count={collections.length}
                active={view === "collections"}
                onClick={() => {
                  setView("collections")
                  setViewMenuOpen(false)
                  navigate({ to: "/collections", search: {} })
                }}
              />
            </div>
          ) : null}
          <button
            type="button"
            aria-label="切换 Notes / Collections"
            aria-expanded={viewMenuOpen}
            onClick={() => setViewMenuOpen((v) => !v)}
            className="text-muted-foreground hover:text-foreground hover:bg-accent flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-colors"
          >
            {view === "notes" ? (
              <SoftPenLine className="size-3.5" data-icon />
            ) : (
              <SoftLayers className="size-3.5" data-icon />
            )}
            <span className="font-medium text-foreground">
              {view === "notes" ? "Notes" : "Collections"}
            </span>
            <SoftChevronUp
              className={cn(
                "size-3 transition-transform",
                viewMenuOpen && "rotate-180"
              )}
              data-icon
            />
          </button>
        </div>
        <div className="bg-border mx-1 h-4 w-px shrink-0" />

        <button
          type="button"
          aria-label="向左滑动"
          disabled={!canLeft}
          onClick={() => slide(-1)}
          className={arrowButton}
        >
          <SoftChevronLeft className="size-3.5" data-icon />
        </button>

        <div
          ref={stripRef}
          onScroll={updateArrows}
          className="no-scrollbar flex items-center gap-0.5 overflow-x-auto"
        >
          {options.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={option.onSelect}
              data-active={option.active}
              className={cn(
                "text-muted-foreground hover:text-foreground hover:bg-accent flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs capitalize transition-colors",
                option.active && "bg-accent text-foreground font-medium"
              )}
            >
              <option.icon
                className="size-3.5"
                data-icon
                style={
                  option.hue !== undefined
                    ? { color: labelColorValue(option.label, option.hue) }
                    : undefined
                }
              />
              {option.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          aria-label="向右滑动"
          disabled={!canRight}
          onClick={() => slide(1)}
          className={arrowButton}
        >
          <SoftChevronRight className="size-3.5" data-icon />
        </button>
      </div>
    </nav>
  )
}

function ViewOption({
  label,
  icon: Icon,
  count,
  active,
  onClick,
}: {
  label: string
  icon: SoftIcon
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-active={active}
      className={cn(
        "hover:bg-accent flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm",
        active && "bg-accent font-medium"
      )}
    >
      <Icon className="size-4 shrink-0" data-icon="inline-start" />
      <span className="min-w-0 flex-1 truncate text-left">{label}</span>
      <span className="text-muted-foreground text-xs tabular-nums">{count}</span>
    </button>
  )
}
