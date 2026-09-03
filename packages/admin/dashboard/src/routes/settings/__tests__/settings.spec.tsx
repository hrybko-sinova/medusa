import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, expect, it, vi } from "vitest"
import { Settings } from "../settings"

const state = vi.hoisted(() => ({
  loading: false,
  canReadStore: false,
  navigate: vi.fn((_props: { to: string; replace: boolean }) => null),
}))
vi.mock("react-router-dom", () => ({ Navigate: state.navigate }))
vi.mock("@medusajs/icons", () => ({ Spinner: () => null }))
vi.mock("../../../providers/permissions-provider", () => ({
  usePermissions: () => ({
    isLoading: state.loading,
    hasPermission: (permission: string) =>
      permission === "store:read" && state.canReadStore,
  }),
}))

beforeEach(() => {
  state.loading = false
  state.canReadStore = false
  state.navigate.mockClear()
})

it("opens My Profile for Support without store access", () => {
  renderToStaticMarkup(<Settings />)
  expect(state.navigate.mock.calls[0][0]).toMatchObject({
    to: "/settings/profile",
    replace: true,
  })
})

it("keeps Store as the landing page for users with store access", () => {
  state.canReadStore = true
  renderToStaticMarkup(<Settings />)
  expect(state.navigate.mock.calls[0][0]).toMatchObject({
    to: "/settings/store",
    replace: true,
  })
})

it("waits for permissions before redirecting", () => {
  state.loading = true
  renderToStaticMarkup(<Settings />)
  expect(state.navigate).not.toHaveBeenCalled()
})
