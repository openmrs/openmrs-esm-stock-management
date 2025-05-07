import { Button } from '@carbon/react';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { launchWorkspace } from '@openmrs/esm-framework';

const AddStockUserRoleScopeActionButton: React.FC = () => {
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    launchWorkspace('stock-user-role-scopes-form-workspace', {
      workspaceTitle: t('addNewUserRoleScope', 'Add New User Role Scope'),
    });
  }, [t]);

  return (
    <Button onClick={handleClick} size="md" kind="primary">
      {t('addNewUserRoleScope', 'Add New User Role Scope')}
    </Button>
  );
};

export default AddStockUserRoleScopeActionButton;
