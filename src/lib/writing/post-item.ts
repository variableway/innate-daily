/**
 * 写作条目的最小数据形状：卡片视图（Plaza）与列表视图共用同一份。
 */
export interface BlogListItem {
  slug: string
  title: string
  excerpt: string
  date: string
  category: string
  tags: string[]
  readingTime: number
  vault?: string
  folder?: string
}
