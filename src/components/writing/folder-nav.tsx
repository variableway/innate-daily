import { useState } from "react"
import { cn } from "@innate/ui"
import { folderMeta } from "../../lib/writing/category-meta"
import { labelColorValue } from "../../lib/writing/label-color"
import type { FolderNode } from "../../lib/writing/folder-tree"
import { SoftChevronRight } from "../icons/soft-icons"

export function FolderNav({
  nodes,
  activeId,
  onSelect,
  depth = 0,
}: {
  nodes: FolderNode[]
  activeId: string | null
  onSelect: (id: string) => void
  depth?: number
}) {
  if (nodes.length === 0) return null
  return (
    <ul className="flex flex-col gap-0.5">
      {nodes.map((node) => (
        <FolderRow
          key={node.id}
          node={node}
          activeId={activeId}
          onSelect={onSelect}
          depth={depth}
        />
      ))}
    </ul>
  )
}

function FolderRow({
  node,
  activeId,
  onSelect,
  depth,
}: {
  node: FolderNode
  activeId: string | null
  onSelect: (id: string) => void
  depth: number
}) {
  const hasChildren = node.children.length > 0
  // 默认收起：点击 chevron 才展开子目录。
  const [open, setOpen] = useState(false)
  const meta = folderMeta(node.name)
  const Icon = meta.icon

  return (
    <li>
      <div
        className="group flex items-center"
        style={{ paddingLeft: `${depth * 0.75}rem` }}
      >
        {hasChildren ? (
          <button
            type="button"
            aria-label={open ? `收起 ${node.name}` : `展开 ${node.name}`}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="text-muted-foreground hover:text-foreground inline-flex size-5 shrink-0 items-center justify-center rounded"
          >
            <SoftChevronRight
              className={cn("size-3.5 transition-transform", open && "rotate-90")}
              data-icon
            />
          </button>
        ) : (
          <span className="size-5 shrink-0" />
        )}
        <button
          type="button"
          onClick={() => onSelect(node.id)}
          data-active={activeId === node.id}
          className={cn(
            "hover:bg-sidebar-accent flex min-w-0 flex-1 items-center gap-2 rounded-md py-1.5 pr-2 text-sm",
            "data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium"
          )}
        >
          <Icon
            className="size-4 shrink-0"
            data-icon="inline-start"
            style={{ color: labelColorValue(node.name, meta.hue) }}
          />
          <span className="min-w-0 flex-1 truncate text-left">{node.name}</span>
          <span className="text-muted-foreground text-xs tabular-nums">
            {node.count}
          </span>
        </button>
      </div>
      {open && hasChildren ? (
        <FolderNav
          nodes={node.children}
          activeId={activeId}
          onSelect={onSelect}
          depth={depth + 1}
        />
      ) : null}
    </li>
  )
}
