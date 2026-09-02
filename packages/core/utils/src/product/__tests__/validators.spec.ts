import { ProductStatus } from "../enums"
import { CreateProduct, UpdateProduct } from "../validators"

describe("product validators", () => {
  it("accepts archived on create and update", () => {
    expect(
      CreateProduct.parse({
        title: "Archived product",
        status: ProductStatus.ARCHIVED,
      }).status
    ).toEqual(ProductStatus.ARCHIVED)

    expect(
      UpdateProduct.parse({
        id: "prod_01ARCHIVED",
        status: ProductStatus.ARCHIVED,
      }).status
    ).toEqual(ProductStatus.ARCHIVED)
  })

  it("rejects unknown product statuses", () => {
    expect(() =>
      CreateProduct.parse({
        title: "Invalid product",
        status: "hidden",
      })
    ).toThrow()
  })
})
