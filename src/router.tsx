import {
  Outlet,
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router"
import { WritingPage } from "./pages/writing/page"
import { WritingDetailPage } from "./pages/writing/[slug]/page"
import { LandingPage } from "./pages/landing/page"
import { CollectionsPage } from "./pages/collections/page"
import { CategoryMenu } from "./components/category-menu"

/** /writing 列表的筛选状态全部落在 URL 上，可从 landing 画廊卡片直接带入。
    slug 是「深链入口」：从 Collections 的 Recent notes 跳过来时直接打开那一篇。 */
export interface WritingSearch {
  folder?: string
  category?: string
  tag?: string
  slug?: string
}

export function validateWritingSearch(search: Record<string, unknown>): WritingSearch {
  const pick = (key: keyof WritingSearch) =>
    typeof search[key] === "string" && search[key] ? (search[key] as string) : undefined
  return {
    folder: pick("folder"),
    category: pick("category"),
    tag: pick("tag"),
    slug: pick("slug"),
  }
}

/** /collections 的筛选同模型：source / category / tag / featured 四维独立开关。 */
export interface CollectionsSearch {
  source?: string
  category?: string
  tag?: string
  featured?: string
}

function validateCollectionsSearch(search: Record<string, unknown>): CollectionsSearch {
  const pick = (key: keyof CollectionsSearch) =>
    typeof search[key] === "string" && search[key] ? (search[key] as string) : undefined
  return {
    source: pick("source"),
    category: pick("category"),
    tag: pick("tag"),
    featured: pick("featured"),
  }
}

function RootLayout() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      {/* 全局悬浮分类菜单：所有页面共享，固定顶部居中 */}
      <CategoryMenu />
      <Outlet />
    </div>
  )
}

const rootRoute = createRootRoute({
  component: RootLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
})

const writingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/writing",
  component: WritingPage,
  validateSearch: validateWritingSearch,
})

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/landing",
  component: LandingPage,
})

const collectionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/collections",
  component: CollectionsPage,
  validateSearch: validateCollectionsSearch,
})

const writingSlugRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/writing/$slug",
  component: WritingDetailPage,
})

const slugRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/$slug",
  component: WritingDetailPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  writingRoute,
  landingRoute,
  collectionsRoute,
  writingSlugRoute,
  slugRoute,
])

export const router = createRouter({
  routeTree,
  history: createHashHistory(),
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
