import { HttpTypes } from "@medusajs/types"
import { Badge, Container, createDataTableColumnHelper } from "@medusajs/ui"
import { keepPreviousData } from "@tanstack/react-query"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { DataTable } from "../../../../../components/data-table"
import { useDataTableDateColumns } from "../../../../../components/data-table/helpers/general/use-data-table-date-columns"
import { useDataTableDateFilters } from "../../../../../components/data-table/helpers/general/use-data-table-date-filters"
import { useUsers } from "../../../../../hooks/api/users"
import { useQueryParams } from "../../../../../hooks/use-query-params"
import { useFeatureFlag } from "../../../../../providers/feature-flag-provider"
import { usePermissions } from "../../../../../providers/permissions-provider"
import { UserListTableActions } from "./user-list-table-actions"

const PAGE_SIZE = 20

export const UserListTable = () => {
  const { q, order, offset } = useQueryParams(["q", "order", "offset"])
  const isRbacEnabled = useFeatureFlag("rbac")
  const { hasPermission } = usePermissions()
  const showRoles = isRbacEnabled && hasPermission("rbac_role:read")
  const { users, count, isPending, isError, error } = useUsers(
    {
      q,
      order,
      offset: offset ? parseInt(offset) : 0,
      limit: PAGE_SIZE,
      fields: showRoles
        ? "id,email,first_name,last_name,created_at,updated_at,rbac_roles.id,rbac_roles.name"
        : undefined,
    },
    {
      placeholderData: keepPreviousData,
    }
  )

  const columns = useColumns(showRoles)
  const filters = useFilters()

  const { t } = useTranslation()

  if (isError) {
    throw error
  }

  return (
    <Container className="divide-y p-0">
      <DataTable
        data={users}
        columns={columns}
        filters={filters}
        getRowId={(row) => row.id}
        rowCount={count}
        pageSize={PAGE_SIZE}
        heading={t("users.domain")}
        rowHref={(row) => `${row.id}`}
        isLoading={isPending}
        action={{
          label: t("users.invite"),
          to: "invite",
        }}
        emptyState={{
          empty: {
            heading: t("users.list.empty.heading"),
            description: t("users.list.empty.description"),
          },
          filtered: {
            heading: t("users.list.filtered.heading"),
            description: t("users.list.filtered.description"),
          },
        }}
      />
    </Container>
  )
}

const columnHelper = createDataTableColumnHelper<HttpTypes.AdminUser>()

const useColumns = (showRoles: boolean) => {
  const { t } = useTranslation()

  const dateColumns = useDataTableDateColumns<HttpTypes.AdminUser>()

  return useMemo(
    () => [
      columnHelper.accessor("email", {
        header: t("fields.email"),
        cell: ({ row }) => {
          return row.original.email
        },
        enableSorting: true,
        sortAscLabel: t("filters.sorting.alphabeticallyAsc"),
        sortDescLabel: t("filters.sorting.alphabeticallyDesc"),
      }),
      columnHelper.accessor("first_name", {
        header: t("fields.firstName"),
        cell: ({ row }) => {
          return row.original.first_name || "-"
        },
        enableSorting: true,
        sortAscLabel: t("filters.sorting.alphabeticallyAsc"),
        sortDescLabel: t("filters.sorting.alphabeticallyDesc"),
      }),
      columnHelper.accessor("last_name", {
        header: t("fields.lastName"),
        cell: ({ row }) => {
          return row.original.last_name || "-"
        },
        enableSorting: true,
        sortAscLabel: t("filters.sorting.alphabeticallyAsc"),
        sortDescLabel: t("filters.sorting.alphabeticallyDesc"),
      }),
      ...(showRoles
        ? [
            columnHelper.accessor("rbac_roles", {
              header: t("fields.role"),
              cell: ({ row }) => {
                const roles = row.original.rbac_roles ?? []

                if (!roles.length) {
                  return "-"
                }

                return (
                  <div className="flex flex-wrap gap-1">
                    {roles.map((role) => (
                      <Badge key={role.id} size="xsmall">
                        {role.name}
                      </Badge>
                    ))}
                  </div>
                )
              },
            }),
          ]
        : []),
      ...dateColumns,
      columnHelper.display({
        id: "action",
        cell: ({ row }) => <UserListTableActions user={row.original} />,
      }),
    ],
    [t, dateColumns, showRoles]
  )
}

const useFilters = () => {
  const dateFilters = useDataTableDateFilters()

  return useMemo(() => {
    return dateFilters
  }, [dateFilters])
}
