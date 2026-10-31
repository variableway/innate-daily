import { describe, expect, it } from "vitest"
import {
  computePlazaColumns,
  distributePlazaColumns,
  estimatePlazaCardHeight,
  groupPlazaItems,
  plazaColumnWidth,
  type PlazaCardItem,
} from "../lib/writing/plaza-layout"

function item(id: string, title = "标题", excerpt = ""): PlazaCardItem {
  return { id, title, excerpt, hasCover: true }
}

describe("computePlazaColumns", () => {
  it("collapses to one column on narrow viewports", () => {
    expect(computePlazaColumns(400, 480)).toBe(1)
    expect(computePlazaColumns(720, 900)).toBe(2)
  })

  it("keeps desktop columns between three and six", () => {
    const cols = computePlazaColumns(1280, 1440)
    expect(cols).toBeGreaterThanOrEqual(3)
    expect(cols).toBeLessThanOrEqual(6)
  })

  it("never squeezes a column below 250px", () => {
    const width = 1000
    const cols = computePlazaColumns(width, 1440)
    expect(plazaColumnWidth(width, cols)).toBeGreaterThanOrEqual(250)
  })
})

describe("estimatePlazaCardHeight", () => {
  it("adds the cover height on top of the text block", () => {
    const withCover = estimatePlazaCardHeight(item("a", "短标题"), 200)
    const withoutCover = estimatePlazaCardHeight(
      { ...item("a", "短标题"), hasCover: false },
      200
    )
    expect(withCover - withoutCover).toBe(200)
  })

  it("grows with longer titles", () => {
    const short = estimatePlazaCardHeight(item("a", "短"))
    const long = estimatePlazaCardHeight(item("a", "很长的标题".repeat(6)))
    expect(long).toBeGreaterThan(short)
  })
})

describe("distributePlazaColumns", () => {
  it("places the summary card on top of the last column", () => {
    const cols = distributePlazaColumns([item("a"), item("b")], 3, true, new Map())
    expect(cols).toHaveLength(3)
    expect(cols[2]?.[0]).toEqual({ kind: "summary" })
    expect(cols[0]?.[0]).toEqual({ kind: "item", item: item("a") })
  })

  it("keeps the summary in the only column on narrow layouts", () => {
    const cols = distributePlazaColumns([item("a")], 1, true, new Map())
    expect(cols[0]?.[0]).toEqual({ kind: "summary" })
  })

  it("places every item exactly once", () => {
    const items = Array.from({ length: 7 }, (_, i) => item(`i${i}`))
    const cols = distributePlazaColumns(items, 3, false, new Map())
    const placed = cols.flatMap((col) => col.flatMap((tile) => (tile.kind === "item" ? [tile.item.id] : [])))
    expect(placed.sort()).toEqual(items.map((i) => i.id).sort())
  })

  it("uses measured heights when available", () => {
    const measured = new Map([
      ["a", 900],
      ["b", 10],
    ])
    const cols = distributePlazaColumns([item("a"), item("b")], 2, false, measured)
    // a 很高 → 下一张 b 应该落到另一列，避免同列叠高。
    expect(cols[0]?.[0]).toEqual({ kind: "item", item: item("a") })
    expect(cols[1]?.[0]).toEqual({ kind: "item", item: item("b") })
  })
})

describe("groupPlazaItems", () => {
  it("groups by key and keeps first-seen order", () => {
    const groups = groupPlazaItems(
      [
        { ...item("a"), category: "log" },
        { ...item("b"), category: "insight" },
        { ...item("c"), category: "log" },
      ],
      (post) => post.category
    )
    expect(groups.map((g) => g.id)).toEqual(["log", "insight"])
    expect(groups[0]?.items.map((i) => i.id)).toEqual(["a", "c"])
  })
})
