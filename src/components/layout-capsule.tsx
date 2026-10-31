import { SoftLayoutGrid, SoftList } from "./icons/soft-icons"

/**
 * 布局切换胶囊：卡片 ⇄ 列表。
 * /writing 的 Plaza 与 /collections 的条目区共用同一个切换器，交互与视觉一致。
 */

export type LayoutMode = "cards" | "list"

export function LayoutCapsule({
  mode,
  onChange,
}: {
  mode: LayoutMode
  onChange: (mode: LayoutMode) => void
}) {
  return (
    <div className="site-layout-capsule" role="group" aria-label="布局模式">
      <button
        type="button"
        aria-pressed={mode === "cards"}
        aria-label="卡片模式"
        title="卡片"
        className={mode === "cards" ? "is-on" : ""}
        onClick={() => onChange("cards")}
      >
        <SoftLayoutGrid size={13} aria-hidden="true" />
        <span>卡片</span>
      </button>
      <button
        type="button"
        aria-pressed={mode === "list"}
        aria-label="列表模式"
        title="列表"
        className={mode === "list" ? "is-on" : ""}
        onClick={() => onChange("list")}
      >
        <SoftList size={13} aria-hidden="true" />
        <span>列表</span>
      </button>
    </div>
  )
}
