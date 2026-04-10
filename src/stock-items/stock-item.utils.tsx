import { type TFunction } from 'i18next';
import { closeWorkspace, launchWorkspace } from '@openmrs/esm-framework';
import { type StockItemDTO } from '../core/api/types/stockItem/StockItem';

export const launchAddOrEditStockItemWorkspace = (t: TFunction, stockItem?: StockItemDTO) => {
  closeWorkspace('stock-item-form-workspace', { ignoreChanges: true });
  launchWorkspace('stock-item-form-workspace', {
    workspaceTitle: stockItem
      ? `Edit ${stockItem?.drugName || stockItem.conceptName || ''} ${stockItem.isDrug ? '(Drug)' : '(Non Drug)'}`
      : t('addItem', 'Add stock item'),
    stockItem,
  });
};
