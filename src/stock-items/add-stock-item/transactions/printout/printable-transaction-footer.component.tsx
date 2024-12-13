import React from 'react';
import styles from './printable-transaction-footer.scss';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useSession } from '@openmrs/esm-framework';

type PrintableFooterProps = {
  // facilityInfo: Record<string, any>;
  title: string;
};

const PrintableTransactionFooter: React.FC<PrintableFooterProps> = ({ title }) => {
  const { t } = useTranslation();
  const session = useSession();

  return (
    <div className={styles.container}>
      <p className={styles.itemFooter}>{title}</p>
      <p className={styles.footDescription}>
        {t(
          'generatedMessage',
          'The card has been electronically generated and is a valid document. It was created by {{userName}} on {{date}} at {{time}}',
          {
            userName: `${session?.user?.display}`,
            date: dayjs().format('DD-MM-YYYY'),
            time: dayjs().format('hh:mm A'),
          },
        )}
      </p>
    </div>
  );
};

export default PrintableTransactionFooter;
