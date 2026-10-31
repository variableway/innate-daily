import { describe, expect, it } from "vitest"
import {
  collectionRepo,
  isGitHubUrl,
  repoBadgeLabel,
  repoBadgeTitle,
} from "../lib/collections/repo"
import type { CollectionItem } from "../lib/collections/types"

function item(over: Partial<CollectionItem>): CollectionItem {
  return {
    id: "x",
    title: "t",
    description: "d",
    url: "https://example.com",
    source: "github",
    category: "工具效率",
    tags: [],
    date: "2026-01-01",
    featured: false,
    ...over,
  }
}

describe("isGitHubUrl", () => {
  it("recognizes github repo and pages hosts", () => {
    expect(isGitHubUrl("https://github.com/variableway/spark-cli")).toBe(true)
    expect(isGitHubUrl("https://variableway.github.io/spark-cli/")).toBe(true)
    expect(isGitHubUrl("https://example.com")).toBe(false)
    expect(isGitHubUrl("not a url")).toBe(false)
  })
})

describe("collectionRepo", () => {
  it("is null when the entry has no repository", () => {
    expect(collectionRepo(item({}))).toBeNull()
  })

  it("falls back to the url when it is a github address", () => {
    const repo = collectionRepo(item({ url: "https://github.com/a/b" }))
    expect(repo?.url).toBe("https://github.com/a/b")
    // 没注明可见性时不能当成公开仓库。
    expect(repo?.visibility).toBe("unknown")
  })

  it("prefers the explicit repo over the site url", () => {
    const repo = collectionRepo(
      item({
        url: "https://a.github.io/b/",
        repo: "https://github.com/a/b",
        repoVisibility: "public",
      })
    )
    expect(repo?.url).toBe("https://github.com/a/b")
    expect(repo?.visibility).toBe("public")
  })

  it("keeps a declared private repository private", () => {
    const repo = collectionRepo(
      item({ repo: "https://github.com/a/b", repoVisibility: "private" })
    )
    expect(repo?.visibility).toBe("private")
  })
})

describe("repo badge", () => {
  it("spells out the visibility on the label", () => {
    expect(repoBadgeLabel({ url: "u", visibility: "public" })).toBe("开源 · 公开")
    expect(repoBadgeLabel({ url: "u", visibility: "private" })).toBe("开源 · 私有")
    expect(repoBadgeLabel({ url: "u", visibility: "unknown" })).toBe("开源")
  })

  it("explains the visibility in the tooltip", () => {
    expect(repoBadgeTitle({ url: "u", visibility: "public" })).toContain("公开")
    expect(repoBadgeTitle({ url: "u", visibility: "private" })).toContain("私有")
    expect(repoBadgeTitle({ url: "u", visibility: "unknown" })).toContain("未注明")
  })
})
