import { describe, expect, it } from "vitest"
import {
  SoftBook,
  SoftFlask,
  SoftFolder,
  SoftLightbulb,
} from "../components/icons/soft-icons"
import { categoryMeta, folderMeta } from "../lib/writing/category-meta"
import { labelColorValue } from "../lib/writing/label-color"

describe("category-meta", () => {
  it("returns curated icon and fixed hue for known categories", () => {
    expect(categoryMeta("research")).toEqual({ icon: SoftFlask, hue: 300 })
    expect(categoryMeta("insight").icon).toBe(SoftLightbulb)
  })

  it("is case-insensitive", () => {
    expect(categoryMeta("Research").hue).toBe(300)
  })

  it("falls back to neutral icon and hash hue for unknown categories", () => {
    const meta = categoryMeta("some-new-category")
    expect(meta.icon).toBe(SoftBook)
    expect(meta.hue).toBeNull()
  })

  it("folderMeta prefers folder table, falls back to category table, then Folder", () => {
    expect(folderMeta("ui").hue).toBe(300)
    expect(folderMeta("weekly").icon).toBe(categoryMeta("weekly").icon)
    expect(folderMeta("random-folder").icon).toBe(SoftFolder)
  })

  it("hue override wins over hash in labelColorValue", () => {
    expect(labelColorValue("research", 300)).toBe(
      "oklch(var(--label-l) var(--label-c) 300)"
    )
    // 不传 override 时维持 hash 行为（向后兼容）
    expect(labelColorValue("research")).not.toContain(" 300)")
  })
})
