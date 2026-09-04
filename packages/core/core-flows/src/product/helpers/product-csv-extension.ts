import type { HttpTypes, MedusaContainer } from "@medusajs/framework/types"
import { CSVNormalizer } from "@medusajs/framework/utils"

/** Optional application support for custom product CSV columns and relations. */
export interface ProductCsvExtension {
  columns: string[]
  exportFields: string[]
  normalizeImport(
    rows: Record<string, unknown>[]
  ): Promise<Record<string, unknown>>
  normalizeExport(product: HttpTypes.AdminProduct): HttpTypes.AdminProduct
}

export function getProductCsvExtension(
  container: MedusaContainer
): ProductCsvExtension | undefined {
  return container.resolve("productCsvExtension", { allowUnregistered: true })
}

export function preprocessProductCsvRow(
  row: Record<string, string | number | boolean>,
  rowNumber: number,
  extension?: ProductCsvExtension
) {
  const standard = { ...row }
  const custom: Record<string, string | number | boolean> = {}
  for (const key of Object.keys(row)) {
    const column = key.trim().toLowerCase()
    if (extension?.columns.includes(column)) {
      custom[column] = row[key]
      delete standard[key]
    }
  }
  return { ...CSVNormalizer.preProcess(standard, rowNumber), ...custom }
}
