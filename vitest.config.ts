import path from "node:path"
import { fileURLToPath } from "node:url"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

const pkgDir = path.dirname(fileURLToPath(import.meta.url))
const source =
  process.env.VITE_WRITING_SOURCE === "docs"
    ? "docs"
    : process.env.VITE_WRITING_SOURCE === "use-cases"
      ? "use-cases"
      : "all"

export default defineConfig({
  root: pkgDir,
  plugins: [react()],
  resolve: {
    alias: {
      "#writing-files": path.resolve(
        pkgDir,
        `src/lib/content/bundled-files.${source}.ts`
      ),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
})
