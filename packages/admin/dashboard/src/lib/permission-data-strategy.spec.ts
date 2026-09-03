import { beforeEach, describe, expect, it, vi } from "vitest"
import { createMemoryRouter } from "react-router-dom"
import { permissionDataStrategy } from "./permission-data-strategy"
import {
  canAccessRoute,
  getRoutePermission,
} from "./permissions/route-permissions"

const state = vi.hoisted(() => ({
  rbac: true,
  permissions: [] as string[],
  fail: false,
}))
vi.mock("../hooks/api/feature-flags", () => ({
  featureFlagsQueryOptions: { queryKey: ["flags"] },
}))
vi.mock("../hooks/api/rbac-roles", () => ({
  mePermissionsQueryKey: ["permissions"],
}))
vi.mock("./client", () => ({ sdk: { admin: { rbacRole: {} } } }))
vi.mock("./query-client", () => ({
  queryClient: {
    fetchQuery: async ({ queryKey }: { queryKey: string[] }) => {
      if (state.fail) throw new Error("Unavailable")
      return queryKey[0] === "flags"
        ? { rbac: state.rbac }
        : { permissions: state.permissions }
    },
  },
}))

beforeEach(() => {
  state.rbac = true
  state.permissions = ["order:read", "product:read"]
  state.fail = false
})

it("hides restricted pages while allowing operational pages and own profile", () => {
  for (const path of [
    "/settings/users",
    "/settings/users/user_1/edit",
    "/settings/roles",
    "/settings/policies",
    "/settings/secret-api-keys",
  ]) {
    expect(canAccessRoute(path, (p) => state.permissions.includes(p))).toBe(
      false
    )
  }
  expect(canAccessRoute("/orders", (p) => state.permissions.includes(p))).toBe(
    true
  )
  expect(canAccessRoute("/settings/profile", () => false)).toBe(true)
})
it("uses API resources and respects path boundaries", () => {
  expect(getRoutePermission("/inventory/item_1")).toBe("inventory_item:read")
  expect(getRoutePermission("/reservations")).toBe("reservation_item:read")
  expect(getRoutePermission("/settings/locations/shipping-profiles")).toBe(
    "shipping_profile:read"
  )
  expect(getRoutePermission("/settings/users-extension")).toBeUndefined()
})

async function loadUserPage() {
  const loader = vi.fn(() => ({ user: { id: "user_1" } }))
  const lazy = vi.fn(async () => ({ loader }))
  const router = createMemoryRouter([{ path: "/settings/users/:id", lazy }], {
    basename: "/app",
    initialEntries: ["/app/settings/users/user_1"],
    dataStrategy: permissionDataStrategy,
  })
  await vi.waitFor(() => expect(router.state.initialized).toBe(true))
  expect(lazy).toHaveBeenCalledOnce()
  expect(router.state.errors).toBeNull()
  router.dispose()
  return loader
}

describe("direct URL loaders", () => {
  it("skips user API for operational roles", async () => {
    expect(await loadUserPage()).not.toHaveBeenCalled()
  })
  it("loads users for authorized administrators", async () => {
    state.permissions = ["user:read"]
    expect(await loadUserPage()).toHaveBeenCalledOnce()
  })
  it("accepts resource wildcards", async () => {
    state.permissions = ["user:*"]
    expect(await loadUserPage()).toHaveBeenCalledOnce()
  })
  it("supports disabled RBAC", async () => {
    state.rbac = false
    expect(await loadUserPage()).toHaveBeenCalledOnce()
  })
  it("fails closed on permission loading failure", async () => {
    state.fail = true
    expect(await loadUserPage()).not.toHaveBeenCalled()
  })
})
