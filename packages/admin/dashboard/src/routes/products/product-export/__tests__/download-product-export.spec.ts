// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest"
import { sdk } from "../../../../lib/client"
import { downloadProductExport } from "../download-product-export"

vi.mock("../../../../lib/client", () => ({
  sdk: { client: { fetch: vi.fn() } },
}))

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe("downloadProductExport", () => {
  it("downloads the authenticated response with its filename and current filters", async () => {
    vi.useFakeTimers()
    const blob = new Blob(["Product Status\narchived\n"], { type: "text/csv" })
    vi.mocked(sdk.client.fetch).mockResolvedValue({
      blob: async () => blob,
      headers: new Headers({
        "content-disposition": 'attachment; filename="products.csv"',
      }),
    })
    const createObjectURL = vi.fn(() => "blob:export")
    const revokeObjectURL = vi.fn()
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL })
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(function (this: HTMLAnchorElement) {
        expect(this.download).toBe("products.csv")
        expect(this.href).toBe("blob:export")
        expect(this.isConnected).toBe(true)
      })
    const query = { status: ["archived" as const] }
    await downloadProductExport(query)
    expect(sdk.client.fetch).toHaveBeenCalledWith(
      "/admin/products/export/download",
      {
        method: "POST",
        headers: { accept: "text/csv" },
        query,
      }
    )
    expect(createObjectURL).toHaveBeenCalledWith(blob)
    expect(click).toHaveBeenCalledOnce()
    expect(document.querySelector("a")).toBeNull()
    expect(revokeObjectURL).not.toHaveBeenCalled()
    vi.runAllTimers()
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:export")
  })

  it("does not start a download if the export fails", async () => {
    vi.mocked(sdk.client.fetch).mockRejectedValue(new Error("Export failed"))
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click")
    await expect(downloadProductExport({})).rejects.toThrow("Export failed")
    expect(click).not.toHaveBeenCalled()
  })
})
