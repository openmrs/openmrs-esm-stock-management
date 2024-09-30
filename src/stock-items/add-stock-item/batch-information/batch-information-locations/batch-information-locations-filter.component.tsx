import React, { ReactNode } from 'react';
import { ComboBox } from '@carbon/react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useStockTagLocations } from '../../../../stock-lookups/stock-lookups.resource';

interface BatchInformationLocationsFilterProps<T> {
  onLocationIdChange?: (location: string) => void;
  title?: string;
  placeholder?: string;
  invalid?: boolean;
  invalidText?: ReactNode;

  // Control
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
}

const BatchInformationLocationsFilter = <T,>(props: BatchInformationLocationsFilterProps<T>) => {
  const { t } = useTranslation();

  const { stockLocations } = useStockTagLocations();

  return (
    <Controller
      name={props.controllerName}
      control={props.control}
      render={({ field: { onChange, value, ref } }) => (
        <ComboBox
          titleText={props.title}
          name={props.name}
          control={props.control}
          controllerName={props.controllerName}
          id={props.name}
          size={'md'}
          items={stockLocations ?? []}
          onChange={(data: { selectedItem }) => {
            props.onLocationIdChange?.(data?.selectedItem?.id ?? '');
            onChange(data?.selectedItem?.name || '');
          }}
          initialSelectedItem={`${stockLocations[0]?.name}`}
          itemToString={(item) => t('location', `${item?.name}`)}
          shouldFilterItem={() => true}
          placeholder={props.placeholder}
          ref={ref}
          value={value}
          invalid={props.invalid}
          invalidText={props.invalidText}
        />
      )}
    />
  );
};

export default BatchInformationLocationsFilter;
