import React, { ReactNode } from "react";
import { ComboBox, TextInputSkeleton } from "@carbon/react";
import { useConcept } from "../../../stock-lookups/stock-lookups.resource";
import { Concept } from "../../../core/api/types/concept/Concept";
import { Control, Controller, FieldValues } from "react-hook-form";
import { type ConfigObject } from "../../../config-schema";
import { useConfig } from "@openmrs/esm-framework";

interface DispensingUnitSelectorProps<T> {
  dispensingUnitUuid?: string;
  onDispensingUnitChange?: (unit: Concept) => void;
  title?: string;
  placeholder?: string;
  invalid?: boolean;
  invalidText?: ReactNode;

  // Control
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
}

const DispensingUnitSelector = <T,>(props: DispensingUnitSelectorProps<T>) => {
  const { dispensingUnitsUUID } = useConfig<ConfigObject>();
  const {
    items: { setMembers: dispensingUnits },
    isLoading,
  } = useConcept(dispensingUnitsUUID);

  if (isLoading) return <TextInputSkeleton />;

  return (
    <Controller
      name={props.controllerName}
      control={props.control}
      render={({ field: { onChange, value, ref } }) => (
        <ComboBox
          titleText={props.title}
          name={props.name}
          control={props.control}
          controllerName={props.controllerName}
          id={props.name}
          size={"md"}
          items={dispensingUnits || []}
          onChange={(data: { selectedItem: Concept }) => {
            props.onDispensingUnitChange?.(data.selectedItem);
            onChange(data.selectedItem.uuid);
          }}
          initialSelectedItem={
            dispensingUnits?.find((p) => p.uuid === props.dispensingUnitUuid) ||
            {}
          }
          itemToString={(item?: Concept) =>
            item && item?.display ? `${item?.display}` : ""
          }
          shouldFilterItem={() => true}
          value={dispensingUnits?.find((p) => p.uuid === value)?.display ?? ""}
          placeholder={props.placeholder}
          ref={ref}
          invalid={props.invalid}
          invalidText={props.invalidText}
        />
      )}
    />
  );
};

export default DispensingUnitSelector;
