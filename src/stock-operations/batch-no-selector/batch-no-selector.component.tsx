import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { ComboBox, InlineLoading } from '@carbon/react';
import { useStockItemBatchNos } from './batch-no-selector.resource';
import { StockBatchDTO } from '../../core/api/types/stockItem/StockBatchDTO';
import { useStockItemBatchInformationHook } from '../../stock-items/add-stock-item/batch-information/batch-information.resource';
import { useTranslation } from 'react-i18next';

interface BatchNoSelectorProps<T> {
  placeholder?: string;
  stockItemUuid: string;
  batchUuid?: string;
  onBatchNoChanged?: (item: StockBatchDTO) => void;
  title?: string;
  invalid?: boolean;
  invalidText?: ReactNode;
  selectedItem?: string;

  // Control
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
}

const BatchNoSelector = <T,>(props: BatchNoSelectorProps<T>) => {
  const { isLoading, stockItemBatchNos } = useStockItemBatchNos(props.stockItemUuid);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<StockBatchDTO | null>(null);
  const { t } = useTranslation();

  const initialSelectedItem = useMemo(
    () => stockItemBatchNos?.find((stockItem) => stockItem.uuid === props.batchUuid) ?? '',
    [stockItemBatchNos, props.batchUuid],
  );

  const { items, setStockItemUuid } = useStockItemBatchInformationHook();

  useEffect(() => {
    setStockItemUuid(props.stockItemUuid);
  }, [props.stockItemUuid, setStockItemUuid]);

  const stockItemBatchesInfo = stockItemBatchNos?.map((item) => {
    const matchingBatch = items?.find((batch) => batch.batchNumber === item.batchNo);
    if (matchingBatch) {
      return {
        ...item,
        quantity: matchingBatch.quantity ?? '',
      };
    }
    return item;
  });

  const filteredBatches = stockItemBatchesInfo?.filter((s) => s.quantity !== undefined && s.quantity !== 0);

  useEffect(() => {
    if (
      !isLoading &&
      stockItemBatchNos &&
      props.selectedItem &&
      (stockItemBatchNos.length === 0 || filteredBatches.length === 0)
    ) {
      setValidationMessage('No stock batch numbers defined. Do a initial/receipt stock operation first.');
    } else {
      setValidationMessage(null);
    }
  }, [isLoading, stockItemBatchNos, props.selectedItem, filteredBatches]);

  if (isLoading) return <InlineLoading status="active" data-testid="loading" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Controller
        name={props.controllerName}
        control={props.control}
        render={({ field: { onChange, ref } }) => (
          <ComboBox
            style={{ flexGrow: '1' }}
            titleText={props.title}
            name={props.name}
            control={props.control}
            controllerName={props.controllerName}
            id={props.name}
            size={'sm'}
            items={filteredBatches || []}
            onChange={(data: { selectedItem?: StockBatchDTO }) => {
              setSelectedItem(data.selectedItem || null);
              props.onBatchNoChanged?.(data.selectedItem);
              onChange(data.selectedItem?.uuid);
            }}
            initialSelectedItem={initialSelectedItem}
            itemToString={(s: StockBatchDTO) => (s?.batchNo ? `${s?.batchNo} | Qty: ${s?.quantity ?? 'Unknown'}` : '')}
            placeholder={props.placeholder}
            invalid={props.invalid}
            invalidText={props.invalidText}
            ref={ref}
          />
        )}
      />
      {isLoading && <InlineLoading status="active" />}
      {validationMessage && (
        <div data-testid="validation-message" style={{ color: 'red', marginTop: '8px' }}>
          {t(validationMessage)}
        </div>
      )}
    </div>
  );
};

export default BatchNoSelector;
