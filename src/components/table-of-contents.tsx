import { useEffect, useState } from "react"
import { cn } from "@ui"

export interface TocItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  headings: TocItem[]
  className?: string
  title?: string
}

export function TableOfContents({ headings, className, title = "On this page" }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px" }
    )

    const timeout = setTimeout(() => {
      for (const h of headings) {
        const el = document.getElementById(h.id)
        if (el) observer.observe(el)
      }
    }, 200)

    return () => {
      clearTimeout(timeout)
      observer.disconnect()
    }
  }, [headings])

  if (headings.length === 0) return null

  return (
    <div className={cn("hidden lg:block sticky top-24 h-fit max-h-[calc(100vh-120px)] overflow-y-auto", className)}>
      <h3 className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
        {title}
      </h3>
      <nav className="space-y-1">
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            className={cn(
              "block text-sm py-1 transition-colors border-l-2 pl-3",
              heading.level === 3 && "pl-6",
              activeId === heading.id
                ? "border-[#8FA68E] text-[#8FA68E] font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
            onClick={(e) => {
              e.preventDefault()
              const element = document.getElementById(heading.id)
              if (element) {
                element.scrollIntoView({ behavior: "smooth" })
              }
            }}
          >
            {heading.text}
          </a>
        ))}
      </nav>
    </div>
  )
}
