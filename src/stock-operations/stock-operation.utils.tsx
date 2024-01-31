import { closeOverlay, launchOverlay } from "../core/components/overlay/hook";
import React from "react";
import {
  FetchResponse,
  showModal,
  showNotification,
  showToast,
} from "@openmrs/esm-framework";
import { StockOperationDTO } from "../core/api/types/stockOperation/StockOperationDTO";
import {
  createStockOperation,
  updateStockOperation,
} from "./stock-operations.resource";
import AddStockOperation from "./add-stock-operation/add-stock-operation.component";
import { StockOperationType } from "../core/api/types/stockOperation/StockOperationType";
import { useLocation } from "react-router-dom";
import { extractErrorMessagesFromResponse } from "../constants";
import { handleMutate } from "./swr-revalidation";
export const addOrEditStockOperation = async (
  stockOperation: StockOperationDTO,
  isEditing: boolean,
  operation?: StockOperationType,
  operations?: StockOperationType[],
  canPrint?: boolean
) => {
  // eslint-disable-next-line prefer-const
  let payload = stockOperation;
  try {
    if (operation.operationType === "requisition") {
      delete payload.destinationName;
    }
    const response: FetchResponse<StockOperationDTO> = await (isEditing
      ? updateStockOperation
      : createStockOperation)(payload);

    if (response?.data) {
      handleMutate("ws/rest/v1/stockmanagement/stockoperation");
      showToast({
        critical: true,
        title: `${isEditing ? "Edit" : "Add"} Stock Operation`,
        kind: "success",
        description: `Stock Operation ${
          isEditing ? "Edited" : "Added"
        } Successfully`,
      });

      // Close overlay and open edit overlay
      closeOverlay();
    }
  } catch (error) {
    const errorMessages = extractErrorMessagesFromResponse(error);
    showNotification({
      description: errorMessages.join(", "),
      title: "Error on saving form",
      kind: "error",
      critical: true,
    });
  }
};

export const launchAddOrEditDialog = (
  stockOperation: StockOperationDTO,
  isEditing: boolean,
  operation?: StockOperationType,
  operations?: StockOperationType[],
  canPrint?: boolean
) => {
  launchOverlay(
    `${isEditing ? "Edit" : "New: "} ${
      isEditing ? stockOperation.operationTypeName : operation.name
    }`,
    <AddStockOperation
      model={stockOperation}
      onSave={(so) =>
        addOrEditStockOperation(so, isEditing, operation, operations, canPrint)
      }
      isEditing={isEditing}
      operation={operation}
      canEdit={
        isEditing ? (stockOperation.status === "NEW" ? true : false) : true
      }
    />
  );
};

export const useUrlQueryParams = () => {
  return new URLSearchParams(useLocation().search);
};

export function getStockOperationUniqueId() {
  return `${new Date().getTime()}-${Math.random()
    .toString(36)
    .substring(2, 16)}`;
}

export const showActionDialogButton = async (
  title: string,
  requireReason: boolean,
  operation: StockOperationDTO
) => {
  const dispose = showModal("stock-operation-dialog", {
    title: title,
    operation: operation,
    requireReason: requireReason,
    closeModal: () => dispose(),
  });
};
