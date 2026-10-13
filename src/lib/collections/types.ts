export type CollectionSource = "kimi" | "feishu" | "other"

export interface CollectionItem {
  id: string
  title: string
  description: string
  url: string
  source: CollectionSource
  category: string
  tags: string[]
  date: string
  thumbnail?: string
  featured: boolean
}

export interface CollectionsData {
  collections: CollectionItem[]
  lastUpdated: string
}
