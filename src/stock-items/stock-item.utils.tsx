import { launchWorkspace } from '@openmrs/esm-framework';
import { type TFunction } from 'react-i18next';
import { type StockItemDTO } from '../core/api/types/stockItem/StockItem';

export const launchAddOrStockItemWorkspace = (t: TFunction, stockItem?: StockItemDTO) => {
  launchWorkspace('stock-item-form-workspace', {
    workspaceTitle: stockItem
      ? `${t('editItem', 'Edit {{name}}', {
          name: stockItem?.drugName || stockItem.conceptName || '',
        })} ${stockItem.isDrug ? '(Drug)' : '(Non Drug)'}`
      : t('addItem', 'Add stock item'),
    stockItem,
  });
};
