import { StockItemDTO } from "../core/api/types/stockItem/StockItem";
import { StockOperationDTO } from "../core/api/types/stockOperation/StockOperationDTO";

export type SaveStockItem = (item: StockItemDTO) => Promise<void>;
export type SaveStockOperation = (item: StockOperationDTO) => Promise<void>;
