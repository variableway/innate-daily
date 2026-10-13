import { describe, expect, it } from "vitest"
import { writingFiles, writingSource } from "../lib/content/bundled-files.docs"

describe("docs writing vault", () => {
  it("loads the local docs tree and not content/", () => {
    const files = Object.keys(writingFiles)
    expect(writingSource).toBe("docs")
    expect(files.some((filePath) => filePath.includes("/docs/use-cases/"))).toBe(true)
    expect(files.some((filePath) => filePath.includes("/docs/modules/"))).toBe(true)
    expect(files.some((filePath) => filePath.includes("/content/"))).toBe(false)
  })
})
