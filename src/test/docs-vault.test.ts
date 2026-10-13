import { describe, expect, it } from "vitest"
import { writingFiles, writingSource } from "../lib/content/bundled-files.docs"
import { parseWritingFile } from "../lib/content/parse-post"

describe("docs writing vault", () => {
  it("loads files from the local docs tree", () => {
    expect(writingSource).toBe("docs")
    const files = Object.keys(writingFiles)
    expect(files.length).toBeGreaterThan(0)
    expect(files.some((filePath) => filePath.includes("/docs/"))).toBe(true)
  })

  it("parses docs files into displayable posts", () => {
    const posts = Object.entries(writingFiles).map(([filePath, raw]) =>
      parseWritingFile(filePath, raw)
    )
    expect(posts.length).toBeGreaterThan(0)
    expect(posts.every((post) => post.slug && post.title)).toBe(true)
    expect(posts.some((post) => post.content.trim().length > 0)).toBe(true)
  })
})
