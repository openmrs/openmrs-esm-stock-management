import React from "react";
import { Control, Controller, FieldValues } from "react-hook-form";
import {
  DropdownProps,
  OnChangeData,
} from "@carbon/react/lib/components/Dropdown/Dropdown";
import { TextInput } from "@carbon/react";

interface ControlledDropdownProps<T, K> extends DropdownProps<K> {
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
}

const ControlledDropdown = <T, K>(props: ControlledDropdownProps<T, K>) => {
  return (
    <Controller
      name={props.controllerName}
      control={props.control}
      render={({ field: { onChange, value, ref } }) => (
        <TextInput
          {...props}
          onChange={(e: OnChangeData<K>) => {
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

export default ControlledDropdown;
