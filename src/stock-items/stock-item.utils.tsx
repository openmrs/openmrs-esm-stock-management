import { closeOverlay, launchOverlay } from "../core/components/overlay/hook";
import { StockItemDTO } from "../core/api/types/stockItem/StockItem";
import React from "react";
import AddEditStockItem from "./add-stock-item/add-stock-item.component";
import {
  FetchResponse,
  showNotification,
  showToast,
} from "@openmrs/esm-framework";
import { createStockItem, updateStockItem } from "./stock-items.resource";

export const addOrEditStockItem = async (
  stockItem: StockItemDTO,
  isEditing = false
) => {
  try {
    const response: FetchResponse<StockItemDTO> = await (isEditing
      ? updateStockItem
      : createStockItem)(stockItem);

    if (response?.data) {
      showToast({
        critical: true,
        title: `${isEditing ? "Edit" : "Add"} Stock Item`,
        kind: "success",
        description: `Stock Item ${
          isEditing ? "Edited" : "Added"
        } Successfully`,
      });

      // Close overlay and open edit overlay
      // closeOverlay();

      if (!isEditing) {
        closeOverlay();

        // launch edit dialog
        const item = response.data;
        item.isDrug = !!item.drugUuid;
        launchAddOrEditDialog(item, true);
      }
    }
  } catch (error) {
    showNotification({
      title: `Error ${isEditing ? "edit" : "add"}ing a stock item`,
      kind: "error",
      critical: true,
      description: error?.responseBody?.error?.message,
    });
  }
};

export const launchAddOrEditDialog = (
  stockItem: StockItemDTO,
  isEditing = false
) => {
  launchOverlay(
    `${isEditing ? "Edit" : "Add"} ${stockItem?.drugName || ""}`,
    <AddEditStockItem
      model={stockItem}
      onSave={(stockItem) => addOrEditStockItem(stockItem, isEditing)}
      isEditing={isEditing}
    />
  );
};
