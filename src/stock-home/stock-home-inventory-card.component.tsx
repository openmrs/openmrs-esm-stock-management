import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { WarningHex } from '@carbon/react/icons';
import { showModal } from '@openmrs/esm-framework';
import { useStockInventory } from './stock-home-inventory-expiry.resource';
import { useStockInventoryItems } from './stock-home-inventory-items.resource';
import styles from './stock-home-detail-card.scss';

const StockHomeInventoryCard = () => {
  const { t } = useTranslation();
  const { items: expiryItems, isLoading: inventoryLoading } = useStockInventory();
  const { items: stockItems, isLoading } = useStockInventoryItems();

  if (isLoading || inventoryLoading) {
    return null;
  }

  if (stockItems?.length === 0) {
    return <p>{t('noInventoryAlerts', 'No inventory alerts to display')}</p>;
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

  const launchExpiredStockModal = () => {
    const dispose = showModal('expired-stock-modal', {
      closeModal: () => dispose(),
      expiredStock: mergedArray,
    });
  };

  return (
    <>
      {filteredData.map((item, index) => (
        <div className={styles.card} key={index}>
          <div className={styles.colorLineRed} />
          <div className={styles.icon}>
            <WarningHex size={40} color={'#DA1E28'} />
          </div>
          <div className={styles.cardText}>
            <p>{t('expiringStock', 'Expiring stock')}</p>
            <p>
              <strong>{item?.drugName}</strong> {t('batchNo', 'Batch No:')} {item?.batchNo} {t('quantity', 'Quantity:')}{' '}
              {item?.quantity} {item?.dispensingUnitName}
            </p>
          </div>
        </div>
      ))}
      {/* <Button
        onClick={() => {
          navigate({
            to: `${window.getOpenmrsSpaBase()}stock-management/expired-stock`,
          });
        }}
        kind="ghost"
      >
        {t('viewAll', 'View All')}
      </Button> */}

      <Button kind="ghost" onClick={launchExpiredStockModal} size="sm">
        {t('viewAll', 'View All')}
      </Button>
    </>
  );
};

export default StockHomeInventoryCard;
