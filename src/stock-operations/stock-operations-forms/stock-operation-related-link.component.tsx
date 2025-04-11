import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useStockOperationTypes } from '../../stock-lookups/stock-lookups.resource';
import { launchStockoperationAddOrEditDialog } from '../stock-operation.utils';
import { useStockOperation } from '../stock-operations.resource';
import { OperationType } from '../../core/api/types/stockOperation/StockOperationType';

interface StockOperationRelatedLinkProps {
  stockOperationUuid: string;
  operationNumber: string;
}

const StockOperationRelatedLink: React.FC<StockOperationRelatedLinkProps> = ({
  stockOperationUuid,
  operationNumber,
}) => {
  const { error, isLoading, types } = useStockOperationTypes();
  const {
    error: stockOperationError,
    isLoading: isStockOperationLoading,
    items: stockOperation,
  } = useStockOperation(stockOperationUuid);
  const { t } = useTranslation();

  const handleEdit = useCallback(() => {
    const operationType = types?.results?.find((op) => op?.uuid === stockOperation?.operationTypeUuid);
    if (!operationType) {
      return;
    }
    const isStockIssueOperation = operationType.operationType === OperationType.STOCK_ISSUE_OPERATION_TYPE;
    launchStockoperationAddOrEditDialog(
      t,
      operationType,
      stockOperation,
      isStockIssueOperation ? stockOperationUuid : undefined,
    );
  }, [types, stockOperation, t, stockOperationUuid]);

  if (isLoading || error || stockOperationError || isStockOperationLoading) return null;
  return (
    <span onClick={handleEdit} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
      {operationNumber}
    </span>
  );
};

export default StockOperationRelatedLink;
