import React, { ReactNode, useEffect } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { Party } from '../../core/api/types/Party';
import { ComboBox } from '@carbon/react';

interface PartySelectorProps<T> {
  partyUuid?: string;
  parties: Party[];
  onPartyChange?: (party: Party) => void;
  title?: string;
  placeholder?: string;
  invalid?: boolean;
  invalidText?: ReactNode;
  filterFunction?: (party: Party) => boolean;

  // Control
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
}

const PartySelector = <T,>(props: PartySelectorProps<T>) => {
  return (
    <Controller
      name={props.controllerName}
      control={props.control}
      render={({ field: { onChange, value, ref } }) => {
        const selectedParty = props.parties.find((p) => p.uuid === props.partyUuid);

        if (selectedParty && !value) {
          onChange(selectedParty.uuid);
        }
        return (
          <ComboBox
            titleText={props.title}
            name={props.name}
            id={props.name}
            size={'md'}
            items={props.parties}
            onChange={(data: { selectedItem: Party }) => {
              props.onPartyChange?.(data.selectedItem);
              onChange(data.selectedItem?.uuid);
            }}
            initialSelectedItem={selectedParty}
            selectedItem={props.parties.find((p) => p.uuid === value)}
            itemToString={(item?: Party) => (item && item?.name ? `${item?.name}` : '')}
            shouldFilterItem={() => true}
            placeholder={props.placeholder}
            ref={ref}
            invalid={props.invalid}
            invalidText={props.invalidText}
          />
        );
      }}
    />
  );
};

export default PartySelector;
