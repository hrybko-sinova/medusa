import { Spinner } from "@medusajs/icons"
import { Navigate } from "react-router-dom"
import { usePermissions } from "../../providers/permissions-provider"

export const Settings = () => {
  const { hasPermission, isLoading } = usePermissions()

  if (isLoading) {
    return <Spinner className="text-ui-fg-interactive animate-spin" />
  }

  return (
    <Navigate
      to={hasPermission("store:read") ? "/settings/store" : "/settings/profile"}
      replace
    />
  )
}
