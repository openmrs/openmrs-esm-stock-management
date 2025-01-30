import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { navigate, useLayoutType } from '@openmrs/esm-framework';
import styles from './stock-home-detail-card.scss';
import { Delivery } from '@carbon/react/icons';
import { ResourceRepresentation } from '../core/api/api';
import { useStockReceiving } from './stock-home-receiving.resource';
import ReceivingStockModal from './stock-home-receiving-modal.component';

const StockHomeReceivingCard = () => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  const { items, isLoading } = useStockReceiving({
    v: ResourceRepresentation.Full,
    totalCount: true,
  });

  const [isModalOpen, setModalOpen] = useState(false);

  if (isLoading) return <></>;

  if (items?.length === 0) {
    return (
      <>
        <p className={styles.content}>{t('receivedNull', 'No received to display')}</p>
      </>
    );
  }

  return (
    <>
      {items?.map((item, index) =>
        item?.stockOperationItems.map((stock) => (
          <div className={styles.card} key={index}>
            <div className={styles.colorLineBlue} />
            <div className={styles.icon}>
              <Delivery size={40} color={'#0F62FE'} />
            </div>
            <div className={styles.cardText}>
              <p>
                {item?.status} · {item?.sourceName} · {item?.destinationName}
              </p>
              <p>
                <strong>{stock?.stockItemName}</strong> {stock?.stockItemPackagingUOMName}, {stock?.quantity}
              </p>
            </div>
          </div>
        )),
      )}
      {/* <Button
        onClick={() => {
          navigate({
            to: `${window.getOpenmrsSpaBase()}stock-management/orders`,
          });
        }}
        kind="ghost"
      >
        {t('receivedView', 'View All')}
      </Button> */}
      <Button onClick={() => setModalOpen(true)} kind="ghost">
        {t('receivedView', 'View All')}
      </Button>

      <ReceivingStockModal open={isModalOpen} onClose={() => setModalOpen(false)} receivingStock={items} />
    </>
  );
};

export default StockHomeReceivingCard;
