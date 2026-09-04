import type { HttpTypes } from "@medusajs/types"
import { sdk } from "../../../lib/client"

export async function downloadProductExport(
  query: HttpTypes.AdminProductListParams
) {
  const response = await sdk.client.fetch<Response>(
    "/admin/products/export/download",
    {
      method: "POST",
      headers: { accept: "text/csv" },
      query,
    }
  )
  const blob = await response.blob()
  const filename =
    response.headers
      .get("content-disposition")
      ?.match(/filename="([^"]+)"/)?.[1] ?? "product-exports.csv"
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  try {
    link.click()
  } finally {
    link.remove()
    // Keep the object URL alive long enough for the browser to start saving it.
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }
}
