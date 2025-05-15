import { Button } from '@carbon/react';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { launchAddOrStockItemWorkspace } from '../stock-item.utils';

const AddStockItemActionButton: React.FC = () => {
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    launchAddOrStockItemWorkspace(t);
  }, [t]);

  return (
    <Button onClick={handleClick} size="md" kind="primary">
      {t('addNewStock', 'Add New')}
    </Button>
  );
};

export default AddStockItemActionButton;
