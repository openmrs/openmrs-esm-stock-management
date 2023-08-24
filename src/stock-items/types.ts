import { StockItemDTO } from "../core/api/types/stockItem/StockItem";

export type SaveStockItem = (item: StockItemDTO) => Promise<void>;
