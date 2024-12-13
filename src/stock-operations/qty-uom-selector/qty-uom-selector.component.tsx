import React, { ReactNode, useEffect, useMemo } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { StockItemPackagingUOMDTO } from '../../core/api/types/stockItem/StockItemPackagingUOM';
import { ComboBox, SkeletonText } from '@carbon/react';
import { useStockItem } from '../../stock-items/stock-items.resource';

interface QtyUomSelectorProps<T> {
  placeholder?: string;
  stockItemUuid: string;
  stockItemPackagingUOMUuid?: string;
  onStockPackageChanged?: (item: StockItemPackagingUOMDTO) => void;
  title?: string;
  invalid?: boolean;
  invalidText?: ReactNode;

  // Control
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
}

const QtyUomSelector = <T,>(props: QtyUomSelectorProps<T>) => {
  const { isLoading, error, item } = useStockItem(props.stockItemUuid ?? props['uuid']);
  const initialSelectedItem = useMemo<StockItemPackagingUOMDTO | null>(
    () => (item?.packagingUnits?.length > 0 ? item.packagingUnits[0] : null),
    [item?.packagingUnits],
  );

  if (isLoading || error) return <SkeletonText />;

  return (
    <Controller
      name={props.controllerName}
      control={props.control}
      defaultValue={initialSelectedItem.uuid ?? ''}
      render={({ field: { onChange, ref }, fieldState: { error } }) => (
        <ComboBox
          titleText={props.title}
          name={props.name}
          id={props.name}
          items={item?.packagingUnits ?? []}
          onChange={(data: { selectedItem?: StockItemPackagingUOMDTO }) => {
            props.onStockPackageChanged?.(data.selectedItem);
            onChange(data.selectedItem?.uuid);
          }}
          initialSelectedItem={initialSelectedItem}
          itemToString={(s: StockItemPackagingUOMDTO) =>
            s.packagingUomName ? `${s?.packagingUomName} - ${s?.factor} ` : ''
          }
          placeholder={props.placeholder}
          invalid={props.invalid ?? error?.message}
          invalidText={props.invalidText ?? error?.message}
          ref={ref}
        />
      )}
    />
  );
};

export default QtyUomSelector;
