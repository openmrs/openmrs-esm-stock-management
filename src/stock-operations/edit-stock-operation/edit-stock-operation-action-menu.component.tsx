import { Button, InlineLoading } from '@carbon/react';
import { Edit } from '@carbon/react/icons';
import { showSnackbar } from '@openmrs/esm-framework';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { type StockOperationDTO } from '../../core/api/types/stockOperation/StockOperationDTO';
import { launchStockoperationAddOrEditWorkSpace } from '../stock-operation.utils';
import useFilteredOperationTypesByRoles from '../stock-operations-forms/hooks/useFilteredOperationTypesByRoles';
import { useStockOperationAndItems } from '../stock-operations.resource';

interface EditStockOperationActionMenuProps {
  stockOperation: StockOperationDTO;
  showIcon?: boolean;
  showprops?: boolean;
}

const EditStockOperationActionMenu: React.FC<EditStockOperationActionMenuProps> = ({
  stockOperation: _stockOperation,
  showIcon = true,
  showprops = true,
}) => {
  const { t } = useTranslation();
  const { error, isLoading, operationTypes } = useFilteredOperationTypesByRoles();
  const {
    isLoading: isLoadingStockoperation,
    items: stockOperation,
    error: stockOperationError,
  } = useStockOperationAndItems(_stockOperation.uuid);
  const activeOperationType = useMemo(
    () => operationTypes?.find((op) => op?.uuid === stockOperation?.operationTypeUuid),
    [operationTypes, stockOperation],
  );

  const handleEdit = useCallback(() => {
    launchStockoperationAddOrEditWorkSpace(
      t,
      activeOperationType,
      stockOperation,
      stockOperation?.requisitionStockOperationUuid,
    );
  }, [t, activeOperationType, stockOperation]);

  useEffect(() => {
    if (error) {
      showSnackbar({
        kind: 'error',
        title: t('stockOperationError', 'Error loading stock operation types'),
        subtitle: error?.message ?? stockOperationError?.message,
      });
    }
  }, [error, t, stockOperationError]);

  if (isLoading || isLoadingStockoperation) return <InlineLoading status="active" iconDescription="Loading" />;

  if (error || stockOperationError) return <>--</>;

  return (
    <Button
      kind="ghost"
      size="sm"
      onClick={handleEdit}
      iconDescription={t('editStockOperation', 'Edit Stock Operation')}
      renderIcon={showIcon ? Edit : undefined}
    >
      {showprops && stockOperation?.operationNumber}
    </Button>
  );
};

export default EditStockOperationActionMenu;
