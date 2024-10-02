import React from 'react';
import { useTranslation } from 'react-i18next';
import { StockOperationDTO } from '../../core/api/types/stockOperation/StockOperationDTO';
import { StockOperationType } from '../../core/api/types/stockOperation/StockOperationType';
import { launchAddOrEditDialog } from '../stock-operation.utils';
import { getStockOperation } from '../stock-operations.resource';

interface StockOperationRelatedLinkProps {
  operationTypes: StockOperationType[];
  operationUuid: string;
  operationNumber: string;
}

const StockOperationRelatedLink = (props: StockOperationRelatedLinkProps) => {
  const { t } = useTranslation();
  const operationTypes = props?.operationTypes;
  let model: StockOperationDTO;

  getStockOperation(props?.operationUuid).then((resp) => {
    model = resp.data;
  });

  const handleEdit = () => {
    const operation = operationTypes?.find((op) => op?.uuid === model?.operationTypeUuid);

    if (!operation) {
      return;
    }
    launchAddOrEditDialog(t, model, true, operation, operationTypes, false);
  };
  return (
    <span onClick={handleEdit} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
      {props?.operationNumber}
    </span>
  );
};

export default StockOperationRelatedLink;
