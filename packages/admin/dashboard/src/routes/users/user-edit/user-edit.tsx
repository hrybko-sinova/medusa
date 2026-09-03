import { Heading } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { RouteDrawer } from "../../../components/modals"
import { useRbacAssignableRoles } from "../../../hooks/api/rbac-roles"
import { useUser } from "../../../hooks/api/users"
import { useUserRoles } from "../../../hooks/api/users"
import { useFeatureFlag } from "../../../providers/feature-flag-provider"
import { usePermissions } from "../../../providers/permissions-provider"
import { EditUserForm } from "./components/edit-user-form"

export const UserEdit = () => {
  const { t } = useTranslation()
  const { id } = useParams()
  const { user, isPending: isLoading, isError, error } = useUser(id!)
  const isRbacEnabled = useFeatureFlag("rbac")
  const { hasPermission, hasAllPermissions } = usePermissions()
  const showRoles = isRbacEnabled && hasPermission("rbac_role:read")
  const canManageRoles =
    isRbacEnabled && hasAllPermissions(["user:update", "rbac_role:update"])

  const {
    roles,
    isPending: isRolesLoading,
    isError: isRolesError,
    error: rolesError,
  } = useUserRoles(id!, { limit: 200 }, { enabled: showRoles })
  const {
    data: assignableRolesData,
    isPending: isAssignableRolesLoading,
    isError: isAssignableRolesError,
    error: assignableRolesError,
  } = useRbacAssignableRoles(
    { limit: 200, order: "name" },
    { enabled: canManageRoles }
  )

  if (isError || isRolesError || isAssignableRolesError) {
    throw error || rolesError || assignableRolesError
  }

  const isRoleDataLoading =
    (showRoles && isRolesLoading) ||
    (canManageRoles && isAssignableRolesLoading)

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <Heading>{t("users.editUser")}</Heading>
      </RouteDrawer.Header>
      {!isLoading && !isRoleDataLoading && user && (
        <EditUserForm
          user={user}
          roles={roles ?? []}
          assignableRoles={assignableRolesData?.roles ?? []}
          canManageRoles={canManageRoles}
        />
      )}
    </RouteDrawer>
  )
}
