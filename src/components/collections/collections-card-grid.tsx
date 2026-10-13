import { Calendar, Sparkles, Tag } from "lucide-react"
import type { CollectionItem } from "../../lib/collections/types"
import { coverArtSvg } from "../../lib/landing/cover-art"
import { labelChipStyle } from "../../lib/writing/label-color"

/** 徽标基类：配色由 .label-chip + 哈希色相决定（与侧栏分类 / landing chips 同一套语言）。 */
const chipClass =
  "label-chip inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium"

/**
 * 收藏封面：thumbnail 有值用真实图片，否则用与 landing 展区一致的
 * 生成式 SVG 封面（按 id 确定性生成，零外部请求，离线可用）。
 */
function CollectionCover({ item }: { item: CollectionItem }) {
  if (item.thumbnail) {
    return (
      <div className="bg-muted aspect-[4/3] w-full overflow-hidden">
        <img
          src={item.thumbnail}
          alt=""
          loading="lazy"
          className="size-full object-cover"
        />
      </div>
    )
  }
  return (
    <div
      className="cover-art aspect-[4/3] w-full"
      // SVG 由 cover-art.ts 纯函数按 id 确定性生成，内容可信。
      dangerouslySetInnerHTML={{ __html: coverArtSvg(item.id) }}
    />
  )
}

interface CollectionsCardGridProps {
  items: CollectionItem[]
  onSelect: (id: string) => void
  onTagClick?: (tag: string) => void
}

export function CollectionsCardGrid({ items, onSelect, onTagClick }: CollectionsCardGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          className="gallery-card flex w-full flex-col overflow-hidden text-left"
        >
          <CollectionCover item={item} />
          <div className="flex flex-col gap-1.5 p-4">
            {/* Source + Category + Featured 徽标 */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`${chipClass} uppercase tracking-wide`} style={labelChipStyle(item.source)}>
                {item.source}
              </span>
              <span className={chipClass} style={labelChipStyle(item.category)}>
                {item.category}
              </span>
              {item.featured && (
                <span className="bg-primary/10 text-primary inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                  <Sparkles className="h-2.5 w-2.5" data-icon />
                  Featured
                </span>
              )}
            </div>

            {/* 标题 */}
            <h3 className="text-foreground truncate text-sm font-semibold">
              {item.title}
            </h3>

            {/* 简介 */}
            <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
              {item.description}
            </p>

            {/* 页脚：日期 + 标签 */}
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="text-muted-foreground flex items-center gap-1 text-[11px] tabular-nums">
                <Calendar className="h-3 w-3" data-icon />
                {item.date}
              </span>
              {item.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  {item.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        onTagClick?.(tag)
                      }}
                    >
                      <Tag className="h-2.5 w-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
