import { useNavigate, useSearch } from "@tanstack/react-router"
import { CollectionsPageClient } from "../../components/collections/collections-page-client"
import {
  getAllCollections,
  getUniqueCategories,
  getUniqueSources,
} from "../../lib/collections/data"

/** /collections：与 /writing 同构的 侧栏筛选 + 列表 + iframe 查看器。筛选落在 URL 上。 */
export function CollectionsPage() {
  const search = useSearch({ from: "/collections" })
  const navigate = useNavigate({ from: "/collections" })

  return (
    <CollectionsPageClient
      collections={getAllCollections()}
      categories={getUniqueCategories()}
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
