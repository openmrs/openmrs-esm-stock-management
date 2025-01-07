import React, { useEffect, useMemo, useState } from 'react';
import styles from '../stock-item-price-details/stock-price-details.scss';
import { SkeletonText, Tooltip } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { Information } from '@carbon/react/icons';
import { fetchStockItem, getStockItem, useOrderItemDetails, useStockItem } from '../stock-items.resource';
import { StockItemDTO } from '../../core/api/types/stockItem/StockItem';

interface OrderPriceDetailsComponentProps {
  orderItemUuid: string;
}

const OrderPriceDetailsComponent: React.FC<OrderPriceDetailsComponentProps> = ({ orderItemUuid }) => {
  const { t } = useTranslation();
  const { item } = useOrderItemDetails(orderItemUuid);
  const [results, setResults] = useState<StockItemDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (item?.uuid) {
        setIsLoading(true);
        try {
          const response = await fetchStockItem(item.uuid);
          setResults(response);
        } catch (error) {
          setIsLoading(false);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchResults();
  }, [item?.uuid]);

  const purchasePrice = results[0]?.purchasePrice;

  return (
    <div className={styles.priceDetailsContainer}>
      <span className={styles.priceLabel}>{t('price', 'Price')}:</span>
      {isLoading ? (
        <SkeletonText width="100px" role="progressbar" />
      ) : (
        <span>{purchasePrice ? purchasePrice : t('noPrice', 'N/A')}</span>
      )}
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
