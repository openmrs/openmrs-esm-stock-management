import React from 'react';
import { StockOperationDTO } from '../../core/api/types/stockOperation/StockOperationDTO';
import { launchAddOrEditDialog } from '../stock-operation.utils';
import { useTranslation } from 'react-i18next';
import { getStockOperation } from '../stock-operations.resource';
import { useStockOperationTypes } from '../../stock-lookups/stock-lookups.resource';

interface StockOperationReferenceProps {
  operationUuid: string;
  operationNumber: string;
}

const StockOperationReference = (props: StockOperationReferenceProps) => {
  const { t } = useTranslation();
  const { stockOperationTypes } = useStockOperationTypes();

  let model: StockOperationDTO;

  getStockOperation(props?.operationUuid).then((resp) => {
    model = resp.data;
  });

  const handleEdit = () => {
    const operation = stockOperationTypes?.find((op) => op?.uuid === model?.operationTypeUuid);

    if (!operation) {
      return;
    }
    launchAddOrEditDialog(t, model, true, operation, stockOperationTypes, false);
  };
  return (
    <a onClick={handleEdit} style={{ cursor: 'pointer' }}>
      {props?.operationNumber}
    </a>
  );
};

export default StockOperationReference;
