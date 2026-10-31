import { useLocation, useNavigate } from "@tanstack/react-router"
import { cn } from "@innate/ui"
import { SoftLayers, SoftPenLine } from "./icons/soft-icons"

/**
 * 站点左上角的顶层切换：日常（笔记） ⇄ Collections（收藏的站点）。
 * writing / collections / landing 三处共用，任何页面左上角都能一键切换。
 */
export function AppSwitcher({ className }: { className?: string }) {
  const pathname = useLocation({ select: (location) => location.pathname })
  const navigate = useNavigate()
  const onCollections = pathname.startsWith("/collections")

  const itemClass = (active: boolean) =>
    cn(
      "text-muted-foreground hover:text-foreground flex h-full items-center gap-1.5 rounded-full px-2.5 text-xs whitespace-nowrap transition-colors",
      active && "bg-card text-foreground shadow-sm font-medium"
    )

  return (
    <div
      role="tablist"
      aria-label="切换视图"
      className={cn(
        "bg-muted border-border flex h-8 shrink-0 items-center gap-0.5 rounded-full border p-0.5",
        className
      )}
    >
      <button
        type="button"
        role="tab"
        aria-selected={!onCollections}
        title="日常"
        className={itemClass(!onCollections)}
        onClick={() => navigate({ to: "/writing", search: {} })}
      >
        <SoftPenLine className="size-3.5 shrink-0" data-icon />
        日常
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={onCollections}
        title="Collections"
        className={itemClass(onCollections)}
        onClick={() => navigate({ to: "/collections", search: {} })}
      >
        <SoftLayers className="size-3.5 shrink-0" data-icon />
        Collections
      </button>
    </div>
  )
}
