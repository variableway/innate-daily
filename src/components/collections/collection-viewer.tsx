import { useState } from "react"
import { ArrowLeft, ExternalLink, Loader2, Tag } from "lucide-react"
import type { CollectionItem } from "../../lib/collections/types"
import { labelChipStyle } from "../../lib/writing/label-color"

const chipClass =
  "label-chip inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium"

interface CollectionViewerProps {
  item: CollectionItem
  onBack?: () => void
  isMobile?: boolean
  onTagClick?: (tag: string) => void
}

export function CollectionViewer({ item, onBack, isMobile, onTagClick }: CollectionViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  return (
    <div className="flex h-full flex-col">
      {/* 条目头 */}
      <div className="border-border border-b px-4 py-3">
        {isMobile && onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground mb-2 flex items-center gap-1 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" data-icon />
            Back to grid
          </button>
        )}

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {/* Source + Category 徽标 */}
            <div className="mb-1 flex items-center gap-1.5">
              <span className={`${chipClass} uppercase tracking-wide`} style={labelChipStyle(item.source)}>
                {item.source}
              </span>
              <span className={chipClass} style={labelChipStyle(item.category)}>
                {item.category}
              </span>
            </div>

            {/* 标题 */}
            <h1 className="text-foreground text-lg leading-tight font-bold">
              {item.title}
            </h1>

            {/* 简介 */}
            {item.description && (
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{item.description}</p>
            )}

            {/* 标签 + 日期 */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground text-[11px] tabular-nums">{item.date}</span>
              {item.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onTagClick?.(tag)}
                  className="bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] transition-colors"
                >
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 新窗口打开（embed 失败时的主出口） */}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground hover:bg-secondary flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" data-icon />
            <span className="hidden sm:inline">Open</span>
          </a>
        </div>
      </div>

      {/* iframe 预览 */}
      <div className="min-h-0 flex-1 p-4">
        <div className="border-border bg-muted/30 relative h-full w-full overflow-hidden rounded-lg border">
          {isLoading && !isError && (
            <div className="text-muted-foreground absolute inset-0 z-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" data-icon />
                <span className="text-sm">Loading...</span>
              </div>
            </div>
          )}

          {isError && (
            <div className="text-muted-foreground absolute inset-0 z-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <ExternalLink className="h-8 w-8 opacity-30" data-icon />
                <p className="text-sm">This site cannot be embedded</p>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 flex items-center gap-1 text-xs"
                >
                  <ExternalLink className="h-3 w-3" />
                  Open in new tab
                </a>
              </div>
            </div>
          )}

          <iframe
            src={item.url}
            title={item.title}
            className="h-full w-full border-0"
            sandbox="allow-scripts allow-same-origin allow-popups"
            loading="lazy"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false)
              setIsError(true)
            }}
          />
        </div>
      </div>
    </div>
  )
}
