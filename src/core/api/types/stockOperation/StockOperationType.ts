import { BaseOpenmrsData } from "../BaseOpenmrsData";
import { LocationType } from "./LocationType";

export interface StockOperationType extends BaseOpenmrsData {
  name: string;
  description: string;
  operationType: string;
  hasSource: boolean;
  sourceType: LocationType;
  hasDestination: boolean;
  destinationType: LocationType;
  hasRecipient: boolean;
  recipientRequired: boolean;
  availableWhenReserved: boolean;
  allowExpiredBatchNumbers: boolean;
  stockOperationTypeLocationScopes: StockOperationTypeLocationScope[];
}

export interface StockOperationTypeLocationScope {
  uuid: string;
  locationTag: string;
  isSource: string;
  isDestination: string;
}

export const STOCK_ISSUE_OPERATION_TYPE = "stockissue";
export const REQUISITION_OPERATION_TYPE = "requisition";
export const RECEIPT_OPERATION_TYPE = "receipt";

export const StockOperationTypeRequiresStockAdjustmentReason = (
  operationType: string
) => {
  return (
    operationType === "adjustment" ||
    operationType === "stocktake" ||
    operationType === "disposed"
  );
};

export const StockOperationTypeIsNegativeQtyAllowed = (
  operationType: string
) => {
  return operationType === "adjustment";
};

export const StockOperationTypeRequiresBatchUuid = (operationType: string) => {
  return (
    !StockOperationTypeRequiresActualBatchInformation(operationType) &&
    operationType !== REQUISITION_OPERATION_TYPE
  );
};

export const StockOperationTypeRequiresActualBatchInformation = (
  operationType: string
) => {
  return (
    operationType === RECEIPT_OPERATION_TYPE || operationType === "initial"
  );
};

export const StockOperationTypeIsQuantityOptional = (operationType: string) => {
  return operationType === REQUISITION_OPERATION_TYPE;
};

export const StockOperationTypeCanCapturePurchasePrice = (
  operationType: string
) => {
  return (
    operationType === RECEIPT_OPERATION_TYPE || operationType === "initial"
  );
};

export const StockOperationTypeCanBeRelatedToRequisition = (
  operationType: string
) => {
  return operationType === STOCK_ISSUE_OPERATION_TYPE;
};

export const StockOperationTypeRequiresDispatchAcknowledgement = (
  operationType: string
) => {
  return (
    operationType === STOCK_ISSUE_OPERATION_TYPE || operationType === "return"
  );
};

export const StockOperationTypeHasPrint = (operationType: string) => {
  return (
    operationType === STOCK_ISSUE_OPERATION_TYPE ||
    StockOperationTypeIsRequistion(operationType) ||
    StockOperationTypeIsReceipt(operationType) ||
    StockOperationTypeIsTransferOut(operationType)
  );
};

export const StockOperationTypeIsRequistion = (operationType: string) => {
  return operationType === REQUISITION_OPERATION_TYPE;
};

export const StockOperationTypeIsReceipt = (operationType: string) => {
  return operationType === RECEIPT_OPERATION_TYPE;
};

export const StockOperationTypeIsTransferOut = (operationType: string) => {
  return operationType === "transferout";
};

export const StockOperationTypeIsStockIssue = (operationType: string) => {
  return operationType === STOCK_ISSUE_OPERATION_TYPE;
};

export const StockOperationPrintHasItemCosts = (operationType: string) => {
  return (
    StockOperationTypeIsStockIssue(operationType) ||
    StockOperationTypeIsTransferOut(operationType)
  );
};
