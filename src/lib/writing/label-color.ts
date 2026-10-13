import type { CSSProperties } from "react"

/** 色相量化步长：15° 一档共 24 档，避免出现肉眼难分的相邻色。 */
const HUE_STEP = 15
const HUE_SLOTS = 360 / HUE_STEP

/** 稳定 hash + 黄金角散射：同一个名字永远同色，相近名字也尽量落到相距最远的色相。 */
export function labelHueIndex(label: string): number {
  let hash = 0
  for (const ch of label) {
    hash = (hash * 31 + (ch.codePointAt(0) ?? 0)) % 1000003
  }
  const hue = (hash * 137.508) % 360
  return Math.floor(hue / HUE_STEP) % HUE_SLOTS
}

/** 标签（category / tag）的完整颜色值；明度/彩度由 globals.css 的 token 控制。
   传入 hueOverride 时使用策展固定色相（见 category-meta.ts），否则按名字 hash。 */
export function labelColorValue(label: string, hueOverride?: number | null): string {
  const hue = hueOverride ?? labelHueIndex(label) * HUE_STEP
  return `oklch(var(--label-l) var(--label-c) ${hue})`
}

/** 挂到 .label-chip 元素上，激活对应色相。 */
export function labelChipStyle(label: string, hueOverride?: number | null): CSSProperties {
  return {
    ["--label-color" as string]: labelColorValue(label, hueOverride),
  } as CSSProperties
}
