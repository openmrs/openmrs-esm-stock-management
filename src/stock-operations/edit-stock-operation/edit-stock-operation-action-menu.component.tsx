import { IconButton, InlineLoading } from '@carbon/react';
import { Edit } from '@carbon/react/icons';
import { showSnackbar } from '@openmrs/esm-framework';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { type StockOperationDTO } from '../../core/api/types/stockOperation/StockOperationDTO';
import { launchStockoperationAddOrEditWorkSpace } from '../stock-operation.utils';
import useFilteredOperationTypesByRoles from '../stock-operations-forms/hooks/useFilteredOperationTypesByRoles';
import { useStockOperationAndItems } from '../stock-operations.resource';
import styles from './edit-stock-operation-button.scss';

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

  const {
    error: operationTypesError,
    isLoading: isOperationTypesLoading,
    operationTypes,
  } = useFilteredOperationTypesByRoles();

  const {
    isLoading: isStockOperationLoading,
    items: fetchedStockOperation,
    error: stockOperationError,
  } = useStockOperationAndItems(_stockOperation?.uuid);

  const activeOperationType = useMemo(
    () => operationTypes?.find((op) => op?.uuid === fetchedStockOperation?.operationTypeUuid),
    [operationTypes, fetchedStockOperation],
  );

  const handleLaunchWorkspace = useCallback(() => {
    launchStockoperationAddOrEditWorkSpace(
      t,
      activeOperationType,
      fetchedStockOperation,
      fetchedStockOperation?.requisitionStockOperationUuid,
    );
  }, [t, activeOperationType, fetchedStockOperation]);

  useEffect(() => {
    if (operationTypesError || stockOperationError) {
      showSnackbar({
        kind: 'error',
        title: t('stockOperationError', 'Error loading stock operation'),
        subtitle: operationTypesError?.message || stockOperationError?.message || '',
      });
    }
  }, [operationTypesError, stockOperationError, t]);

  if (isOperationTypesLoading || isStockOperationLoading) {
    return <InlineLoading status="active" iconDescription="Loading" />;
  }

  if (operationTypesError || stockOperationError) {
    return <>--</>;
  }

  return (
    <IconButton
      className={styles.editStockButton}
      kind="ghost"
      size="sm"
      onClick={handleLaunchWorkspace}
      label={t('editStockOperation', 'Edit Stock Operation')}
      renderIcon={showIcon ? () => <Edit size={16} /> : undefined}
    >
      {showprops && <span className={styles.operationNumberText}>{fetchedStockOperation?.operationNumber}</span>}
    </IconButton>
  );
};

export default EditStockOperationActionMenu;
