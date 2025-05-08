import React from 'react';
import { closeOverlay, launchOverlay } from '../core/components/overlay/hook';
import { type StockItemDTO } from '../core/api/types/stockItem/StockItem';
import { type TFunction } from 'react-i18next';
import AddEditStockItem from './add-stock-item/add-stock-item.component';
import { type FetchResponse, showSnackbar } from '@openmrs/esm-framework';
import { createStockItem, updateStockItem } from './stock-items.resource';

export const addOrEditStockItem = async (t: TFunction, stockItem: StockItemDTO, isEditing = false) => {
  try {
    const response: FetchResponse<StockItemDTO> = await (isEditing ? updateStockItem : createStockItem)(stockItem);

    if (response?.data) {
      showSnackbar({
        isLowContrast: true,
        title: isEditing ? `${t('editStockItem', 'Edit Stock Item')}` : `${t('addStockItem', 'Add Stock Item')}`,
        kind: 'success',
        subtitle: isEditing
          ? `${t('stockItemEdited', 'Stock Item Edited Successfully')}`
          : `${t('stockItemAdded', 'Stock Item Added Successfully')}`,
      });

      if (!isEditing) {
        closeOverlay();

        // launch edit dialog
        const item = response.data;
        item.isDrug = !!item.drugUuid;
        launchAddOrEditDialog(t, item, true);
      }
    }
  } catch (error) {
    showSnackbar({
      title: isEditing
        ? t('errorEditingStockItem', 'Error editing a stock Item')
        : t('errorAddingStockItem', 'Error adding a stock Item'),
      kind: 'error',
      isLowContrast: true,
      subtitle: error?.responseBody?.error?.message,
    });
  }
};

export const launchAddOrEditDialog = (t: TFunction, stockItem: StockItemDTO, isEditing = false) => {
  launchOverlay(
    isEditing
      ? `${t('editItem', 'Edit {{name}}', {
          name: stockItem?.drugName || stockItem.conceptName || '',
        })} ${stockItem.isDrug ? '(Drug)' : '(Non Drug)'}`
      : t('addItem', 'Add stock item'),
    <AddEditStockItem
      model={stockItem}
      onSave={(stockItem) => addOrEditStockItem(t, stockItem, isEditing)}
      isEditing={isEditing}
    />,
  );
};
