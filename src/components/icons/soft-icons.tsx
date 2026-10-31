import type { ReactElement, ReactNode, SVGProps } from "react"

/**
 * 柔和图标集（sidebars / 目录 / 分类）。
 *
 * lucide 的默认语言是 2px 实线 + 近乎直角的折角，在本站「圆角、细线、留白」
 * 的卡片体系里显得生硬。这里自绘一套同语言图标：
 * - 统一 24×24 viewBox、1.6 描边、圆头圆角连接
 * - 几何全部走大圆角（rect rx ≥ 2.5）或曲线，不用直角折边
 * - 颜色一律 currentColor，跟随主题 token / 分类色
 *
 * 用法与 lucide 组件一致：<SoftX className="size-4" style={{ color }} />
 */

export type SoftIcon = (props: SoftIconProps) => ReactElement

export interface SoftIconProps extends SVGProps<SVGSVGElement> {
  /** 与 lucide 一致的便捷尺寸（映射到 width/height）。 */
  size?: string | number
  children?: ReactNode
}

function SoftSvg({ children, size, width, height, style, ...props }: SoftIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      width={size ?? width}
      height={size ?? height}
      style={size ? { width: size, height: size, ...style } : style}
      {...props}
    >
      {children}
    </svg>
  )
}

/* ---------------------------------------------------------------- 目录 / 分类 */

/** 文档（Notes / specs）。 */
export function SoftFileText(props: SoftIconProps) {
  return (
    <SoftSvg {...props}>
      <path d="M13.4 3.75H7.9A2.15 2.15 0 0 0 5.75 5.9v12.2a2.15 2.15 0 0 0 2.15 2.15h8.2a2.15 2.15 0 0 0 2.15-2.15V8.35Z" />
      <path d="M13.4 3.75v3.4a1.2 1.2 0 0 0 1.2 1.2h3.65" />
      <path d="M9.25 12.4h5.5" />
      <path d="M9.25 15.6h3.5" />
    </SoftSvg>
  )
}

/** 文件夹（通用兜底）。 */
export function SoftFolder(props: SoftIconProps) {
  return (
    <SoftSvg {...props}>
      <path d="M3.6 8.4a2 2 0 0 1 2-2h3.62a2 2 0 0 1 1.51.69l.96 1.13a2 2 0 0 0 1.51.68h5.4a2 2 0 0 1 2 2v6.7a2 2 0 0 1-2 2H5.6a2 2 0 0 1-2-2Z" />
    </SoftSvg>
  )
}

/** 立方包裹（use-cases）。 */
export function SoftPackage(props: SoftIconProps) {
  return (
    <SoftSvg {...props}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </SoftSvg>
  )
}

/** 方块阵（build-it-own）。 */
export function SoftBlocks(props: SoftIconProps) {
  return (
    <SoftSvg {...props}>
      <path d="M10.25 3.25H4.75a1.5 1.5 0 0 0-1.5 1.5v14a1.5 1.5 0 0 0 1.5 1.5h5.5a1.5 1.5 0 0 0 1.5-1.5v-14a1.5 1.5 0 0 0-1.5-1.5Z" />
      <rect x="13.25" y="13.25" width="6.5" height="6.5" rx="2.5" />
      <rect x="13.25" y="3.25" width="6.5" height="6.5" rx="2.5" />
      <rect x="3.25" y="13.25" width="6.5" height="6.5" rx="2.5" />
    </SoftSvg>
  )
}

/** 叠层（Collections）。 */
export function SoftLayers(props: SoftIconProps) {
  return (
    <SoftSvg {...props}>
      <path d="M12 3.6 20.4 7.9 12 12.2 3.6 7.9Z" />
      <path d="m3.6 12 8.4 4.3 8.4-4.3" />
      <path d="m3.6 16.1 8.4 4.3 8.4-4.3" />
    </SoftSvg>
  )
}

/** 扳手（demo）。 */
export function SoftWrench(props: SoftIconProps) {
  return (
    <SoftSvg {...props}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94Z" />
    </SoftSvg>
  )
}

/** 烧瓶（research）。 */
export function SoftFlask(props: SoftIconProps) {
  return (
    <SoftSvg {...props}>
      <path d="M10 2.75v6.9a2 2 0 0 1-.28 1.01L4.9 19.9a1.4 1.4 0 0 0 1.2 2.1h11.8a1.4 1.4 0 0 0 1.2-2.1l-4.82-9.24a2 2 0 0 1-.28-1.01v-6.9" />
      <path d="M8.5 2.75h7" />
      <path d="M7.4 15.5h9.2" />
    </SoftSvg>
  )
}

/** 调色盘（ui）。 */
export function SoftPalette(props: SoftIconProps) {
  return (
    <SoftSvg {...props}>
      <path d="M12 2.75C6.96 2.75 2.75 6.96 2.75 12s4.21 9.25 9.25 9.25c.83 0 1.46-.64 1.46-1.44 0-.37-.15-.72-.38-.98a1.45 1.45 0 0 1 1.07-2.46h1.7c2.83 0 5.15-2.32 5.15-5.15 0-4.88-4.21-8.47-9-8.47Z" />
      <path d="M7.4 10.9h.01" />
      <path d="M10.4 7.4h.01" />
      <path d="M14.4 7.9h.01" />
    </SoftSvg>
  )
}

/** 锤子（guide）。 */
export function SoftHammer(props: SoftIconProps) {
  return (
    <SoftSvg {...props}>
      <path d="m14.75 11.5-8.2 8.2a2 2 0 0 1-2.83-2.83l8.2-8.2" />
      <path d="m17.75 14.5 3.5-3.5" />
      <path d="m20.75 11-1.6-1.6a2 2 0 0 1-.58-1.42V5.9a1.9 1.9 0 0 0-1.9-1.9h-2.15a2 2 0 0 1-1.42-.58L11.6 2.2l1.5 1.5" />
    </SoftSvg>
  )
}

/** 灯泡（insight）。 */
export function SoftLightbulb(props: SoftIconProps) {
  return (
    <SoftSvg {...props}>
      <path d="M14.8 14.1c.2-1 .7-1.75 1.5-2.55a5.85 5.85 0 0 0 1.45-3.4 5.75 5.75 0 0 0-11.5 0c0 1.16.48 2.42 1.45 3.4.8.8 1.3 1.55 1.5 2.55" />
      <path d="M9.4 17.6h5.2" />
      <path d="M10.2 21.25h3.6" />
    </SoftSvg>
  )
}

/** 日历（weekly / log）。 */
export function SoftCalendar(props: SoftIconProps) {
  return (
    <SoftSvg {...props}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="3.2" />
      <path d="M8 2.75v4" />
      <path d="M16 2.75v4" />
      <path d="M3.5 10h17" />
    </SoftSvg>
  )
}

/** 摊开的书（通用分类兜底）。 */
export function SoftBook(props: SoftIconProps) {
  return (
    <SoftSvg {...props}>
      <path d="M12 7.4v13.4" />
      <path d="M3.5 18.2a1 1 0 0 1-1-1V4.9a1 1 0 0 1 1-1h4.6a3.9 3.9 0 0 1 3.9 3.9 3.9 3.9 0 0 1 3.9-3.9h4.6a1 1 0 0 1 1 1v12.3a1 1 0 0 1-1 1h-6a2.9 2.9 0 0 0-2.9 2.9 2.9 2.9 0 0 0-2.9-2.9Z" />
    </SoftSvg>
  )
}

/** 学士帽（教育）。 */
export function SoftGraduationCap(props: SoftIconProps) {
  return (
    <SoftSvg {...props}>
      <path d="M21.1 10.6 12.5 6.1a1.6 1.6 0 0 0-1.6 0L3.3 10.6a.85.85 0 0 0 0 1.55l7.6 3.47a1.6 1.6 0 0 0 1.6 0l7.6-3.47a.85.85 0 0 0 0-1.55Z" />
      <path d="M21.4 11.6v4.2" />
      <path d="M6.6 13.7V16a5.4 5.4 0 0 0 10.8 0v-2.3" />
    </SoftSvg>
  )
}

/* ---------------------------------------------------------------- 站点 / 集合 */

/** 地球（站点）。 */
export function SoftGlobe(props: SoftIconProps) {
  return (
    <SoftSvg {...props}>
      <circle cx="12" cy="12" r="9.25" />
      <path d="M12 2.75a14.2 14.2 0 0 0 0 18.5 14.2 14.2 0 0 0 0-18.5Z" />
      <path d="M2.75 12h18.5" />
    </SoftSvg>
  )
}

/** 星标（精选）。 */
export function SoftStar(props: SoftIconProps) {
  return (
    <SoftSvg {...props}>
      <path d="m12 3.6 2.62 5.3 5.85.85-4.24 4.13 1 5.83L12 17.03l-5.23 2.75 1-5.83-4.24-4.13 5.85-.85Z" />
    </SoftSvg>
  )
}

/** 笔（写笔记）。 */
export function SoftPenLine(props: SoftIconProps) {
  return (
    <SoftSvg {...props}>
      <path d="M12 20.25h9" />
      <path d="M16.38 3.62a1.95 1.95 0 0 1 2.76 2.76L7.37 18.63a2 2 0 0 1-.86.51l-2.87.84a.5.5 0 0 1-.62-.62l.84-2.87a2 2 0 0 1 .5-.86Z" />
    </SoftSvg>
  )
}

/* ---------------------------------------------------------------- 通用小件 */

/** 右向尖角（目录展开）。 */
export function SoftChevronRight(props: SoftIconProps) {
  return (
    <SoftSvg {...props}>
      <path d="m9.75 6.75 5.25 5.25-5.25 5.25" />
    </SoftSvg>
  )
}

/** 左向尖角（横向滚动）。 */
export function SoftChevronLeft(props: SoftIconProps) {
  return (
    <SoftSvg {...props}>
      <path d="m14.25 6.75-5.25 5.25 5.25 5.25" />
    </SoftSvg>
  )
}

/** 上向尖角（展开）。 */
export function SoftChevronUp(props: SoftIconProps) {
  return (
    <SoftSvg {...props}>
      <path d="m6.75 14.25 5.25-5.25 5.25 5.25" />
    </SoftSvg>
  )
}

/** 放大镜（搜索）。 */
export function SoftSearch(props: SoftIconProps) {
  return (
    <SoftSvg {...props}>
      <circle cx="10.6" cy="10.6" r="6.6" />
      <path d="m15.4 15.4 4.35 4.35" />
    </SoftSvg>
  )
}

/* ---------------------------------------------------------------- 集合 / 通用 */

/** 分支（开源仓库徽标）。 */
export function SoftGitBranch(props: SoftIconProps) {
  return (
    <SoftSvg {...props}>
      <path d="M6 3.75v11.5" />
      <circle cx="18" cy="5.5" r="2.75" />
      <circle cx="6" cy="18" r="2.75" />
      <path d="M18 8.25a9 9 0 0 1-9 9" />
    </SoftSvg>
  )
}

/** 站外链接。 */
export function SoftExternalLink(props: SoftIconProps) {
  return (
    <SoftSvg {...props}>
      <path d="M14.75 3.25h5.5a.75.75 0 0 1 .75.75v5.5" />
      <path d="M9.75 14.25 21.25 2.75" />
      <path d="M17.25 13.25v5a2 2 0 0 1-2 2h-9.5a2 2 0 0 1-2-2v-9.5a2 2 0 0 1 2-2h5" />
    </SoftSvg>
  )
}

/** 左箭头（返回）。 */
export function SoftArrowLeft(props: SoftIconProps) {
  return (
    <SoftSvg {...props}>
      <path d="M20.25 12H3.75" />
      <path d="m10.5 5.25-6 6.75 6 6.75" />
    </SoftSvg>
  )
}

/** 右箭头（进入）。 */
export function SoftArrowRight(props: SoftIconProps) {
  return (
    <SoftSvg {...props}>
      <path d="M3.75 12h16.5" />
      <path d="m13.5 5.25 6 6.75-6 6.75" />
    </SoftSvg>
  )
}

/** 右上箭头（卡片悬停）。 */
export function SoftArrowUpRight(props: SoftIconProps) {
  return (
    <SoftSvg {...props}>
      <path d="M7.25 16.75 16.75 7.25" />
      <path d="M8.75 7.25h8v8" />
    </SoftSvg>
  )
}

/** 网格（卡片视图）。 */
export function SoftLayoutGrid(props: SoftIconProps) {
  return (
    <SoftSvg {...props}>
      <rect x="3.6" y="3.6" width="7.4" height="7.4" rx="2.6" />
      <rect x="13" y="3.6" width="7.4" height="7.4" rx="2.6" />
      <rect x="13" y="13" width="7.4" height="7.4" rx="2.6" />
      <rect x="3.6" y="13" width="7.4" height="7.4" rx="2.6" />
    </SoftSvg>
  )
}

/** 列表（列表视图）。 */
export function SoftList(props: SoftIconProps) {
  return (
    <SoftSvg {...props}>
      <path d="M4 6.25h.01" />
      <path d="M4 12h.01" />
      <path d="M4 17.75h.01" />
      <path d="M8.75 6.25H20" />
      <path d="M8.75 12H20" />
      <path d="M8.75 17.75H20" />
    </SoftSvg>
  )
}
