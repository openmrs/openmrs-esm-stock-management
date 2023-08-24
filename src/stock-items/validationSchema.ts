import { z } from "zod";

const nullableString = z.string().max(255).nullish();

// Stock item details
export const stockItemDetailsSchema = z
  .object({
    isDrug: z.boolean(),
    drugUuid: z.string().nullish(),
    drugName: z.string().nullish(),
    commonName: nullableString,
    acronym: nullableString,
    hasExpiration: z.boolean(),
    expiryNotice: z.coerce.number().nullish(),
    uuid: z.string().nullish(),
    conceptUuid: z.string().nullish(),
    conceptName: z.string().nullish(),
    preferredVendorUuid: z.string().nullish(),
    preferredVendorName: z.string().nullish(),
    purchasePrice: z.number().nullish(),
    purchasePriceUoMUuid: z.string().nullish(),
    purchasePriceUoMName: z.string().nullish(),
    categoryUuid: z.string().nullish(),
    categoryName: z.string().nullish(),
    dispensingUnitUuid: z.string().nullish(),
    dispensingUnitName: z.string().nullish(),
    dispensingUnitPackagingUoMUuid: z.string().nullish(),
    dispensingUnitPackagingUoMName: z.string().nullish(),
    defaultStockOperationsUoMUuid: z.string().nullish(),
    defaultStockOperationsUoMName: z.string().nullish(),
    reorderLevel: z.number().nullish(),
    reorderLevelUoMUuid: z.string().nullish(),
    reorderLevelUoMName: z.string().nullish(),
    dateCreated: z.coerce.date().nullish(),
    creatorGivenName: z.string().nullish(),
    creatorFamilyName: z.string().nullish(),
    voided: z.boolean().nullish(),
  })
  .refine(
    ({ isDrug, drugUuid }) => {
      return isDrug ? !!drugUuid : true;
    },
    {
      message: "Drug required",
      path: ["drugUuid"],
    }
  )
  .refine(
    ({ isDrug, dispensingUnitUuid }) => {
      return isDrug ? !!dispensingUnitUuid : true;
    },
    {
      message: "Dispensing Unit required",
      path: ["dispensingUnitUuid"],
    }
  )
  .refine(
    ({ hasExpiration, expiryNotice }) => {
      return hasExpiration ? !!expiryNotice : true;
    },
    {
      message: "Expiry Notice required",
      path: ["expiryNotice"],
    }
  );

export type StockItemFormData = z.infer<typeof stockItemDetailsSchema>;
