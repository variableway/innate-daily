"use client"

import type { ReactNode } from "react"
import { MonitorIcon, MoonIcon, PaletteIcon, SunIcon } from "lucide-react"

import { Button } from "../components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { useTheme } from "./theme-provider"
import type { ThemeVariant } from "./theme-provider"

export interface ThemeSelectorOption {
  value: ThemeVariant
  label: string
}

/**
 * 仓库级共享 variant 清单（顺序即菜单顺序）。
 * 只放"任何 app 都能渲染出正确视觉"的 variant；token 定义见 globals.css + themes/*.css。
 * 2026-11 合并精简（issue #58）为 4 档：Neutral 基线 / 产品品牌 / ToB 效率 / 暖调编辑教育。
 */
export const THEME_SELECTOR_OPTIONS: readonly ThemeSelectorOption[] = [
  { value: "default", label: "Default" },
  { value: "webshell", label: "Webshell (Brand)" },
  { value: "linear", label: "Linear (ToB SaaS)" },
  { value: "notion", label: "Notion (Editorial)" },
]

const COLOR_MODE_OPTIONS = [
  { value: "light", icon: SunIcon, label: "Light" },
  { value: "dark", icon: MoonIcon, label: "Dark" },
  { value: "system", icon: MonitorIcon, label: "System" },
] as const

export interface ThemeSelectorProps {
  /** 追加 app 独有的 variant（如 web-showcase 的 `custom`），排在共享清单之后。 */
  extraVariants?: readonly ThemeSelectorOption[]
  /** 菜单底部扩展项（如 web-showcase 的 Theme Editor 外链），自动补分隔线。 */
  children?: ReactNode
}

/**
 * 唯一主题切换入口：写 localStorage + `<html data-theme>` / `.dark`（经 ThemeProvider）。
 * 所有 app 与 webshell 壳共用本组件，不要在 app 内另写一份。
 */
export function ThemeSelector({
  extraVariants = [],
  children,
}: ThemeSelectorProps) {
  const { colorMode, variant, setColorMode, setVariant } = useTheme()
  const options = [...THEME_SELECTOR_OPTIONS, ...extraVariants]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
        <PaletteIcon data-icon />
        <span className="sr-only">Select theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8}>
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setVariant(option.value)}
            className={variant === option.value ? "bg-accent" : ""}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        {COLOR_MODE_OPTIONS.map((mode) => (
          <DropdownMenuItem
            key={mode.value}
            onClick={() => setColorMode(mode.value)}
            className={colorMode === mode.value ? "bg-accent" : ""}
          >
            <mode.icon data-icon />
            {mode.label}
          </DropdownMenuItem>
        ))}
        {children ? (
          <>
            <DropdownMenuSeparator />
            {children}
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
