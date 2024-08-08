import { StockOperationDTO } from "../../core/api/types/stockOperation/StockOperationDTO";
import { OperationType } from "../../core/api/types/stockOperation/StockOperationType";

const OPERATION_TYPES_FOR_DESTINATION_NAME_DELETION = [
  OperationType.ADJUSTMENT_OPERATION_TYPE,
  OperationType.RECEIPT_OPERATION_TYPE,
  OperationType.STOCK_ISSUE_OPERATION_TYPE,
  OperationType.STOCK_TAKE_OPERATION_TYPE,
  OperationType.RETURN_OPERATION_TYPE,
  OperationType.DISPOSED_OPERATION_TYPE,
  OperationType.OPENING_STOCK_OPERATION_TYPE,
  OperationType.TRANSFER_OUT_OPERATION_TYPE,
];

const OPERATION_TYPES_FOR_DESTINATION_UUID_DELETION = [
  OperationType.ADJUSTMENT_OPERATION_TYPE,
  OperationType.DISPOSED_OPERATION_TYPE,
  OperationType.STOCK_TAKE_OPERATION_TYPE,
  OperationType.OPENING_STOCK_OPERATION_TYPE,
];

export function getRequisitionStockOperations(
  items: Array<StockOperationDTO> = []
) {
  // Extract stock issued requisition UUIDs
  const stockIssuedRequisitionUuids =
    items
      ?.filter(
        (item) =>
          item.operationType === OperationType.STOCK_ISSUE_OPERATION_TYPE
      )
      .map((item) => item.requisitionStockOperationUuid) ?? [];

  // Filter requisition stock operations
  const requisitionStockOperations =
    items?.filter(
      (item) =>
        item.operationType === OperationType.REQUISITION_OPERATION_TYPE &&
        !stockIssuedRequisitionUuids.includes(item.uuid)
    ) ?? [];

  return requisitionStockOperations;
}

function deleteProperties(req, properties) {
  properties.forEach((prop) => {
    delete req[prop];
  });
}

function shouldDeleteDestinationName(operationType) {
  return OPERATION_TYPES_FOR_DESTINATION_NAME_DELETION.includes(operationType);
}

function shouldDeleteDestinationUuid(operationType) {
  return OPERATION_TYPES_FOR_DESTINATION_UUID_DELETION.includes(operationType);
}

export function createBaseOperationPayload(model, item, operationType) {
  const req = Object.assign(model, item);
  const propertiesToDelete = [
    "submitted",
    "cancelledByFamilyName",
    "atLocationName",
    "completedByGivenName",
    "cancelledBy",
    "submittedByFamilyName",
    "operationOrder",
    "dispatchedByGivenName",
    "submittedByGivenName",
    "returnedByGivenName",
    "operationNumber",
    "responsiblePersonFamilyName",
    "returnReason",
    "atLocationUuid",
    "cancelReason",
    "rejectedByGivenName",
    "reasonName",
    "submittedBy",
    "creator",
    "completedByFamilyName",
    "operationTypeName",
    "rejectedByFamilyName",
    "responsiblePerson",
    "creatorFamilyName",
    "returnedByFamilyName",
    "cancelledByGivenName",
    "operationType",
    "responsiblePersonGivenName",
    "sourceName",
    "rejectionReason",
    "completedBy",
    "creatorGivenName",
    "dispatchedByFamilyName",
    "uuid",
  ];

  deleteProperties(req, propertiesToDelete);

  if (shouldDeleteDestinationName(operationType)) {
    delete req.destinationName;
  }

  if (shouldDeleteDestinationUuid(operationType)) {
    delete req.destinationUuid;
  }
  return req;
}
