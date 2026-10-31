/**
 * Plaza 瀑布流排布：列数计算 / 卡片高度估算 / 贪心分配。
 * 算法移植自 daily-next 的 Plaza 组件（列宽 ≥250px、3~6 列、最短列优先），
 * 拆成纯函数便于单测，也方便 writing 侧复用同一套节奏。
 */

/** 参与排布的卡片信息（与具体内容源解耦）。 */
export interface PlazaCardItem {
  id: string
  title: string
  excerpt: string
  /** 是否有封面（有封面时卡片更高）。 */
  hasCover: boolean
}

export type PlazaTile =
  | { kind: "summary" }
  | { kind: "item"; item: PlazaCardItem }

/** 列间距，与源站一致。 */
export const PLAZA_GAP = 12

/** 列数：窄屏 1 列 / 中屏 2 列 / 桌面按宽度 3..6 列且每列 ≥250px。 */
export function computePlazaColumns(width: number, innerWidth: number): number {
  if (innerWidth <= 649) return 1
  if (innerWidth <= 1024) return 2
  let n = Math.round((width + PLAZA_GAP) / 292)
  n = Math.max(3, Math.min(6, n))
  while (n > 3 && (width - (n - 1) * PLAZA_GAP) / n < 250) --n
  return n
}

/** 单列宽度（用于按比例推算封面高度）。 */
export function plazaColumnWidth(containerWidth: number, colCount: number): number {
  if (colCount <= 0) return containerWidth
  return (containerWidth - (colCount - 1) * PLAZA_GAP) / colCount
}

/** 卡片高度估算（未实测时使用）：正文块 + 封面高度。 */
export function estimatePlazaCardHeight(item: PlazaCardItem, coverHeight = 0): number {
  const titleLines = Math.ceil(item.title.length / 22)
  const body =
    86 + Math.min(3, titleLines) * 20 + Math.min(2, Math.ceil(item.excerpt.length / 26)) * 18
  return (item.hasCover ? coverHeight : 0) + body
}

/** 概览卡（summary）的高度估算。 */
export function estimatePlazaSummaryHeight(): number {
  return 240
}

/**
 * 贪心分配：每张卡片落到当前最矮的一列；概览卡固定放在最后一列顶部。
 * measured 为实测高度（key = 卡片 id，summary 用 "summary"），有实测值时优先使用。
 */
export function distributePlazaColumns(
  items: PlazaCardItem[],
  colCount: number,
  withSummary: boolean,
  measured: ReadonlyMap<string, number>,
  coverHeight = 0
): PlazaTile[][] {
  const cols: PlazaTile[][] = Array.from({ length: Math.max(1, colCount) }, () => [])
  const heights = Array<number>(cols.length).fill(0)
  if (withSummary) {
    const idx = cols.length <= 1 ? 0 : cols.length - 1
    cols[idx]!.push({ kind: "summary" })
    heights[idx] = (measured.get("summary") ?? estimatePlazaSummaryHeight()) + PLAZA_GAP
  }
  for (const item of items) {
    let shortest = 0
    for (let c = 1; c < cols.length; c++) {
      if ((heights[c] ?? 0) < (heights[shortest] ?? 0)) shortest = c
    }
    cols[shortest]!.push({ kind: "item", item })
    heights[shortest] =
      (heights[shortest] ?? 0) +
      (measured.get(item.id) ?? estimatePlazaCardHeight(item, coverHeight)) +
      PLAZA_GAP
  }
  return cols
}

/** 列表模式按分类分组（保持首次出现顺序）。 */
export interface PlazaSection<T> {
  id: string
  items: T[]
}

export function groupPlazaItems<T>(
  items: readonly T[],
  keyOf: (item: T) => string
): PlazaSection<T>[] {
  const sections: PlazaSection<T>[] = []
  const index = new Map<string, PlazaSection<T>>()
  for (const item of items) {
    const key = keyOf(item)
    let section = index.get(key)
    if (!section) {
      section = { id: key, items: [] }
      index.set(key, section)
      sections.push(section)
    }
    section.items.push(item)
  }
  return sections
}
