import React, { useEffect, useMemo, useState } from 'react';
import { useStockItemsTransactions } from './transactions.resource';
import { DataTableSkeleton } from '@carbon/react';
import { formatDisplayDate } from '../../../core/utils/datetimeUtils';
import { ArrowLeft } from '@carbon/react/icons';
import DataList from '../../../core/components/table/table.component';
import { StockOperationType } from '../../../core/api/types/stockOperation/StockOperationType';
import TransactionsLocationsFilter from './transaction-filters/transaction-locations-filter.component';
import { useForm } from 'react-hook-form';
import { StockItemInventoryFilter } from '../../stock-items.resource';
import { useTranslation } from 'react-i18next';
import StockOperationReference from '../../../stock-operations/add-stock-operation/stock-operation-reference.component';

interface TransactionsProps {
  onSubmit?: () => void;
  stockItemUuid: string;
}

const Transactions: React.FC<TransactionsProps> = ({ stockItemUuid }) => {
  const { t } = useTranslation();

  const [stockItemFilter, setStockItemFilter] = useState<StockItemInventoryFilter>();
  const { isLoading, items, tableHeaders, totalCount, setCurrentPage, setStockItemUuid, setLocationUuid } =
    useStockItemsTransactions(stockItemFilter);

  useEffect(() => {
    setStockItemUuid(stockItemUuid);
  }, [stockItemUuid, setStockItemUuid]);

  const { control } = useForm({});

  const tableRows = useMemo(() => {
    return items?.map((stockItemTransaction) => ({
      ...stockItemTransaction,
      id: stockItemTransaction?.uuid,
      key: `key-${stockItemTransaction?.uuid}`,
      uuid: `${stockItemTransaction?.uuid}`,
      date: formatDisplayDate(stockItemTransaction?.dateCreated),
      location:
        stockItemTransaction.operationSourcePartyName && stockItemTransaction.operationDestinationPartyName ? (
          stockItemTransaction.operationSourcePartyName === stockItemTransaction?.partyName ? (
            stockItemTransaction.quantity > 0 ? (
              <>
                <span className="transaction-location">{stockItemTransaction.operationSourcePartyName}</span>
                <ArrowLeft size={16} /> {stockItemTransaction.operationDestinationPartyName}
              </>
            ) : (
              <>
                <span className="transaction-location">{stockItemTransaction.operationSourcePartyName}</span>
                <ArrowLeft size={16} /> {stockItemTransaction.operationDestinationPartyName}
              </>
            )
          ) : stockItemTransaction.operationDestinationPartyName === stockItemTransaction?.partyName ? (
            stockItemTransaction.quantity > 0 ? (
              <>
                <span className="transaction-location">{stockItemTransaction.operationDestinationPartyName}</span>
                <ArrowLeft size={16} /> {stockItemTransaction.operationSourcePartyName}
              </>
            ) : (
              <>
                <span className="transaction-location">{stockItemTransaction.operationDestinationPartyName}</span>
                <ArrowLeft size={16} /> {stockItemTransaction.operationSourcePartyName}
              </>
            )
          ) : (
            stockItemTransaction?.partyName
          )
        ) : (
          stockItemTransaction?.partyName
        ),
      transaction: stockItemTransaction?.isPatientTransaction
        ? 'Patient Dispense'
        : stockItemTransaction.stockOperationTypeName,
      quantity: `${stockItemTransaction?.quantity?.toLocaleString()} ${stockItemTransaction?.packagingUomName ?? ''}`,
      batch: stockItemTransaction.stockBatchNo
        ? `${stockItemTransaction.stockBatchNo}${
            stockItemTransaction.expiration ? ` (${formatDisplayDate(stockItemTransaction.expiration)})` : ''
          }`
        : '',
      reference: (
        <StockOperationReference
          operationUuid={stockItemTransaction?.stockOperationUuid}
          operationNumber={stockItemTransaction?.stockOperationNumber}
        />
      ),
      status: stockItemTransaction?.stockOperationStatus ?? '',
      in:
        stockItemTransaction?.quantity >= 0
          ? `${stockItemTransaction?.quantity?.toLocaleString()} ${stockItemTransaction?.packagingUomName ?? ''} of ${
              stockItemTransaction.packagingUomFactor
            }`
          : '',
      out:
        stockItemTransaction?.quantity < 0
          ? `${(-1 * stockItemTransaction?.quantity)?.toLocaleString()} ${
              stockItemTransaction?.packagingUomName ?? ''
            } of ${stockItemTransaction.packagingUomFactor}`
          : '',
    }));
  }, [items]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  return (
    <DataList
      children={() => (
        <TransactionsLocationsFilter
          onLocationIdChange={(q) => {
            setLocationUuid(q);
            setStockItemFilter({ ...stockItemFilter, locationUuid: q });
          }}
          name={'TransactionLocationUuid'}
          placeholder={t('filterByLocation', 'Filter by Location')}
          control={control}
          controllerName="TransactionLocationUuid"
        />
      )}
      columns={tableHeaders}
      data={tableRows}
      totalItems={totalCount}
      goToPage={setCurrentPage}
      hasToolbar={true}
    />
  );
};

export default Transactions;
