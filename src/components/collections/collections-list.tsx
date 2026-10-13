import { Calendar, Tag } from "lucide-react"
import { cn } from "@innate/ui"
import type { CollectionItem } from "../../lib/collections/types"
import { labelChipStyle } from "../../lib/writing/label-color"

const chipClass =
  "label-chip inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium"

interface CollectionsListProps {
  items: CollectionItem[]
  activeId?: string
  onSelect: (id: string) => void
  onTagClick?: (tag: string) => void
}

export function CollectionsList({ items, activeId, onSelect, onTagClick }: CollectionsListProps) {
  return (
    <div className="flex flex-col gap-1 py-2">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          className={cn(
            "hover:bg-secondary/50 w-full rounded-lg border border-transparent px-4 py-3 text-left transition-colors",
            activeId === item.id && "bg-secondary border-border"
          )}
        >
          {/* Source + Category 徽标 */}
          <div className="mb-1.5 flex items-center gap-1.5">
            <span className={`${chipClass} uppercase tracking-wide`} style={labelChipStyle(item.source)}>
              {item.source}
            </span>
            <span className={chipClass} style={labelChipStyle(item.category)}>
              {item.category}
            </span>
          </div>

          {/* 标题 */}
          <h3 className="text-foreground mb-1 line-clamp-2 text-sm font-semibold leading-snug">
            {item.title}
          </h3>

          {/* 简介 */}
          <p className="text-muted-foreground mb-2 line-clamp-2 text-xs">
            {item.description}
          </p>

          {/* 元信息 + 标签 */}
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] tabular-nums">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" data-icon />
              {item.date}
            </span>
            {item.tags.length > 0 && (
              <>
                <span className="text-muted-foreground/20">|</span>
                <div className="flex flex-wrap items-center gap-1">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground inline-flex cursor-pointer items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] transition-colors"
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
              </>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}
