import React, { ReactNode } from "react";
import { Control, Controller, FieldValues } from "react-hook-form";
import { Concept } from "../../core/api/types/concept/Concept";
import { ComboBox, SelectSkeleton } from "@carbon/react";
import { useConceptById } from "../../stock-lookups/stock-lookups.resource";
import { STOCK_ADJUSTMENT_REASON_CODED_CONCEPT_ID } from "../../constants";
import { StockOperationDTO } from "../../core/api/types/stockOperation/StockOperationDTO";

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
  model: StockOperationDTO;
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
      render={({ field: { onChange, ref } }) => (
        <ComboBox
          labelText={props.title}
          placeholder={props.placeholder}
          name={props.name}
          controllerName={props.controllerName}
          id={props.name}
          size={"md"}
          items={reasons}
          initialSelectedItem={
            reasons?.find((p) => p.uuid === props.reasonUuid) || {}
          }
          itemToString={(item?: Concept) =>
            item && item?.display ? `${item?.display}` : ""
          }
          onChange={(data: { selectedItem?: Concept }) => {
            props.onReasonChange?.(data?.selectedItem);
            onChange(data?.selectedItem?.uuid);
          }}
          ref={ref}
          invalid={props.invalid}
          invalidText={props.invalidText}
          value={props.model.reasonName}
        />
      )}
    />
  );
};

export default StockOperationReasonSelector;
