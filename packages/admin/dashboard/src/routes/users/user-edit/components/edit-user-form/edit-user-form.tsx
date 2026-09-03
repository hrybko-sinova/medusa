import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Input, toast } from "@medusajs/ui"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import * as zod from "zod"

import { HttpTypes } from "@medusajs/types"
import { Form } from "../../../../../components/common/form"
import { Combobox } from "../../../../../components/inputs/combobox"
import { RouteDrawer, useRouteModal } from "../../../../../components/modals"
import { KeyboundForm } from "../../../../../components/utilities/keybound-form"
import {
  useAddUserRoles,
  useRemoveUserRoles,
  useUpdateUser,
} from "../../../../../hooks/api/users"

type EditUserFormProps = {
  user: HttpTypes.AdminUser
  roles: HttpTypes.AdminRbacRole[]
  assignableRoles: Pick<
    HttpTypes.AdminRbacRole,
    "id" | "name" | "description"
  >[]
  canManageRoles: boolean
}

const EditUserFormSchema = zod.object({
  first_name: zod.string().optional(),
  last_name: zod.string().optional(),
  roles: zod.array(zod.string()).optional(),
})

export const EditUserForm = ({
  user,
  roles,
  assignableRoles,
  canManageRoles,
}: EditUserFormProps) => {
  const { t } = useTranslation()
  const { handleSuccess } = useRouteModal()
  const assignableRoleIds = useMemo(
    () => new Set(assignableRoles.map((role) => role.id)),
    [assignableRoles]
  )
  const unassignableRoles = useMemo(
    () => roles.filter((role) => !assignableRoleIds.has(role.id)),
    [assignableRoleIds, roles]
  )

  const form = useForm<zod.infer<typeof EditUserFormSchema>>({
    defaultValues: {
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      roles: roles
        .filter((role) => assignableRoleIds.has(role.id))
        .map((role) => role.id),
    },
    resolver: zodResolver(EditUserFormSchema),
  })

  const { mutateAsync, isPending } = useUpdateUser(user.id)
  const { mutateAsync: addRoles, isPending: isAddingRoles } = useAddUserRoles(
    user.id
  )
  const { mutateAsync: removeRoles, isPending: isRemovingRoles } =
    useRemoveUserRoles(user.id)

  const roleOptions = useMemo(
    () =>
      assignableRoles.map((role) => ({
        label: role.name,
        value: role.id,
      })),
    [assignableRoles]
  )

  const handleSubmit = form.handleSubmit(async (values) => {
    const selectedRoleIds = values.roles ?? []
    const existingRoleIds = roles.map((role) => role.id)

    if (
      canManageRoles &&
      selectedRoleIds.length === 0 &&
      unassignableRoles.length === 0
    ) {
      form.setError("roles", {
        type: "manual",
        message: t("users.roleRequired"),
      })
      return
    }

    const rolesToAdd = canManageRoles
      ? selectedRoleIds.filter((roleId) => !existingRoleIds.includes(roleId))
      : []
    const rolesToRemove = canManageRoles
      ? existingRoleIds
          .filter((roleId) => assignableRoleIds.has(roleId))
          .filter((roleId) => !selectedRoleIds.includes(roleId))
      : []

    try {
      await mutateAsync({
        first_name: values.first_name,
        last_name: values.last_name,
      })

      if (rolesToAdd.length) {
        await addRoles({ roles: rolesToAdd })
      }

      if (rolesToRemove.length) {
        await removeRoles({ roles: rolesToRemove })
      }

      handleSuccess()
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : t("errorBoundary.defaultTitle")
      )
    }
  })

  const isSubmitting = isPending || isAddingRoles || isRemovingRoles

  return (
    <RouteDrawer.Form form={form}>
      <KeyboundForm
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <RouteDrawer.Body className="flex max-w-full flex-1 flex-col gap-y-8 overflow-y-auto">
          <Form.Field
            control={form.control}
            name="first_name"
            render={({ field }) => {
              return (
                <Form.Item>
                  <Form.Label>{t("fields.firstName")}</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                  <Form.ErrorMessage />
                </Form.Item>
              )
            }}
          />
          <Form.Field
            control={form.control}
            name="last_name"
            render={({ field }) => {
              return (
                <Form.Item>
                  <Form.Label>{t("fields.lastName")}</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                  <Form.ErrorMessage />
                </Form.Item>
              )
            }}
          />
          {canManageRoles && (
            <Form.Field
              control={form.control}
              name="roles"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label>{t("fields.role")}</Form.Label>
                    <Form.Control>
                      <Combobox
                        {...field}
                        value={field.value ?? []}
                        onChange={(value) => field.onChange(value ?? [])}
                        options={roleOptions}
                        placeholder={t("labels.selectValues")}
                        displayMode="chips"
                      />
                    </Form.Control>
                    {unassignableRoles.length > 0 && (
                      <Form.Hint>
                        {t("users.rolesNotEditable", {
                          roles: unassignableRoles
                            .map((role) => role.name)
                            .join(", "),
                        })}
                      </Form.Hint>
                    )}
                    <Form.ErrorMessage />
                  </Form.Item>
                )
              }}
            />
          )}
        </RouteDrawer.Body>
        <RouteDrawer.Footer>
          <div className="flex items-center justify-end gap-x-2">
            <RouteDrawer.Close asChild>
              <Button size="small" variant="secondary">
                {t("actions.cancel")}
              </Button>
            </RouteDrawer.Close>
            <Button size="small" type="submit" isLoading={isSubmitting}>
              {t("actions.save")}
            </Button>
          </div>
        </RouteDrawer.Footer>
      </KeyboundForm>
    </RouteDrawer.Form>
  )
}
