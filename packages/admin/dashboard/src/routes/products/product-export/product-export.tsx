import { Button, Heading, toast } from "@medusajs/ui"
import { RouteDrawer, useRouteModal } from "../../../components/modals"
import { useTranslation } from "react-i18next"
import { ExportFilters } from "./components/export-filters"
import { useMutation } from "@tanstack/react-query"
import { downloadProductExport } from "./download-product-export"
import { useProductTableQuery } from "../../../hooks/table/query"

export const ProductExport = () => {
  const { t } = useTranslation()

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <RouteDrawer.Title asChild>
          <Heading>{t("products.export.header")}</Heading>
        </RouteDrawer.Title>
        <RouteDrawer.Description className="sr-only">
          {t("products.export.description")}
        </RouteDrawer.Description>
      </RouteDrawer.Header>
      <ProductExportContent />
    </RouteDrawer>
  )
}

const ProductExportContent = () => {
  const { t } = useTranslation()
  const { searchParams } = useProductTableQuery({ prefix: "p" })
  delete searchParams.fields

  const { handleSuccess } = useRouteModal()
  const { mutate: exportProducts, isPending } = useMutation({
    mutationFn: () => downloadProductExport(searchParams),
    onSuccess: () => handleSuccess(),
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <>
      <RouteDrawer.Body>
        <ExportFilters />
        {/* <Divider className="mt-4" variant="dashed" /> */}
      </RouteDrawer.Body>
      <RouteDrawer.Footer>
        <div className="flex items-center gap-x-2">
          <RouteDrawer.Close asChild>
            <Button size="small" variant="secondary" disabled={isPending}>
              {t("actions.cancel")}
            </Button>
          </RouteDrawer.Close>
          <Button
            onClick={() => exportProducts()}
            size="small"
            isLoading={isPending}
            disabled={isPending}
          >
            {t("actions.export")}
          </Button>
        </div>
      </RouteDrawer.Footer>
    </>
  )
}
