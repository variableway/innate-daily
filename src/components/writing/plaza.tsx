import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react"
import {
  SoftArrowUpRight,
} from "../icons/soft-icons"
import type { LayoutMode } from "../layout-capsule"
import { categoryMeta } from "../../lib/writing/category-meta"
import { labelColorValue } from "../../lib/writing/label-color"
import { coverArtSvg } from "../../lib/landing/cover-art"
import {
  computePlazaColumns,
  distributePlazaColumns,
  groupPlazaItems,
  plazaColumnWidth,
  type PlazaCardItem,
} from "../../lib/writing/plaza-layout"
import type { BlogListItem } from "../../lib/writing/post-item"

/**
 * Plaza：内容广场。移植自 daily-next 的首页内容区，提供两种模式：
 * - cards（默认）：瀑布流卡片墙，封面为按标题确定性生成的 SVG。
 * - list：紧凑列表行，按分类分节，悬停浮出大图。
 * 底部是栏目筛选胶囊，点击卡片即由上层切到列表模式并打开正文。
 */

export type PlazaMode = LayoutMode

export interface PlazaProps {
  posts: BlogListItem[]
  mode: PlazaMode
  activeSlug?: string
  onSelect: (slug: string) => void
  /** 概览卡：仅在「全部」视图的卡片模式下出现。 */
  showSummary?: boolean
}

function toCardItem(post: BlogListItem): PlazaCardItem {
  return {
    id: post.slug,
    title: post.title,
    excerpt: post.excerpt ?? "",
    hasCover: true,
  }
}

function folderLabel(post: BlogListItem): string {
  return post.folder || post.vault || "notes"
}

/**
 * 目录路径里去掉与分类重复的首段。
 * 分类本身就是目录第一层（research / build-it-own / toolchain），
 * 直接并排显示会出现「research | research/ui」这种重复。
 */
function folderRest(post: BlogListItem): string {
  const folder = post.folder || ""
  if (!folder) return post.vault || ""
  if (folder === post.category) return ""
  if (folder.startsWith(`${post.category}/`)) {
    return folder.slice(post.category.length + 1)
  }
  return folder
}

export function Plaza({
  posts,
  mode,
  activeSlug,
  onSelect,
  showSummary = false,
}: PlazaProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const plazaRef = useRef<HTMLDivElement>(null)
  const [colCount, setColCount] = useState(3)
  const [containerWidth, setContainerWidth] = useState(0)
  const [measured, setMeasured] = useState<ReadonlyMap<string, number>>(() => new Map())

  const items = useMemo(() => posts.map(toCardItem), [posts])

  // 列数跟随容器宽度（窄屏 1 / 中屏 2 / 桌面 3~6）。
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const update = () => {
      setContainerWidth(el.clientWidth)
      setColCount(computePlazaColumns(el.clientWidth, window.innerWidth))
    }
    update()
    const raf = requestAnimationFrame(update)
    const timer = setTimeout(update, 300)
    const observer = new ResizeObserver(update)
    observer.observe(el)
    window.addEventListener("resize", update)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timer)
      observer.disconnect()
      window.removeEventListener("resize", update)
    }
  }, [])

  // 瀑布流实测高度：与估算差异 >1px 时重新分配。
  useLayoutEffect(() => {
    const el = plazaRef.current
    if (!el || mode !== "cards") return
    const measure = () => {
      const next = new Map<string, number>()
      el.querySelectorAll<HTMLElement>("[data-tile]").forEach((tile) => {
        const key = tile.dataset.tile
        if (key) next.set(key, tile.offsetHeight)
      })
      let same = next.size === measured.size
      if (same) {
        for (const [key, value] of next) {
          if (Math.abs((measured.get(key) ?? 0) - value) > 1) {
            same = false
            break
          }
        }
      }
      if (!same) setMeasured(next)
    }
    measure()
    const observer = new ResizeObserver(measure)
    el.querySelectorAll("[data-tile]").forEach((tile) => observer.observe(tile))
    return () => observer.disconnect()
  }, [items, colCount, measured, mode])

  const coverHeight = useMemo(() => {
    if (containerWidth <= 0) return 0
    return Math.round(plazaColumnWidth(containerWidth, colCount) * 0.75)
  }, [containerWidth, colCount])

  const columns = useMemo(
    () =>
      mode === "cards"
        ? distributePlazaColumns(
            items,
            colCount,
            // 单列（窄屏）时概览卡会让首屏全是概览，窄屏不出。
            showSummary && colCount > 1,
            measured,
            coverHeight
          )
        : [],
    [items, colCount, showSummary, measured, coverHeight, mode]
  )

  const sections = useMemo(
    () => groupPlazaItems(posts, (post) => post.category),
    [posts]
  )

  const postBySlug = useMemo(() => {
    const map = new Map<string, BlogListItem>()
    for (const post of posts) map.set(post.slug, post)
    return map
  }, [posts])

  return (
    <div className="plaza-root">
      <div className="plaza-scroll" ref={scrollRef}>
        {mode === "cards" ? (
          <div className="site-plaza" ref={plazaRef}>
            {columns.map((col, n) => (
              <div className="site-plaza-col" key={n}>
                {col.map((tile) =>
                  tile.kind === "summary" ? (
                    <PlazaSummaryCard key="summary" posts={posts} />
                  ) : (
                    <PlazaCard
                      key={tile.item.id}
                      post={postBySlug.get(tile.item.id)}
                      onSelect={onSelect}
                    />
                  )
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="plaza-list" ref={plazaRef}>
            {sections.map((section) => (
              <Fragment key={section.id}>
                <div className="plaza-section-header">
                  <span className="plaza-section-name">{section.id}</span>
                  <span className="plaza-section-count">({section.items.length})</span>
                </div>
                {section.items.map((post) => (
                  <PlazaListRow
                    key={post.slug}
                    post={post}
                    active={activeSlug === post.slug}
                    onSelect={onSelect}
                  />
                ))}
              </Fragment>
            ))}
          </div>
        )}
      </div>
      <div className="plaza-fade" aria-hidden="true" />
    </div>
  )
}

/** 卡片：封面（生成式 SVG）+ 栏目/目录/日期 + 标题 + 摘要 + 悬停箭头。 */
function PlazaCard({
  post,
  onSelect,
}: {
  post?: BlogListItem
  onSelect: (slug: string) => void
}) {
  if (!post) return null
  const meta = categoryMeta(post.category)
  const rest = folderRest(post)
  return (
    <button
      type="button"
      className="plaza-card"
      data-tile={post.slug}
      onClick={() => onSelect(post.slug)}
    >
      {/* 封面由 cover-art.ts 纯函数生成（内容可信），内联以便跟随主题 token。 */}
      <span
        className="plaza-media"
        aria-hidden="true"
        dangerouslySetInnerHTML={{
          __html: coverArtSvg(post.title, meta.hue, { slice: true }),
        }}
      />
      <div className="plaza-card-body">
        <div className="plaza-kicker">
          <span style={{ color: labelColorValue(post.category, meta.hue) }}>
            {post.category}
          </span>
          {rest ? (
            <>
              <span className="plaza-dot" aria-hidden="true" />
              <span>{rest}</span>
            </>
          ) : null}
          <span className="plaza-dot" aria-hidden="true" />
          <span>{post.date}</span>
        </div>
        <h3 className="plaza-title">{post.title}</h3>
        {post.excerpt ? <p className="plaza-judgment">{post.excerpt}</p> : null}
      </div>
      <span className="plaza-go" aria-hidden="true">
        <SoftArrowUpRight size={14} />
      </span>
    </button>
  )
}

/** 列表行：紧凑两栏，悬停时右侧浮出大图预览。 */
function PlazaListRow({
  post,
  active,
  onSelect,
}: {
  post?: BlogListItem
  active: boolean
  onSelect: (slug: string) => void
}) {
  if (!post) return null
  const meta = categoryMeta(post.category)
  const rest = folderRest(post)
  const cover = coverArtSvg(post.title, meta.hue, { slice: true })
  return (
    <button
      type="button"
      className="plaza-list-row"
      data-active={active}
      onClick={() => onSelect(post.slug)}
    >
      <div className="plaza-list-copy">
        <div className="plaza-kicker">
          <span style={{ color: labelColorValue(post.category, meta.hue) }}>
            {post.category}
          </span>
          {rest ? (
            <>
              <span className="plaza-dot" aria-hidden="true" />
              <span>{rest}</span>
            </>
          ) : null}
          <span className="plaza-dot" aria-hidden="true" />
          <span>{post.readingTime} min</span>
        </div>
        <h3 className="plaza-list-title">{post.title}</h3>
        {post.excerpt ? <p className="plaza-list-judgment">{post.excerpt}</p> : null}
      </div>
      <span
        className="plaza-list-thumb"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: cover }}
      />
    </button>
  )
}

/** 概览卡：总量概览 + 高频标签胶囊（静态倾斜，模拟源站的物理胶囊）。 */
function PlazaSummaryCard({ posts }: { posts: BlogListItem[] }) {
  const folders = useMemo(
    () => new Set(posts.map((post) => folderLabel(post))).size,
    [posts]
  )
  const categories = useMemo(
    () => new Set(posts.map((post) => post.category)).size,
    [posts]
  )
  const tags = useMemo(() => {
    const counts = new Map<string, number>()
    for (const post of posts) {
      for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 9)
      .map(([tag]) => tag)
  }, [posts])

  return (
    <div className="plaza-card plaza-summary" data-tile="summary">
      <div className="plaza-card-body">
        <h2 className="plaza-title">
          全部笔记
          <span className="plaza-title-date">{posts.length} 篇</span>
        </h2>
        <p className="plaza-overview">
          覆盖 {folders} 个目录、{categories} 个分类。
          {tags.length > 0 ? " 高频标签：" : ""}
          {tags.join(" · ")}
        </p>
        <div className="plaza-chips">
          {tags.map((tag, i) => (
            <span
              key={tag}
              className="plaza-chip"
              style={chipTilt(i)}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/** 胶囊的静态倾斜/错位：按序号取固定角度，视觉上与源站的物理胶囊一致。 */
function chipTilt(index: number): CSSProperties {
  const angles = [-3.2, 2.4, -1.8, 3, -2.6, 1.6, -3.6, 2.8, -1.2]
  const offsets = [2, -1, 3, 0, -2, 2, -1, 1, -3]
  return {
    transform: `rotate(${angles[index % angles.length]}deg) translateY(${offsets[index % offsets.length]}px)`,
  }
}

/** 布局切换胶囊：卡片 ⇄ 列表（与 /collections 共用同一个组件）。 */
export { LayoutCapsule as PlazaLayoutCapsule } from "../layout-capsule"

