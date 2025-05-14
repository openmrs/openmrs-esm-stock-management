import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalHeader, ModalBody, ModalFooter } from '@carbon/react';
import { getCoreTranslation } from '@openmrs/esm-framework';
import styles from './delete-stock-user-scope-modal.scss';

interface DeleteConfirmationProps {
  uuid?: string;
  close: () => void;
  onConfirmation: () => void;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({ close, onConfirmation }) => {
  const { t } = useTranslation();
  const handleCancel = () => close();
  const handleDelete = () => onConfirmation?.();

  return (
    <>
      <ModalHeader closeModal={close} className={styles.productiveHeading03}>
        {t('deleteStockUserScope', 'Delete Stock User Scope')}?
      </ModalHeader>
      <ModalBody>
        <p className={styles.bodyLong01}>
          {t('deleteConfirmationText', "Are you sure you want to delete this User Scope? This action can't be undone.")}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button size="lg" kind="secondary" onClick={handleCancel}>
          {getCoreTranslation('cancel')}
        </Button>
        <Button autoFocus kind="danger" onClick={handleDelete} size="lg">
          {t('delete', 'Delete')}
        </Button>
      </ModalFooter>
    </>
  );
};

export default DeleteConfirmation;
