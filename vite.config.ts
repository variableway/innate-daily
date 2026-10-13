import path from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

const pkgDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(pkgDir, "../..")

function writingSourceMode(): "all" | "docs" | "use-cases" {
  const source = process.env.VITE_WRITING_SOURCE
  if (source === "docs") return "docs"
  if (source === "use-cases") return "use-cases"
  return "all"
}

export default defineConfig({
  base: process.env.PUBLIC_PATH ?? "./",
  plugins: [tailwindcss(), react()],
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: [
      {
        find: "#writing-files",
        replacement: path.resolve(
          pkgDir,
          `src/lib/content/bundled-files.${writingSourceMode()}.ts`
        ),
      },
      {
        find: /^mermaid$/,
        replacement: path.resolve(
          pkgDir,
          "node_modules/mermaid/dist/mermaid.esm.min.mjs"
        ),
      },
    ],
  },
  optimizeDeps: {
    exclude: ["mermaid"],
    include: ["mermaid/dist/mermaid.esm.min.mjs"],
  },
  server: { port: 4016, strictPort: true, fs: { allow: [repoRoot, pkgDir] } },
  preview: { port: 4016, strictPort: true },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
})
