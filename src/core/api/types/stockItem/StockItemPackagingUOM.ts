import { BaseOpenmrsData } from '../BaseOpenmrsData'
import { Concept } from '../concept/Concept';
import { StockItem } from './StockItem';

export interface StockItemPackagingUOM extends BaseOpenmrsData {
    factor: number;
    packagingUom: Concept;
    stockItem: StockItem;
}

export interface StockItemPackagingUOMDTO{
    id?: string;
    uuid?: string;
    stockItemUuid?: string;
    packagingUomName?: string;
    packagingUomUuid?: string;
    factor?: number | null;
    isDefaultStockOperationsUoM?: boolean;
    isDispensingUnit?: boolean;
}
