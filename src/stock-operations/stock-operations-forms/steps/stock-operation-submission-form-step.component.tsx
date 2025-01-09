import React from 'react';
import styles from '../stock-operation-form.scss';
import { Stack } from '@carbon/react';
import { Button } from '@carbon/react';
import { StockOperationDTO } from '../../../core/api/types/stockOperation/StockOperationDTO';
import { StockOperationType } from '../../../core/api/types/stockOperation/StockOperationType';
import { useTranslation } from 'react-i18next';
import useOperationTypePermisions from '../hooks/useOperationTypePermisions';

type StockOperationSubmissionFormStepProps = {
  onPrevious?: () => void;
  stockOperation?: StockOperationDTO;
  stockOperationType: StockOperationType;
};
const StockOperationSubmissionFormStep: React.FC<StockOperationSubmissionFormStepProps> = ({
  onPrevious,
  stockOperationType,
  stockOperation,
}) => {
  const { t } = useTranslation();
  const operationTypePermision = useOperationTypePermisions(stockOperationType);

  return (
    <Stack gap={4} className={styles.grid}>
      <div className={styles.heading}>
        <h4>
          {operationTypePermision?.requiresDispatchAcknowledgement
            ? t('submitAndDispatch', 'Submit/Dispatch')
            : t('submitAndComplete', 'Submit/Complete')}
        </h4>
        <div className={styles.btnSet}>
          {typeof onPrevious === 'function' && (
            <Button kind="secondary" onClick={onPrevious}>
              Previous
            </Button>
          )}
        </div>
      </div>
    </Stack>
  );
};

export default StockOperationSubmissionFormStep;
