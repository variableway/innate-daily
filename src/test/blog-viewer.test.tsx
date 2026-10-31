import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { BlogViewer } from "../components/writing/blog-viewer"

function renderViewer(toc: Array<{ id: string; text: string; level: number }>) {
  return render(
    <BlogViewer
      title="标题"
      content="正文"
      excerpt=""
      date="2026-10-31"
      author="Innate Team"
      category="research"
      tags={[]}
      readingTime={1}
      toc={toc}
      showToc
    />
  )
}

describe("blog viewer toc layout", () => {
  it("does not reserve the toc rail when the post has no headings", () => {
    const { container } = renderViewer([])
    // 空侧栏会把正文挤窄，没有标题时整列都应该给正文。
    expect(container.querySelector("aside")).toBeNull()
    expect(container.querySelector(".markdown-content")).not.toBeNull()
  })

  it("renders the toc rail when the post has headings", () => {
    const { container } = renderViewer([{ id: "a", text: "第一节", level: 2 }])
    expect(container.querySelector("aside")).not.toBeNull()
    expect(screen.getByText("第一节")).toBeTruthy()
  })
})
