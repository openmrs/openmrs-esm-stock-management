import { BaseOpenmrsData } from "../BaseOpenmrsData";
import { StockSource } from "../stockOperation/StockSource";
import { StockItem } from "./StockItem";

export interface StockItemReference extends BaseOpenmrsData {
  referenceCode: string;
  stockSource: StockSource;
  stockItem: StockItem;
}

export interface StockItemReferenceDTO {
  id?: string;
  uuid?: string;
  stockItemUuid?: string;
  stockSourceName?: string;
  stockSourceUuid?: string;
  referenceCode?: string | null;
}
