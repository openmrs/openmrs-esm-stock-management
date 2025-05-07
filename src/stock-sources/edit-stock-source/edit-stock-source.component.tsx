import React, { useCallback } from 'react';
import { Button } from '@carbon/react';
import { Edit } from '@carbon/react/icons';

import { useTranslation } from 'react-i18next';
import { StockSource } from '../../core/api/types/stockOperation/StockSource';
import { launchWorkspace } from '@openmrs/esm-framework';

interface EditStockSourcesActionMenuProps {
  data?: StockSource;
}

const EditStockSourceActionsMenu: React.FC<EditStockSourcesActionMenuProps> = ({ data }) => {
  const { t } = useTranslation();
  const handleClick = useCallback(() => {
    launchWorkspace('stock-sources-form-workspace', {
      workspaceTitle: t('editStockSource', 'Edit Stock Source'),
      model: data,
    });
  }, [data, t]);

  return (
    <Button
      kind="ghost"
      size="md"
      onClick={() => handleClick()}
      iconDescription={t('editStockItem', 'Edit Stock Item')}
      renderIcon={(props) => <Edit size={16} {...props} />}
    />
  );
};
export default EditStockSourceActionsMenu;
