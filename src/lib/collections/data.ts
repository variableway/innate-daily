import type { CollectionItem, CollectionsData } from "./types"
import { COLLECTION_CATEGORIES } from "./types"
import collectionsData from "../../data/collections.json"
import autoThumbnails from "../../data/thumbnails.gen.json"

const autoThumbnailsMap = autoThumbnails as Record<string, string>
const data = collectionsData as CollectionsData

/**
 * 缩略图三层回落（issue #14）：
 * 显式 thumbnail（人工截图，最高优先）→ thumbnails.gen.json（构建期
 * 自动抓取的 og:image，见 scripts/fetch-thumbnails.mjs）→ 卡片组件里
 * 的 coverArtSvg 生成封面。
 */
function withAutoThumbnail(item: CollectionItem): CollectionItem {
  return item.thumbnail ? item : { ...item, thumbnail: autoThumbnailsMap[item.id] }
}

export function getAllCollections(): CollectionItem[] {
  return [...data.collections]
    .map(withAutoThumbnail)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getCollectionById(id: string): CollectionItem | undefined {
  const item = data.collections.find((c) => c.id === id)
  return item ? withAutoThumbnail(item) : undefined
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
