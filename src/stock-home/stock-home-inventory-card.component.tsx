import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { navigate, useLayoutType } from '@openmrs/esm-framework';
import styles from './stock-home-detail-card.scss';
import { WarningHex } from '@carbon/react/icons';
import { useStockInventory } from './stock-home-inventory-expiry.resource';
import { useStockInventoryItems } from './stock-home-inventory-items.resource';

const StockHomeInventoryCard = () => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  const { items: expiryItems, isLoading: inventoryLoading } = useStockInventory();
  const { items: stockItems, isLoading } = useStockInventoryItems();

  if (isLoading || inventoryLoading) return <></>;

  if (stockItems?.length === 0) {
    return (
      <>
        <p className={styles.content}>{t('inventoryAlertNull', 'No inventory alerts to display')}</p>
      </>
    );
  }

  const currentDate = new Date();

  let mergedArray = expiryItems.map((batch) => {
    const matchingItem = stockItems?.find((item) => batch?.stockItemUuid === item.uuid);
    return { ...batch, ...matchingItem };
  });

  mergedArray = mergedArray.filter((item) => item.hasExpiration);

  const filteredData = mergedArray
    .filter((item) => {
      const expirationDate = new Date(item.expiration);
      const differenceInDays = Math.ceil((expirationDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      return differenceInDays <= 180 && differenceInDays >= 0;
    })
    .slice(0, 5);

  return (
    <>
      {filteredData.map((item, index) => (
        <div className={styles.card} key={index}>
          <div className={styles.colorLineRed} />
          <div className={styles.icon}>
            <WarningHex size={40} color={'#DA1E28'} />
          </div>
          <div className={styles.cardText}>
            <p>EXPIRING STOCK</p>
            <p>
              <strong>{item?.drugName}</strong> Batch No: {item?.batchNo} Quantity: {item?.quantity}{' '}
              {item?.dispensingUnitName}
            </p>
          </div>
        </div>
      ))}
      <Button
        onClick={() => {
          navigate({
            to: `${window.getOpenmrsSpaBase()}stock-management/expired-stock`,
          });
        }}
        kind="ghost"
      >
        View All
      </Button>
    </>
  );
};

export default StockHomeInventoryCard;
