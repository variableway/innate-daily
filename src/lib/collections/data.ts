import type { CollectionItem, CollectionsData } from "./types"
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

export function getUniqueCategories(): string[] {
  return [...new Set(data.collections.map((c) => c.category))].sort()
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
