import { Button } from '@carbon/react';
import { Printer } from '@carbon/react/icons';
import { showModal, useConfig } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { type ConfigObject } from '../../../../config-schema';
import { type StockItemInventoryFilter, useStockItem } from '../../../stock-items.resource';

type Props = {
  itemUuid: string;
  columns: any;
  data: any;
  filter?: StockItemInventoryFilter;
};

const TransactionsPrintAction: React.FC<Props> = ({ columns, data, itemUuid, filter }) => {
  const { t } = useTranslation();

  const { enablePrintButton } = useConfig<ConfigObject>();

  const { item: stockItem, isLoading: isStockItemLoading } = useStockItem(itemUuid);

  const handleStockControlCardClick = () => {
    const dispose = showModal('transactions-print-bincard-preview-modal', {
      onClose: () => dispose(),
      title: stockItem.drugName || stockItem.conceptName || '',
      columns,
      data,
    });
  };

  return (
    <>
      {enablePrintButton && (
        <Button
          renderIcon={Printer}
          disabled={isStockItemLoading}
          iconDescription={t('printStockControlCard', 'Print Stock Controll Card')}
          onClick={handleStockControlCardClick}
        >
          {t('printStockControlCard', 'Print Stock Controll Card')}
        </Button>
      )}
    </>
  );
};

export default TransactionsPrintAction;
