"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react"

export type ColorMode = "light" | "dark" | "system"
export type ThemeVariant =
  | "default"
  | "webshell"
  | "linear"
  | "notion"
  | "custom"

interface ThemeContextValue {
  colorMode: ColorMode
  variant: ThemeVariant
  resolvedColorMode: "light" | "dark"
  setColorMode: (mode: ColorMode) => void
  setVariant: (variant: ThemeVariant) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)
const THEME_STORAGE_EVENT = "innate-theme-storage"

function isColorMode(value: string | null): value is ColorMode {
  return value === "light" || value === "dark" || value === "system"
}

function isThemeVariant(value: string | null): value is ThemeVariant {
  // 2026-11 合并精简（issue #58）：11 个 variant 收敛为 4 + custom。
  // default = shadcn Neutral 基线；webshell = 产品品牌；linear = ToB/SaaS 效率风；
  // notion = 暖调编辑/教育风。shadcn 五色板与 studio 两套已移除，见 git 历史。
  return (
    value === "default" ||
    value === "webshell" ||
    value === "linear" ||
    value === "notion" ||
    value === "custom"
  )
}

function getStoredColorMode(): ColorMode {
  if (typeof window === "undefined") return "system"
  const stored = window.localStorage.getItem("color-mode")
  return isColorMode(stored) ? stored : "system"
}

function getStoredVariant(): ThemeVariant {
  if (typeof window === "undefined") return "default"
  const stored = window.localStorage.getItem("theme-variant")
  return isThemeVariant(stored) ? stored : "default"
}

function subscribeThemeStorage(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === null ||
      event.key === "color-mode" ||
      event.key === "theme-variant"
    ) {
      onStoreChange()
    }
  }

  window.addEventListener("storage", handleStorage)
  window.addEventListener(THEME_STORAGE_EVENT, onStoreChange)
  return () => {
    window.removeEventListener("storage", handleStorage)
    window.removeEventListener(THEME_STORAGE_EVENT, onStoreChange)
  }
}

function emitThemeStorageChange() {
  window.dispatchEvent(new Event(THEME_STORAGE_EVENT))
}

function getSystemColorMode(): "light" | "dark" {
  if (typeof window === "undefined") return "dark"
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function resolveColorMode(colorMode: ColorMode): "light" | "dark" {
  return colorMode === "system" ? getSystemColorMode() : colorMode
}

function subscribeSystemColorMode(onStoreChange: () => void) {
  const mql = window.matchMedia("(prefers-color-scheme: dark)")
  mql.addEventListener("change", onStoreChange)
  return () => mql.removeEventListener("change", onStoreChange)
}

function applyTheme(
  resolvedColorMode: "light" | "dark",
  variant: ThemeVariant
) {
  const root = document.documentElement

  root.classList.toggle("dark", resolvedColorMode === "dark")
  root.setAttribute("data-theme", variant)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorMode = useSyncExternalStore<ColorMode>(
    subscribeThemeStorage,
    getStoredColorMode,
    () => "system"
  )
  const variant = useSyncExternalStore<ThemeVariant>(
    subscribeThemeStorage,
    getStoredVariant,
    () => "default"
  )
  const systemColorMode = useSyncExternalStore<"light" | "dark">(
    subscribeSystemColorMode,
    getSystemColorMode,
    () => "dark"
  )
  const resolvedColorMode = colorMode === "system" ? systemColorMode : colorMode

  useEffect(() => {
    applyTheme(resolvedColorMode, variant)
  }, [resolvedColorMode, variant])

  const setColorMode = useCallback(
    (mode: ColorMode) => {
      localStorage.setItem("color-mode", mode)
      applyTheme(resolveColorMode(mode), variant)
      emitThemeStorageChange()
    },
    [variant]
  )

  const setVariant = useCallback(
    (v: ThemeVariant) => {
      localStorage.setItem("theme-variant", v)
      applyTheme(resolveColorMode(colorMode), v)
      emitThemeStorageChange()
    },
    [colorMode]
  )

  const value = useMemo(
    () => ({ colorMode, variant, resolvedColorMode, setColorMode, setVariant }),
    [colorMode, variant, resolvedColorMode, setColorMode, setVariant]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}
