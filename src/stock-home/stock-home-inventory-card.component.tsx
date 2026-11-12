import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActionableNotification, Button } from '@carbon/react';
import { WarningHex } from '@carbon/react/icons';
import { restBaseUrl, showModal } from '@openmrs/esm-framework';
import { useHandleMutate } from '../utils';
import { useStockInventory } from './stock-home-inventory-expiry.resource';
import { useStockInventoryItems } from './stock-home-inventory-items.resource';
import styles from './stock-home-detail-card.scss';

const StockHomeInventoryCard = () => {
  const { t } = useTranslation();
  const handleMutate = useHandleMutate();
  const { items: expiryItems, isLoading: inventoryLoading, error: batchesError } = useStockInventory();
  const { items: stockItems, isLoading, error: stockItemsError } = useStockInventoryItems();

  if (isLoading || inventoryLoading) {
    return null;
  }

  // Checked before the data, which SWR keeps from an earlier load when a reload fails.
  if (batchesError || stockItemsError) {
    const retry = () => {
      if (batchesError) handleMutate(`${restBaseUrl}/stockmanagement/stockbatch?`);
      if (stockItemsError) handleMutate(`${restBaseUrl}/stockmanagement/stockitem?`);
    };

    return (
      <ActionableNotification
        actionButtonLabel={t('tryAgain', 'Try again')}
        closeOnEscape={false}
        hasFocus={false}
        hideCloseButton
        inline
        kind="error"
        lowContrast
        onActionButtonClick={retry}
        role="alert"
        title={t('inventoryAlertsLoadError', "Couldn't load inventory alerts")}
      />
    );
  }

  if (stockItems?.length === 0) {
    return <p className={styles.content}>{t('noInventoryAlerts', 'No inventory alerts to display')}</p>;
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
              <strong>{item?.drugName}</strong> {t('batchNumberLabel', 'Batch number:')} {item?.batchNo}{' '}
              {t('quantityLabel', 'Quantity:')} {item?.quantity} {item?.dispensingUnitName}
            </p>
          </div>
        </div>
      ))}
      <Button kind="ghost" onClick={launchExpiredStockModal} size="sm">
        {t('viewAll', 'View All')}
      </Button>
    </>
  );
};

export default StockHomeInventoryCard;
