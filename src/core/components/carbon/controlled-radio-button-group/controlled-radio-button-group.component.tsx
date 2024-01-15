import React from "react";
import { RadioButtonGroupProps } from "@carbon/react/lib/components/RadioButtonGroup/RadioButtonGroup";
import { Control, Controller, FieldValues } from "react-hook-form";
import { RadioButtonGroup, RadioButton } from "@carbon/react";
import { radioOptions } from "../../../../stock-items/add-stock-item/stock-item-details/stock-item-details.resource";

interface ControlledRadioButtonGroupProps<T> extends RadioButtonGroupProps {
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
  defaultValue?: string;
  options: any[];
}

const ControlledRadioButtonGroup = <T,>(
  props: ControlledRadioButtonGroupProps<T>
) => {
  return (
    <Controller
      name={props.controllerName}
      control={props.control}
      defaultValue={props.defaultValue}
      render={({ field: { onChange, value, ref } }) => (
        <RadioButtonGroup
          {...props}
          onChange={(selection: boolean, name: string, event: unknown) => {
            onChange(selection, name, event);

            // Fire prop change
            if (props.onChange) {
              props.onChange(selection, name, event);
            }
          }}
          id={props.name}
          ref={ref}
          defaultSelected={props.id}
          value={value}
        >
          {radioOptions.map((option) => (
            <RadioButton
              key={option.value}
              id={`${name}-${option.value}`}
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
