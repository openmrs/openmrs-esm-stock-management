import { Button } from '@carbon/react';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import CreateReport from '../generate-report/create-stock-report.component';
import { launchOverlay } from '../../core/components/overlay/hook';

const NewReportActionButton: React.FC = () => {
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    launchOverlay('New Report', <CreateReport />);
  }, []);

  return (
    <Button onClick={handleClick} size="md" kind="primary">
      {t('newReport', 'New Report')}
    </Button>
  );
};

export default NewReportActionButton;
