import { ArchiveBox, ArrowUturnLeft, GlobeEurope, PencilSquare, Trash } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Container, Heading, StatusBadge, toast, usePrompt } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import { ActionMenu } from "../../../../../components/common/action-menu"
import { SectionRow } from "../../../../../components/common/section"
import { useDeleteProduct, useUpdateProduct } from "../../../../../hooks/api/products"
import { useExtension } from "../../../../../providers/extension-provider"
import { useFeatureFlag } from "../../../../../providers/feature-flag-provider"

const productStatusColor = (status: string) => {
  switch (status) {
    case "draft":
      return "grey"
    case "proposed":
      return "orange"
    case "published":
      return "green"
    case "rejected":
      return "red"
    case "archived":
      return "purple"
    default:
      return "grey"
  }
}

type ProductGeneralSectionProps = {
  product: HttpTypes.AdminProduct
}

export const ProductGeneralSection = ({
  product,
}: ProductGeneralSectionProps) => {
  const { t } = useTranslation()
  const prompt = usePrompt()
  const navigate = useNavigate()
  const { getDisplays } = useExtension()
  const isTranslationsEnabled = useFeatureFlag("translation")

  const displays = getDisplays("product", "general")

  const { mutateAsync: deleteProduct } = useDeleteProduct(product.id)
  const { mutateAsync: updateProduct } = useUpdateProduct(product.id)
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
        navigate("..")
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
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading>{product.title}</Heading>
        <div className="flex items-center gap-x-4">
          <StatusBadge color={productStatusColor(product.status)}>
            {t(`products.productStatus.${product.status}`)}
          </StatusBadge>
          <ActionMenu
            groups={[
              {
                actions: [
                  {
                    label: t("actions.edit"),
                    to: "edit",
                    icon: <PencilSquare />,
                  },
                ],
              },
              ...(isTranslationsEnabled
                ? [
                    {
                      actions: [
                        {
                          label: t("translations.actions.manage"),
                          to: `/settings/translations/edit?reference=product&reference_id=${product.id}`,
                          icon: <GlobeEurope />,
                        },
                      ],
                    },
                  ]
                : []),
              {
                actions: [
                  isArchived
                    ? {
                        label: t("actions.restore"),
                        onClick: handleRestore,
                        icon: <ArrowUturnLeft />,
                      }
                    : {
                        label: t("actions.archive"),
                        onClick: handleArchive,
                        icon: <ArchiveBox />,
                      },
                  {
                    label: t("actions.delete"),
                    onClick: handleDelete,
                    icon: <Trash />,
                  },
                ],
              },
            ]}
          />
        </div>
      </div>

      <SectionRow title={t("fields.description")} value={product.description} />
      <SectionRow title={t("fields.subtitle")} value={product.subtitle} />
      <SectionRow title={t("fields.handle")} value={`/${product.handle}`} />
      <SectionRow title={t("fields.material")} value={product.material} />
      <SectionRow
        title={t("fields.discountable")}
        value={product.discountable ? t("fields.true") : t("fields.false")}
      />
      {displays.map((Component, index) => {
        return <Component key={index} data={product} />
      })}
    </Container>
  )
}
