import React from 'react';
import { TextInputSkeleton, ComboBox } from '@carbon/react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { StockSource } from '../../../core/api/types/stockOperation/StockSource';
import { ResourceRepresentation } from '../../../core/api/api';
import { useStockSources } from '../../../stock-sources/stock-sources.resource';
import { Concept } from '../../../core/api/types/concept/Concept';
import { StockItemReferenceDTO } from '../../../core/api/types/stockItem/StockItemReference';

interface StockSourceSelectorProps<T> {
  row?: StockItemReferenceDTO;
  onSourceChange?: (unit: StockSource) => void;
  title?: string;
  placeholder?: string;
  invalid?: boolean;

  // Control
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
}

const StockSourceSelector = <T,>(props: StockSourceSelectorProps<T>) => {
  const {
    items: { results: sourcesList },
    isLoading,
  } = useStockSources({
    v: ResourceRepresentation.Default,
  });
  if (isLoading) return <TextInputSkeleton />;

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
          items={sourcesList || []}
          onChange={(data: { selectedItem: StockSource }) => {
            props.onSourceChange?.(data.selectedItem);
            onChange(data.selectedItem?.uuid);
          }}
          initialSelectedItem={sourcesList?.find((p) => p.uuid === props.row?.uuid) || {}}
          itemToString={(item?: Concept) => (item && item?.name ? `${item?.name}` : '')}
          shouldFilterItem={() => true}
          value={sourcesList?.find((p) => p.uuid === value)?.name ?? ''}
          placeholder={props.placeholder}
          ref={ref}
          invalid={props.invalid}
        />
      )}
    />
  );
};

export default StockSourceSelector;
