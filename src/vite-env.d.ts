/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WRITING_SOURCE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module "#writing-files" {
  export const writingFiles: Record<string, string>
  export const writingSource: "all" | "use-cases" | "docs"
}

declare module "mermaid/dist/mermaid.esm.min.mjs" {
  import mermaid from "mermaid"
  export default mermaid
}

