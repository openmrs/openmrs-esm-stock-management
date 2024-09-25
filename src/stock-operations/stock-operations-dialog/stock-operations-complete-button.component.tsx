import React, { useCallback } from 'react';

import { Button } from '@carbon/react';
import { showModal } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { CheckmarkOutline } from '@carbon/react/icons';
import { StockOperationDTO } from '../../core/api/types/stockOperation/StockOperationDTO';

interface StockOperationCompleteButtonProps {
  operation: StockOperationDTO;
  reason: boolean;
}

const StockOperationCompleteButton: React.FC<StockOperationCompleteButtonProps> = ({ operation, reason }) => {
  const { t } = useTranslation();
  const launchCompleteModal = useCallback(() => {
    const dispose = showModal('stock-operation-dialog', {
      title: 'Complete',
      operation: operation,
      requireReason: reason,
      closeModal: () => dispose(),
    });
  }, [operation]);

  return (
    <Button onClick={launchCompleteModal} renderIcon={(props) => <CheckmarkOutline size={16} {...props} />}>
      {t('complete', 'Complete')}
    </Button>
  );
};

export default StockOperationCompleteButton;
