import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './stock-settings.scss';
import { navigate } from '@openmrs/esm-framework';
import { Button } from '@carbon/react';
import { UserSettings } from '@carbon/react/icons';

function StockSettings() {
  const { t } = useTranslation();

  return (
    <div className={styles.StockSettings}>
      <div className={styles.tableHeader}>
        {t(
          'comingSoonUnderDev',
          'Exciting updates are on the way! In the meantime, use the link below to access Admin UI settings.',
        )}
      </div>

      <Button
        onClick={() =>
          navigate({
            to: `\${openmrsBase}/admin/maintenance/settings.list?show=Stockmanagement`,
          })
        }
        size="md"
        renderIcon={() => <UserSettings className="cds--btn__icon" size={24} />}
        kind="ghost"
      >
        {t('adminSettings', 'Admin settings')}
      </Button>
    </div>
  );
}

export default StockSettings;
