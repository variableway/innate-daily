import {
  Blocks,
  BookOpen,
  CalendarDays,
  FileText,
  FlaskConical,
  Folder,
  Hammer,
  Lightbulb,
  Package,
  Palette,
  Wrench,
  type LucideIcon,
} from "lucide-react"

/**
 * 分类 / 目录的策展映射表：固定图标 + 固定色相。
 * 未收录的名字走兜底：中性图标 + hash 色相（label-color 原有行为），
 * 保证新增分类不崩、但策展过的分类有稳定可记忆的视觉识别。
 */

export interface LabelMeta {
  icon: LucideIcon
  /** 固定色相（角度）；null = 沿用 label-color 的 hash 色相。 */
  hue: number | null
}

/** 分类（frontmatter category）映射。 */
const CATEGORY_META: Record<string, LabelMeta> = {
  insight: { icon: Lightbulb, hue: 250 },
  research: { icon: FlaskConical, hue: 300 },
  demo: { icon: Wrench, hue: 150 },
  guide: { icon: Hammer, hue: 45 },
  weekly: { icon: CalendarDays, hue: 60 },
  log: { icon: CalendarDays, hue: 60 },
}

/** 目录（folder 树节点，按节点名匹配）映射。 */
const FOLDER_META: Record<string, LabelMeta> = {
  demo: { icon: Wrench, hue: 150 },
  research: { icon: FlaskConical, hue: 300 },
  ui: { icon: Palette, hue: 300 },
  specs: { icon: FileText, hue: 210 },
  "use-cases": { icon: Package, hue: 20 },
  "build-it-own": { icon: Blocks, hue: 30 },
}

function lookup(table: Record<string, LabelMeta>, name: string): LabelMeta | null {
  return table[name.toLowerCase()] ?? null
}

/** 分类元信息；未知分类返回中性图标 + hash 色相。 */
export function categoryMeta(category: string): LabelMeta {
  return lookup(CATEGORY_META, category) ?? { icon: BookOpen, hue: null }
}

/** 目录节点元信息；未知目录返回 Folder + hash 色相。 */
export function folderMeta(name: string): LabelMeta {
  return lookup(FOLDER_META, name) ?? lookup(CATEGORY_META, name) ?? { icon: Folder, hue: null }
}
