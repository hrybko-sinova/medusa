import { FetchError } from "@medusajs/js-sdk"
import { HttpTypes } from "@medusajs/types"
import {
  QueryKey,
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query"
import { sdk } from "../../lib/client"
import { queryClient } from "../../lib/query-client"
import { queryKeysFactory } from "../../lib/query-key-factory"

const USERS_QUERY_KEY = "users" as const
const usersQueryKeys = {
  ...queryKeysFactory(USERS_QUERY_KEY),
  me: (query?: HttpTypes.AdminUserParams) =>
    [USERS_QUERY_KEY, "me", query ? { query } : undefined].filter((k) => !!k),
  roles: (id: string, query?: HttpTypes.AdminGetUserRolesParams) =>
    [
      USERS_QUERY_KEY,
      "detail",
      id,
      "roles",
      query ? { query } : undefined,
    ].filter((k) => !!k),
}

export const useMe = (
  query?: HttpTypes.AdminUserParams,
  options?: UseQueryOptions<
    HttpTypes.AdminUserResponse,
    FetchError,
    HttpTypes.AdminUserResponse,
    QueryKey
  >
) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.user.me(query),
    queryKey: usersQueryKeys.me(query),
    ...options,
  })

  return {
    ...data,
    ...rest,
  }
}

export const useUser = (
  id: string,
  query?: HttpTypes.AdminUserParams,
  options?: Omit<
    UseQueryOptions<
      HttpTypes.AdminUserResponse,
      FetchError,
      HttpTypes.AdminUserResponse,
      QueryKey
    >,
    "queryFn" | "queryKey"
  >
) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.user.retrieve(id, query),
    queryKey: usersQueryKeys.detail(id),
    ...options,
  })

  return { ...data, ...rest }
}

export const useUsers = (
  query?: HttpTypes.AdminUserListParams,
  options?: Omit<
    UseQueryOptions<
      HttpTypes.AdminUserListResponse,
      FetchError,
      HttpTypes.AdminUserListResponse,
      QueryKey
    >,
    "queryFn" | "queryKey"
  >
) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.user.list(query),
    queryKey: usersQueryKeys.list(query),
    ...options,
  })

  return { ...data, ...rest }
}

export const useUserRoles = (
  id: string,
  query?: HttpTypes.AdminGetUserRolesParams,
  options?: Omit<
    UseQueryOptions<
      HttpTypes.AdminUserRoleListResponse,
      FetchError,
      HttpTypes.AdminUserRoleListResponse,
      QueryKey
    >,
    "queryFn" | "queryKey"
  >
) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.user.listRoles(id, query),
    queryKey: usersQueryKeys.roles(id, query),
    ...options,
  })

  return { ...data, ...rest }
}

export const useAddUserRoles = (
  id: string,
  options?: UseMutationOptions<
    HttpTypes.AdminUserRolesResponse,
    FetchError,
    HttpTypes.AdminAssignUserRoles
  >
) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.user.addRoles(id, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.roles(id) })
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ["rbac_roles"] })

      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

export const useRemoveUserRoles = (
  id: string,
  options?: UseMutationOptions<
    HttpTypes.AdminUserRolesDeleteResponse,
    FetchError,
    HttpTypes.AdminRemoveUserRoles
  >
) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.user.removeRoles(id, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.roles(id) })
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ["rbac_roles"] })

      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

export const useUpdateUser = (
  id: string,
  query?: HttpTypes.AdminUserParams,
  options?: UseMutationOptions<
    HttpTypes.AdminUserResponse,
    FetchError,
    HttpTypes.AdminUpdateUser,
    QueryKey
  >
) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.user.update(id, payload, query),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.lists() })

      // We invalidate the me query in case the user updates their own profile
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.me() })

      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

export const useDeleteUser = (
  id: string,
  options?: UseMutationOptions<
    HttpTypes.AdminUserDeleteResponse,
    FetchError,
    void
  >
) => {
  return useMutation({
    mutationFn: () => sdk.admin.user.delete(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.lists() })

      // We invalidate the me query in case the user updates their own profile
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.me() })

      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

// Self-service profile changes must not use the user-administration endpoint.
export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: (payload: Pick<HttpTypes.AdminUpdateUser, "first_name" | "last_name">) =>
      sdk.client.fetch<HttpTypes.AdminUserResponse>("/admin/profile", {
        method: "POST",
        body: payload,
      }),
    onSuccess: ({ user }) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.me() })
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.detail(user.id) })
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.lists() })
    },
  })
}
