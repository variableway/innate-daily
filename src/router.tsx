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

/** /writing 列表的筛选状态全部落在 URL 上，可从 landing 画廊卡片直接带入。 */
export interface WritingSearch {
  folder?: string
  category?: string
  tag?: string
}

function validateWritingSearch(search: Record<string, unknown>): WritingSearch {
  const pick = (key: keyof WritingSearch) =>
    typeof search[key] === "string" && search[key] ? (search[key] as string) : undefined
  return { folder: pick("folder"), category: pick("category"), tag: pick("tag") }
}

function RootLayout() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
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
