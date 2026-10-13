export interface FilterablePost {
  slug: string
  title: string
  excerpt?: string
  category: string
  tags: string[]
  vault?: string
  folder?: string
}

export interface WritingListFilter {
  query?: string
  category?: string | null
  tag?: string | null
  folder?: string | null
}

export function postFolderId(post: Pick<FilterablePost, "vault" | "folder">): string {
  const vault = post.vault || "content"
  return post.folder ? `${vault}/${post.folder}` : vault
}

export function filterWritingPosts<T extends FilterablePost>(
  posts: readonly T[],
  filter: WritingListFilter
): T[] {
  const query = filter.query?.trim().toLowerCase()
  return posts.filter((post) => {
    if (filter.category && post.category !== filter.category) return false
    if (filter.tag && !post.tags.includes(filter.tag)) return false
    if (filter.folder) {
      const id = postFolderId(post)
      if (id !== filter.folder && !id.startsWith(`${filter.folder}/`)) return false
    }
    if (!query) return true
    const haystack =
      `${post.title} ${post.excerpt ?? ""} ${post.tags.join(" ")} ${post.category} ${postFolderId(post)}`.toLowerCase()
    return haystack.includes(query)
  })
}

export function countByCategory(
  posts: readonly FilterablePost[]
): Array<{ id: string; count: number }> {
  const counts = new Map<string, number>()
  for (const post of posts) {
    counts.set(post.category, (counts.get(post.category) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, count]) => ({ id, count }))
}
