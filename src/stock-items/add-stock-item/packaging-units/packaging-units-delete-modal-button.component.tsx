import React, { useCallback } from 'react';
import { Button } from '@carbon/react';
import { TrashCan } from '@carbon/react/icons';
import { showModal } from '@openmrs/esm-framework';
import { StockItemPackagingUOMDTO } from '../../../core/api/types/stockItem/StockItemPackagingUOM';

interface DeleteModalButtonProps {
  row?: StockItemPackagingUOMDTO;
  closeModal: () => void;
}

const DeleteModalButton: React.FC<DeleteModalButtonProps> = ({ row }) => {
  const launchDeleteModal = useCallback(() => {
    const dispose = showModal('delete-packaging-unit-modal', {
      closeModal: () => dispose(),
      row,
    });
  }, [row]);
  return (
    <div>
      <Button
        type="button"
        size="sm"
        className="submitButton clear-padding-margin"
        iconDescription={'Delete'}
        kind="ghost"
        renderIcon={TrashCan}
        onClick={launchDeleteModal}
      />
    </div>
  );
};

export default DeleteModalButton;
