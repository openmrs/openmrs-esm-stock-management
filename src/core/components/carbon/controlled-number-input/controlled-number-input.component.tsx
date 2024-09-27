import React from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { NumberInputProps } from '@carbon/react/lib/components/NumberInput/NumberInput';
import { NumberInput } from '@carbon/react';
import { StockItemPackagingUOMDTO } from '../../../api/types/stockItem/StockItemPackagingUOM';

interface ControlledNumberInputProps<T> extends NumberInputProps {
  row?: StockItemPackagingUOMDTO;
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
  hideSteppers?: boolean;
}

const ControlledNumberInput = <T,>(props: ControlledNumberInputProps<T>) => {
  return (
    <Controller
      name={props.controllerName}
      control={props.control}
      render={({ field: { onChange, value, ref } }) => (
        <NumberInput
          disableWheel
          label={props.label}
          id={`${props.name}-${props.id}-${props.row?.uuid}`}
          value={props.row?.factor ?? value}
          min={props.min}
          hideSteppers={props.hideSteppers || false}
          ref={ref}
          onChange={(
            event: React.MouseEvent<HTMLButtonElement>,
            state: {
              value: number | string;
              direction: string;
            },
          ) => {
            onChange(event, state);

            // Fire prop change if props.onChange is defined
            if (props.onChange) {
              props.onChange(event, state);
            }
          }}
        />
      )}
    />
  );
};

export default ControlledNumberInput;
