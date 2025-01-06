import React, { useMemo } from 'react';
import styles from './order-stock-details.scss';
import { SkeletonText } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useStockItem } from '../stock-items.resource';
import { CheckmarkOutline, Misuse } from '@carbon/react/icons';

interface OrderStockDetailsComponentProps {
  orderItemUuid: string;
}

const OrderStockDetailsComponent: React.FC<OrderStockDetailsComponentProps> = ({ orderItemUuid }) => {
  const { t } = useTranslation();
  const { item: stockData, isLoading, error } = useStockItem(orderItemUuid);

  const isInStock = useMemo(() => {
    if (!stockData) {
      return false;
    }
    return true;
  }, [stockData]);

  if (isLoading) {
    return <SkeletonText width="100px" role="progressbar" />;
  }

  if (!stockData || error) {
    return null;
  }

  return (
    <div>
      {isInStock ? (
        <div className={styles.itemInStock}>
          <CheckmarkOutline size={16} className={styles.itemInStockIcon} /> {t('inStock', 'In stock')}
        </div>
      ) : (
        <div className={styles.itemOutOfStock}>
          <Misuse size={16} className={styles.itemOutOfStockIcon} /> {t('outOfStock', 'Out of stock')}
        </div>
      )}
    </div>
  );
};

export default OrderStockDetailsComponent;
