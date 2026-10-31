import { describe, expect, it } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { PanelIcon } from "../components/panel-icon"

function markup(collapsed?: boolean) {
  return renderToStaticMarkup(<PanelIcon collapsed={collapsed} />)
}

describe("panel-icon", () => {
  it("uses soft rounded geometry instead of hard right angles", () => {
    const html = markup()
    const rx = Number(html.match(/rx="([\d.]+)"/)?.[1])
    expect(rx).toBeGreaterThanOrEqual(4)
  })

  it("uses a light stroke with round caps", () => {
    const html = markup()
    const width = Number(html.match(/stroke-width="([\d.]+)"/)?.[1])
    expect(width).toBe(1.6)
    expect(html).toContain('stroke-linecap="round"')
    expect(html).toContain('stroke-linejoin="round"')
  })

  it("inherits the surrounding text color instead of hardcoding one", () => {
    const html = markup()
    expect(html).toContain('stroke="currentColor"')
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  it("draws no direction arrow when the state is unknown (mobile trigger)", () => {
    const html = markup()
    expect(html.match(/<path/g)?.length).toBe(1)
  })

  it("points the arrow right when the panel is collapsed (expand)", () => {
    const html = markup(true)
    expect(html).toContain("m12.75 9.5 3 2.5-3 2.5")
  })

  it("points the arrow left when the panel is expanded (collapse)", () => {
    const html = markup(false)
    expect(html).toContain("m15.75 9.5-3 2.5 3 2.5")
  })
})
