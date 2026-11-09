/**
 * 供给链守卫：保证 @innate/* 能装上，再放行真正的业务命令。
 * 被 package.json 里每个 scripts 命令前置调用（`pnpm run setup && …`）。
 *
 * 1. CI 环境直接放行——deploy-pages.yml 用注入式 workspace（sparse checkout
 *    基础仓 packages/ui + preferWorkspacePackages）解析 @innate/ui，不走私有源；
 * 2. 本地：`innate-fe-cli install` 起本地 Verdaccio（127.0.0.1:4873）、把基础仓
 *    @innate/* 发布上去、写 .npmrc、pnpm install；
 * 3. `pnpm update @innate/ui` 让 lockfile/node_modules 跟到私有源上最新发布版本，
 *    随后把 package.json 的约束写回 `*`（pnpm update 有「保存」语义，会把 `*`
 *    改写成 `^x.y.z`；写回 `*` 保证约束永远不挡新版本，CI 的 workspace 链接也
 *    永远满足）。
 *
 * 用法：node scripts/ensure-innate-ui.mjs [--latest]
 *   --latest  基础仓改过源码还没升版本时，强制重发（--bump patch）再同步。
 *             注意：本地版本号会递增（0.1.4、0.1.5…），lockfile 会跟着变。
 */
import { spawnSync } from "node:child_process"
import { readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const pkgPath = join(dirname(fileURLToPath(import.meta.url)), "..", "package.json")

const latest = process.argv.includes("--latest")

// CI：workflow 自己解析 @innate/ui，这里绝不执行 innate-fe-cli（runner 上没有）。
if (process.env.CI) {
  console.log("[setup] CI 环境：跳过本地私有源链路（@innate/ui 由 workspace 注入解析）")
  process.exit(0)
}

function run(cmd, args) {
  const line = `${cmd} ${args.join(" ")}`
  console.log(`[setup] $ ${line}`)
  // 拼成单条命令行再交给 shell：参数都是固定字面量，不经过用户输入。
  const r = spawnSync(line, { stdio: "inherit", shell: true })
  if (r.status !== 0) {
    console.error(`[setup] 失败（exit ${r.status}）：${line}`)
    process.exit(r.status ?? 1)
  }
}

/** 把 @innate/ui 约束写回 `*`（undo pnpm update 的「保存」改写）。 */
function restoreWildcardSpec() {
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"))
  if (pkg.dependencies?.["@innate/ui"] === "*") return
  pkg.dependencies["@innate/ui"] = "*"
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
  console.log('[setup] 已把 package.json 的 @innate/ui 约束写回 "*"（保持永远解析最新）')
}

// 先探针：innate-fe-cli 缺失 / 基础仓没配（fe-root）时，给出可操作的指引再退出，
// 不要放行到一半才在 pnpm install 处冒出一串难懂的网络错误。
const probe = spawnSync("innate-fe-cli fe-root show", {
  stdio: "ignore",
  shell: true,
})
if (probe.status !== 0) {
  console.error(
    [
      "[setup] 未找到 innate-fe-cli 或基础仓未配置，无法供给 @innate/ui。",
      "        1) 安装 innate-fe-cli；",
      "        2) innate-fe-cli fe-root set <基础仓路径>（含 plugins.registry.yaml 的 innate-fe 仓）；",
      "        3) 重跑本命令。",
    ].join("\n"),
  )
  process.exit(1)
}

run("innate-fe-cli", ["install", "--dir", ".", ...(latest ? ["--bump", "patch"] : [])])
run("pnpm", ["update", "@innate/ui"])
restoreWildcardSpec()
