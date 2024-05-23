import React, { ChangeEvent } from "react";
import { Control, Controller, FieldValues } from "react-hook-form";
import { TextInput } from "@carbon/react";
import { TextInputProps } from "@carbon/react/lib/components/TextInput/TextInput";

interface ControlledTextInputProps<T> extends TextInputProps {
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
}

const ControlledTextInput = <T,>(props: ControlledTextInputProps<T>) => {
  return (
    <Controller
      name={props.controllerName}
      control={props.control}
      render={({ field: { onChange, value, ref } }) => (
        <TextInput
          {...props}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            onChange(e.target.value);

            // Fire prop change
            if (props.onChange) {
              props.onChange(e);
            }
          }}
          id={props.id}
          ref={ref}
          value={value}
        />
      )}
    />
  );
};

export default ControlledTextInput;
