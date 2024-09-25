import { formatDate, useSession } from '@openmrs/esm-framework';
import React from 'react';
import styles from './stock-management-header.scss';
import StockManagementIllustration from './stock-management-Illustration';
import { Calendar, Location } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';

export const StockManagementHeader: React.FC = () => {
  const { t } = useTranslation();
  const userSession = useSession();
  const userLocation = userSession?.sessionLocation?.display;

  return (
    <div className={styles.header}>
      <div className={styles['left-justified-items']}>
        <StockManagementIllustration />
        <div className={styles['page-labels']}>
          <p>{t('home', 'Home')}</p>
          <p className={styles['page-name']}>{t('stockManagement', 'Stock Management')}</p>
        </div>
      </div>
      <div className={styles['right-justified-items']}>
        <div className={styles['date-and-location']}>
          <Location size={16} />
          <span className={styles.value}>{userLocation}</span>
          <span className={styles.middot}>&middot;</span>
          <Calendar size={16} />
          <span className={styles.value}>{formatDate(new Date(), { mode: 'standard' })}</span>
        </div>
      </div>
    </div>
  );
};
