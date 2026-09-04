import { describe, expect, it } from "vitest"

import { getAffectedVariantIds } from "./get-affected-variant-ids"

const variants = [
  {
    id: "variant-red-small",
    options: [
      { id: "red", option_id: "color" },
      { id: "small", option_id: "size" },
    ],
  },
  {
    id: "variant-blue-small",
    options: [
      { id: "blue", option_id: "color" },
      { id: "small", option_id: "size" },
    ],
  },
]

describe("getAffectedVariantIds", () => {
  it("returns variants using a removed option", () => {
    expect(
      getAffectedVariantIds(variants, new Set(["size"]), new Map())
    ).toEqual(["variant-red-small", "variant-blue-small"])
  })

  it("returns only variants using a removed option value", () => {
    expect(
      getAffectedVariantIds(
        variants,
        new Set(),
        new Map([["color", new Set(["red"])]])
      )
    ).toEqual(["variant-red-small"])
  })

  it("ignores unrelated and malformed option references", () => {
    expect(
      getAffectedVariantIds(
        [{ id: "variant", options: [{ id: "red", option_id: null }] }],
        new Set(["size"]),
        new Map([["color", new Set(["blue"])]])
      )
    ).toEqual([])
  })
})
