import React, { ReactNode } from "react";
import { ComboBox, TextInputSkeleton } from "@carbon/react";
import { useDrugs } from "../../../stock-lookups/stock-lookups.resource";
import { ResourceRepresentation } from "../../../core/api/api";
import { Drug } from "../../../core/api/types/concept/Drug";
import { Control, Controller, FieldValues } from "react-hook-form";

interface DrugSelectorProps<T> {
  placeholder?: string;
  drugUuid?: string;
  onDrugChanged?: (drug: Drug) => void;
  title?: string;
  invalid?: boolean;
  invalidText?: ReactNode;

  // Control
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
}

const DrugSelector = <T,>(props: DrugSelectorProps<T>) => {
  const {
    items: { results: drugList },
    isLoading,
  } = useDrugs({
    v: ResourceRepresentation.Default,
  });

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
          items={drugList || []}
          onChange={(data: { selectedItem: Drug }) => {
            props.onDrugChanged?.(data.selectedItem);
            onChange(data.selectedItem.uuid);
          }}
          initialSelectedItem={
            drugList?.find((p) => p.uuid === props.drugUuid) ?? ""
          }
          itemToString={drugName}
          value={drugList?.find((p) => p.uuid === value)?.display ?? ""}
          placeholder={props.placeholder}
          invalid={props.invalid}
          invalidText={props.invalidText}
          ref={ref}
        />
      )}
    />
  );
};

function drugName(item: Drug): string {
  return item
    ? `${item.name}${item.concept ? ` (${item.concept.display})` : ""}`
    : "";
}

export default DrugSelector;
