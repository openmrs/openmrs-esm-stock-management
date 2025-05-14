import React from 'react';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from '@carbon/react/icons';
import { isEmpty } from 'lodash-es';
import { Tile } from '@carbon/react';
import { ConfigurableLink } from '@openmrs/esm-framework';
import styles from './metrics-card.scss';

dayjs.extend(isSameOrBefore);

interface MetricsCardProps {
  label: string;
  value: number;
  headerLabel: string;
  children?: React.ReactNode;
  view: string;
  count?: { expiry6months: Array<any> };
  outOfStockCount?: { itemsBelowMin: Array<any>; itemsAboveMax: Array<any> };
  disposedCount?: { expired: Array<any>; poorQuality: Array<any> };
}
const MetricsCard: React.FC<MetricsCardProps> = ({
  label,
  value,
  headerLabel,
  children,
  view,
  count,
  outOfStockCount,
  disposedCount,
}) => {
  const { t } = useTranslation();

  return (
    <Tile className={styles.tileContainer}>
      <div className={styles.tileHeader}>
        <div className={styles.headerLabelContainer}>
          <label className={styles.headerLabel}>{headerLabel}</label>
          {children}
        </div>
        {view && (
          <ConfigurableLink className={styles.link} to={`\${openmrsSpaBase}/stock-management/orders`}>
            <span>{t('view', 'View')}</span>
            <ArrowRight size={16} />
          </ConfigurableLink>
        )}
      </div>
      <div className={styles.metricsGrid}>
        <div>
          <label className={styles.totalsLabel}>{label}</label>
          <p className={styles.totalsValue}>{value}</p>
        </div>
        {!isEmpty(count) && (
          <div className={styles.countGrid}>
            <span />
            <span className={styles.in6MonthsLabel}>{t('in6Months', 'In 6 months')}</span>
            <p />
            <p className={styles.in6MonthsValue}>{count.expiry6months?.length}</p>
          </div>
        )}
        {!isEmpty(outOfStockCount) && (
          <div className={styles.countGrid}>
            <span className={styles.belowMinLabel}>{t('itemsBelowMin', 'Items Below Min')}</span>
            <span className={styles.aboveMaxLabel}>{t('itemsAboveMax', 'Items Above Max')}</span>
            <p className={styles.belowMinValue}>{outOfStockCount.itemsBelowMin?.length}</p>
            <p className={styles.aboveMaxValue}>{outOfStockCount.itemsAboveMax?.length}</p>
          </div>
        )}
        {!isEmpty(disposedCount) && (
          <div className={styles.countGrid}>
            <span className={styles.expiredLabel}>{t('expired', 'Expired')}</span>
            <span className={styles.poorQualityLabel}>{t('poorQuality', 'Poor Quality')}</span>
            <p className={styles.expiredValue}>{disposedCount.expired?.length}</p>
            <p className={styles.poorQualityValue}>{disposedCount.poorQuality?.length}</p>
          </div>
        )}
      </div>
    </Tile>
  );
};
export default MetricsCard;
