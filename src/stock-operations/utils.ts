import { StockOperationDTO } from "../core/api/types/stockOperation/StockOperationDTO";
import { User } from "../core/api/types/identity/User";

export const initialStockOperationValue: StockOperationDTO = {
  atLocationName: "",
  atLocationUuid: "",
  cancelReason: "",
  cancelledBy: 0,
  cancelledByFamilyName: "",
  cancelledByGivenName: "",
  cancelledDate: undefined,
  completedBy: 0,
  completedByFamilyName: "",
  completedByGivenName: "",
  completedDate: undefined,
  creator: 0,
  creatorFamilyName: "",
  creatorGivenName: "",
  dateCreated: undefined,
  destinationName: "",
  destinationUuid: "",
  dispatchedByFamilyName: "",
  dispatchedByGivenName: "",
  dispatchedDate: undefined,
  externalReference: "",
  locked: false,
  operationDate: new Date(),
  operationNumber: "",
  operationOrder: 0,
  operationType: "",
  operationTypeName: "",
  operationTypeUuid: "",
  permission: undefined,
  reasonName: "",
  reasonUuid: "",
  rejectedByFamilyName: "",
  rejectedByGivenName: "",
  rejectedDate: undefined,
  rejectionReason: "",
  remarks: "",
  requisitionStockOperationUuid: "",
  responsiblePerson: 0,
  responsiblePersonFamilyName: "",
  responsiblePersonGivenName: "",
  responsiblePersonOther: "",
  responsiblePersonUuid: "",
  returnReason: "",
  returnedByFamilyName: "",
  returnedByGivenName: "",
  returnedDate: undefined,
  sourceName: "",
  sourceUuid: "",
  status: undefined,
  stockOperationItems: [],
  submitted: false,
  submittedBy: "",
  submittedByFamilyName: "",
  submittedByGivenName: "",
  submittedDate: undefined,
  uuid: "",
};

export const otherUser: User = {
  uuid: "Other",
  display: "Other",
  person: {
    display: "Other",
  },
} as unknown as User;

export const TRANSFER_OUT_OPERATION_TYPE = "transferout";
export const DISPOSED_OPERATION_TYPE = "disposed";
export const STOCK_ISSUE_OPERATION_TYPE = "stockissue";
export const STOCK_TAKE_OPERATION_TYPE = "stocktake";
export const REQUISITION_OPERATION_TYPE = "requisition";
export const OPENING_STOCK_OPERATION_TYPE = "initial";
export const RECEIPT_OPERATION_TYPE = "receipt";
export const RETURN_OPERATION_TYPE = "return";
export const ADJUSTMENT_OPERATION_TYPE = "adjustment";
