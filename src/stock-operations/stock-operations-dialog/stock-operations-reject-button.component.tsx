import React, { useCallback } from 'react';

import { Button } from '@carbon/react';
import { showModal } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { Repeat } from '@carbon/react/icons';
import { StockOperationDTO } from '../../core/api/types/stockOperation/StockOperationDTO';

interface StockOperationRejectButtonProps {
  operation: StockOperationDTO;
}

const StockOperationRejectButton: React.FC<StockOperationRejectButtonProps> = ({ operation }) => {
  const { t } = useTranslation();
  const launchRejectModal = useCallback(() => {
    const dispose = showModal('stock-operation-dialog', {
      title: 'Reject',
      operation: operation,
      requireReason: true,
      closeModal: () => dispose(),
    });
  }, [operation]);

  return (
    <Button onClick={launchRejectModal} kind="" renderIcon={(props) => <Repeat size={16} {...props} />}>
      {t('reject', 'Reject ')}
    </Button>
  );
};

export default StockOperationRejectButton;
