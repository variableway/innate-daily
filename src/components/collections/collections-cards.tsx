import { Badge, cn } from "@innate/ui"
import { SoftArrowUpRight, SoftGitBranch } from "../icons/soft-icons"
import type { CollectionItem } from "../../lib/collections/types"
import { collectionRepo, repoBadgeLabel, repoBadgeTitle } from "../../lib/collections/repo"
import { collectionCoverUrl } from "../../lib/collections/cover"
import { categoryMeta } from "../../lib/writing/category-meta"
import { labelChipStyle, labelColorValue } from "../../lib/writing/label-color"
import { coverArtSvg } from "../../lib/landing/cover-art"

interface CollectionsCardsProps {
  items: CollectionItem[]
  activeId?: string
  onSelect: (id: string) => void
  onTagClick?: (tag: string) => void
}

/**
 * 中列卡片墙：与 /writing 的 Plaza 卡片同一套语言（生成式 SVG 封面 + 圆角卡片
 * + 悬停箭头），封面按标题确定性生成，因此不需要额外维护缩略图。
 */
export function CollectionsCards({
  items,
  activeId,
  onSelect,
  onTagClick,
}: CollectionsCardsProps) {
  return (
    <div className="collection-cards">
      {items.map((item) => (
        <CollectionCard
          key={item.id}
          item={item}
          active={activeId === item.id}
          onSelect={onSelect}
          onTagClick={onTagClick}
        />
      ))}
    </div>
  )
}

function CollectionCard({
  item,
  active,
  onSelect,
  onTagClick,
}: {
  item: CollectionItem
  active: boolean
  onSelect: (id: string) => void
  onTagClick?: (tag: string) => void
}) {
  const meta = categoryMeta(item.category)
  const repo = collectionRepo(item)

  return (
    <button
      type="button"
      className="plaza-card collection-card"
      data-active={active}
      data-tile={item.id}
      onClick={() => onSelect(item.id)}
    >
      {/* 有 thumbnail 就用站点首屏截图（light 版），否则回落到 cover-art.ts 生成的 SVG 封面。 */}
      {item.thumbnail ? (
        <span
          className="plaza-media collection-cover"
          style={{ backgroundImage: `url(${collectionCoverUrl(item.thumbnail)})` }}
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
          <span>{item.source}</span>
          <span className="plaza-dot" aria-hidden="true" />
          <span>{item.date}</span>
        </div>
        <h3 className="plaza-title">{item.title}</h3>
        <p className="plaza-judgment">{item.description}</p>
        <div className="plaza-chips">
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
            style={labelChipStyle(item.category, meta.hue)}
          >
            {item.category}
          </Badge>
          {repo ? (
            <Badge
              variant="outline"
              className="text-muted-foreground gap-1"
              title={repoBadgeTitle(repo)}
            >
              <SoftGitBranch className="size-3" data-icon />
              {repoBadgeLabel(repo)}
            </Badge>
          ) : null}
          {item.tags.slice(0, 2).map((tag) => (
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
        </div>
      </div>
      <span
        className={cn("plaza-go", active && "is-on")}
        aria-hidden="true"
      >
        <SoftArrowUpRight size={14} />
      </span>
    </button>
  )
}
