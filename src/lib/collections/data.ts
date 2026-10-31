import type { CollectionItem, CollectionsData } from "./types"
import { COLLECTION_CATEGORIES } from "./types"
import collectionsData from "../../data/collections.json"

const data = collectionsData as CollectionsData

export function getAllCollections(): CollectionItem[] {
  return [...data.collections].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export function getCollectionById(id: string): CollectionItem | undefined {
  return data.collections.find((c) => c.id === id)
}

export function getUniqueSources(): string[] {
  return [...new Set(data.collections.map((c) => c.source))].sort()
}

/** 分类是固定的策展三类（工具效率 / 随意日常 / 教育），不随数据增减。 */
export function getUniqueCategories(): string[] {
  return [...COLLECTION_CATEGORIES]
}

export function getUniqueTags(): string[] {
  const tagMap = new Map<string, number>()
  data.collections.forEach((c) => {
    c.tags.forEach((t) => tagMap.set(t, (tagMap.get(t) || 0) + 1))
  })
  return [...tagMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag)
}
