import { useNavigate, useSearch } from "@tanstack/react-router"
import { CollectionsPageClient } from "../../components/collections/collections-page-client"
import {
  getAllCollections,
  getUniqueCategories,
  getUniqueSources,
  getUniqueTags,
} from "../../lib/collections/data"

/** /collections：卡片网格 → 选中后左列表 + 右 iframe 预览。筛选落在 URL 上。 */
export function CollectionsPage() {
  const search = useSearch({ from: "/collections" })
  const navigate = useNavigate({ from: "/collections" })

  return (
    <CollectionsPageClient
      collections={getAllCollections()}
      categories={getUniqueCategories()}
      tags={getUniqueTags()}
      sources={getUniqueSources()}
      filters={{
        category: search.category,
        tag: search.tag,
        source: search.source,
        featured: search.featured,
      }}
      onFiltersChange={(next) => {
        navigate({ to: "/collections", search: next })
      }}
    />
  )
}
