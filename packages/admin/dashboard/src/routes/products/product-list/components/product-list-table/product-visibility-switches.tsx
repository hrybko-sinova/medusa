import { Label, Switch } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"

type ProductVisibilitySwitchesProps = {
  prefix?: string
}

export const ProductVisibilitySwitches = ({
  prefix,
}: ProductVisibilitySwitchesProps) => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const draftedKey = prefix ? `${prefix}_show_drafted` : "show_drafted"
  const archivedKey = prefix ? `${prefix}_show_archived` : "show_archived"
  const offsetKey = prefix ? `${prefix}_offset` : "offset"

  const showDrafted = searchParams.get(draftedKey) === "true"
  const showArchived = searchParams.get(archivedKey) === "true"

  const toggleParam = (key: string, checked: boolean) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)

      if (checked) {
        next.set(key, "true")
      } else {
        next.delete(key)
      }

      next.delete(offsetKey)

      return next
    })
  }

  return (
    <div className="flex items-center gap-x-4">
      <div className="flex items-center gap-x-2">
        <Label
          htmlFor={draftedKey}
          className="txt-compact-small text-ui-fg-subtle"
        >
          {t("products.list.showDrafted")}
        </Label>
        <Switch
          id={draftedKey}
          dir="ltr"
          className="rtl:rotate-180"
          checked={showDrafted}
          onCheckedChange={(checked) => toggleParam(draftedKey, checked === true)}
        />
      </div>
      <div className="flex items-center gap-x-2">
        <Label
          htmlFor={archivedKey}
          className="txt-compact-small text-ui-fg-subtle"
        >
          {t("products.list.showArchived")}
        </Label>
        <Switch
          id={archivedKey}
          dir="ltr"
          className="rtl:rotate-180"
          checked={showArchived}
          onCheckedChange={(checked) => toggleParam(archivedKey, checked === true)}
        />
      </div>
    </div>
  )
}
