import { launchWorkspace2 } from '@openmrs/esm-framework';
import { type StockItemDTO } from '../core/api/types/stockItem/StockItem';

export const launchAddOrEditStockItemWorkspace = (stockItem?: StockItemDTO) => {
  launchWorkspace2('stock-item-form-workspace', { stockItem });
};
