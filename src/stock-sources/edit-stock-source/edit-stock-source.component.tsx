import React, { useCallback } from 'react';
import { Button } from '@carbon/react';
import { Edit } from '@carbon/react/icons';

import { useTranslation } from 'react-i18next';
import { launchOverlay } from '../../core/components/overlay/hook';
import StockSourcesAddOrUpdate from '../add-stock-sources/add-stock-sources.component';
import { StockSource } from '../../core/api/types/stockOperation/StockSource';

interface EditStockSourcesActionMenuProps {
  data?: StockSource;
}

const EditStockSourceActionsMenu: React.FC<EditStockSourcesActionMenuProps> = ({ data }) => {
  const { t } = useTranslation();
  const handleClick = useCallback(() => {
    launchOverlay('Edit Stock Source', <StockSourcesAddOrUpdate model={data} />);
  }, [data]);

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
