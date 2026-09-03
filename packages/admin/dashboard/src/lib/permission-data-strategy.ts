import type { DataStrategyFunction } from "react-router-dom"
import { featureFlagsQueryOptions } from "../hooks/api/feature-flags"
import { mePermissionsQueryKey } from "../hooks/api/rbac-roles"
import { sdk } from "./client"
import { getRoutePermission } from "./permissions/route-permissions"
import { queryClient } from "./query-client"

// React Router runs loaders before rendering guards. Resolve lazy modules but
// skip their data requests on denied routes so the guard can render normally.
export const permissionDataStrategy: DataStrategyFunction = async ({
  matches,
}) => {
  const permission = getRoutePermission(matches[matches.length - 1].pathname)
  let allowed = true
  if (permission) {
    try {
      const flags = await queryClient.fetchQuery(featureFlagsQueryOptions)
      if (flags.rbac) {
        const { permissions } = await queryClient.fetchQuery({
          queryKey: mePermissionsQueryKey,
          queryFn: () => sdk.admin.rbacRole.mePermissions(),
          staleTime: 5 * 60 * 1000,
        })
        const resource = permission.split(":")[0]
        allowed =
          permissions.includes(permission) ||
          permissions.includes(`${resource}:*`)
      }
    } catch {
      // Authentication and permission loading errors are handled by ProtectedRoute.
      allowed = false
    }
  }
  return Object.fromEntries(
    await Promise.all(
      matches
        .filter((match) => match.shouldLoad)
        .map(async (match) => [
          match.route.id,
          await match.resolve(allowed ? undefined : () => null),
        ])
    )
  )
}
