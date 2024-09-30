import { BaseOpenmrsData } from '../BaseOpenmrsData';
import { StockBatch } from '../stockItem/StockBatch';
import { StockItem } from '../stockItem/StockItem';
import { StockItemPackagingUOM } from '../stockItem/StockItemPackagingUOM';
import { StockOperation } from './StockOperation';

export interface StockOperationItem extends BaseOpenmrsData {
  quantity: number;
  stockBatch: StockBatch;
  stockItemPackagingUOM: StockItemPackagingUOM;
  stockItem: StockItem;
  stockOperation: StockOperation;
}
