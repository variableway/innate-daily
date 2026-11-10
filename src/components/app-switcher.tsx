import { useLocation, useNavigate } from "@tanstack/react-router"
import { cn } from "@ui"
import { SoftLayers, SoftPenLine } from "./icons/soft-icons"

/**
 * 全局悬浮视图切换：日常（笔记） ⇄ Collections（作品）。
 * 由 RootLayout 固定在页面顶部居中，任何页面都存在。
 * 本地编辑入口在侧栏底部的 Settings 里（sidebar-settings.tsx）。
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
        "border-border bg-background/80 shadow-lg flex h-8 shrink-0 items-center gap-0.5 rounded-full border p-0.5 backdrop-blur-md",
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
