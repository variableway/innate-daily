import { useState } from "react"
import { ArrowLeft, ExternalLink, Loader2, Star } from "lucide-react"
import { Badge, Button } from "@innate/ui"
import type { CollectionItem } from "../../lib/collections/types"
import { categoryMeta } from "../../lib/writing/category-meta"
import { labelChipStyle } from "../../lib/writing/label-color"

interface CollectionViewerProps {
  item: CollectionItem
  onBack?: () => void
  isMobile?: boolean
  onTagClick?: (tag: string) => void
  onCategoryClick?: (category: string) => void
  onSourceClick?: (source: string) => void
}

/** 右侧查看器：条目头与 /writing 的 BlogViewer 同构（徽标 + 标题 + meta 行），下方 iframe 预览。 */
export function CollectionViewer({
  item,
  onBack,
  isMobile,
  onTagClick,
  onCategoryClick,
  onSourceClick,
}: CollectionViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="shrink-0 border-b border-border px-6 py-5 md:px-8">
        {isMobile && onBack ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mb-3 md:hidden"
          >
            <ArrowLeft data-icon="inline-start" />
            Back
          </Button>
        ) : null}

        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <Badge
            variant="outline"
            className="label-chip uppercase tracking-wide"
            style={labelChipStyle(item.source)}
            render={
              onSourceClick ? (
                <button type="button" onClick={() => onSourceClick(item.source)} />
              ) : undefined
            }
          >
            {item.source}
          </Badge>
          <Badge
            variant="outline"
            className="label-chip"
            style={labelChipStyle(item.category, categoryMeta(item.category).hue)}
            render={
              onCategoryClick ? (
                <button type="button" onClick={() => onCategoryClick(item.category)} />
              ) : undefined
            }
          >
            {item.category}
          </Badge>
          {item.featured ? (
            <Badge
              variant="outline"
              className="border-transparent bg-primary/10 text-primary gap-0.5"
            >
              <Star className="size-2.5" data-icon />
              Featured
            </Badge>
          ) : null}
        </div>

        <h1 className="text-foreground text-2xl font-semibold tracking-tight md:text-[1.75rem]">
          {item.title}
        </h1>
        {item.description ? (
          <p className="text-muted-foreground mt-1.5 max-w-2xl text-sm leading-relaxed">
            {item.description}
          </p>
        ) : null}

        <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1">
          <span className="text-muted-foreground text-sm">Updated {item.date}</span>
          {item.tags.length > 0 ? (
            <>
              <span className="text-muted-foreground text-sm">·</span>
              {item.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="label-chip cursor-pointer"
                  style={labelChipStyle(tag)}
                  render={
                    onTagClick ? (
                      <button type="button" onClick={() => onTagClick(tag)} />
                    ) : undefined
                  }
                >
                  {tag}
                </Badge>
              ))}
            </>
          ) : null}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 ml-auto inline-flex items-center gap-1 text-sm underline-offset-2 hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" data-icon />
            Open site
          </a>
        </div>
      </header>

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
