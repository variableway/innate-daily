import { useEffect, useRef, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { ThemeSelector, cn } from "@ui"
import { SoftWrench } from "./icons/soft-icons"

/**
 * 侧栏底部的 Settings：齿轮图标，向上弹出面板。
 * 面板里是主题选择（复用 ThemeSelector）与「本地编辑」入口。
 * 适用于带侧栏的页面（writing / collections）与编辑页顶栏。
 */
export function SidebarSettings({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // 点面板外关闭。
  useEffect(() => {
    if (!open) return
    const onDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    window.addEventListener("mousedown", onDown)
    return () => window.removeEventListener("mousedown", onDown)
  }, [open])

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        aria-label="Settings"
        aria-expanded={open}
        title="Settings：主题与本地编辑"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground flex size-7 items-center justify-center rounded-md transition-colors",
          open && "bg-sidebar-accent text-foreground"
        )}
      >
        <svg
          className="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {/* 齿轮：外圈 + 内圆，六向齿（lucide settings 同形） */}
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.3 11.3 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      </button>
      {open ? (
        <div
          role="menu"
          className="bg-card border-border shadow-popover absolute bottom-full left-0 z-50 mb-2 w-64 rounded-xl border p-3"
        >
          <p className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wider uppercase">
            Theme
          </p>
          <ThemeSelector />
          <div className="bg-border my-3 h-px" />
          <p className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wider uppercase">
            Workspace
          </p>
          <button
            type="button"
            role="menuitem"
            className="hover:bg-sidebar-accent text-foreground flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors"
            onClick={() => {
              setOpen(false)
              navigate({ to: "/edit" })
            }}
          >
            <SoftWrench className="size-3.5 shrink-0" data-icon />
            本地编辑
            <span className="text-muted-foreground ml-auto font-mono text-[10px]">/#/edit</span>
          </button>
        </div>
      ) : null}
    </div>
  )
}
