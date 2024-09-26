import { Button } from '@carbon/react';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { launchOverlay } from '../../../core/components/overlay/hook';
import StockRulesAddOrUpdate from './add-stock-rules.component';

interface AddStockRuleActionButtonProps {
  stockItemUuid: string;
}

const AddStockRuleActionButton: React.FC<AddStockRuleActionButtonProps> = ({ stockItemUuid }) => {
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    launchOverlay('Add Stock Rule', <StockRulesAddOrUpdate stockItemUuid={stockItemUuid} />);
  }, [stockItemUuid]);

  return (
    <Button onClick={handleClick} size="md" kind="primary">
      {t('addNewStockRule', 'Add New Rule')}
    </Button>
  );
};

export default AddStockRuleActionButton;
