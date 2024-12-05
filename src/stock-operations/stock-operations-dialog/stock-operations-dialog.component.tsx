import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StockOperationDTO } from '../../core/api/types/stockOperation/StockOperationDTO';
import { Button, Form, ModalBody, ModalFooter, ModalHeader, TextArea, InlineLoading } from '@carbon/react';
import styles from './stock-operations-dialog.scss';
import { StopOperationAction, StopOperationActionType } from '../../core/api/types/stockOperation/StockOperationAction';
import { executeStockOperationAction } from '../stock-operations.resource';
import { restBaseUrl, showSnackbar } from '@openmrs/esm-framework';
import { closeOverlay } from '../../core/components/overlay/hook';
import { extractErrorMessagesFromResponse } from '../../constants';
import { handleMutate } from '../../utils';

interface StockOperationDialogProps {
  title: string;
  requireReason: boolean;
  operation: StockOperationDTO;
  closeModal: () => void;
}

const StockOperationDialog: React.FC<StockOperationDialogProps> = ({ title, requireReason, operation, closeModal }) => {
  const confirmType = title.toLocaleLowerCase().trim();

  const { t } = useTranslation();

  const [notes, setNotes] = useState('');

  const [isApproving, setIsApproving] = useState(false);

  const handleClick = async (event) => {
    event.preventDefault();

    setIsApproving(true);

    let actionName: StopOperationActionType | null = null;

    switch (confirmType) {
      case 'submit':
        actionName = 'SUBMIT';
        break;
      case 'dispatch':
        actionName = 'DISPATCH';
        break;
      case 'complete':
        actionName = 'COMPLETE';
        break;
      case 'complete dispatch':
        actionName = 'COMPLETE';
        break;
      case 'cancel':
        actionName = 'CANCEL';
        break;
      case 'reject':
        actionName = 'REJECT';
        break;
      case 'return':
        actionName = 'RETURN';
        break;
      case 'approve':
        actionName = 'APPROVE';
        break;
      case 'dispatchapproval':
        // messagePrefix = "dispatch";
        actionName = 'DISPATCH';
        break;
    }
    if (!actionName) {
      return;
    }

    const payload: StopOperationAction = {
      name: actionName,
      uuid: operation?.uuid,
      reason: notes,
    };

    // submit action
    executeStockOperationAction(payload).then(
      () => {
        setIsApproving(false);
        showSnackbar({
          title: t('operationSuccessTitle', '{{title}} Operation', { title }),
          subtitle: t('operationSuccessful', 'You have successfully {{title}} operation', {
            title,
          }),
          kind: 'success',
        }),
          closeModal();
        closeOverlay();
        handleMutate(`${restBaseUrl}/stockmanagement/stockoperation`);
      },
      (err) => {
        setIsApproving(false);
        const errorMessages = extractErrorMessagesFromResponse(err);
        const message = errorMessages[0].replace(/[[\]]/g, '');
        showSnackbar({
          title: t('stockOperationErrorTitle', 'Error on saving form'),
          subtitle: t('stockOperationErrorDescription', 'Details: {{message}}', {
            message,
          }),
          kind: 'error',
        }),
          closeModal();
        closeOverlay();
      },
    );
  };

  return (
    <div>
      <Form onSubmit={handleClick}>
        <ModalHeader closeModal={closeModal} title={t('operationModalTitle', '{{title}} Operation', { title })} />
        <ModalBody>
          <div className={styles.modalBody}>
            <section className={styles.section}>
              <h5 className={styles.section}>Would you really like to {title} the operation ?</h5>
            </section>
            <br />
            {requireReason && (
              <section className={styles.section}>
                <TextArea
                  labelText={t('notes', 'Please explain the reason:')}
                  id="nextNotes"
                  name="nextNotes"
                  invalidText="Required"
                  maxCount={500}
                  enableCounter
                  onChange={(e) => setNotes(e.target.value)}
                />
              </section>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={closeModal}>
            {t('cancel', 'Cancel')}
          </Button>
          {isApproving ? <InlineLoading /> : <Button type="submit">{t('submit', 'Submit')}</Button>}
        </ModalFooter>
      </Form>
    </div>
  );
};

export default StockOperationDialog;
