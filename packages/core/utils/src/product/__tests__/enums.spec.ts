import { ProductStatus } from "../enums"

describe("ProductStatus", () => {
  it("includes archived as a native status", () => {
    expect(ProductStatus.ARCHIVED).toEqual("archived")
    expect(Object.values(ProductStatus)).toEqual([
      "draft",
      "proposed",
      "published",
      "rejected",
      "archived",
    ])
  })
})
