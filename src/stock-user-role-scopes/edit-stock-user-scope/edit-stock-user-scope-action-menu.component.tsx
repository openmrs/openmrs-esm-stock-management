import { Button } from '@carbon/react';
import { Edit } from '@carbon/react/icons';

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { type UserRoleScope } from '../../core/api/types/identity/UserRoleScope';
import { launchWorkspace } from '@openmrs/esm-framework';

interface EditStockUserRoleActionsMenuProps {
  data: UserRoleScope;
}

const EditStockUserRoleActionsMenu: React.FC<EditStockUserRoleActionsMenuProps> = ({ data }) => {
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    launchWorkspace('stock-user-role-scopes-form-workspace', {
      workspaceTitle: t('editUserScope', 'Edit user scope role'),
      model: data,
    });
  }, [data, t]);

  return (
    <Button
      kind="ghost"
      onClick={handleClick}
      iconDescription={t('editUserScope', 'Edit user scope role')}
      renderIcon={(props) => <Edit size={16} {...props} />}
    />
  );
};
export default EditStockUserRoleActionsMenu;
