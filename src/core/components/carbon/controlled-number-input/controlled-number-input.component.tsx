import React from "react";
import { Control, Controller, FieldValues } from "react-hook-form";
import { NumberInputProps } from "@carbon/react/lib/components/NumberInput/NumberInput";
import { NumberInput } from "@carbon/react";

interface ControlledNumberInputProps<T> extends NumberInputProps {
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
}

const ControlledNumberInput = <T,>(props: ControlledNumberInputProps<T>) => {
  return (
    <Controller
      name={props.controllerName}
      control={props.control}
      render={({ field: { onChange, value, ref } }) => (
        <NumberInput
          {...props}
          onChange={(
            event: React.MouseEvent<HTMLButtonElement>,
            state: {
              value: number | string;
              direction: string;
            }
          ) => {
            onChange(event, state);

            // Fire prop change
            if (props.onChange) {
              props.onChange(event, state);
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

export default ControlledNumberInput;
