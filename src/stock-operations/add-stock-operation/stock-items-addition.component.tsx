import React from "react";
import { StockOperationDTO } from "../../core/api/types/stockOperation/StockOperationDTO";
import { SaveStockOperation } from "../../stock-items/types";
import { StockOperationType } from "../../core/api/types/stockOperation/StockOperationType";

interface StockItemsAdditionProps {
  isEditing?: boolean;
  model?: StockOperationDTO;
  onSave?: SaveStockOperation;
  operation: StockOperationType;
}

const StockItemsAddition: React.FC<StockItemsAdditionProps> = () => {
  return <p>Stock Items addition</p>;
};

export default StockItemsAddition;
