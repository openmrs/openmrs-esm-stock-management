import React from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { ComboBox } from '@carbon/react';

interface ControlledComboBoxProps<T> {
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
  onChange?: (e: { selectedItem: never }) => void;
}

const ControlledComboBox = <T,>(props: ControlledComboBoxProps<T>) => {
  return (
    <Controller
      name={props.controllerName}
      control={props.control}
      render={({ field: { onChange, value, ref } }) => (
        <ComboBox
          {...props}
          onChange={(e: { selectedItem: never }) => {
            onChange(e);

            // Fire prop change
            if (props.onChange) {
              props.onChange(e);
            }
          }}
          id={props.name}
          ref={ref}
          value={value}
        />
      )}
    />
  );
};

export default ControlledComboBox;
