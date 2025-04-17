import { launchWorkspace, showModal } from '@openmrs/esm-framework';
import { TFunction } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { StockOperationDTO } from '../core/api/types/stockOperation/StockOperationDTO';
import { StockOperationType } from '../core/api/types/stockOperation/StockOperationType';

export const launchStockoperationAddOrEditWorkSpace = (
  t: TFunction,
  operationType: StockOperationType,
  stockOperation?: StockOperationDTO,
  stockRequisitionUuid?: string, // Only suplied on stock issue (when overlay is launched for stock issue)
) => {
  launchWorkspace('stock-operation-form-workspace', {
    workspaceTitle: stockOperation
      ? t('editOperationTitle', 'Edit {{operationType}}', {
          operationType: stockOperation?.operationTypeName,
        })
      : t('newOperationTitle', 'New: {{operationName}}', {
          operationName: operationType?.name,
        }),
    stockOperationType: operationType,
    stockOperation: stockOperation,
    stockRequisitionUuid: stockRequisitionUuid,
  });
};

export const useUrlQueryParams = () => {
  return new URLSearchParams(useLocation().search);
};

export function getStockOperationUniqueId() {
  return `${new Date().getTime()}-${Math.random().toString(36).substring(2, 16)}`;
}

export const showActionDialogButton = (title: string, requireReason: boolean, operation: StockOperationDTO) => {
  const dispose = showModal('stock-operation-dialog', {
    title: title,
    operation: operation,
    requireReason: requireReason,
    closeModal: () => dispose(),
  });
};
