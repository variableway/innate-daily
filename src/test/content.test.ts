import { describe, expect, it } from "vitest"
import { getWritingMeta } from "../lib/content"
import { writingFiles } from "#writing-files"
import { deriveExcerpt, parseFrontmatter } from "../lib/content/parser"
import { fallbackSlug, parseWritingFile } from "../lib/content/parse-post"

describe("writing content vault", () => {
  it("bundles the docs tree as the single content root", () => {
    const posts = getWritingMeta({ status: "published" })
    const files = Object.keys(writingFiles)
    expect(files.length).toBeGreaterThan(0)
    // 文档根已统一为 docs/：不再从仓库根的 content/ 或 use-cases/ 读取。
    expect(files.every((filePath) => filePath.includes("/docs/"))).toBe(true)
    expect(posts.length).toBeGreaterThan(0)
    expect(posts.every((post) => post.slug && post.title)).toBe(true)
    expect(
      posts.every(
        (post) =>
          post.vault === "content" ||
          post.vault === "docs" ||
          post.vault === "use-cases"
      )
    ).toBe(true)
  })

  it("derives vault and folder from the docs directory layout", () => {
    const posts = getWritingMeta()
    // docs/content/research/ui/** → vault content
    const content = posts.find((post) => post.vault === "content")
    expect(content?.folder).toBe("research/ui")
    // docs/use-cases/** → vault use-cases
    const useCase = posts.find((post) => post.vault === "use-cases")
    expect(useCase?.folder).toMatch(/^(build-it-own|toolchain)$/)
  })
})

describe("parseFrontmatter labels", () => {
  it("treats label / labels as tags", () => {
    const { meta } = parseFrontmatter(`---
title: Labeled
tags: [alpha]
label: beta
labels: [gamma, alpha]
---
body
`)
    expect(meta.tags).toEqual(["alpha", "beta", "gamma"])
  })
})

describe("nested path fallbacks", () => {
  it("builds a url-safe slug from three folder levels", () => {
    expect(fallbackSlug("/vault/content/demo/nested/deep/note.md")).toBe(
      "content-demo-nested-deep-note"
    )
    expect(fallbackSlug("/repo/docs/use-cases/01-empty-webshell.md")).toBe(
      "use-cases-01-empty-webshell"
    )
    expect(fallbackSlug("/repo/docs/modules/cli.md")).toBe(
      "docs-modules-cli"
    )
  })

  it("uses the first folder as category when frontmatter omits it", () => {
    const post = parseWritingFile(
      "/vault/content/demo/nested/deep/note.md",
      "---\ntitle: Deep\n---\nHi\n"
    )
    expect(post.category).toBe("demo")
    expect(post.vault).toBe("content")
    expect(post.folder).toBe("demo/nested/deep")
    expect(post.slug).toBe("content-demo-nested-deep-note")
  })

  it("derives the category from the directory and keeps the frontmatter one aside", () => {
    const post = parseWritingFile(
      "/repo/docs/content/research/ui/note.md",
      "---\ntitle: X\ncategory: guide\n---\nHi\n"
    )
    // 分类按目录推导（「目录即分类」），frontmatter 的 category 只留作参考。
    expect(post.category).toBe("research")
    expect(post.metaCategory).toBe("guide")
  })

  it("falls back to the vault when the file sits at the vault root", () => {
    const post = parseWritingFile("/repo/docs/content/note.md", "# T\n")
    expect(post.category).toBe("content")
    expect(post.folder).toBe("")
  })
})

describe("deriveExcerpt", () => {
  it("skips the title and code fences, takes the first paragraph", () => {
    const body = [
      "# 用例 1：标题",
      "",
      "在仓库根执行。`pnpm run dev` 会起 Vite。",
      "",
      "```bash",
      "pnpm install",
      "```",
      "",
      "后面的段落不应出现。",
    ].join("\n")
    expect(deriveExcerpt(body)).toBe("在仓库根执行。pnpm run dev 会起 Vite。")
  })

  it("strips markdown syntax and truncates long paragraphs", () => {
    const long = Array.from({ length: 40 }, (_, i) => `word${i}`).join(" ")
    const body = `[link text](https://example.com) ${long}`
    const excerpt = deriveExcerpt(body, 30)
    expect(excerpt.startsWith("link text word0")).toBe(true)
    expect(excerpt.length).toBeLessThanOrEqual(31)
    expect(excerpt.endsWith("…")).toBe(true)
  })

  it("falls back to an empty string when no prose exists", () => {
    expect(deriveExcerpt("# 标题\n\n```bash\ncode\n```")).toBe("")
  })

  it("is used when frontmatter has no excerpt", () => {
    const post = parseWritingFile(
      "/repo/docs/use-cases/01-empty-webshell.md",
      "# 标题\n\n第一段正文描述。\n"
    )
    expect(post.excerpt).toBe("第一段正文描述。")
  })
})
