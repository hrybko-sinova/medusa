import type { HttpTypes } from "@medusajs/framework/types"
import { CSVNormalizer, productValidators } from "@medusajs/framework/utils"
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk"
import {
  getProductCsvExtension,
  preprocessProductCsvRow,
} from "../helpers/product-csv-extension"
import { convertCsvToJson } from "../utils"

/**
 * The CSV file content to parse.
 */
export type NormalizeProductCsvStepInput = string

export const normalizeCsvStepId = "normalize-product-csv"
/**
 * This step parses a CSV file holding products to import, returning the products as
 * objects that can be imported.
 *
 * @example
 * const data = parseProductCsvStep("products.csv")
 */
export const normalizeCsvStep = createStep(
  normalizeCsvStepId,
  async (fileContent: NormalizeProductCsvStepInput, { container }) => {
    const extension = getProductCsvExtension(container)
    const csvProducts =
      convertCsvToJson<Record<string, number | string | boolean>>(fileContent, {
        // Let CSVNormalizer handle field types, as the chunked importer does.
        // Automatic CSV coercion loses leading zeros in identifiers and turns
        // metadata into objects before its JSON processor can read it.
        preserveStrings: true,
      })
    const rows = csvProducts.map((row, index) =>
      preprocessProductCsvRow(row, index + 1, extension)
    )
    const additional_data = await extension?.normalizeImport(rows)
    const normalizer = new CSVNormalizer(rows)
    const products = normalizer.proccess()

    const create = Object.keys(products.toCreate).reduce<
      HttpTypes.AdminCreateProduct[]
    >((result, toCreateHandle) => {
      result.push(
        productValidators.CreateProduct.parse(
          products.toCreate[toCreateHandle]
        ) as HttpTypes.AdminCreateProduct
      )
      return result
    }, [])

    const update = Object.keys(products.toUpdate).reduce<
      HttpTypes.AdminUpdateProduct & { id: string }[]
    >((result, toUpdateId) => {
      result.push(
        productValidators.UpdateProduct.parse(products.toUpdate[toUpdateId])
      )
      return result
    }, [])

    return new StepResponse({
      create,
      update,
      additional_data,
    })
  }
)
