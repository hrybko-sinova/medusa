import { ArchiveBox, ArrowUturnLeft, GlobeEurope, PencilSquare, Trash } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { toast, usePrompt } from "@medusajs/ui"
import { useTranslation } from "react-i18next"

import { ActionMenu } from "../../../../../components/common/action-menu"
import { useDeleteProduct, useUpdateProduct } from "../../../../../hooks/api/products"
import { useFeatureFlag } from "../../../../../providers/feature-flag-provider"

export const ProductActions = ({
  product,
}: {
  product: HttpTypes.AdminProduct
}) => {
  const { t } = useTranslation()
  const prompt = usePrompt()
  const { mutateAsync: deleteProduct } = useDeleteProduct(product.id)
  const { mutateAsync: updateProduct } = useUpdateProduct(product.id)
  const isTranslationsEnabled = useFeatureFlag("translation")
  const isArchived = product.status === "archived"

  const handleDelete = async () => {
    const res = await prompt({
      title: t("general.areYouSure"),
      description: t("products.deleteWarning", {
        title: product.title,
      }),
      confirmText: t("actions.delete"),
      cancelText: t("actions.cancel"),
    })

    if (!res) {
      return
    }

    await deleteProduct(undefined, {
      onSuccess: () => {
        toast.success(t("products.toasts.delete.success.header"), {
          description: t("products.toasts.delete.success.description", {
            title: product.title,
          }),
        })
      },
      onError: (e) => {
        toast.error(t("products.toasts.delete.error.header"), {
          description: e.message,
        })
      },
    })
  }

  const handleArchive = async () => {
    const res = await prompt({
      title: t("general.areYouSure"),
      description: t("products.archiveWarning", {
        title: product.title,
      }),
      confirmText: t("actions.archive"),
      cancelText: t("actions.cancel"),
    })

    if (!res) {
      return
    }

    await updateProduct(
      { status: "archived" },
      {
        onSuccess: () => {
          toast.success(t("products.toasts.archive.success.header"), {
            description: t("products.toasts.archive.success.description", {
              title: product.title,
            }),
          })
        },
        onError: (e) => {
          toast.error(t("products.toasts.archive.error.header"), {
            description: e.message,
          })
        },
      }
    )
  }

  const handleRestore = async () => {
    const res = await prompt({
      title: t("general.areYouSure"),
      description: t("products.restoreWarning", {
        title: product.title,
      }),
      confirmText: t("actions.restore"),
      cancelText: t("actions.cancel"),
    })

    if (!res) {
      return
    }

    await updateProduct(
      { status: "draft" },
      {
        onSuccess: () => {
          toast.success(t("products.toasts.restore.success.header"), {
            description: t("products.toasts.restore.success.description", {
              title: product.title,
            }),
          })
        },
        onError: (e) => {
          toast.error(t("products.toasts.restore.error.header"), {
            description: e.message,
          })
        },
      }
    )
  }

  return (
    <ActionMenu
      groups={[
        {
          actions: [
            {
              icon: <PencilSquare />,
              label: t("actions.edit"),
              to: `/products/${product.id}/edit`,
            },
          ],
        },
        ...(isTranslationsEnabled
          ? [
              {
                actions: [
                  {
                    icon: <GlobeEurope />,
                    label: t("translations.actions.manage"),
                    to: `/settings/translations/edit?reference=product&reference_id=${product.id}`,
                  },
                ],
              },
            ]
          : []),
        {
          actions: [
            isArchived
              ? {
                  icon: <ArrowUturnLeft />,
                  label: t("actions.restore"),
                  onClick: handleRestore,
                }
              : {
                  icon: <ArchiveBox />,
                  label: t("actions.archive"),
                  onClick: handleArchive,
                },
            {
              icon: <Trash />,
              label: t("actions.delete"),
              onClick: handleDelete,
            },
          ],
        },
      ]}
    />
  )
}
