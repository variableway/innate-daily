import { describe, expect, it } from "vitest"
import { writingFiles, writingSource } from "../lib/content/bundled-files.docs"
import { parseWritingFile } from "../lib/content/parse-post"

describe("docs writing vault", () => {
  it("is wired to the local docs tree", () => {
    expect(writingSource).toBe("docs")
    const files = Object.keys(writingFiles)
    // docs/ 目前为空——原有文档已整合进 use-cases/build-it-own/；
    // 这里只保证「docs 模式仍指向 docs/」，新增文档后内容会自动进来。
    expect(files.every((filePath) => filePath.includes("/docs/"))).toBe(true)
  })

  it("parses any docs files into displayable posts", () => {
    const posts = Object.entries(writingFiles).map(([filePath, raw]) =>
      parseWritingFile(filePath, raw)
    )
    expect(posts.every((post) => post.slug && post.title)).toBe(true)
  })
})
