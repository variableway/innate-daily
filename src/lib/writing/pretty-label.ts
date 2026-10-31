/** 首字母大写：侧栏行标题用（中文原样返回）。 */
export function prettyLabel(value: string): string {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}
