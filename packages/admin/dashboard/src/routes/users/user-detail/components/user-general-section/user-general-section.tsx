import { PencilSquare, Spinner, Trash } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Badge, Container, Heading, Text, toast, usePrompt } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { ActionMenu } from "../../../../../components/common/action-menu"
import { useDeleteUser, useUserRoles } from "../../../../../hooks/api/users"
import { useFeatureFlag } from "../../../../../providers/feature-flag-provider"
import { usePermissions } from "../../../../../providers/permissions-provider"

type UserGeneralSectionProps = {
  user: HttpTypes.AdminUser
}

export const UserGeneralSection = ({ user }: UserGeneralSectionProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const prompt = usePrompt()
  const isRbacEnabled = useFeatureFlag("rbac")
  const { hasPermission } = usePermissions()
  const showRoles = isRbacEnabled && hasPermission("rbac_role:read")

  const {
    roles,
    isPending: isRolesLoading,
    isError: isRolesError,
    error: rolesError,
  } = useUserRoles(user.id, { limit: 200 }, { enabled: showRoles })

  const { mutateAsync } = useDeleteUser(user.id)

  const name = [user.first_name, user.last_name].filter(Boolean).join(" ")

  if (isRolesError) {
    throw rolesError
  }

  const handleDeleteUser = async () => {
    const res = await prompt({
      title: t("general.areYouSure"),
      description: t("users.deleteUserWarning", {
        name: name ?? user.email,
      }),
      verificationText: name ?? user.email,
      verificationInstruction: t("general.typeToConfirm"),
      confirmText: t("actions.delete"),
      cancelText: t("actions.cancel"),
    })

    if (!res) {
      return
    }

    await mutateAsync(undefined, {
      onSuccess: () => {
        toast.success(t("users.deleteUserSuccess", { name: user.email }))
        navigate("..")
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading>{user.email}</Heading>
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  label: t("actions.edit"),
                  to: "edit",
                  icon: <PencilSquare />,
                },
              ],
            },
            {
              actions: [
                {
                  label: t("actions.delete"),
                  onClick: handleDeleteUser,
                  icon: <Trash />,
                },
              ],
            },
          ]}
        />
      </div>
      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          {t("fields.name")}
        </Text>
        <Text size="small" leading="compact">
          {name ?? "-"}
        </Text>
      </div>
      {showRoles && (
        <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
          <Text size="small" leading="compact" weight="plus">
            {t("fields.role")}
          </Text>
          {isRolesLoading ? (
            <Spinner className="text-ui-fg-interactive animate-spin" />
          ) : roles?.length ? (
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <Badge key={role.id} size="xsmall">
                  {role.name}
                </Badge>
              ))}
            </div>
          ) : (
            <Text size="small" leading="compact">
              -
            </Text>
          )}
        </div>
      )}
    </Container>
  )
}
