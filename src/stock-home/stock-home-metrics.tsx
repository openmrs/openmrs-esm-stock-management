import React from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from '@carbon/react';
import { ErrorState, formatDate, parseDate } from '@openmrs/esm-framework';
import styles from './stock-home.scss';
import MetricsCard from '../core/components/card/metrics-card-component';
import useStockList from './useStockList';
import useDisposalList from './useDisposalList';

const StockManagementMetrics: React.FC = () => {
  const { t } = useTranslation();
  
  const { stockList: allStocks, isLoading, error } = useStockList();
  const { disposalList: allOperations } = useDisposalList();

  if (isLoading) {
    return <InlineLoading role="progressbar" description={t('loading', 'Loading...')} />;
  }
  if (error) {
    return <ErrorState headerTitle={t('errorStockMetric')} error={error} />;
  }

  const sevenDaysExpiryStocks = allStocks.filter((stock) => stock.hasExpiration && stock.ExpiryNotice <= 7);
  const thirtyDaysExpiryStocks = allStocks.filter((stock) => stock.hasExpiration && stock.ExpiryNotice <= 30);

  const expired = allOperations.filter((disposalstock) => disposalstock.operationType == "Disposal" );
  const poorquality = allOperations.filter((disposalstock) => disposalstock.operationType == "Disposal");



  return (
    <>
      
      <div className={styles.cardContainer}>
      <MetricsCard
          label={t('stocks', 'Expiring stock')}
          value={allStocks.length}
          headerLabel={t('expiringStock', 'Expiring Stock')}
          view="items"
          count={{
            expiry7days: sevenDaysExpiryStocks,
            expiry30days: thirtyDaysExpiryStocks,
          }}
        />
        <MetricsCard
          label={
             t('outofstock', 'Out of Stock')
          }
          value={3}
          headerLabel={t('highestServiceVolume', 'Out of Stock ')}
          view="items"
          outofstockCount={{
            itemsbelowmin: sevenDaysExpiryStocks,
            itemsabovemax: thirtyDaysExpiryStocks,
          }}
        />
        <MetricsCard
          label={t('disposedstock', 'Disposed Stock')}
          value={allOperations.length}
          headerLabel={t('providersAvailableToday', 'Disposed Stock ')}
          view="items"
          disposedCount={{
            expired: expired,
            poorquality: poorquality,
          }}
        />
      </div>
    </>
  );
};
export default StockManagementMetrics;