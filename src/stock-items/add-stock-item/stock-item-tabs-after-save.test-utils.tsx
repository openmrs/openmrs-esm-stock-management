import { useEffect } from 'react';
import { type Control, type FieldValues, useController } from 'react-hook-form';

interface FieldFillerProps {
  control: Control<FieldValues>;
  controllerName: string;
}

/** A stand-in for a picker that sets its field as if an option had been chosen. */
export function createFieldFiller(value: string) {
  return function FieldFiller({ control, controllerName }: FieldFillerProps) {
    const { field } = useController({ control, name: controllerName });
    useEffect(() => {
      field.onChange(value);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    return null;
  };
}
