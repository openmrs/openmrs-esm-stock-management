import React, { useCallback, useEffect, useMemo } from 'react';
import { useStockItem } from '../../../stock-items/stock-items.resource';
import { useTranslation } from 'react-i18next';
import { showSnackbar, useConfig } from '@openmrs/esm-framework';
import { InlineLoading } from '@carbon/react';
import { StockItemDTO } from '../../../core/api/types/stockItem/StockItem';
import { URL_STOCK_ITEM } from '../../../constants';
import { Link } from 'react-router-dom';
import { ConfigObject } from '../../../config-schema';

type StockOperationItemCellProps = {
  stockItemUuid: string;
};

const StockOperationItemCell: React.FC<StockOperationItemCellProps> = ({ stockItemUuid }) => {
  const { isLoading, error, item } = useStockItem(stockItemUuid);
  const { t } = useTranslation();
  const { useItemCommonNameAsDisplay } = useConfig<ConfigObject>();
  const commonName = useMemo(() => {
    if (!useItemCommonNameAsDisplay) return;
    const drugName = item?.drugName ? `(Drug name: ${item.drugName})` : undefined;
    return `${item?.commonName || t('noCommonNameAvailable', 'No common name available') + (drugName ?? '')}`;
  }, [item, useItemCommonNameAsDisplay, t]);

  const drugName = useMemo(() => {
    if (useItemCommonNameAsDisplay) return;
    const commonName = item?.commonName ? `(Common name: ${item.commonName})` : undefined;
    return `${item?.drugName || t('noDrugNameAvailable', 'No drug name available') + (commonName ?? '')}`;
  }, [item, useItemCommonNameAsDisplay, t]);
  useEffect(() => {
    if (error) {
      showSnackbar({
        kind: 'error',
        title: t('stockItemError', 'Error loading stock item'),
        subtitle: error?.message,
      });
    }
  }, [error, t]);

  if (isLoading) return <InlineLoading status="active" iconDescription="Loading" />;
  if (error) return <>--</>;

  return (
    <Link target={'_blank'} to={URL_STOCK_ITEM(stockItemUuid)}>
      {useItemCommonNameAsDisplay ? commonName : drugName}
    </Link>
  );
};

export default StockOperationItemCell;
