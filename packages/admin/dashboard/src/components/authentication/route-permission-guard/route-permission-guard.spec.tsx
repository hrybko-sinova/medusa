import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, expect, it, vi } from "vitest"
import { RoutePermissionGuard } from "./route-permission-guard"

const state = vi.hoisted(() => ({
  loading: false,
  pathname: "/settings/users",
  permissions: [] as string[],
  matches: [] as { handle: unknown }[],
  outlet: vi.fn(() => "protected page"),
}))
vi.mock("react-router-dom", () => ({
  useMatches: () => state.matches,
  useLocation: () => ({ pathname: state.pathname }),
  Outlet: state.outlet,
  Navigate: () => null,
}))
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))
vi.mock("../../../providers/permissions-provider", () => ({
  useRegisterPermissions: () => {},
  usePermissions: () => ({
    isLoading: state.loading,
    hasAnyPermission: (ps: string[]) =>
      ps.some((p) => state.permissions.includes(p)),
    hasAllPermissions: (ps: string[]) =>
      ps.every((p) => state.permissions.includes(p)),
  }),
}))
vi.mock("@medusajs/icons", () => ({
  Spinner: () => "loading",
  ExclamationCircle: () => null,
}))
vi.mock("@medusajs/ui", () => ({
  Container: ({ children }: React.PropsWithChildren) => children,
  Heading: ({ children }: React.PropsWithChildren) => children,
  Text: ({ children }: React.PropsWithChildren) => children,
}))
beforeEach(() => {
  state.loading = false
  state.pathname = "/settings/users"
  state.permissions = []
  state.matches = []
  state.outlet.mockClear()
})
it("does not mount pages while permissions load", () => {
  state.loading = true
  renderToStaticMarkup(<RoutePermissionGuard />)
  expect(state.outlet).not.toHaveBeenCalled()
})
it("shows access denied without mounting the users page", () => {
  expect(renderToStaticMarkup(<RoutePermissionGuard />)).toContain(
    "permissions.accessDenied.title"
  )
  expect(state.outlet).not.toHaveBeenCalled()
})
it("renders authorized pages", () => {
  state.permissions = ["user:read"]
  expect(renderToStaticMarkup(<RoutePermissionGuard />)).toContain(
    "protected page"
  )
})
it("does not let child permissions override missing parent permissions", () => {
  state.permissions = ["invite:create"]
  state.matches = [{ handle: { permissions: "invite:create" } }]
  renderToStaticMarkup(<RoutePermissionGuard />)
  expect(state.outlet).not.toHaveBeenCalled()
})
