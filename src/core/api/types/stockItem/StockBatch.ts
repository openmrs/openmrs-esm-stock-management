import { BaseOpenmrsData } from "../BaseOpenmrsData";
import { StockItem } from "./StockItem";

export interface StockBatch extends BaseOpenmrsData {
  batchNo: string;
  expiration: Date;
  stockItem: StockItem;
}
