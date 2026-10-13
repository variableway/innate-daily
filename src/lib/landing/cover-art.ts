import { labelHueIndex } from "../writing/label-color"

/**
 * 生成式 SVG 封面：输入一个名字（目录 / 分类），输出确定性的 SVG 画廊封面。
 * 同一个名字永远得到同一张图；色相与 label-color 共用同一套 hash，
 * 保证「目录卡片封面」与「标签 badge」的色彩记忆点一致。
 */

export type CoverArtVariant = "waves" | "arcs" | "grid"

export const COVER_ART_VARIANTS: readonly CoverArtVariant[] = [
  "waves",
  "arcs",
  "grid",
]

/** 稳定字符串 hash（与 labelHueIndex 同算法，但保留原始 hash 供播种）。 */
export function coverHash(name: string): number {
  let hash = 0
  for (const ch of name) {
    hash = (hash * 31 + (ch.codePointAt(0) ?? 0)) % 1000003
  }
  return hash
}

/** mulberry32：小巧的确定性伪随机数发生器。 */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0 || 1
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function coverArtVariant(name: string): CoverArtVariant {
  return COVER_ART_VARIANTS[coverHash(name) % COVER_ART_VARIANTS.length]!
}

/** 封面主色相（角度），与 label-color 同源。 */
export function coverHue(name: string): number {
  return labelHueIndex(name) * 15
}

function oklch(l: string, c: string, hue: number, alpha?: number): string {
  const base = `oklch(${l} ${c} ${hue})`
  return alpha === undefined ? base : `color-mix(in oklab, ${base} ${alpha}%, transparent)`
}

/** 明度/彩度跟随 globals.css 的 --label-l / --label-c，暗色模式自动适配。 */
const L = "var(--label-l)"
const C = "var(--label-c)"

function wavesArt(hue: number, rand: () => number): string {
  const paths: string[] = []
  for (let i = 0; i < 3; i += 1) {
    const yBase = 90 + i * 55 + rand() * 20
    const amp = 18 + rand() * 22
    const phase = rand() * 400
    const d = `M -20 ${yBase} Q ${100 + phase * 0.2} ${yBase - amp}, 210 ${yBase} T 440 ${yBase}`
    const opacity = 90 - i * 20
    paths.push(
      `<path d="${d}" fill="none" stroke="${oklch(L, C, hue, opacity)}" stroke-width="${10 - i * 2}" stroke-linecap="round"/>`
    )
  }
  return paths.join("")
}

function arcsArt(hue: number, rand: () => number): string {
  const arcs: string[] = []
  const cx = 90 + rand() * 60
  const cy = 210 + rand() * 40
  for (let i = 0; i < 4; i += 1) {
    const r = 46 + i * 42
    const opacity = 95 - i * 18
    arcs.push(
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${oklch(L, C, hue, opacity)}" stroke-width="${12 - i * 2}"/>`
    )
  }
  arcs.push(`<circle cx="${cx}" cy="${cy}" r="14" fill="${oklch(L, C, hue)}"/>`)
  return arcs.join("")
}

function gridArt(hue: number, rand: () => number): string {
  const dots: string[] = []
  const cols = 8
  const rows = 6
  for (let x = 0; x < cols; x += 1) {
    for (let y = 0; y < rows; y += 1) {
      const hot = rand() > 0.82
      const r = hot ? 9 : 4
      const fill = hot
        ? oklch(L, C, hue)
        : oklch(L, C, hue, 25)
      dots.push(`<circle cx="${40 + x * 46}" cy="${38 + y * 46}" r="${r}" fill="${fill}"/>`)
    }
  }
  return dots.join("")
}

/**
 * 生成完整 SVG 字符串（viewBox 400x300，建议以 4:3 比例展示）。
 * 颜色全部使用 token 化的 oklch，不写死 hex，主题切换时跟随。
 * 传入 hueOverride 时使用策展固定色相（category-meta.ts），与图标/badge 同色。
 */
export function coverArtSvg(name: string, hueOverride?: number | null): string {
  const hue = hueOverride ?? coverHue(name)
  const rand = seededRandom(coverHash(name))
  const variant = coverArtVariant(name)
  const body =
    variant === "waves"
      ? wavesArt(hue, rand)
      : variant === "arcs"
        ? arcsArt(hue, rand)
        : gridArt(hue, rand)
  const bg = oklch(L, C, hue, 8)
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" role="img" aria-label="${name}">` +
    `<rect width="400" height="300" fill="${bg}"/>` +
    body +
    `</svg>`
  )
}
