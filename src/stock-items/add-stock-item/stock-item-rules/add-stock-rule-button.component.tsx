import { Button } from '@carbon/react';
import { useWorkspace2Context } from '@openmrs/esm-framework';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface AddStockRuleActionButtonProps {
  stockItemUuid: string;
}

const AddStockRuleActionButton: React.FC<AddStockRuleActionButtonProps> = ({ stockItemUuid }) => {
  const { t } = useTranslation();
  const { launchChildWorkspace } = useWorkspace2Context();

  const handleClick = useCallback(() => {
    launchChildWorkspace('stock-item-rules-form-workspace', { stockItemUuid });
  }, [launchChildWorkspace, stockItemUuid]);

  return (
    <Button onClick={handleClick} size="md" kind="primary">
      {t('addNewStockRule', 'Add New Rule')}
    </Button>
  );
};

export default AddStockRuleActionButton;
