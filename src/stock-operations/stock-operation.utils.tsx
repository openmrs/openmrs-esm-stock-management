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

export const addOrEditStockOperation = async (
  stockOperation: StockOperationDTO,
  operation: StockOperationType,
  isEditing = false
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
        launchAddOrEditDialog(response.data, operation, true);
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
  operation: StockOperationType,
  isEditing = false
) => {
  launchOverlay(
    `${isEditing ? "Edit" : "Add"} ${operation?.name || ""}`,
    <AddStockOperation
      model={stockOperation}
      onSave={(stockOperation) =>
        addOrEditStockOperation(stockOperation, operation, isEditing)
      }
      isEditing={isEditing}
      operation={operation}
    />
  );
};
