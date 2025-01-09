import React from 'react';
import { StockOperationType } from '../../../core/api/types/stockOperation/StockOperationType';
import { StockOperationDTO } from '../../../core/api/types/stockOperation/StockOperationDTO';

type StockOperationItemsFormStepProps = {
  stockOperation?: StockOperationDTO;
  stockOperationType: StockOperationType;
};
const StockOperationItemsFormStep: React.FC<StockOperationItemsFormStepProps> = ({
  stockOperationType,
  stockOperation,
}) => {
  return <div>StockOperationItemsFormStep</div>;
};

export default StockOperationItemsFormStep;
