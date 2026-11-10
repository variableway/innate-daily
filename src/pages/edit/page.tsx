import { useCallback, useEffect, useMemo, useState } from "react"
import { Badge, Button, ScrollArea, cn } from "@ui"
import { AppSwitcher } from "../../components/app-switcher"
import { MarkdownPreview } from "../../components/markdown-preview"
import { writingFiles } from "../../lib/content/bundled-files"
import { SoftFileText, SoftFolder, SoftWrench } from "../../components/icons/soft-icons"

/** File System Access API 的最小类型面（lib.dom 未收录 picker 入口）。 */
interface PickableWindow {
  showDirectoryPicker?: (opts?: { mode?: "read" | "readwrite" }) => Promise<FileSystemDirectoryHandle>
}
interface PermissionAwareHandle extends FileSystemDirectoryHandle {
  queryPermission?: (desc: { mode: "read" | "readwrite" }) => Promise<PermissionState>
  requestPermission?: (desc: { mode: "read" | "readwrite" }) => Promise<PermissionState>
}

/** 仓库里可编辑的固定入口（相对仓库根）。 */
const COLLECTIONS_PATH = "src/data/collections.json"
const EXCLUDED_DIRS = new Set(["node_modules", ".git", "dist", "site", "references"])

const NEW_ARTICLE_TEMPLATE = `---
title: "文章标题"
slug: my-new-post
date: ${new Date().toISOString().slice(0, 10)}
author: 你的名字
status: draft
---

# 文章标题

正文从这里开始。
`

type FileKind = "md" | "json"
interface EditableFile {
  path: string
  handle: FileSystemFileHandle
  kind: FileKind
}

/* ── IndexedDB：记住上次连接的目录 handle，下次进入免重选 ── */

const DB_NAME = "daily-editor"
const STORE = "handles"
const KEY = "root"

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function storedHandle(): Promise<PermissionAwareHandle | null> {
  try {
    const db = await openDb()
    const handle = await new Promise<PermissionAwareHandle | undefined>((resolve, reject) => {
      const req = db.transaction(STORE).objectStore(STORE).get(KEY)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
    return handle ?? null
  } catch {
    return null
  }
}

async function persistHandle(handle: PermissionAwareHandle | null): Promise<void> {
  try {
    const db = await openDb()
    const tx = db.transaction(STORE, "readwrite")
    if (handle) tx.objectStore(STORE).put(handle, KEY)
    else tx.objectStore(STORE).delete(KEY)
  } catch {
    /* 忽略持久化失败：只是少了个"下次免选"的便利 */
  }
}

/* ── 目录扫描：docs 下全部 .md + src/data/collections.json ── */

async function walkMd(dir: FileSystemDirectoryHandle, prefix: string, out: EditableFile[]) {
  for await (const entry of dir.values()) {
    if (entry.kind === "file") {
      if (entry.name.endsWith(".md")) {
        out.push({ path: prefix + entry.name, handle: entry, kind: "md" })
      }
    } else if (!EXCLUDED_DIRS.has(entry.name)) {
      await walkMd(entry, `${prefix}${entry.name}/`, out)
    }
  }
}

async function scanDir(root: FileSystemDirectoryHandle): Promise<EditableFile[]> {
  const files: EditableFile[] = []
  await walkMd(root, "", files)

  // 仓库根目录连接时补上 collections.json；直接选了 src/data 也认得。
  const jsonLocations =
    root.name === "data"
      ? [COLLECTIONS_PATH.slice("src/data/".length)]
      : ["src/data/collections.json"]
  for (const rel of jsonLocations) {
    try {
      const handle = await root.getFileHandle(rel)
      files.push({ path: `🗂 ${rel}`, handle, kind: "json" })
    } catch {
      /* 选择的目录里没有该文件，跳过 */
    }
  }
  return files.sort((a, b) => a.path.localeCompare(b.path))
}

/* ── 页面 ── */

export function EditPage() {
  const [dir, setDir] = useState<PermissionAwareHandle | null>(null)
  const [files, setFiles] = useState<EditableFile[]>([])
  const [active, setActive] = useState<EditableFile | null>(null)
  const [bundledPath, setBundledPath] = useState<string | null>(null)
  const [content, setContent] = useState("")
  const [saved, setSaved] = useState("")
  const [status, setStatus] = useState("")
  const [busy, setBusy] = useState(false)
  const [showPreview, setShowPreview] = useState(true)

  const dirty = active !== null && content !== saved
  /** 当前查看的文件种类：FS 文件优先，否则视为只读 Markdown。 */
  const viewKind: FileKind | null = active?.kind ?? (saved ? "md" : null)
  const viewPath = active?.path ?? bundledPath

  /* 进入页面：尝试用上次记住的目录自动恢复（权限仍 granted 时免操作）。 */
  useEffect(() => {
    storedHandle().then(async (handle) => {
      if (!handle?.queryPermission) return
      const state = await handle.queryPermission({ mode: "readwrite" })
      if (state === "granted") {
        const found = await scanDir(handle)
        setDir(handle)
        setFiles(found)
        setStatus(`已连接本地目录：${handle.name}`)
      } else {
        setStatus("上次连接的目录需要重新授权，点右侧按钮恢复连接")
      }
    })
  }, [])

  const connect = useCallback(async () => {
    const picker = (window as unknown as PickableWindow).showDirectoryPicker
    if (!picker) {
      setStatus("当前浏览器不支持文件夹直连（需要 Chrome / Edge），可用只读模式 + 下载保存")
      return
    }
    try {
      setBusy(true)
      const handle = (await picker({ mode: "readwrite" })) as PermissionAwareHandle
      const found = await scanDir(handle)
      setDir(handle)
      setFiles(found)
      setActive(null)
      setStatus(`已连接本地目录：${handle.name}（${found.length} 个可编辑文件）`)
      await persistHandle(handle)
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setStatus(`连接失败：${(e as Error).message}`)
      }
    } finally {
      setBusy(false)
    }
  }, [])

  const openFile = useCallback(async (file: EditableFile | null, bundled?: { path: string; text: string }) => {
    if (file) {
      setBundledPath(null)
      setActive(file)
      const text = await (await file.handle.getFile()).text()
      setContent(text)
      setSaved(text)
    } else if (bundled) {
      setActive(null)
      setBundledPath(bundled.path)
      setContent(bundled.text)
      setSaved(bundled.text)
    }
  }, [])

  const save = useCallback(async () => {
    if (!active || !dirty) return
    if (active.kind === "json") {
      try {
        JSON.parse(content)
      } catch (e) {
        setStatus(`JSON 语法有误，未保存：${(e as Error).message}`)
        return
      }
    }
    try {
      setBusy(true)
      const writable = await active.handle.createWritable()
      await writable.write(content)
      await writable.close()
      setSaved(content)
      setStatus(`已保存 ${active.path}`)
    } catch (e) {
      setStatus(`保存失败：${(e as Error).message}`)
    } finally {
      setBusy(false)
    }
  }, [active, content, dirty])

  const newArticle = useCallback(async () => {
    if (!dir) return
    try {
      const name = window.prompt("新文章文件名（放在所选目录下，如 my-post.md）")
      if (!name?.endsWith(".md")) return
      const handle = await dir.getFileHandle(name, { create: true })
      const writable = await handle.createWritable()
      await writable.write(NEW_ARTICLE_TEMPLATE)
      await writable.close()
      const found = await scanDir(dir)
      setFiles(found)
      await openFile({ path: name, handle, kind: "md" })
      setStatus(`已创建 ${name}（默认 draft）`)
    } catch (e) {
      setStatus(`创建失败：${(e as Error).message}`)
    }
  }, [dir, openFile])

  const download = useCallback(() => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = active?.path.split("/").pop() ?? "untitled.md"
    a.click()
    URL.revokeObjectURL(a.href)
  }, [content, active])

  /* 预览用内容：剥掉 frontmatter（正文渲染不需要身份证）。 */
  const previewSource = useMemo(() => content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, ""), [content])

  /* JSON 预览：解析成功就渲染成迷你卡片列表（artifact 展示）。 */
  const collectionsPreview = useMemo(() => {
    if (active?.kind !== "json") return null
    try {
      const parsed = JSON.parse(content) as {
        collections?: Array<{ title?: string; category?: string; featured?: boolean; url?: string }>
      }
      return parsed.collections ?? null
    } catch {
      return null
    }
  }, [active, content])

  /* 只读模式素材：bundle 里的文档，路径归一化为仓库相对路径。 */
  const bundledFiles = useMemo(
    () =>
      Object.entries(writingFiles)
        .map(([key, text]) => ({ path: key.replace(/^(?:\.\.\/)+/, ""), text }))
        .sort((a, b) => a.path.localeCompare(b.path)),
    []
  )

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* 顶栏 */}
      <header className="border-border bg-background/80 flex h-12 shrink-0 items-center gap-3 border-b px-4">
        <AppSwitcher />
        <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <SoftWrench className="size-3.5" />
          本地编辑
        </span>
        <div className="flex-1" />
        <span className="text-muted-foreground max-w-64 truncate text-xs">{status}</span>
        {dir ? (
          <>
            <Button variant="ghost" size="sm" onClick={newArticle} disabled={busy}>
              新建文章
            </Button>
            <Button variant={dirty ? "default" : "ghost"} size="sm" onClick={save} disabled={!dirty || busy}>
              {dirty ? "保存 * " : "已保存"}
            </Button>
          </>
        ) : (
          <Button variant="default" size="sm" onClick={connect} disabled={busy}>
            <SoftFolder className="size-3.5" />
            连接仓库文件夹
          </Button>
        )}
      </header>

      <div className="flex min-h-0 flex-1">
        {/* 左栏：文件列表 */}
        <aside className="border-border w-64 shrink-0 border-r">
          <ScrollArea className="h-full">
            <div className="p-2">
              {dir ? (
                files.map((f) => (
                  <button
                    key={f.path}
                    type="button"
                    onClick={() => openFile(f)}
                    className={cn(
                      "text-muted-foreground hover:bg-muted hover:text-foreground flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                      active?.path === f.path && "bg-muted text-foreground font-medium"
                    )}
                  >
                    <SoftFileText className="size-3.5 shrink-0" />
                    <span className="truncate">{f.path}</span>
                    {f.kind === "json" && (
                      <Badge variant="outline" className="ml-auto shrink-0 text-[10px]">
                        JSON
                      </Badge>
                    )}
                  </button>
                ))
              ) : (
                <>
                  <p className="text-muted-foreground px-2 py-1.5 text-xs leading-relaxed">
                    只读模式：以下是构建进本站的文档。要直接编辑本地文件，请连接仓库文件夹。
                  </p>
                  {bundledFiles.map((f) => (
                    <button
                      key={f.path}
                      type="button"
                      onClick={() => openFile(null, f)}
                      className={cn(
                        "text-muted-foreground hover:bg-muted hover:text-foreground flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                        !active && bundledPath === f.path && "bg-muted text-foreground"
                      )}
                    >
                      <SoftFileText className="size-3.5 shrink-0" />
                      <span className="truncate">{f.path}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          </ScrollArea>
        </aside>

        {/* 右侧：编辑 + artifact 预览 */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {active || bundledPath ? (
            <>
              <div className="border-border flex h-9 shrink-0 items-center gap-2 border-b px-3">
                <span className="text-muted-foreground truncate font-mono text-xs">
                  {viewPath ?? "只读预览"}
                </span>
                <div className="flex-1" />
                {dirty && <Badge variant="secondary">未保存</Badge>}
                {!dir && (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(content)}>
                      复制全文
                    </Button>
                    <Button variant="ghost" size="sm" onClick={download}>
                      下载文件
                    </Button>
                  </>
                )}
                {viewKind === "md" && (
                  <Button variant="ghost" size="sm" onClick={() => setShowPreview((v) => !v)}>
                    {showPreview ? "隐藏预览" : "显示预览"}
                  </Button>
                )}
              </div>
              <div className="flex min-h-0 flex-1">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  readOnly={!dir}
                  spellCheck={false}
                  className={cn(
                    "bg-background text-foreground min-h-0 flex-1 resize-none p-4 font-mono text-xs leading-relaxed outline-none",
                    !dir && "opacity-80"
                  )}
                  placeholder="从左侧选择一个文件"
                />
                {viewKind === "md" && showPreview && (
                  <div className="border-border min-h-0 w-1/2 overflow-hidden border-l">
                    <ScrollArea className="h-full">
                      <div className="px-6 py-4">
                        <MarkdownPreview source={previewSource} />
                      </div>
                    </ScrollArea>
                  </div>
                )}
                {active?.kind === "json" && (
                  <div className="border-border min-h-0 w-1/2 border-l p-4">
                    <p className="text-muted-foreground mb-2 text-xs">Collections 预览（{collectionsPreview?.length ?? 0} 个作品）</p>
                    <div className="space-y-2">
                      {collectionsPreview?.map((c) => (
                        <div key={c.url} className="bg-card border-border rounded-lg border p-3 text-xs">
                          <div className="text-foreground flex items-center gap-2 font-medium">
                            {c.title}
                            {c.featured && <Badge variant="outline" className="text-[10px]">★</Badge>}
                          </div>
                          <div className="text-muted-foreground mt-1">
                            {c.category} · {c.url}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-2 text-sm">
              <SoftWrench className="size-8 opacity-40" />
              <p>连接仓库文件夹后即可编辑 docs/ 与 collections.json</p>
              <p className="text-xs">编辑保存 = 写回本地文件；发布交给 Agent 或 git push</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
