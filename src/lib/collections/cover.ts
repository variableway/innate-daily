/**
 * Collections 卡片封面图（站点首屏截图）的地址解析。
 *
 * 封面图放在 public/collections-covers/ 下，构建时原样拷贝到产物根目录。
 * 站点部署在 GitHub Pages 的子路径上（vite base 为 "./"），
 * 因此这里用 import.meta.env.BASE_URL 拼前缀，避免写死 "/" 导致 404。
 */
export function collectionCoverUrl(path: string): string {
  const base = import.meta.env.BASE_URL ?? "/"
  // 兼容写成 "/collections-covers/x.png" 或 "collections-covers/x.png" 两种形式
  const relative = path.replace(/^\/+/, "")
  return `${base}${relative}`.replace(/([^:])\/{2,}/g, "$1/")
}
