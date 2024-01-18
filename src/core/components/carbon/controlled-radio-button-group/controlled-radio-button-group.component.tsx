import React from "react";
import { RadioButtonGroupProps } from "@carbon/react/lib/components/RadioButtonGroup/RadioButtonGroup";
import { Control, Controller, FieldValues } from "react-hook-form";
import { RadioButtonGroup, RadioButton } from "@carbon/react";
import {
  RadioOption,
  radioOptions,
} from "../../../../stock-items/add-stock-item/stock-item-details/stock-item-details.resource";

interface ControlledRadioButtonGroupProps<T> extends RadioButtonGroupProps {
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
  defaultValue?: string;
  radioOptions: RadioOption[];
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
        <RadioButtonGroup id={props.name}>
          {radioOptions.map((option: RadioOption, index) => (
            <RadioButton
              {...props}
              key={`${index}-${option.value}`}
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
