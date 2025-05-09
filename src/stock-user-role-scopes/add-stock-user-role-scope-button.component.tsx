import { Button } from '@carbon/react';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { launchWorkspace } from '@openmrs/esm-framework';

const AddStockUserRoleScopeActionButton: React.FC = () => {
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    launchWorkspace('add-stock-user-role-scope');
  }, []);

  return (
    <Button onClick={handleClick} size="md" kind="primary">
      {t('addNewUserRoleScope', 'Add New User Role Scope')}
    </Button>
  );
};

export default AddStockUserRoleScopeActionButton;
