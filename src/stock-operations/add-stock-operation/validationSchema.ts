import { z } from "zod";

const stockItemTableSchema = z.object({
  // itemIndex: z.number().min(1).nullish(),
  // id: string | null | undefined;
  // uuid: string | null | undefined;
  stockItemUuid: z.string().min(1, { message: "Required" }),
  stockItemName: z.string().min(1).nullish(),
  stockItemPackagingUOMUuid: z.string().min(1, { message: "Required" }),
  stockItemPackagingUOMName: z.string().min(1).nullish(),
  // stockBatchUuid: z.string().min(1).nullish(),
  batchNo: z.string().min(1, { message: "Required" }),
  expiration: z.coerce.date({ required_error: "Required" }),
  quantity: z.coerce.number().min(1, { message: "Required" }),
  purchasePrice: z.coerce.number().nullish(),
  // permission: z.recordpermission().min(1).nullish(),
  // edit: z.boolean().min(1).nullish(),
  hasExpiration: z.boolean().nullish(),
  // packagingUnits: z.stockitempackaginguomdto().min(1).nullish(),
  // quantityReceived: z.number().min(1).nullish(),
  // quantityReceivedPackagingUOMName: z.string().min(1).nullish(),
  // quantityReceivedPackagingUOMUuid: z.string().min(1).nullish(),
  // quantityRequested: z.number().min(1).nullish(),
  // quantityRequestedPackagingUOMUuid: z.string().min(1).nullish(),
  // quantityRequestedPackagingUOMName: z.string().min(1).nullish(),
  // commonName: z.string().min(1).nullish(),
  // acronym: z.string().min(1).nullish(),
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
