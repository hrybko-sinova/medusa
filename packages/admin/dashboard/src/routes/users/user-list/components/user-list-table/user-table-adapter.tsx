import { HttpTypes } from "@medusajs/types"
import { TFunction } from "i18next"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useUsers } from "../../../../../hooks/api/users"
import { useFeatureFlag } from "../../../../../providers/feature-flag-provider"
import { usePermissions } from "../../../../../providers/permissions-provider"
import {
  createTableAdapter,
  TableAdapter,
} from "../../../../../lib/table/table-adapters"
import { UserListTableActions } from "./user-list-table-actions"

export function createUserTableAdapter({
  t,
  showRoles,
}: {
  t: TFunction<"translation", undefined>
  showRoles: boolean
}): TableAdapter<HttpTypes.AdminUser> {
  return createTableAdapter<HttpTypes.AdminUser>({
    entity: "users",
    queryPrefix: "u",
    pageSize: 20,
    emptyState: {
      empty: {
        heading: t("users.list.empty.heading"),
        description: t("users.list.empty.description"),
      },
      filtered: {
        heading: t("users.list.filtered.heading"),
        description: t("users.list.filtered.description"),
      },
    },
    useData: (fields, params) => {
      const { users, count, isError, error, isLoading } = useUsers(
        {
          fields,
          ...params,
        },
        {
          placeholderData: (previousData, previousQuery: any) => {
            const prevFields =
              previousQuery?.[previousQuery?.length - 1]?.query?.fields
            if (prevFields && prevFields !== fields) {
              return undefined
            }
            return previousData
          },
        }
      )
      return { data: users, count, isLoading, isError, error }
    },
    getRowHref: (row) => `/settings/users/${row.id}`,
    renderRowActions: (row) => <UserListTableActions user={row} />,
    transformColumns: (columns) => {
      const ALLOWED_FILTERS = [
        "id",
        "email",
        "first_name",
        "last_name",
        "created_at",
        "updated_at",
        "deleted_at",
      ]

      const transformedColumns = columns.map((column) => {
        const isFilterDisabled = !ALLOWED_FILTERS.includes(column.field)

        return {
          ...column,
          filter: isFilterDisabled
            ? { ...column.filter, enabled: false }
            : column.filter,
        }
      })

      if (!showRoles) {
        return transformedColumns
      }

      return [
        ...transformedColumns,
        {
          id: "roles",
          name: t("fields.role"),
          field: "roles",
          sortable: false,
          hideable: true,
          default_visible: true,
          data_type: "string",
          semantic_type: "relationship",
          context: "display",
          render_mode: "badges",
          default_order: 350,
          category: "relationship",
          computed: {
            type: "badges",
            required_fields: ["rbac_roles.name"],
            optional_fields: [],
          },
          metadata: {
            list_field: "rbac_roles",
            display_field: "name",
          },
          filter: { enabled: false },
        },
      ]
    },
  })
}

export function useUserTableAdapter(): TableAdapter<HttpTypes.AdminUser> {
  const { t } = useTranslation()
  const isRbacEnabled = useFeatureFlag("rbac")
  const { hasPermission } = usePermissions()
  const showRoles = isRbacEnabled && hasPermission("rbac_role:read")

  return useMemo(() => createUserTableAdapter({ t, showRoles }), [t, showRoles])
}
