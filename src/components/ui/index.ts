/**
 * 本站自带的 shadcn 风格 UI 组件（从 @innate/ui vendor 进来，见 docs/own-your-daily）。
 *
 * 之所以收进本仓：这个站点要作为独立模板给任何人 fork / 复用，
 * 不能依赖未公开发布的 @innate/ui 私有包。shadcn 的哲学本来就是
 * 「组件复制进项目、随项目演化」，这里的文件即最终事实源，
 * 上游（innate-fe）更新时按需同步即可。
 *
 * 业务代码统一从 "@ui" 导入，不直接引用具体文件路径。
 */

// 基础原语
export * from "./alert"
export * from "./badge"
export * from "./button"
export * from "./dropdown-menu"
export * from "./empty"
export * from "./input"
export * from "./input-group"
export * from "./kbd"
export * from "./resizable"
export * from "./scroll-area"
export * from "./select"
export * from "./separator"
export * from "./sheet"
export * from "./skeleton"
export * from "./textarea"

// 主题
export { ThemeProvider, useTheme, type ColorMode, type ThemeVariant } from "../../themes/theme-provider"
export { ThemeSelector } from "../../themes/theme-selector"

// 工具
export { cn } from "../../lib/utils"
export { useIsMobile } from "../../hooks/use-mobile"
