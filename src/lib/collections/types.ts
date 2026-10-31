export type CollectionSource = "kimi" | "feishu" | "github"

/**
 * 代码仓库可见性。
 * - public：公开仓库，任何人可访问。
 * - private：私有仓库，需要授权才能访问（GitHub 地址本身看不出这一点）。
 * - unknown：给了仓库地址，但没注明公开 / 私有。
 */
export type RepoVisibility = "public" | "private" | "unknown"

/**
 * Collections 的分类是固定三类（策展式），不是从数据里推导出来的：
 * 即使某一类暂时没有条目，侧栏也会照样列出（计数为 0）。
 */
export const COLLECTION_CATEGORIES = ["工具效率", "随意日常", "教育"] as const

export type CollectionCategory = (typeof COLLECTION_CATEGORIES)[number]

export interface CollectionItem {
  id: string
  title: string
  description: string
  /** 站点地址：iframe 预览与「Open site」都指向这里。 */
  url: string
  /** 代码仓库地址（可选）。缺省时若 url 是 GitHub 地址则回退使用它。 */
  repo?: string
  /** 仓库可见性说明。 */
  repoVisibility?: RepoVisibility
  source: CollectionSource
  category: CollectionCategory
  tags: string[]
  date: string
  /**
   * 封面图（站点首屏截图，light 版）。缺省时卡片回落到按标题确定性生成的 SVG 封面。
   * 路径相对站点根，形如 "collections-covers/xxx.png"。
   */
  thumbnail?: string
  featured: boolean
}

export interface CollectionsData {
  collections: CollectionItem[]
  lastUpdated: string
}
