import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ComboBox, SelectSkeleton } from '@carbon/react';
import { type StockBatchDTO } from '../../../core/api/types/stockItem/StockBatchDTO';
import { formatForDatePicker } from '../../../constants';
import { useStockItemBatchInformationHook } from '../../../stock-items/add-stock-item/batch-information/batch-information.resource';
import { useStockItemBatchNumbers } from '../hooks/useStockItemBatchNumbers';

interface BatchNoSelectorProps {
  stockItemUuid: string;
  initialValue?: string;
  onValueChange?: (value: string) => void;
  error?: string;
}

const BatchNoSelector: React.FC<BatchNoSelectorProps> = ({ stockItemUuid, error, initialValue, onValueChange }) => {
  const { isLoading, stockItemBatchNos } = useStockItemBatchNumbers(stockItemUuid);
  const { t } = useTranslation();

  const { items, setStockItemUuid, isLoading: isLoadingBatchinfo } = useStockItemBatchInformationHook();

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
          quantityUoM: matchingBatch.quantityUoM,
        };
      }
      return item;
    });
  }, [stockItemBatchNos, items]);

  const filteredBatches = useMemo(() => {
    return stockItemBatchesInfo?.filter((s) => s.quantity !== undefined && s.quantity !== 0);
  }, [stockItemBatchesInfo]);
  const initialSelectedItem = useMemo(
    () => filteredBatches?.find((s) => s.uuid === initialValue),
    [filteredBatches, initialValue],
  );

  if (isLoading || isLoadingBatchinfo) return <SelectSkeleton role="progressbar" />;

  return (
    <ComboBox
      id={'stockBatchUuid'}
      invalid={!!error}
      invalidText={error}
      items={filteredBatches || []}
      itemToString={(s: StockBatchDTO) =>
        s?.batchNo
          ? `${s?.batchNo} | Qty: ${s?.quantity ?? 'Unknown'} ${
              (s as StockBatchDTO & { quantityUoM: string })?.quantityUoM
            } | Expiry: ${formatForDatePicker(s.expiration)}`
          : ''
      }
      name={'stockBatchUuid'}
      onChange={(data: { selectedItem?: StockBatchDTO }) => {
        onValueChange(data.selectedItem?.uuid);
      }}
      placeholder={t('filter', "'Filter") + '...'}
      selectedItem={initialSelectedItem}
      style={{ flexGrow: '1' }}
      titleText={t('batchNo', 'Batch no.')}
    />
  );
};

export default BatchNoSelector;
