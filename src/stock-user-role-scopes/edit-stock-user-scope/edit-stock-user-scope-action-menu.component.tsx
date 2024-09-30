import { Button } from '@carbon/react';
import { Edit } from '@carbon/react/icons';

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { launchOverlay } from '../../core/components/overlay/hook';
import AddStockUserRoleScope from '../add-stock-user-scope/add-stock-user-role-scope.component';
import { UserRoleScope } from '../../core/api/types/identity/UserRoleScope';

interface EditStockUserRoleActionsMenuProps {
  data: UserRoleScope;
}

const EditStockUserRoleActionsMenu: React.FC<EditStockUserRoleActionsMenuProps> = ({ data }) => {
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    launchOverlay('Edit Stock User Role', <AddStockUserRoleScope model={data} editMode={true} />);
  }, [data]);

  return (
    <Button
      kind="ghost"
      onClick={handleClick}
      iconDescription={t('editUserScope', 'Edit UserScope')}
      renderIcon={(props) => <Edit size={16} {...props} />}
    />
  );
};
export default EditStockUserRoleActionsMenu;
