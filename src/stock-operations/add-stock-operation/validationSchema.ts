import { z } from "zod";

export const baseStockOperationSchema = {
  stockItemUuid: z.string().min(1, { message: "Required" }),
  stockItemName: z.string().min(1).nullish(),
  stockItemPackagingUOMUuid: z.string().min(1, { message: "Required" }),
  stockItemPackagingUOMName: z.string().min(1).nullish(),
  batchNo: z.string().min(1, { message: "Required" }),
  stockBatchUuid: z.string().optional(),
  expiration: z.coerce.date({ required_error: "Required" }),
  quantity: z.coerce.number().min(1, { message: "Required" }),
  purchasePrice: z.coerce.number().nullish(),
  hasExpiration: z.boolean().nullish(),
};

export const stockItemTableSchema = z.object(baseStockOperationSchema);

export const stockItemTableSchemaWithNoExpiration = stockItemTableSchema.omit({
  expiration: true,
});

export const stockOperationItemsSchema = z.object({
  stockItems: z.array(stockItemTableSchema),
});

export type StockOperationItemsFormData = z.infer<
  typeof stockOperationItemsSchema
>;

export type StockOperationItemFormData = z.infer<
  typeof stockOperationItemsSchema
>["stockItems"][number];

export function useValidationSchema(operationType?: string) {
  if (operationType === "requisition") {
    const customSchema = stockItemTableSchema.omit({
      batchNo: true,
      expiration: true,
    });
    return z.object({
      stockItems: z.array(customSchema),
    });
  }
  return stockOperationItemsSchema;
}
