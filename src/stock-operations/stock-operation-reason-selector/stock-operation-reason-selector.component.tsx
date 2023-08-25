import React, { ReactNode } from "react";
import { Control, Controller, FieldValues } from "react-hook-form";
import { Concept } from "../../core/api/types/concept/Concept";
import { Select, SelectItem, SelectSkeleton } from "@carbon/react";
import { useConceptById } from "../../stock-lookups/stock-lookups.resource";
import { STOCK_ADJUSTMENT_REASON_CODED_CONCEPT_ID } from "../../constants";

interface StockOperationReasonSelectorProps<T> {
  reasonUuid?: string;
  onReasonChange?: (reason: Concept) => void;
  title?: string;
  placeholder?: string;
  invalid?: boolean;
  invalidText?: ReactNode;

  // Control
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
}

const StockOperationReasonSelector = <T,>(
  props: StockOperationReasonSelectorProps<T>
) => {
  const {
    isLoading,
    isError,
    items: { answers: reasons },
  } = useConceptById(STOCK_ADJUSTMENT_REASON_CODED_CONCEPT_ID);

  if (isLoading || isError) return <SelectSkeleton />;

  return (
    <Controller
      name={props.controllerName}
      control={props.control}
      render={({ field: { onChange, value, ref } }) => (
        <Select
          labelText={props.title}
          name={props.name}
          control={props.control}
          controllerName={props.controllerName}
          id={props.name}
          size={"md"}
          onChange={(data: { selectedItem?: Concept }) => {
            props.onReasonChange?.(data?.selectedItem);
            onChange(data?.selectedItem?.uuid);
          }}
          ref={ref}
          value={value || ""}
          invalid={props.invalid}
          invalidText={props.invalidText}
        >
          {props.placeholder && (
            <SelectItem disabled hidden value={null} text={props.placeholder} />
          )}
          {reasons?.map((reason) => {
            return (
              <SelectItem
                key={reason.uuid}
                value={reason.uuid}
                text={reason.display ?? ""}
              />
            );
          })}
        </Select>
      )}
    />
  );
};

export default StockOperationReasonSelector;
