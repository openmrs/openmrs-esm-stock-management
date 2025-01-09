import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { ComboBox, InlineLoading } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useStockItemBatchNumbers } from '../hooks/useStockItemBatchNumbers';
import { useStockItemBatchInformationHook } from '../../../stock-items/add-stock-item/batch-information/batch-information.resource';
import { StockBatchDTO } from '../../../core/api/types/stockItem/StockBatchDTO';
import { SelectSkeleton } from '@carbon/react';

interface BatchNoSelectorProps {
  stockItemUuid: string;
  intiallvalue?: string;
  onValueChange?: (value: string) => void;
  error?: string;

  // selectedItem?: string;
}

const BatchNoSelector: React.FC<BatchNoSelectorProps> = ({ stockItemUuid, error, intiallvalue, onValueChange }) => {
  const { isLoading, stockItemBatchNos } = useStockItemBatchNumbers(stockItemUuid);
  const { t } = useTranslation();

  const { items, setStockItemUuid } = useStockItemBatchInformationHook();

  useEffect(() => {
    setStockItemUuid(stockItemUuid);
  }, [stockItemUuid, setStockItemUuid]);

  const stockItemBatchesInfo = useMemo(() => {
    return stockItemBatchNos?.map((item) => {
      const matchingBatch = items?.find((batch) => batch.batchNumber === item.batchNo);
      if (matchingBatch) {
        return {
          ...item,
          quantity: matchingBatch.quantity ?? '',
        };
      }
      return item;
    });
  }, [stockItemBatchNos, items]);

  const filteredBatches = useMemo(() => {
    return stockItemBatchesInfo?.filter((s) => s.quantity !== undefined && s.quantity !== 0);
  }, [stockItemBatchesInfo]);
  const initialSelectedItem = useMemo(
    () => filteredBatches?.find((s) => s.uuid === intiallvalue),
    [filteredBatches, intiallvalue],
  );

  // useEffect(() => {
  //   if (
  //     !isLoading &&
  //     stockItemBatchNos &&
  //     props.selectedItem &&
  //     (stockItemBatchNos.length === 0 || filteredBatches.length === 0)
  //   ) {
  //     setValidationMessage('No stock batch numbers defined. Do a initial/receipt stock operation first.');
  //   } else {
  //     setValidationMessage(null);
  //   }
  // }, [isLoading, stockItemBatchNos, props.selectedItem, filteredBatches]);
  if (isLoading) return <SelectSkeleton />;
  // const errorMessage =

  return (
    <ComboBox
      style={{ flexGrow: '1' }}
      titleText={t('batchNo', 'Batch')}
      name={'stockBatchUuid'}
      id={'stockBatchUuid'}
      items={filteredBatches || []}
      onChange={(data: { selectedItem?: StockBatchDTO }) => {
        onValueChange(data.selectedItem?.uuid);
      }}
      initialSelectedItem={initialSelectedItem}
      itemToString={(s: StockBatchDTO) => (s?.batchNo ? `${s?.batchNo} | Qty: ${s?.quantity ?? 'Unknown'}` : '')}
      placeholder={t('filter', "'Filter") + '...'}
      invalid={error}
      invalidText={error}
    />
  );
};

export default BatchNoSelector;
