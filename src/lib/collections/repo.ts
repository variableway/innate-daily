import type { CollectionItem, RepoVisibility } from "./types"

/**
 * 仓库识别与开源标签。
 *
 * 约定：给了 GitHub 地址 = 开源项目；但 GitHub 地址看不出仓库是公开还是私有
 * （私有仓库对有权限的人看起来和公开仓库一样），所以可见性要单独标注，
 * 标签上写清楚，免得把私有仓库当成公开项目推荐。
 */

/** GitHub 主站 / GitHub Pages 域名。 */
const GITHUB_HOSTS = ["github.com", "github.io"]

export interface CollectionRepo {
  /** 仓库地址。 */
  url: string
  /** 可见性。 */
  visibility: RepoVisibility
}

export function isGitHubUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase()
    return GITHUB_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))
  } catch {
    return false
  }
}

/**
 * 取条目的代码仓库：
 * - 显式写了 repo 就用它（站点地址与仓库地址可以不同：站点在 Pages、仓库在 GitHub）；
 * - 否则 url 本身是 GitHub 地址时回退用它。
 */
export function collectionRepo(item: CollectionItem): CollectionRepo | null {
  if (item.repo) {
    return { url: item.repo, visibility: item.repoVisibility ?? "unknown" }
  }
  if (isGitHubUrl(item.url)) {
    return { url: item.url, visibility: item.repoVisibility ?? "unknown" }
  }
  return null
}

/** 标签文案：开源 + 可见性（GitHub 地址只说明「开源」，不保证公开）。 */
export function repoBadgeLabel(repo: CollectionRepo): string {
  switch (repo.visibility) {
    case "public":
      return "开源 · 公开"
    case "private":
      return "开源 · 私有"
    default:
      return "开源"
  }
}

/** 标签说明（悬停可见）。 */
export function repoBadgeTitle(repo: CollectionRepo): string {
  switch (repo.visibility) {
    case "public":
      return "代码仓库公开，任何人都可以查看源码"
    case "private":
      return "代码仓库是私有仓库，需要授权才能查看源码"
    default:
      return "提供了代码仓库地址，但未注明公开 / 私有"
  }
}
