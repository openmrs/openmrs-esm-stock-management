import { z } from "zod";
import { StockOperationStatusTypes } from "../core/api/types/stockOperation/StockOperationStatus";

export const stockItemPackagingUOMDTOSchema = z.object({
  id: z.string().nullish(),
  uuid: z.string().nullish(),
  stockItemUuid: z.string().nullish(),
  packagingUomName: z.string().nullish(),
  packagingUomUuid: z.string().nullish(),
  factor: z.number().nullish(),
  isDefaultStockOperationsUoM: z.boolean().nullish(),
  isDispensingUnit: z.boolean().nullish(),
});

export type StockItemPackagingUOMDTOFormData = z.infer<
  typeof stockItemPackagingUOMDTOSchema
>;

export const recordPermissionSchema = z.object({
  canView: z.boolean(),
  canEdit: z.boolean(),
  canApprove: z.boolean().nullish(),
  canReceiveItems: z.boolean().nullish(),
  canDisplayReceivedItems: z.boolean().nullish(),
  isRequisitionAndCanIssueStock: z.boolean().nullish(),
  canUpdateBatchInformation: z.boolean().nullish(),
});

export type RecordPermissionFormData = z.infer<typeof recordPermissionSchema>;

export const stockOperationItemSchema = z.object({
  itemIndex: z.number().nullish(),
  id: z.string().nullish(),
  uuid: z.string().nullish(),
  stockItemUuid: z.string().nullish(),
  stockItemName: z.string().nullish(),
  stockItemPackagingUOMUuid: z.string().nullish(),
  stockItemPackagingUOMName: z.string().nullish(),
  stockBatchUuid: z.string().nullish(),
  batchNo: z.string().nullish(),
  expiration: z.coerce.date().nullish(),
  quantity: z.number().nullish(),
  purchasePrice: z.number().nullish(),
  permission: recordPermissionSchema.nullish(),
  edit: z.boolean().nullish(),
  hasExpiration: z.boolean().nullish(),
  packagingUnits: stockItemPackagingUOMDTOSchema.array(),
  quantityReceived: z.number().nullish(),
  quantityReceivedPackagingUOMName: z.string().nullish(),
  quantityReceivedPackagingUOMUuid: z.string().nullish(),
  quantityRequested: z.number().nullish(),
  quantityRequestedPackagingUOMUuid: z.string().nullish(),
  quantityRequestedPackagingUOMName: z.string().nullish(),
  commonName: z.string().nullish(),
  acronym: z.string().nullish(),
});

export type StockOperationItemFormData = z.infer<
  typeof stockOperationItemSchema
>;

export const stockOperationSchema = z.object({
  uuid: z.string().nullish(),
  cancelReason: z.string().nullish(),
  cancelledBy: z.coerce.number(),
  cancelledByGivenName: z.string().nullish(),
  cancelledByFamilyName: z.string().nullish(),
  cancelledDate: z.coerce.date(),
  completedBy: z.coerce.number(),
  completedByGivenName: z.string().nullish(),
  completedByFamilyName: z.string().nullish(),
  completedDate: z.coerce.date(),
  destinationUuid: z.string().nullish(),
  destinationName: z.string().nullish(),
  externalReference: z.string().nullish(),
  atLocationUuid: z.string().nullish(),
  atLocationName: z.string().nullish(),
  operationDate: z.coerce.date(),
  submitted: z.boolean(),
  submittedBy: z.string().nullish(),
  submittedByGivenName: z.string().nullish(),
  submittedByFamilyName: z.string().nullish(),
  locked: z.boolean(),
  operationNumber: z.string().nullish(),
  operationOrder: z.coerce.number(),
  remarks: z.string().nullish(),
  sourceUuid: z.string().nullish(),
  sourceName: z.string().nullish(),
  status: z.enum(StockOperationStatusTypes),
  returnReason: z.string().nullish(),
  rejectionReason: z.string().nullish(),
  operationTypeUuid: z.string().nullish(),
  operationType: z.string().nullish(),
  operationTypeName: z.string().nullish(),
  responsiblePerson: z.coerce.number(),
  responsiblePersonUuid: z.string().nullish(),
  responsiblePersonGivenName: z.string().nullish(),
  responsiblePersonFamilyName: z.string().nullish(),
  responsiblePersonOther: z.string().nullish(),
  creator: z.coerce.number(),
  dateCreated: z.coerce.date(),
  creatorGivenName: z.string().nullish(),
  creatorFamilyName: z.string().nullish(),
  permission: recordPermissionSchema.nullish(),
  reasonUuid: z.string().nullish(),
  reasonName: z.string().nullish(),
  approvalRequired: z.boolean().nullish(),
  stockOperationItems: stockOperationItemSchema.array(),

  submittedDate: z.coerce.date(),
  returnedByGivenName: z.string().nullish(),
  returnedByFamilyName: z.string().nullish(),
  returnedDate: z.coerce.date(),
  rejectedByGivenName: z.string().nullish(),
  rejectedByFamilyName: z.string().nullish(),
  rejectedDate: z.coerce.date(),
  dispatchedByGivenName: z.string().nullish(),
  dispatchedByFamilyName: z.string().nullish(),
  dispatchedDate: z.coerce.date(),
  requisitionStockOperationUuid: z.string(),
});

export type StockOperationFormData = z.infer<typeof stockOperationSchema>;
