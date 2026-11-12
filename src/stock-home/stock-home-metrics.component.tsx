import React from 'react';
import { useTranslation } from 'react-i18next';
import { restBaseUrl } from '@openmrs/esm-framework';
import { ResourceRepresentation } from '../core/api/api';
import { useHandleMutate } from '../utils';
import { useDisposalList } from './useDisposalList';
import { useStockInventory } from './stock-home-inventory-expiry.resource';
import { useStockInventoryItems } from './stock-home-inventory-items.resource';
import { type StockOperationFilter } from '../stock-operations/stock-operations.resource';
import useStockList from './useStockList';
import MetricsCard from '../core/components/card/metrics-card-component';
import styles from './stock-home.scss';

const StockManagementMetrics: React.FC = (filter: StockOperationFilter) => {
  const { t } = useTranslation();
  const handleMutate = useHandleMutate();
  const { stockList: allStocks, error: stockListError } = useStockList();
  const { items: expiryItems, error: batchesError } = useStockInventory();
  const { items: stockItems, error: stockItemsError } = useStockInventoryItems();

  const currentDate = new Date();

  let mergedArray = expiryItems.map((batch) => {
    const matchingItem = stockItems?.find((item) => batch?.stockItemUuid === item.uuid);
    return { ...batch, ...matchingItem };
  });

  mergedArray = mergedArray.filter((item) => item.hasExpiration);

  const filteredData = mergedArray.filter((item) => {
    const expiryNotice = item.expiryNotice || 0;
    const expirationDate = new Date(item.expiration);
    const differenceInDays = Math.ceil((expirationDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    return differenceInDays <= expiryNotice || differenceInDays < 0;
  });

  const sixMonthsExpiryStocks = filteredData.filter((stock) => stock.hasExpiration && stock.expiryNotice <= 180);

  const { items, error: disposalsError } = useDisposalList({
    v: ResourceRepresentation.Full,
    totalCount: true,
  });

  // The trailing "?" keeps each retry to its own endpoint (stockitem, not stockiteminventory).
  const retry = (resource: string) => () => handleMutate(`${restBaseUrl}/stockmanagement/${resource}?`);
  const retryExpiring = () => {
    if (batchesError) retry('stockbatch')();
    if (stockItemsError) retry('stockitem')();
  };

  const filteredItems =
    items && items.filter((item) => item.reasonName === 'Drug not available due to expired medication');
  const poorQualityItems = items && items.filter((item) => item.reasonName === 'Poor Quality');

  return (
    <div className={styles.cardContainer}>
      <MetricsCard
        count={{
          expiry6months: sixMonthsExpiryStocks,
        }}
        error={batchesError ?? stockItemsError}
        headerLabel={t('expiringStock', 'Expiring stock')}
        label={t('expiringStock', 'Expiring stock')}
        onRetry={retryExpiring}
        value={filteredData?.length || 0}
      />
      <MetricsCard
        error={stockListError}
        onRetry={retry('stockitem')}
        label={t('outOfStock', 'Out of stock')}
        headerLabel={t('outOfStock', 'Out of stock')}
        outOfStockCount={{
          itemsBelowMin: [],
          itemsAboveMax: [],
        }}
        value={allStocks?.length}
      />
      <MetricsCard
        disposedCount={{
          expired: filteredItems,
          poorQuality: poorQualityItems,
        }}
        error={disposalsError}
        headerLabel={t('disposedStock', 'Disposed stock')}
        label={t('disposedStock', 'Disposed stock')}
        onRetry={retry('stockoperation')}
        value={items?.length || 0}
      />
    </div>
  );
};
export default StockManagementMetrics;
