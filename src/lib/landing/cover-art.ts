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

/**
 * SVG 里的颜色一律走行内 style，不走 fill/stroke 表现属性：
 * 部分浏览器（WebKit/Safari）不解析 SVG 表现属性里的颜色函数，
 * 解析失败会整体回落到默认黑色 —— 整张封面变成黑块。
 * 行内 style 按普通 CSS 解析，各浏览器行为一致。
 * 透明度用 oklch(L C H / A)，不依赖 color-mix()（旧引擎对后者支持更晚）。
 */
function oklch(hue: number, alpha?: number): string {
  const base = `oklch(var(--label-l) var(--label-c) ${hue}`
  return alpha === undefined ? `${base})` : `${base} / ${alpha})`
}

/** 填充 / 描边分别拼 style。 */
function fillStyle(hue: number, alpha?: number): string {
  return `fill:${oklch(hue, alpha)}`
}

function strokeStyle(hue: number, alpha?: number): string {
  return `fill:none;stroke:${oklch(hue, alpha)}`
}

function wavesArt(hue: number, rand: () => number): string {
  const paths: string[] = []
  for (let i = 0; i < 3; i += 1) {
    const yBase = 90 + i * 55 + rand() * 20
    const amp = 18 + rand() * 22
    const phase = rand() * 400
    const d = `M -20 ${yBase} Q ${100 + phase * 0.2} ${yBase - amp}, 210 ${yBase} T 440 ${yBase}`
    const opacity = (90 - i * 20) / 100
    paths.push(
      `<path d="${d}" style="${strokeStyle(hue, opacity)}" stroke-width="${10 - i * 2}" stroke-linecap="round"/>`
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
    const opacity = (95 - i * 18) / 100
    arcs.push(
      `<circle cx="${cx}" cy="${cy}" r="${r}" style="${strokeStyle(hue, opacity)}" stroke-width="${12 - i * 2}"/>`
    )
  }
  arcs.push(`<circle cx="${cx}" cy="${cy}" r="14" style="${fillStyle(hue)}"/>`)
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
      const style = fillStyle(hue, hot ? undefined : 0.25)
      dots.push(`<circle cx="${40 + x * 46}" cy="${38 + y * 46}" r="${r}" style="${style}"/>`)
    }
  }
  return dots.join("")
}

/**
 * 生成完整 SVG 字符串（viewBox 400x300，建议以 4:3 比例展示）。
 * 颜色全部使用 token 化的 oklch，不写死 hex，主题切换时跟随。
 * 传入 hueOverride 时使用策展固定色相（category-meta.ts），与图标/badge 同色。
 * slice = true 时按容器裁切填满（preserveAspectRatio slice），用于卡片头图 / 缩略图。
 */
export function coverArtSvg(
  name: string,
  hueOverride?: number | null,
  options?: { slice?: boolean }
): string {
  const hue = hueOverride ?? coverHue(name)
  const rand = seededRandom(coverHash(name))
  const variant = coverArtVariant(name)
  const body =
    variant === "waves"
      ? wavesArt(hue, rand)
      : variant === "arcs"
        ? arcsArt(hue, rand)
        : gridArt(hue, rand)
  const preserve = options?.slice ? ' preserveAspectRatio="xMidYMid slice"' : ""
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" role="img" aria-label="${name}"${preserve}>` +
    `<rect width="400" height="300" style="${fillStyle(hue, 0.08)}"/>` +
    body +
    `</svg>`
  )
}
