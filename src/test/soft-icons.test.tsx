import { describe, expect, it } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import * as soft from "../components/icons/soft-icons"

const ALL = Object.entries(soft).filter(
  ([name]) => name !== "SoftIcon" && typeof soft[name as keyof typeof soft] === "function"
)

describe("soft-icons", () => {
  it("exposes the full icon set", () => {
    const names = ALL.map(([name]) => name)
    expect(names).toEqual(
      expect.arrayContaining([
        "SoftFileText",
        "SoftFolder",
        "SoftPackage",
        "SoftBlocks",
        "SoftLayers",
        "SoftWrench",
        "SoftFlask",
        "SoftPalette",
        "SoftHammer",
        "SoftLightbulb",
        "SoftCalendar",
        "SoftBook",
        "SoftGlobe",
        "SoftStar",
        "SoftPenLine",
        "SoftChevronRight",
        "SoftChevronLeft",
        "SoftChevronUp",
        "SoftSearch",
        "SoftGitBranch",
        "SoftExternalLink",
        "SoftArrowLeft",
        "SoftArrowRight",
        "SoftArrowUpRight",
        "SoftLayoutGrid",
        "SoftList",
      ])
    )
  })

  it("draws every icon with the same light, round-capped stroke", () => {
    for (const [name, Icon] of ALL) {
      const html = renderToStaticMarkup(<Icon />)
      expect(html, name).toContain('stroke-width="1.6"')
      expect(html, name).toContain('stroke-linecap="round"')
      expect(html, name).toContain('stroke-linejoin="round"')
      expect(html, name).toContain('stroke="currentColor"')
      expect(html, name).not.toMatch(/#[0-9a-fA-F]{3,8}/)
    }
  })

  it("never uses near-square corners on rectangles", () => {
    for (const [name, Icon] of ALL) {
      const html = renderToStaticMarkup(<Icon />)
      const radii = [...html.matchAll(/rx="([\d.]+)"/g)].map((m) => Number(m[1]))
      for (const radius of radii) {
        expect(radius, name).toBeGreaterThanOrEqual(2.5)
      }
    }
  })

  it("uses a shared 24x24 canvas so sizes stay consistent", () => {
    for (const [name, Icon] of ALL) {
      const html = renderToStaticMarkup(<Icon />)
      expect(html, name).toContain('viewBox="0 0 24 24"')
    }
  })

  it("passes className and style through for theme coloring", () => {
    const html = renderToStaticMarkup(
      <soft.SoftFolder className="size-4" style={{ color: "oklch(0.6 0.1 300)" }} />
    )
    expect(html).toContain('class="size-4"')
    expect(html).toContain("oklch(0.6 0.1 300)")
  })

  it("supports the lucide-style size shortcut", () => {
    const html = renderToStaticMarkup(<soft.SoftList size={13} />)
    expect(html).toContain('width="13"')
    expect(html).toContain('height="13"')
  })
})
