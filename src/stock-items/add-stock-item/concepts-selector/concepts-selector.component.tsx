import React, { type ReactNode, useMemo, useState } from 'react';
import { type Concept } from '../../../core/api/types/concept/Concept';
import { type Control, Controller, type FieldValues } from 'react-hook-form';
import { useConcepts } from '../../../stock-lookups/stock-lookups.resource';
import { ComboBox, TextInputSkeleton } from '@carbon/react';

interface ConceptsSelectorProps<T> {
  conceptUuid?: string;
  onConceptUuidChange?: (unit: Concept) => void;
  title?: string;
  placeholder?: string;
  invalid?: boolean;
  invalidText?: ReactNode;

  // Control
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
}

const ConceptsSelector = <T,>(props: ConceptsSelectorProps<T>) => {
  const {
    items: { results: concepts },
    isLoading,
  } = useConcepts({});
  const [inputValue, setInputValue] = useState('');
  const handleInputChange = (value) => {
    setInputValue(value);
  };

  const filteredConcepts = useMemo(() => {
    return inputValue.trim() === ''
      ? concepts
      : concepts.filter((concept) => concept.display?.toLowerCase().includes(inputValue.trim()?.toLowerCase()));
  }, [inputValue, concepts]);

  if (isLoading) return <TextInputSkeleton />;

  return (
    <Controller
      name={props.controllerName}
      control={props.control}
      render={({ field: { onChange, ref } }) => (
        <ComboBox
          titleText={props.title}
          name={props.name}
          control={props.control}
          controllerName={props.controllerName}
          id={props.name}
          size={'md'}
          items={filteredConcepts}
          onChange={(data: { selectedItem: Concept }) => {
            props.onConceptUuidChange?.(data.selectedItem);
            onChange(data.selectedItem.uuid);
          }}
          initialSelectedItem={concepts?.find((p) => p.uuid === props.conceptUuid) || {}}
          itemToString={(item?: Concept) => (item && item?.display ? `${item?.display}` : '')}
          shouldFilterItem={() => true}
          onInputChange={(event) => handleInputChange(event)}
          inputValue={inputValue}
          placeholder={props.placeholder}
          ref={ref}
          invalid={props.invalid}
          invalidText={props.invalidText}
        />
      )}
    />
  );
};

export default ConceptsSelector;
