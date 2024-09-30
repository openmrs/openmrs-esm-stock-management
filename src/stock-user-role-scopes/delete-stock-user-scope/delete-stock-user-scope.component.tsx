import React, { useState } from 'react';
import { Button, InlineLoading } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { TrashCan } from '@carbon/react/icons';
import { deleteUserRoleScopes } from '../stock-user-role-scopes.resource';
import { restBaseUrl, showModal, showSnackbar } from '@openmrs/esm-framework';
import { handleMutate } from '../../utils';

interface StockUserScopDeleteActionMenuProps {
  uuid: string;
}

const StockUserScopeDeleteActionMenu: React.FC<StockUserScopDeleteActionMenuProps> = ({ uuid }) => {
  const { t } = useTranslation();

  const [deletingUserScope, setDeletingUserScope] = useState(false);

  const handleDeleteStockUserScope = React.useCallback(() => {
    const close = showModal('delete-stock-user-scope-modal', {
      close: () => close(),
      uuid: uuid,
      onConfirmation: () => {
        const ids = [];
        ids.push(uuid);
        deleteUserRoleScopes(ids)
          .then(
            () => {
              handleMutate(`${restBaseUrl}/stockmanagement/userrolescope`);
              setDeletingUserScope(false);
              showSnackbar({
                isLowContrast: true,
                title: t('deletingstockUserScope', 'Delete Stock User Scope'),
                kind: 'success',
                subtitle: t('stockUserScopeDeletedSuccessfully', 'Stock User Scope Deleted Successfully'),
              });
            },
            (error) => {
              setDeletingUserScope(false);
              showSnackbar({
                title: t('errorDeletingUserScope', 'Error deleting a user scope'),
                kind: 'error',
                isLowContrast: true,
                subtitle: error?.message,
              });
            },
          )
          .catch();
        close();
      },
    });
  }, [t, uuid]);

  const deleteButton = (
    <Button
      kind="ghost"
      size="md"
      onClick={handleDeleteStockUserScope}
      iconDescription={t('deleteUserScope', 'Delete Stock User Scope')}
      renderIcon={(props) => <TrashCan size={16} {...props} />}
    />
  );

  return deletingUserScope ? <InlineLoading /> : deleteButton;
};

export default StockUserScopeDeleteActionMenu;
