import {
  BatchWorkflowInput,
  CreateProductWorkflowInputDTO,
  ProductTypes,
  UpdateProductWorkflowInputDTO,
} from "@medusajs/framework/types"
import {
  createWorkflow,
  createHook,
  parallelize,
  transform,
  when,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createProductsWorkflow } from "./create-products"
import { deleteProductsWorkflow } from "./delete-products"
import { updateProductsWorkflow } from "./update-products"
import { processProductOptionsForImportStep } from "../steps/process-product-options-for-import"

/**
 * The products to manage.
 */
export interface BatchProductWorkflowInput
  extends BatchWorkflowInput<
    CreateProductWorkflowInputDTO,
    UpdateProductWorkflowInputDTO
  > {
  additional_data?: Record<string, unknown>
}

export const batchProductsWorkflowId = "batch-products"
/**
 * This workflow creates, updates, or deletes products. It's used by the
 * [Manage Products Admin API Route](https://docs.medusajs.com/api/admin/products/manage-products).
 *
 * You can use this workflow within your own customizations or custom workflows to manage products in bulk. This is
 * also useful when writing a [seed script](https://docs.medusajs.com/learn/fundamentals/custom-cli-scripts/seed-data) or a custom import script.
 *
 * @example
 * const { result } = await batchProductsWorkflow(container)
 * .run({
 *   input: {
 *     create: [
 *       {
 *         title: "Shirt",
 *         options: [
 *           {
 *             title: "Color",
 *             values: ["Red", "Brown"]
 *           }
 *         ],
 *         variants: [
 *           {
 *             title: "Red Shirt",
 *             options: {
 *               "Color": "Red"
 *             },
 *             prices: [
 *               {
 *                 amount: 10,
 *                 currency_code: "usd"
 *               }
 *             ]
 *           }
 *         ]
 *       }
 *     ],
 *     update: [
 *       {
 *         id: "prod_123",
 *         title: "Pants"
 *       }
 *     ],
 *     delete: ["prod_321"]
 *   }
 * })
 *
 * @summary
 *
 * Manage products in bulk.
 */
export const batchProductsWorkflow = createWorkflow(
  batchProductsWorkflowId,
  (input: WorkflowData<BatchProductWorkflowInput>) => {
    const productsToUpdate = transform({ input }, ({ input }) => {
      return input.update ?? []
    })

    const processedProductsToUpdate = processProductOptionsForImportStep({
      products: productsToUpdate as unknown as (Omit<
        UpdateProductWorkflowInputDTO,
        "option_ids"
      > & { options: ProductTypes.CreateProductOptionDTO[] })[],
    })

    const res = parallelize(
      when({ input }, ({ input }) => !!input.create?.length).then(() =>
        createProductsWorkflow.runAsStep({ input: { products: input.create! } })
      ),
      when(
        { processedProductsToUpdate },
        ({ processedProductsToUpdate }) => !!processedProductsToUpdate.length
      ).then(() =>
        updateProductsWorkflow.runAsStep({
          input: { products: processedProductsToUpdate },
        })
      ),
      when({ input }, ({ input }) => !!input.delete?.length).then(() =>
        deleteProductsWorkflow.runAsStep({ input: { ids: input.delete! } })
      )
    )

    const result = transform({ res, input }, (data) => ({
      created: data.res[0] ?? [],
      updated: data.res[1] ?? [],
      deleted: data.input.delete ?? [],
    }))
    const productsBatched = createHook("productsBatched", {
      result,
      additional_data: input.additional_data,
    })
    return new WorkflowResponse(result, { hooks: [productsBatched] })
  }
)
