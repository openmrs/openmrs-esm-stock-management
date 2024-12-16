import React from 'react';
import { Button, Stack, ComboButton, MenuItem } from '@carbon/react';
import { Printer } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { useStockItem } from '../../../stock-items.resource';
import { showModal } from '@openmrs/esm-framework';
import styles from './printable-transaction.scss';
import { useEffect, useMemo, useState } from 'react';
import { StockItemInventoryFilter, useStockItemTransactions } from '../../../stock-items.resource';
import { ResourceRepresentation } from '../../../../core/api/api';

type Props = {
  itemUuid: string;
  columns: any;
  data: any;
};

const TransactionsPrintAction: React.FC<Props> = ({ columns, data, itemUuid }) => {
  const { t } = useTranslation();

  const [stockCardItemFilter, setStockCardItemFilter] = useState<StockItemInventoryFilter>({
    startIndex: 0,
    totalCount: true,
    v: ResourceRepresentation.Full,
    isPatientTransaction: 'true',
  });

  const { item: stockItem, isLoading: isStockItemLoading } = useStockItem(itemUuid);
  const { items: stockCardData, isLoading: isStockCardLoading, error } = useStockItemTransactions(stockCardItemFilter);

  const stockCardHeaders = useMemo(
    () => [
      {
        key: 'patientId',
        header: 'Patient ID',
      },
      {
        key: 'patientName',
        header: 'Patient Name',
      },
      {
        key: 'patientIdentifier',
        header: 'Patient Identifier',
      },
      {
        key: 'date',
        header: 'Date',
      },
      {
        key: 'location',
        header: 'Location',
      },
      {
        key: 'transaction',
        header: 'Transaction',
      },
      {
        key: 'totalout',
        header: 'OUT',
      },
      {
        key: 'batch',
        header: 'Batch',
      },
    ],
    [],
  );

  const handleBincardClick = () => {
    const dispose = showModal('transactions-print-bincard-preview-modal', {
      onClose: () => dispose(),
      title: stockItem.drugName || stockItem.conceptName || '',
      columns,
      data,
    });
  };

  const handleStockcardClick = () => {
    const dispose = showModal('transactions-print-stockcard-preview-modal', {
      onClose: () => dispose(),
      title: stockItem.drugName || stockItem.conceptName || '',
      columns: stockCardHeaders,
      data: stockCardData.results,
    });
  };

  return (
    <>
      <ComboButton label="Print">
        <MenuItem
          label={t('printStockCard', 'Print Stock Card')}
          renderIcon={(props) => <Printer size={24} {...props} />}
          iconDescription="Print Stock Card"
          onClick={handleStockcardClick}
          disabled={isStockItemLoading || isStockCardLoading}
        />
        <MenuItem
          label={t('printBinCard', 'Print Bin Card')}
          renderIcon={(props) => <Printer size={24} {...props} />}
          iconDescription="Print Bin Card"
          onClick={handleBincardClick}
          disabled={isStockItemLoading}
        />
      </ComboButton>
    </>
  );
};

export default TransactionsPrintAction;
