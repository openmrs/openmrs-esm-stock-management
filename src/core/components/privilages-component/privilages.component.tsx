import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tile } from '@carbon/react';
import { DocumentProtected } from '@carbon/react/icons';

import styles from './privilages.scss';

interface PrivilageComponentProps {
  title: string;
  description?: string;
}

export const PrivilagedView: React.FC<PrivilageComponentProps> = ({ title, description }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.tileContainer}>
      <Tile className={styles.tile}>
        <div className={styles.tileContent}>
          <DocumentProtected size="24" />
          <p className={styles.content}>{t('noPrivilagesTitle', `${title}`)}</p>
          {description && (
            <p className={styles.helper}>
              {t('noViewPrivilegesDescription', 'Description: {{description}}', {
                description,
              })}
            </p>
          )}
        </div>
      </Tile>
    </div>
  );
};
