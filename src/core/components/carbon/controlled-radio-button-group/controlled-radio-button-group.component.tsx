import React from 'react';
import { type RadioButtonGroupProps } from '@carbon/react/lib/components/RadioButtonGroup/RadioButtonGroup';
import { type Control, Controller, type FieldValues } from 'react-hook-form';
import { RadioButtonGroup, RadioButton } from '@carbon/react';
import { type RadioOption } from '../../../../stock-items/add-stock-item/stock-item-details/stock-item-details.resource';

interface ControlledRadioButtonGroupProps<T> extends RadioButtonGroupProps {
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
  options: RadioOption[]; // Change the type to RadioOption[]
}

const ControlledRadioButtonGroup = <T,>(props: ControlledRadioButtonGroupProps<T>) => {
  return (
    <Controller
      name={props.controllerName}
      control={props.control}
      render={({ field: { onChange, value, ref } }) => (
        <RadioButtonGroup
          {...props}
          onChange={(selectedValue: string, name: string, event: React.ChangeEvent<HTMLInputElement>) => {
            onChange(selectedValue, name, event);

            // Fire prop change
            if (props.onChange) {
              props.onChange(selectedValue, name, event);
            }
          }}
          id={props.name}
          ref={ref}
          defaultSelected={props.id}
          value={value}
        >
          {props.options.map((option, index) => (
            <RadioButton
              key={`${index}-${props.name}-${option.value}`}
              id={`${props.name}-${option.value}`}
              labelText={option.label}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              ref={ref}
            />
          ))}
        </RadioButtonGroup>
      )}
    />
  );
};

export default ControlledRadioButtonGroup;
