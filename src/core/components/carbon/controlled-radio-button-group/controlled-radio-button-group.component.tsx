import React from "react";
import { RadioButtonGroupProps } from "@carbon/react/lib/components/RadioButtonGroup/RadioButtonGroup";
import { Control, Controller, FieldValues } from "react-hook-form";
import { RadioButtonGroup } from "@carbon/react";

interface ControlledRadioButtonGroupProps<T> extends RadioButtonGroupProps {
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
}

const ControlledRadioButtonGroup = <T,>(
  props: ControlledRadioButtonGroupProps<T>
) => {
  return (
    <Controller
      name={props.controllerName}
      control={props.control}
      render={({ field: { onChange, value, ref } }) => (
        <RadioButtonGroup
          {...props}
          onChange={(selection: unknown, name: string, event: unknown) => {
            onChange(selection, name, event);

            // Fire prop change
            if (props.onChange) {
              props.onChange(selection, name, event);
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

export default ControlledRadioButtonGroup;
