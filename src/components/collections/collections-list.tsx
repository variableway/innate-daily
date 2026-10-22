import { Badge, cn } from "@innate/ui"
import type { CollectionItem } from "../../lib/collections/types"
import { categoryMeta } from "../../lib/writing/category-meta"
import { labelChipStyle } from "../../lib/writing/label-color"

interface CollectionsListProps {
  items: CollectionItem[]
  activeId?: string
  onSelect: (id: string) => void
  onTagClick?: (tag: string) => void
}

/** 中列列表：与 /writing 的 BlogList 同款卡片语言（圆角卡片 + 选中 ring + label-chip 徽标）。 */
export function CollectionsList({
  items,
  activeId,
  onSelect,
  onTagClick,
}: CollectionsListProps) {
  return (
    <div className="flex flex-col gap-2 p-3">
      {items.map((item) => {
        const isActive = activeId === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            data-active={isActive}
            className={cn(
              "w-full rounded-xl border p-3 text-left transition-all duration-150",
              isActive
                ? "border-primary/40 bg-card shadow-sm ring-2 ring-primary/25"
                : "border-transparent bg-transparent hover:border-border hover:bg-card hover:shadow-sm motion-safe:hover:-translate-y-0.5"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-foreground line-clamp-1 text-sm font-semibold leading-snug">
                {item.title}
              </h3>
              <span className="text-muted-foreground shrink-0 text-[11px] tabular-nums">
                {item.date}
              </span>
            </div>
            <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-relaxed">
              {item.description}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1">
              <Badge
                variant="outline"
                className="label-chip uppercase"
                style={labelChipStyle(item.source)}
              >
                {item.source}
              </Badge>
              <Badge
                variant="outline"
                className="label-chip"
                style={labelChipStyle(item.category, categoryMeta(item.category).hue)}
              >
                {item.category}
              </Badge>
              {item.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="label-chip cursor-pointer"
                  style={labelChipStyle(tag)}
                  onClick={(event) => {
                    event.stopPropagation()
                    onTagClick?.(tag)
                  }}
                >
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 3 ? (
                <span className="text-muted-foreground text-[11px]">
                  +{item.tags.length - 3} more
                </span>
              ) : null}
            </div>
          </button>
        )
      })}
    </div>
  )
}
