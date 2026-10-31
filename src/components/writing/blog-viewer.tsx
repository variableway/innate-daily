import { SoftArrowLeft } from "../icons/soft-icons"
import {
  Badge,
  Button,
  ScrollArea,
} from "@innate/ui"
import { MarkdownPreview } from "../markdown-preview"
import { TableOfContents, type TocItem } from "../table-of-contents"
import { labelChipStyle } from "../../lib/writing/label-color"

export interface BlogViewerProps {
  title: string
  content: string
  excerpt: string
  date: string
  author: string
  category: string
  tags: string[]
  readingTime: number
  toc: TocItem[]
  onBack?: () => void
  showToc?: boolean
  onTagClick?: (tag: string) => void
  onCategoryClick?: (category: string) => void
}

export function BlogViewer({
  title,
  content,
  date,
  author,
  category,
  tags,
  readingTime,
  toc,
  onBack,
  showToc = false,
  onTagClick,
  onCategoryClick,
}: BlogViewerProps) {
  // 只有真的有标题时才留出 ToC 侧栏：否则那 200px 会变成空白，正文被挤窄。
  const hasToc = showToc && toc.length > 0

  return (
    <article className="flex h-full min-h-0 flex-col">
      <header className="shrink-0 border-b border-border px-6 py-5 md:px-8">
        {onBack ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mb-3 md:hidden"
          >
            <SoftArrowLeft data-icon="inline-start" />
            Back
          </Button>
        ) : null}
        {category ? (
          <Badge
            variant="outline"
            className="label-chip mb-2"
            style={labelChipStyle(category)}
            render={
              onCategoryClick ? (
                <button type="button" onClick={() => onCategoryClick(category)} />
              ) : undefined
            }
          >
            {category}
          </Badge>
        ) : null}
        <h1 className="text-foreground text-2xl font-semibold tracking-tight md:text-[1.75rem]">
          {title}
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Updated {date}
          <span className="mx-1.5">·</span>
          {readingTime} min read
          <span className="mx-1.5">·</span>
          {author}
        </p>
      </header>

      <ScrollArea className="min-h-0 flex-1">
        <div className="px-6 py-6 md:px-8 md:py-8">
          {hasToc ? (
            <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_13rem]">
              {/* 正文列收在 42rem（672px）：按 16px 正文算约 84 拉丁字符 / 45 汉字一行，
                  落在长文阅读的舒适区（拉丁 60-80、中文 30-45）上沿。 */}
              <MarkdownPreview source={content} className="mx-auto w-full max-w-[42rem]" />
              <aside className="hidden lg:block">
                <TableOfContents headings={toc} className="top-6" />
              </aside>
            </div>
          ) : (
            // 没有 ToC 时正文独占整列，把侧栏让出来的空间还回去；
            // 但阅读列宽仍按 42rem 收窄 —— 过宽的行长会让眼睛回扫时找错行。
            <MarkdownPreview source={content} className="mx-auto w-full max-w-[42rem]" />
          )}
        </div>
      </ScrollArea>

      <footer className="flex shrink-0 flex-wrap items-center gap-1.5 border-t border-border px-6 py-3 md:px-8">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className="label-chip"
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
      </footer>
    </article>
  )
}
