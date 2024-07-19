import React, { ReactNode, useState } from "react";
import { ComboBox, InlineLoading } from "@carbon/react";
import { Drug } from "../../../core/api/types/concept/Drug";
import { Control, Controller, FieldValues } from "react-hook-form";
import { useDrugsHook } from "./drug-selector.resource";
import { fetchStockItem } from "../../stock-items.resource";

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
  const [inputValue, setInputValue] = useState("");
  const { isLoading, drugList } = useDrugsHook(inputValue);
  const [showExistenceError, setShowExistenceError] = useState(false);

  const handleInputChange = (value) => {
    setInputValue(value);
  };

  const checkDrugExistence = (drugUuid?: string | null) => {
    if (!drugUuid) return;

    fetchStockItem(drugUuid).then((result: any) => {
      const itemExists = (result?.results?.length ?? 0) !== 0;
      setShowExistenceError(itemExists);
    });
  };

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
            items={drugList || []}
            initialSelectedItem={
              drugList?.find((p) => p.uuid === props.drugUuid) ?? ""
            }
            itemToString={drugName}
            onChange={(data: { selectedItem: Drug }) => {
              setShowExistenceError(false);
              props.onDrugChanged?.(data.selectedItem);
              onChange(data?.selectedItem?.uuid);
              if (data?.selectedItem?.uuid) {
                checkDrugExistence(data?.selectedItem?.uuid);
              }
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
      {showExistenceError && (
        <div style={{ color: "#da1e28" }}>Item already exits</div>
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
