import { describe, expect, it } from "vitest"
import collectionsJson from "../data/collections.json"
import {
  COLLECTION_CATEGORIES,
  type CollectionItem,
  type CollectionsData,
} from "../lib/collections/types"
import {
  getAllCollections,
  getCollectionById,
  getUniqueCategories,
  getUniqueSources,
  getUniqueTags,
} from "../lib/collections/data"

const data = collectionsJson as CollectionsData
const validSources = ["kimi", "feishu", "github"]

describe("collections data integrity", () => {
  it("has at least one collection entry", () => {
    expect(data.collections.length).toBeGreaterThan(0)
  })

  it("has unique ids", () => {
    const ids = data.collections.map((item) => item.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("every item has required fields with valid shapes", () => {
    for (const item of data.collections as CollectionItem[]) {
      expect(item.id, `${item.id}: id`).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
      expect(item.title, `${item.id}: title`).toBeTruthy()
      expect(item.description, `${item.id}: description`).toBeTruthy()
      expect(item.url, `${item.id}: url`).toMatch(/^https?:\/\//)
      expect(validSources, `${item.id}: source ${item.source}`).toContain(item.source)
      expect(item.category, `${item.id}: category`).toBeTruthy()
      expect(
        COLLECTION_CATEGORIES as readonly string[],
        `${item.id}: category must be one of the three curated categories`
      ).toContain(item.category)
      expect(Array.isArray(item.tags), `${item.id}: tags`).toBe(true)
      expect(item.date, `${item.id}: date`).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      if (item.repo) {
        expect(item.repo, `${item.id}: repo`).toMatch(/^https?:\/\//)
        expect(
          item.repoVisibility,
          `${item.id}: repoVisibility`
        ).toMatch(/^(public|private|unknown)$/)
      }
    }
  })
})

describe("collections data helpers", () => {
  it("sorts all collections by date descending", () => {
    const sorted = getAllCollections()
    expect(sorted.length).toBe(data.collections.length)
    for (let i = 1; i < sorted.length; i++) {
      expect(
        new Date(sorted[i - 1]!.date).getTime()
      ).toBeGreaterThanOrEqual(new Date(sorted[i]!.date).getTime())
    }
  })

  it("finds a collection by id", () => {
    const first = data.collections[0]!
    expect(getCollectionById(first.id)?.title).toBe(first.title)
    expect(getCollectionById("does-not-exist")).toBeUndefined()
  })

  it("derives unique sources, categories and tags", () => {
    expect(getUniqueSources().every((s) => validSources.includes(s))).toBe(true)
    const categories = getUniqueCategories()
    expect(new Set(categories).size).toBe(categories.length)
    const tags = getUniqueTags()
    expect(new Set(tags).size).toBe(tags.length)
  })

  it("always exposes the three curated categories, even when one is empty", () => {
    expect(getUniqueCategories()).toEqual(["工具效率", "随意日常", "教育"])
    // 分类是固定策展的，不随条目增减。
    expect(getUniqueCategories()).toHaveLength(COLLECTION_CATEGORIES.length)
  })
})
