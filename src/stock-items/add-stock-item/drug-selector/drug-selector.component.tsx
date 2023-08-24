import React, { ReactNode } from "react";
import { ComboBox, InlineLoading } from "@carbon/react";
import { Drug } from "../../../core/api/types/concept/Drug";
import { Control, Controller, FieldValues } from "react-hook-form";
import { useDrugsHook } from "./drug-selector.resource";

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
  const { isLoading, drugList, setSearchString } = useDrugsHook();

  return (
    <div>
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
            onInputChange={setSearchString}
            placeholder={props.placeholder}
            invalid={props.invalid}
            invalidText={props.invalidText}
            ref={ref}
          />
        )}
      />
      {isLoading && (
        <InlineLoading
          status="active"
          iconDescription="Searching"
          description="Searching..."
        />
      )}
    </div>
  );
};

function drugName(item: Drug): string {
  return item
    ? `${item.name}${item.concept ? ` (${item.concept.display})` : ""}`
    : "";
}

export default DrugSelector;
