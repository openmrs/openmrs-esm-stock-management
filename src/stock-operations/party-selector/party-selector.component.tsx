import React, { ReactNode } from "react";
import { Concept } from "../../core/api/types/concept/Concept";
import { Control, Controller, FieldValues } from "react-hook-form";
import { Party } from "../../core/api/types/Party";
import { useParties } from "../../stock-lookups/stock-lookups.resource";
import { ComboBox, TextInputSkeleton } from "@carbon/react";

interface PartySelectorProps<T> {
  partyUuid?: string;
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
  const {
    items: { results: parties },
    isLoading,
    isError,
  } = useParties();

  if (isLoading || isError) return <TextInputSkeleton />;

  let filteredParties = [...parties];
  if (props.filter) {
    filteredParties = parties.filter(props.filter);
  }

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
          items={parties || []}
          onChange={(data: { selectedItem: Party }) => {
            props.onPartyChange?.(data.selectedItem);
            onChange(data.selectedItem.uuid);
          }}
          initialSelectedItem={
            filteredParties?.find((p) => p.uuid === props.partyUuid) || {}
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
