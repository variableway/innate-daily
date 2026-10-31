import { describe, expect, it } from "vitest"
import { validateWritingSearch } from "../router"

describe("writing deep link", () => {
  it("carries the slug through the url search params", () => {
    expect(validateWritingSearch({ slug: "content-research-ui-README" })).toEqual({
      folder: undefined,
      category: undefined,
      tag: undefined,
      slug: "content-research-ui-README",
    })
  })

  it("ignores a non-string slug", () => {
    expect(validateWritingSearch({ slug: 42 }).slug).toBeUndefined()
    expect(validateWritingSearch({}).slug).toBeUndefined()
  })
})
