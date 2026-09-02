import { describe, expect, it } from "vitest"

import { resolveProductListStatuses } from "../product-list-status"

describe("resolveProductListStatuses", () => {
  it("hides draft and archived by default", () => {
    expect(resolveProductListStatuses({})).toEqual([
      "published",
      "proposed",
      "rejected",
    ])
  })

  it("includes draft when showDrafted is on", () => {
    expect(resolveProductListStatuses({ showDrafted: true })).toEqual([
      "published",
      "proposed",
      "rejected",
      "draft",
    ])
  })

  it("includes archived when showArchived is on", () => {
    expect(resolveProductListStatuses({ showArchived: true })).toEqual([
      "published",
      "proposed",
      "rejected",
      "archived",
    ])
  })

  it("uses an explicit status filter as-is", () => {
    expect(
      resolveProductListStatuses({
        status: ["draft"],
        showDrafted: false,
        showArchived: true,
      })
    ).toEqual(["draft"])
  })
})
