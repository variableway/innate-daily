import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "@tanstack/react-router"
import { ThemeProvider } from "@innate/ui"
import { router } from "./router"

import "@innate/ui/globals.css"
import "./globals.css"

// 首次访问默认 Notion 暖纸主题；用户一旦手动切换过就尊重 localStorage 里的选择。
if (!localStorage.getItem("theme-variant")) {
  localStorage.setItem("theme-variant", "notion")
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <div className="h-svh overflow-hidden">
        <RouterProvider router={router} />
      </div>
    </ThemeProvider>
  </StrictMode>
)
