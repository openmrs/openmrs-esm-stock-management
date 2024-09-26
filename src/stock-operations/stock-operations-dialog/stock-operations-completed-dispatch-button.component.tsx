import React, { useCallback } from 'react';

import { Button } from '@carbon/react';
import { showModal } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { Arrival } from '@carbon/react/icons';
import { StockOperationDTO } from '../../core/api/types/stockOperation/StockOperationDTO';

interface StockOperationCompleteDispatchButtonProps {
  operation: StockOperationDTO;
  reason: boolean;
}

const StockOperationCompleteDispatchButton: React.FC<StockOperationCompleteDispatchButtonProps> = ({
  operation,
  reason,
}) => {
  const { t } = useTranslation();
  const launchcompletedDispatchModal = useCallback(() => {
    const dispose = showModal('stock-operation-dialog', {
      title: 'Complete Dispatch',
      operation: operation,
      requireReason: reason,
      closeModal: () => dispose(),
    });
  }, [operation, reason]);

  return (
    <Button onClick={launchcompletedDispatchModal} renderIcon={(props) => <Arrival size={16} {...props} />}>
      {t('complete', 'Complete Dispatch ')}
    </Button>
  );
};

export default StockOperationCompleteDispatchButton;
