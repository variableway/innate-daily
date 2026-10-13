import { describe, expect, it } from "vitest"
import {
  COVER_ART_VARIANTS,
  coverArtSvg,
  coverArtVariant,
  coverHash,
  coverHue,
} from "../lib/landing/cover-art"

describe("cover-art", () => {
  it("is deterministic: same name always yields the same svg", () => {
    expect(coverArtSvg("research/ui")).toBe(coverArtSvg("research/ui"))
  })

  it("picks a variant from the known set", () => {
    for (const name of ["demo", "research", "research/ui", "docs", "x"]) {
      expect(COVER_ART_VARIANTS).toContain(coverArtVariant(name))
    }
  })

  it("different names can produce different art", () => {
    expect(coverArtSvg("demo")).not.toBe(coverArtSvg("research"))
  })

  it("derives hue in 15-degree slots, consistent with label colors", () => {
    const hue = coverHue("demo")
    expect(hue % 15).toBe(0)
    expect(hue).toBeGreaterThanOrEqual(0)
    expect(hue).toBeLessThan(360)
  })

  it("emits a 4:3 svg using token-based oklch colors (no raw hex)", () => {
    const svg = coverArtSvg("research")
    expect(svg).toContain('viewBox="0 0 400 300"')
    expect(svg).toContain("oklch(var(--label-l)")
    expect(svg).not.toMatch(/#[0-9a-fA-F]{3,6}/)
    expect(coverHash("research")).toBeGreaterThan(0)
  })
})
