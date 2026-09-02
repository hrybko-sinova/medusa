import { HttpTypes } from "@medusajs/types"

export const DEFAULT_PRODUCT_LIST_STATUSES: HttpTypes.AdminProductStatus[] = [
  "published",
  "proposed",
  "rejected",
]

type ResolveProductListStatusesArgs = {
  status?: string | string[] | HttpTypes.AdminProductStatus[]
  showDrafted?: boolean
  showArchived?: boolean
}

export function resolveProductListStatuses({
  status,
  showDrafted = false,
  showArchived = false,
}: ResolveProductListStatusesArgs): HttpTypes.AdminProductStatus[] {
  const selected = Array.isArray(status) ? status : status ? [status] : []

  if (selected.length) {
    return selected as HttpTypes.AdminProductStatus[]
  }

  const statuses: HttpTypes.AdminProductStatus[] = [
    ...DEFAULT_PRODUCT_LIST_STATUSES,
  ]

  if (showDrafted) {
    statuses.push("draft")
  }

  if (showArchived) {
    statuses.push("archived")
  }

  return statuses
}
