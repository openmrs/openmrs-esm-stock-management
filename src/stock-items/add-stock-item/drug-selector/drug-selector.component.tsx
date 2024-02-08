import React, { ReactNode, useMemo, useState } from "react";
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
  const { isLoading, drugList } = useDrugsHook();

  const [inputValue, setInputValue] = useState("");
  const handleInputChange = (value) => {
    setInputValue(value);
  };
  const filteredDrugs = useMemo(() => {
    return inputValue.trim() === ""
      ? drugList
      : drugList.filter((drug) =>
          drug.name.toLowerCase().includes(inputValue.trim().toLowerCase())
        );
  }, [inputValue, drugList]);

  return (
    <div>
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
            items={filteredDrugs || []}
            initialSelectedItem={
              drugList?.find((p) => p.uuid === props.drugUuid) ?? ""
            }
            itemToString={drugName}
            onChange={(data: { selectedItem: Drug }) => {
              props.onDrugChanged?.(data.selectedItem);
              onChange(data.selectedItem.uuid);
            }}
            onInputChange={(event) => handleInputChange(event)}
            inputValue={inputValue}
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
