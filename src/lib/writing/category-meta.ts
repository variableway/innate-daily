import {
  SoftBlocks,
  SoftBook,
  SoftCalendar,
  SoftFileText,
  SoftFlask,
  SoftFolder,
  SoftGraduationCap,
  SoftHammer,
  SoftLightbulb,
  SoftPackage,
  SoftPalette,
  SoftWrench,
  type SoftIcon,
} from "../../components/icons/soft-icons"

/**
 * 分类 / 目录的策展映射表：固定图标 + 固定色相。
 * 未收录的名字走兜底：中性图标 + hash 色相（label-color 原有行为），
 * 保证新增分类不崩、但策展过的分类有稳定可记忆的视觉识别。
 *
 * 图标统一走 soft-icons：细线 + 大圆角，跟站点整体语言一致。
 */

export interface LabelMeta {
  icon: SoftIcon
  /** 固定色相（角度）；null = 沿用 label-color 的 hash 色相。 */
  hue: number | null
}

/** 分类（frontmatter category）映射。 */
const CATEGORY_META: Record<string, LabelMeta> = {
  insight: { icon: SoftLightbulb, hue: 250 },
  research: { icon: SoftFlask, hue: 300 },
  demo: { icon: SoftWrench, hue: 150 },
  guide: { icon: SoftHammer, hue: 45 },
  weekly: { icon: SoftCalendar, hue: 60 },
  log: { icon: SoftCalendar, hue: 60 },
  // 目录推导出来的分类（docs/ 下的第一层目录）。
  "build-it-own": { icon: SoftBlocks, hue: 30 },
  toolchain: { icon: SoftWrench, hue: 150 },
  content: { icon: SoftFileText, hue: 210 },
}

/** 目录（folder 树节点，按节点名匹配）映射。 */
const FOLDER_META: Record<string, LabelMeta> = {
  demo: { icon: SoftWrench, hue: 150 },
  research: { icon: SoftFlask, hue: 300 },
  ui: { icon: SoftPalette, hue: 300 },
  specs: { icon: SoftFileText, hue: 210 },
  "use-cases": { icon: SoftPackage, hue: 20 },
  "build-it-own": { icon: SoftBlocks, hue: 30 },
  content: { icon: SoftFileText, hue: 210 },
  toolchain: { icon: SoftWrench, hue: 150 },
}

/**
 * Collections 的固定三类（见 lib/collections/types.ts 的 COLLECTION_CATEGORIES）。
 * 与笔记分类分表管理，互不影响。
 */
const COLLECTION_CATEGORY_META: Record<string, LabelMeta> = {
  工具效率: { icon: SoftWrench, hue: 150 },
  随意日常: { icon: SoftBook, hue: 30 },
  教育: { icon: SoftGraduationCap, hue: 280 },
}

function lookup(table: Record<string, LabelMeta>, name: string): LabelMeta | null {
  return table[name.toLowerCase()] ?? null
}

/** 分类元信息；未知分类返回中性图标 + hash 色相。 */
export function categoryMeta(category: string): LabelMeta {
  return (
    lookup(CATEGORY_META, category) ??
    lookup(COLLECTION_CATEGORY_META, category) ?? { icon: SoftBook, hue: null }
  )
}

/** 目录节点元信息；未知目录返回 Folder + hash 色相。 */
export function folderMeta(name: string): LabelMeta {
  return lookup(FOLDER_META, name) ?? lookup(CATEGORY_META, name) ?? { icon: SoftFolder, hue: null }
}
