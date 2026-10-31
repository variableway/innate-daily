import {
  SoftGitBranch,
  SoftPackage,
  SoftPenLine,
  type SoftIcon,
} from "../../components/icons/soft-icons"

/**
 * Collections 的「来源」展示：source 是站点类型（GitHub / Kimi / Feishu …），
 * 之前把个人 GitHub 项目归到笼统的 other，这里按真实来源收敛。
 */

/** 来源的展示名：GitHub 这类有官方写法的不能被 capitalize 改写。 */
export function sourceLabel(source: string): string {
  switch (source) {
    case "github":
      return "GitHub"
    case "kimi":
      return "Kimi"
    case "feishu":
      return "Feishu"
    default:
      return source
  }
}

/** 来源的图标：GitHub 用分支图标，其余按站点类型给中性图标。 */
export function sourceIcon(source: string): SoftIcon {
  switch (source) {
    case "github":
      return SoftGitBranch
    case "kimi":
      return SoftPenLine
    default:
      return SoftPackage
  }
}
