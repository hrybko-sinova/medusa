type VariantOptionReference = {
  id: string
  option_id?: string | null
}

type VariantWithOptions = {
  id: string
  options?: VariantOptionReference[] | null
}

export const getAffectedVariantIds = (
  variants: VariantWithOptions[],
  removedOptionIds: Set<string>,
  removedValueIdsByOptionId: Map<string, Set<string>>
) => {
  return variants
    .filter((variant) =>
      variant.options?.some((value) => {
        const optionId = value.option_id

        if (!optionId) {
          return false
        }

        if (removedOptionIds.has(optionId)) {
          return true
        }

        return removedValueIdsByOptionId.get(optionId)?.has(value.id)
      })
    )
    .map((variant) => variant.id)
}
