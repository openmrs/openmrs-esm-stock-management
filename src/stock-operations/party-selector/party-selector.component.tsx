import React, { ReactNode } from "react";
import { Concept } from "../../core/api/types/concept/Concept";
import { Control, Controller, FieldValues } from "react-hook-form";
import { Party } from "../../core/api/types/Party";
import { ComboBox } from "@carbon/react";

interface PartySelectorProps<T> {
  partyUuid?: string;
  parties: Party[];
  onPartyChange?: (unit: Party) => void;
  title?: string;
  placeholder?: string;
  invalid?: boolean;
  invalidText?: ReactNode;
  filter?: (party: Party) => boolean;

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
      render={({ field: { onChange, ref } }) => (
        <ComboBox
          titleText={props.title}
          name={props.name}
          control={props.control}
          controllerName={props.controllerName}
          id={props.name}
          size={"md"}
          items={props.parties}
          onChange={(data: { selectedItem: Party }) => {
            props.onPartyChange?.(data.selectedItem);
            onChange(data.selectedItem.uuid);
          }}
          initialSelectedItem={
            props.parties?.find((p) => p.uuid === props.partyUuid) || {}
          }
          itemToString={(item?: Concept) =>
            item && item?.name ? `${item?.name}` : ""
          }
          shouldFilterItem={() => true}
          placeholder={props.placeholder}
          ref={ref}
          invalid={props.invalid}
          invalidText={props.invalidText}
        />
      )}
    />
  );
};

export default PartySelector;
