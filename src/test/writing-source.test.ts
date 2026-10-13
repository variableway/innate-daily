import { describe, expect, it } from "vitest"
import { resolveWritingSource } from "../lib/content/writing-source"

describe("writing source", () => {
  it("defaults to all", () => {
    expect(resolveWritingSource(undefined)).toBe("all")
    expect(resolveWritingSource("docs")).toBe("docs")
    expect(resolveWritingSource("use-cases")).toBe("use-cases")
  })
})
