#!/usr/bin/env node
/**
 * run-innate-daily 冒烟驱动：无头浏览器访问本地 dev 站（默认 4016），
 * 等待关键文本出现后截图，并汇总页面控制台 error。
 *
 *   node .claude/skills/run-innate-daily/driver.mjs [页面名] [自定义等待文本]
 *
 *   node .claude/skills/run-innate-daily/driver.mjs             # collections（默认）
 *   node .claude/skills/run-innate-daily/driver.mjs writing     # /#/writing
 *   node .claude/skills/run-innate-daily/driver.mjs landing     # /
 *
 * 页面名不带斜杠：git-bash 的 MSYS 路径转换会把 "/#/x" 这类参数改写成
 * "C:/Program Files/Git/#/x"，裸名免疫（误传斜杠形式时驱动也会尝试修复）。
 *
 * 依赖 playwright-core（装在仓库外的驱动目录，见 SKILL.md Prerequisites）
 * 与系统 Chrome/Edge；不下载浏览器。截图写入本目录 shots/（已 gitignore）。
 * 退出码：0 = 找到等待文本；1 = 超时（仍截图留证）；2 = dev server 未启动。
 */
import { createRequire } from "node:module"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))

// ── playwright-core 解析：优先专用驱动目录，避免污染仓库依赖 ──
function loadPlaywrightCore() {
  const dirs = [
    process.env.PW_DRIVER_DIR,
    path.join(process.env.TEMP ?? "", "claude", "pw-driver"),
    process.env.USERPROFILE
      ? path.join(process.env.USERPROFILE, "AppData", "Local", "Temp", "claude", "pw-driver")
      : "",
    path.resolve(here, "../../.."), // 若日后把 playwright-core 加进仓库 devDependencies
  ].filter(Boolean)
  for (const dir of dirs) {
    try {
      return createRequire(path.join(dir, "package.json"))("playwright-core")
    } catch {
      /* 试下一个候选目录 */
    }
  }
  throw new Error(
    "playwright-core 未找到。在仓库外执行一次（不污染本仓依赖）：\n" +
      '  mkdir -p "$TEMP/claude/pw-driver" && cd "$TEMP/claude/pw-driver" && npm init -y >/dev/null && npm i playwright-core'
  )
}

// ── 系统浏览器发现：Chrome 优先，Edge 兜底；找不到则交给 playwright 自带 ──
function findBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  ].filter(Boolean)
  for (const exe of candidates) if (fs.existsSync(exe)) return exe
  return undefined
}

const base = process.env.BASE_URL ?? "http://localhost:4016"

/** git-bash MSYS 路径转换修复：剥掉误加的盘符前缀（C:/Program Files/Git/#/x → /#/x）。 */
function normalizeRoute(raw) {
  let route = raw.replace(/^[A-Za-z]:[^#]*/, "")
  if (route.startsWith("#")) route = "/" + route
  return route
}

const PAGES = {
  collections: { route: "/#/collections", wait: "Spark CLI" },
  writing: { route: "/#/writing", wait: "All Notes" },
  landing: { route: "/", wait: "Notes, curated like a gallery." },
}

const nameArg = process.argv[2] ?? "collections"
const pageSpec =
  PAGES[nameArg] ??
  (nameArg === "root" || nameArg === "/" || nameArg === "" ? PAGES.landing : null)
if (!pageSpec) {
  console.error(`未知页面 "${nameArg}"；可用: ${Object.keys(PAGES).join(", ")}（或 root）`)
  process.exit(1)
}
const route = normalizeRoute(pageSpec.route)
const waitText = process.argv[3] ?? pageSpec.wait
const slug = route.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "") || "root"

// ── 探活：驱动不管起服务，只提醒 ──
let up = false
for (let i = 0; i < 15; i++) {
  try {
    const res = await fetch(base)
    if (res.ok) {
      up = true
      break
    }
  } catch {
    /* 服务未就绪，继续等 */
  }
  await new Promise((resolve) => setTimeout(resolve, 1000))
}
if (!up) {
  console.error(`FAIL dev server (${base}) 未启动。先在仓库根目录后台执行 pnpm dev（严格端口 4016）。`)
  process.exit(2)
}

const { chromium } = loadPlaywrightCore()
const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })
let page
try {
  page = await browser.newPage({ viewport: { width: 1600, height: 900 } })
} catch (err) {
  await browser.close()
  console.error(`FAIL 打开页面失败: ${String(err).slice(0, 300)}`)
  process.exit(1)
}
const errors = []
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text())
})
page.on("pageerror", (err) => errors.push(String(err)))

const shotsDir = path.join(here, "shots")
fs.mkdirSync(shotsDir, { recursive: true })
const shot = path.join(shotsDir, `${slug}.png`)

try {
  await page.goto(base + route, { waitUntil: "domcontentloaded" })
} catch (err) {
  await browser.close()
  console.error(`FAIL 导航失败 ${base + route}: ${String(err).split("\n")[0]}`)
  process.exit(1)
}
try {
  // 首访 Vite 按需编译可能 10s+，给足 30s
  await page.waitForSelector(`text=${waitText}`, { timeout: 30000 })
} catch {
  await page.screenshot({ path: shot })
  await browser.close()
  console.error(`FAIL 等待文本 "${waitText}" 超时；失败现场截图: ${shot}`)
  process.exit(1)
}

await page.screenshot({ path: shot })
await browser.close()

console.log(`PASS ${route} 渲染出 "${waitText}"`)
console.log(`截图: ${shot}`)
console.log(`控制台 error ${errors.length} 条（GitHub 收藏被 CSP 拒绝 iframe 属预期，见 SKILL.md Gotchas）`)
for (const err of errors) console.log("  -", err.slice(0, 200))
