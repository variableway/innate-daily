/**
 * Collections 缩略图自动生成（issue #14 方案 A：构建期抓 og:image）。
 *
 * 对 collections.json 里没有 thumbnail 字段的作品：
 *   1. fetch 作品 url 的 HTML，解析 og:image / twitter:image；
 *   2. 下载图片 → public/collections-covers/auto/<id>.<ext>；
 *   3. 把「id → 相对路径」写进 src/data/thumbnails.gen.json（站点数据层合并）。
 *
 * 纪律（见 issue #14）：
 * - 显式 thumbnail 永远优先，本脚本不碰；
 * - 缓存优先：gen json 里已有记录且文件在盘上 → 跳过网络（--force 重抓）；
 * - 失败静默：抓不到就不写条目，站点回落到 coverArtSvg 生成封面；
 * - 并发 4、单站超时 8s，绝不让构建被单个站点拖死。
 *
 * 用法：node scripts/fetch-thumbnails.mjs [--force]
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs"
import path from "node:path"
import process from "node:process"

const root = path.resolve(import.meta.dirname, "..")
const dataFile = path.join(root, "src/data/collections.json")
const genFile = path.join(root, "src/data/thumbnails.gen.json")
const outDir = path.join(root, "public/collections-covers/auto")
const TIMEOUT_MS = 8000
const CONCURRENCY = 4
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"

const force = process.argv.includes("--force")
const collections = JSON.parse(readFileSync(dataFile, "utf8")).collections
let gen = {}
if (existsSync(genFile)) {
  try {
    gen = JSON.parse(readFileSync(genFile, "utf8"))
  } catch {
    gen = {}
  }
}

const targets = collections.filter((c) => c.url && !c.thumbnail)
console.log(
  `[thumbnails] ${collections.length} 个作品，其中 ${targets.length} 个缺 thumbnail，待抓取 ${force ? "(--force)" : "（缓存跳过）"}`
)

function fetchWithTimeout(url, options = {}) {
  return fetch(url, {
    ...options,
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { "user-agent": UA, ...(options.headers ?? {}) },
  })
}

/** 解析页面 HTML 里的 og:image / twitter:image（按优先级）。 */
function extractImage(html) {
  const patterns = [
    /<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image:secure_url["']/i,
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
  ]
  for (const re of patterns) {
    const match = html.match(re)
    if (match?.[1]) return match[1]
  }
  return null
}

function extFromContentType(contentType = "") {
  if (contentType.includes("image/webp")) return "webp"
  if (contentType.includes("image/png")) return "png"
  if (contentType.includes("image/gif")) return "gif"
  if (contentType.includes("image/svg")) return "svg"
  return "jpg"
}

/** GitHub 仓库页有确定性的社交卡图 / 头像，免去 HTML 解析（issue #14 §A）。 */
function githubImageCandidates(url) {
  const match = url.match(/^https?:\/\/github\.com\/([^/]+)\/([^/?#]+)/)
  if (!match) return null
  const [, owner, repo] = match
  return [
    `https://opengraph.githubassets.com/1/${owner}/${repo}`,
    `https://avatars.githubusercontent.com/${owner}?size=240`,
  ]
}

async function resolveImageCandidates(collection) {
  const ghCandidates = githubImageCandidates(collection.url)
  if (ghCandidates) return ghCandidates
  const pageRes = await fetchWithTimeout(collection.url)
  if (!pageRes.ok) throw new Error(`page ${pageRes.status}`)
  const html = await pageRes.text()
  const ogImage = extractImage(html)
  if (!ogImage) throw new Error("no og:image / twitter:image")
  // og:image 可能是相对路径 / 协议相对路径
  return [new URL(ogImage, collection.url).href]
}

async function fetchOne(collection) {
  const { id } = collection
  try {
    const candidates = await resolveImageCandidates(collection)
    let lastError = new Error("no image candidate")
    for (const imageUrl of candidates) {
      try {
        const imgRes = await fetchWithTimeout(imageUrl)
        if (!imgRes.ok) throw new Error(`image ${imgRes.status}`)
        const type = imgRes.headers.get("content-type") ?? ""
        if (!type.startsWith("image/")) throw new Error(`not an image: ${type}`)
        const ext = extFromContentType(type)
        const buffer = Buffer.from(await imgRes.arrayBuffer())
        if (buffer.length < 1024) throw new Error("image too small (<1KB)")

        mkdirSync(outDir, { recursive: true })
        const file = path.join(outDir, `${id}.${ext}`)
        writeFileSync(file, buffer)
        return { id, genPath: `collections-covers/auto/${id}.${ext}`, bytes: buffer.length }
      } catch (error) {
        lastError = error
      }
    }
    throw lastError
  } catch (error) {
    return { id, error: error?.message ?? String(error) }
  }
}

async function run() {
  const kept = []
  const pending = []
  for (const collection of targets) {
    const cached = gen[collection.id]
    const cachedFile = cached ? path.join(outDir, path.basename(cached)) : null
    if (!force && cached && cachedFile && existsSync(cachedFile)) {
      console.log(`[thumbnails] 缓存命中 ${collection.id} → ${cached}`)
      kept.push([collection.id, cached])
    } else {
      pending.push(collection)
    }
  }

  // 简易并发池
  const results = []
  const queue = [...pending]
  async function worker() {
    while (queue.length > 0) {
      const collection = queue.shift()
      console.log(`[thumbnails] 抓取 ${collection.id} ← ${collection.url}`)
      results.push(await fetchOne(collection))
    }
  }
  await Promise.allSettled(
    Array.from({ length: Math.min(CONCURRENCY, pending.length) }, worker)
  )

  for (const result of results) {
    if (result.genPath) {
      gen[result.id] = result.genPath
      kept.push([result.id, result.genPath])
      console.log(`[thumbnails] ✓ ${result.id} ← ${result.genPath} (${result.bytes} bytes)`)
    } else {
      console.log(`[thumbnails] ✗ ${result.id}：${result.error}（回落生成封面）`)
    }
  }

  writeFileSync(genFile, JSON.stringify(gen, null, 2) + "\n")
  console.log(
    `[thumbnails] 完成：${kept.length}/${targets.length} 个自动缩略图可用（gen json 已写入 src/data/thumbnails.gen.json）`
  )
}

run()
