import { coverArtSvg } from "../../lib/landing/cover-art"
import { folderMeta } from "../../lib/writing/category-meta"

interface GalleryCardProps {
  /** 展区名（目录名，如 demo / research）。 */
  name: string
  /** 该目录下的文章数。 */
  count: number
  /** 最新文章标题（最多 3 条）。 */
  latest: string[]
  onOpen: () => void
}

/**
 * 画廊展品卡片：生成式 SVG 封面 + 目录信息。
 * 视觉行为由 globals.css 的 .gallery-card / .cover-art 承载（软阴影 + 悬停浮起）。
 */
export function GalleryCard({ name, count, latest, onOpen }: GalleryCardProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open folder ${name}`}
      className="gallery-card flex w-full flex-col overflow-hidden text-left"
    >
      <div
        className="cover-art aspect-[4/3] w-full"
        // SVG 由 cover-art.ts 纯函数按名字确定性生成，内容可信。
        // 色相优先使用策展映射表，与侧栏图标 / badge 保持同色。
        dangerouslySetInnerHTML={{ __html: coverArtSvg(name, folderMeta(name).hue) }}
      />
      <div className="flex flex-col gap-1.5 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-foreground truncate text-sm font-semibold capitalize">
            {name}
          </h3>
          <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
            {count} {count === 1 ? "note" : "notes"}
          </span>
        </div>
        {latest.length > 0 ? (
          <ul className="text-muted-foreground flex flex-col gap-0.5 text-xs leading-relaxed">
            {latest.map((title) => (
              <li key={title} className="truncate">
                {title}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </button>
  )
}
