import React, { useMemo } from 'react';
import styles from './order-price-details.scss';
import { SkeletonText, Tooltip } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { Information } from '@carbon/react/icons';
import { useStockItem } from '../stock-items.resource';

interface OrderPriceDetailsComponentProps {
  orderItemUuid: string;
}

const OrderPriceDetailsComponent: React.FC<OrderPriceDetailsComponentProps> = ({ orderItemUuid }) => {
  const { t } = useTranslation();
  const { item: priceData, isLoading, error } = useStockItem(orderItemUuid);

  const amount = useMemo(() => {
    if (!priceData || priceData) {
      return null;
    }
    return priceData.purchasePrice;
  }, [priceData]);

  if (isLoading) {
    return <SkeletonText width="100px" role="progressbar" />;
  }

  if (!priceData || !amount || error) {
    return null;
  }

  return (
    <div className={styles.priceDetailsContainer}>
      <span className={styles.priceLabel}>{t('price', 'Price')}:</span>
      {amount}
      <Tooltip
        align="bottom-left"
        className={styles.priceToolTip}
        label={t(
          'priceDisclaimer',
          'This price is indicative and may not reflect final costs, which could vary due to discounts, insurance coverage, or other pricing rules',
        )}
      >
        <button className={styles.priceToolTipTrigger} type="button">
          <Information size={16} />
        </button>
      </Tooltip>
    </div>
  );
};

export default OrderPriceDetailsComponent;
