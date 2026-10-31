import { useEffect, useRef, useState } from "react"
import mermaid from "mermaid"
import { extractMermaidChart } from "../lib/content/mdx-source"

interface MermaidBlockProps {
  chart?: string
  children?: React.ReactNode
}

let mermaidInitialized = false

/** 从 CSS token 读出图表配色，交给 mermaid 的 themeVariables（颜色事实源在 globals.css）。 */
function readMermaidVariables(): Record<string, string> {
  const styles = getComputedStyle(document.documentElement)
  const read = (name: string) => styles.getPropertyValue(name).trim()
  return {
    background: "transparent",
    // 字体栈读 --font-sans token：正文/UI 换字体时图表内文字同步跟随，
    // 避免 mermaid 里写死一份栈而与站点其他部分脱节。
    fontFamily:
      read("--font-sans") ||
      '"Inter Variable", "PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif',
    fontSize: "14px",
    mainBkg: read("--mermaid-main-bkg"),
    nodeBorder: read("--mermaid-node-border"),
    nodeTextColor: read("--mermaid-node-text"),
    lineColor: read("--mermaid-line"),
    clusterBkg: read("--mermaid-cluster-bkg"),
    clusterBorder: read("--mermaid-cluster-border"),
    actorBkg: read("--mermaid-main-bkg"),
    actorBorder: read("--mermaid-node-border"),
    actorTextColor: read("--mermaid-node-text"),
    signalColor: read("--mermaid-signal"),
    signalTextColor: read("--mermaid-signal"),
    noteBkgColor: read("--mermaid-note-bkg"),
    noteBorderColor: read("--mermaid-note-border"),
    noteFontColor: read("--mermaid-note-text"),
    activationBkgColor: read("--mermaid-activation"),
    edgeLabelBackground: read("--mermaid-label-bg"),
    textColor: read("--mermaid-node-text"),
  }
}

function initMermaid() {
  if (mermaidInitialized) return
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
  })
  mermaidInitialized = true
}

function getTextFromChildren(node: React.ReactNode): string {
  if (typeof node === "string") return node
  if (typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(getTextFromChildren).join("")
  if (node && typeof node === "object" && "props" in node) {
    return getTextFromChildren((node as any).props.children)
  }
  return ""
}

export function MermaidBlock({ chart, children }: MermaidBlockProps) {
  const chartSource = extractMermaidChart(
    chart || getTextFromChildren(children) || ""
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [isDark, setIsDark] = useState(false)

  // Detect dark mode
  useEffect(() => {
    const check = () => {
      setIsDark(document.documentElement.classList.contains("dark"))
    }
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!chartSource) return

    initMermaid()

    let cancelled = false
    const id = `mermaid-${Math.random().toString(36).slice(2, 11)}`

    // 每次渲染前按当前明暗模式重新套用配色
    mermaid.initialize({
      startOnLoad: false,
      theme: "base",
      themeVariables: readMermaidVariables(),
      securityLevel: "strict",
    })

    mermaid
      .render(id, chartSource)
      .then(({ svg }) => {
        if (!cancelled) setSvg(svg)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to render diagram")
      })

    return () => {
      cancelled = true
    }
  }, [chartSource, isDark])

  if (error) {
    return (
      <div className="border-destructive bg-destructive/10 my-6 rounded-lg border p-4">
        <p className="text-destructive text-sm font-medium">Mermaid Error</p>
        <pre className="text-destructive mt-2 overflow-x-auto text-xs">{error}</pre>
      </div>
    )
  }

  if (!svg) {
    return (
      <div className="my-6 p-8 rounded-lg border border-border bg-muted flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="mermaid-diagram my-6 flex justify-center overflow-x-auto rounded-lg border border-border/50 bg-card/30 p-4"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
