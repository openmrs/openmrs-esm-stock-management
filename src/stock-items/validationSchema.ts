import { z } from "zod";

const nullableString = z.string().max(255).optional();

// Stock item details
export const stockItemDetailsSchema = z
  .object({
    isDrug: z.boolean(),
    drugUuid: z.string().optional(),
    drugName: z.string().optional(),
    commonName: nullableString,
    acronym: nullableString,
    hasExpiration: z.boolean(),
    expiryNotice: z.coerce.number().optional(),
    uuid: z.string().optional(),
    conceptUuid: z.string().optional(),
    conceptName: z.string().optional(),
    preferredVendorUuid: z.string().optional(),
    preferredVendorName: z.string().optional(),
    purchasePrice: z.number().optional(),
    purchasePriceUoMUuid: z.string().optional(),
    purchasePriceUoMName: z.string().optional(),
    categoryUuid: z.string().optional(),
    categoryName: z.string().optional(),
    dispensingUnitUuid: z.string().optional(),
    dispensingUnitName: z.string().optional(),
    dispensingUnitPackagingUoMUuid: z.string().optional(),
    dispensingUnitPackagingUoMName: z.string().optional(),
    defaultStockOperationsUoMUuid: z.string().optional(),
    defaultStockOperationsUoMName: z.string().optional(),
    reorderLevel: z.number().optional(),
    reorderLevelUoMUuid: z.string().optional(),
    reorderLevelUoMName: z.string().optional(),
    dateCreated: z.date().optional(),
    creatorGivenName: z.string().optional(),
    creatorFamilyName: z.string().optional(),
    voided: z.boolean().optional(),
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

//
// const createOnlyValidationSchema = {
//   drugUuid: Yup.string()
//     .when("isDrug", {
//       is: true,
//       then: Yup.string().required("stockmanagement.field.required").nullable(),
//     })
//     .nullable(),
//   conceptUuid: Yup.string()
//     .when("isDrug", {
//       is: false,
//       then: Yup.string().required("stockmanagement.field.required").nullable(),
//     })
//     .nullable(),
// };
// const editOnlyValidationSchema = {
//   hasPurchasePrice: Yup.boolean(),
//   hasPackagingUnits: Yup.boolean(),
//   hasReorderLevel: Yup.boolean(),
//   purchasePrice: Yup.number()
//     .when("hasPurchasePrice", {
//       is: true,
//       then: Yup.number()
//         .when("hasPackagingUnits", {
//           is: true,
//           then: Yup.number()
//             .required("stockmanagement.field.required")
//             .nullable(),
//         })
//         .nullable(),
//     })
//     .min(0.00005, "stockmanagement.field.greaterthanzero")
//     .nullable(),
//   purchasePriceUoMUuid: Yup.string()
//     .when("hasPurchasePrice", {
//       is: true,
//       then: Yup.string()
//         .when("hasPackagingUnits", {
//           is: true,
//           then: Yup.string()
//             .required("stockmanagement.field.required")
//             .nullable(),
//         })
//         .nullable(),
//     })
//     .nullable(),
//   dispensingUnitUuid: Yup.string()
//     .when("isDrug", {
//       is: true,
//       then: Yup.string().required("stockmanagement.field.required").nullable(),
//     })
//     .nullable(),
//   dispensingUnitPackagingUoMUuid: Yup.string()
//     .when("isDrug", {
//       is: true,
//       then: Yup.string()
//         .when("hasPackagingUnits", {
//           is: true,
//           then: Yup.string()
//             .required("stockmanagement.field.required")
//             .nullable(),
//         })
//         .nullable(),
//     })
//     .nullable(),
//   reorderLevel: Yup.number()
//     .when("hasReorderLevel", {
//       is: true,
//       then: Yup.number()
//         .when("hasPackagingUnits", {
//           is: true,
//           then: Yup.number()
//             .required("stockmanagement.field.required")
//             .nullable(),
//         })
//         .nullable(),
//     })
//     .min(0, "stockmanagement.field.greaterthanorequaltozero")
//     .nullable(),
//   reorderLevelUoMUuid: Yup.string()
//     .when("hasReorderLevel", {
//       is: true,
//       then: Yup.string()
//         .when("hasPackagingUnits", {
//           is: true,
//           then: Yup.string()
//             .required("stockmanagement.field.required")
//             .nullable(),
//         })
//         .nullable(),
//     })
//     .nullable(),
// };
//
// const stockRulesCommonValidationSchema = {
//   name: Yup.string()
//     .required("stockmanagement.field.required")
//     .max(255, "stockmanagement.field.noexceed255"),
//   quantity: Yup.number()
//     .required("stockmanagement.field.required")
//     .min(0, "greaterthanorequaltozero")
//     .nullable(),
//   stockItemPackagingUOMUuid: Yup.string()
//     .required("stockmanagement.field.required")
//     .nullable(),
//   evaluationFrequency: Yup.number()
//     .required("stockmanagement.field.required")
//     .nullable(),
//   actionFrequency: Yup.number()
//     .required("stockmanagement.field.required")
//     .nullable(),
//   alertRole: Yup.string().required("stockmanagement.field.required").nullable(),
//   mailRole: Yup.string().required("stockmanagement.field.required").nullable(),
// };
//
// const stockRulesCreateOnlyValidationSchema = {
//   locationUuid: Yup.string().required("stockmanagement.field.required"),
// };
//
// export const editValidationSchema = Yup.object(
//   Object.assign({}, commonValidationSchema, editOnlyValidationSchema)
// );
// export const createValidationSchema = Yup.object(
//   Object.assign({}, commonValidationSchema, createOnlyValidationSchema)
// );
// export const stockRulesEditValidationSchema = Yup.object(
//   Object.assign({}, stockRulesCommonValidationSchema)
// );
// export const stockRulesCreateValidationSchema = Yup.object(
//   Object.assign(
//     {},
//     stockRulesCreateOnlyValidationSchema,
//     stockRulesCommonValidationSchema
//   )
// );
