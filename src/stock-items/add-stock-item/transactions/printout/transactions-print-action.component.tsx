import React from 'react';
import { Button, Stack, ComboButton, MenuItem } from '@carbon/react';
import { Printer } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { useStockItem } from '../../../stock-items.resource';
import { showModal } from '@openmrs/esm-framework';
import styles from './printable-transaction.scss';

type Props = {
  itemUuid: string;
  columns: any;
  data: any;
};

const TransactionsPrintAction: React.FC<Props> = ({ columns, data, itemUuid }) => {
  const { t } = useTranslation();

  const { item: stockItem, isLoading: isStockItemLoading } = useStockItem(itemUuid);

  const handleClick = () => {
    // stockItem.drugName || stockItem.conceptName || ''
    const dispose = showModal('transactions-print-preview-modal', {
      onClose: () => dispose(),
      title: stockItem.drugName || stockItem.conceptName || '',
      columns,
      data,
    });
  };

  return (
    <>
      <ComboButton label="Print">
        <MenuItem
          label={t('printStockCard', 'Print Stock Card')}
          renderIcon={(props) => <Printer size={24} {...props} />}
          iconDescription="Print Stock Card"
        />
        <MenuItem
          label={t('printBinCard', 'Print Bin Card')}
          renderIcon={(props) => <Printer size={24} {...props} />}
          iconDescription="Print Bin Card"
          onClick={handleClick}
          disabled={isStockItemLoading}
        />
      </ComboButton>
    </>
  );
};

export default TransactionsPrintAction;
