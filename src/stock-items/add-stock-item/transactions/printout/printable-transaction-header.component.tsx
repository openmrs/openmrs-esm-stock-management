import React from 'react';
import styles from './printable-transaction-header.scss';
import { useConfig } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import startCase from 'lodash-es/startCase';

interface PrintableTransactionHeaderProps {
  itemName: string;
}

const PrintableTransactionHeader: React.FC<PrintableTransactionHeaderProps> = ({ itemName }) => {
  const { t } = useTranslation();
  const { logo } = useConfig({ externalModuleName: '@kenyaemr/esm-login-app' });

  return (
    <div className={styles.container}>
      <div className={styles.printableHeader}>
        <p className={styles.heading}>{t('bincard', 'Bin Card')}</p>
        {logo?.src ? (
          <img className={styles.img} height={60} width={250} src={logo.src} alt={logo.alt} />
        ) : logo?.name ? (
          logo.name
        ) : (
          // OpenMRS Logo
          <svg
            role="img"
            className={styles.img}
            width={110}
            height={40}
            viewBox="0 0 380 119"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>{t('openmrsLogo', 'OpenMRS logo')}</title>
            <use href="#omrs-logo-full-color"></use>
          </svg>
        )}
      </div>

      <div className={styles.printableBody}>
        <div className={styles.transactionDetails}>
          <p className={styles.itemHeading}>{t('itemname', 'Item Name')}</p>
          <p className={styles.itemLabel}>{startCase(itemName)}</p>
        </div>
      </div>
    </div>
  );
};

export default PrintableTransactionHeader;
