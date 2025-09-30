import React, { type ReactNode, useMemo, useState } from 'react';
import { ComboBox, TextInputSkeleton } from '@carbon/react';
import { type Control, Controller, type FieldValues } from 'react-hook-form';
import { type Concept } from '../../../core/api/types/concept/Concept';
import { useConcepts } from '../../../stock-lookups/stock-lookups.resource';

interface ConceptsSelectorProps<T> {
  conceptUuid?: string;
  control: Control<FieldValues, T>;
  controllerName: string;
  invalid?: boolean;
  invalidText?: ReactNode;
  name: string;
  onConceptUuidChange?: (unit: Concept) => void;
  placeholder?: string;
  title?: string;
}

const ConceptsSelector = <T,>(props: ConceptsSelectorProps<T>) => {
  const {
    items: { results: concepts },
    isLoading,
  } = useConcepts({});
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  const filteredConcepts = useMemo(() => {
    return inputValue.trim() === ''
      ? concepts
      : concepts.filter((concept) => concept.display?.toLowerCase().includes(inputValue.trim()?.toLowerCase()));
  }, [inputValue, concepts]);

  if (isLoading) {
    return <TextInputSkeleton />;
  }

  return (
    <Controller
      control={props.control}
      name={props.controllerName}
      render={({ field: { onChange, value, ref } }) => (
        <ComboBox
          id={props.name}
          invalid={props.invalid}
          invalidText={props.invalidText}
          items={filteredConcepts}
          itemToString={(item?: Concept) => item?.display ?? ''}
          name={props.name}
          onChange={(data: { selectedItem: Concept | null }) => {
            if (data.selectedItem) {
              props.onConceptUuidChange?.(data.selectedItem);
              onChange(data.selectedItem.uuid);
            } else {
              onChange('');
            }
          }}
          onInputChange={handleInputChange}
          placeholder={props.placeholder}
          ref={ref}
          selectedItem={concepts?.find((p) => p.uuid === value) ?? null}
          size="md"
          titleText={props.title}
        />
      )}
    />
  );
};

export default ConceptsSelector;
