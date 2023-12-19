import { closeOverlay, launchOverlay } from "../core/components/overlay/hook";
import React from "react";
import {
  FetchResponse,
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
import { boolean } from "zod";

export const addOrEditStockOperation = async (
  stockOperation: StockOperationDTO,
  isEditing: boolean,
  operation?: StockOperationType,
  operations?: StockOperationType[],
  canPrint?: boolean
) => {
  try {
    const response: FetchResponse<StockOperationDTO> = await (isEditing
      ? updateStockOperation
      : createStockOperation)(stockOperation);

    if (response?.data) {
      showToast({
        critical: true,
        title: `${isEditing ? "Edit" : "Add"} Stock Operation`,
        kind: "success",
        description: `Stock Operation ${
          isEditing ? "Edited" : "Added"
        } Successfully`,
      });

      // Close overlay and open edit overlay

      if (!isEditing) {
        closeOverlay();

        // launch edit dialog
        // launchAddOrEditDialog(response.data, operation, true, operations);
      }
    }
  } catch (error) {
    showNotification({
      title: `Error ${isEditing ? "edit" : "add"}ing a stock operation`,
      kind: "error",
      critical: true,
      description: error?.message,
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
