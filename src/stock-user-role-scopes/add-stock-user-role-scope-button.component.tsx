import React, { useCallback } from 'react';
import { Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { launchWorkspace2 } from '@openmrs/esm-framework';

const AddStockUserRoleScopeActionButton: React.FC = () => {
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    launchWorkspace2('stock-user-role-scopes-form-workspace');
  }, []);

  return (
    <Button kind="primary" onClick={handleClick} size="md">
      {t('addNewUserRoleScope', 'Add new user role scope')}
    </Button>
  );
};

export default AddStockUserRoleScopeActionButton;
