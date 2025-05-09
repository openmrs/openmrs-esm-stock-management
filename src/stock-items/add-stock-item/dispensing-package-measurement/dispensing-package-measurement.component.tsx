import React, { type ReactNode, useMemo, useState } from 'react';
import { type Control, Controller, type FieldValues } from 'react-hook-form';
import { type StockItemPackagingUOMDTO } from '../../../core/api/types/stockItem/StockItemPackagingUOM';
import { ComboBox, SelectSkeleton } from '@carbon/react';

interface DispensingPackageMeasurementProps<T> {
  dispensingUnitPackagingUoMUuid?: string;
  onDispensingUnitPackagingUoMUuidChange?: (unit: StockItemPackagingUOMDTO) => void;
  isLoading?: boolean;
  packagingUnits?: StockItemPackagingUOMDTO[];
  title?: string;
  placeholder?: string;
  invalid?: boolean;
  invalidText?: ReactNode;

  // Control
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
}

const DispensingPackageMeasurement = <T,>(props: DispensingPackageMeasurementProps<T>) => {
  const initialSelectedItem = useMemo<StockItemPackagingUOMDTO | null>(
    () =>
      props?.packagingUnits.length > 0
        ? props?.packagingUnits.find((u) => u?.uuid === props?.dispensingUnitPackagingUoMUuid)
        : null,
    [props?.packagingUnits, props?.dispensingUnitPackagingUoMUuid],
  );

  if (props.isLoading) return <SelectSkeleton />;

  if (!(props?.packagingUnits && props?.packagingUnits.length > 0)) return <></>;
  return (
    <div>
      <Controller
        name={props.controllerName}
        control={props.control}
        defaultValue={initialSelectedItem?.uuid ?? ''}
        render={({ field: { onChange, ref } }) => (
          <ComboBox
            titleText={props.title}
            name={props.name}
            control={props.control}
            controllerName={props.controllerName}
            id={props.name}
            size={'sm'}
            items={props.packagingUnits ?? []}
            onChange={(data: { selectedItem?: StockItemPackagingUOMDTO }) => {
              props.onDispensingUnitPackagingUoMUuidChange?.(data?.selectedItem);
              onChange(data?.selectedItem?.uuid);
            }}
            initialSelectedItem={initialSelectedItem}
            itemToString={(s: StockItemPackagingUOMDTO) =>
              s?.packagingUomName ? `${s?.packagingUomName} - ${s?.factor} ` : 'Not set'
            }
            placeholder={props.placeholder}
            invalid={props.invalid}
            invalidText={props.invalidText}
            ref={ref}
          />
        )}
      />
    </div>
  );
};

export default DispensingPackageMeasurement;
