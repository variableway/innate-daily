/**
 * 侧栏面板图标（折叠 / 展开 / 移动端抽屉触发器共用）。
 *
 * lucide 的 PanelLeft 系列是近直角方框（rx=2）+ 实线竖分隔，线条偏硬，
 * 和本站「圆角、细线、柔和」的卡片语言不合。这里自绘一版：
 * 大圆角外框 + 圆头端点的分隔线与箭头，笔画更轻。
 */
export function PanelIcon({ collapsed }: { collapsed?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 shrink-0"
      aria-hidden="true"
    >
      <rect x="3.75" y="4.75" width="16.5" height="14.5" rx="5" />
      <path d="M9.75 5.5v13" />
      {collapsed === undefined ? null : (
        <path d={collapsed ? "m12.75 9.5 3 2.5-3 2.5" : "m15.75 9.5-3 2.5 3 2.5"} />
      )}
    </svg>
  )
}
