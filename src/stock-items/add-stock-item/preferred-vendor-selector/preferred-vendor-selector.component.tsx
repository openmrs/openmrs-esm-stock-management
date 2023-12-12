import React, { ReactNode } from "react";
import { Concept } from "../../../core/api/types/concept/Concept";
import { Control, Controller, FieldValues } from "react-hook-form";
import { ComboBox, TextInputSkeleton } from "@carbon/react";
import { useStockSources } from "../../../stock-sources/stock-sources.resource";
import { ResourceRepresentation } from "../../../core/api/api";
import { StockSource } from "../../../core/api/types/stockOperation/StockSource";

interface PreferredVendorSelectorProps<T> {
  preferredVendorUuid?: string;
  onPreferredVendorChange?: (unit: StockSource) => void;
  title?: string;
  placeholder?: string;
  invalid?: boolean;
  invalidText?: ReactNode;

  // Control
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
}

const PreferredVendorSelector = <T,>(
  props: PreferredVendorSelectorProps<T>
) => {
  const {
    items: { results: sourcesList },
    isLoading,
  } = useStockSources({
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
          items={sourcesList || []}
          onChange={(data: { selectedItem: StockSource }) => {
            props.onPreferredVendorChange?.(data.selectedItem);
            onChange(data.selectedItem?.uuid);
          }}
          initialSelectedItem={
            sourcesList?.find((p) => p.uuid === props.preferredVendorUuid) || {}
          }
          itemToString={(item?: Concept) =>
            item && item?.name ? `${item?.name}` : ""
          }
          shouldFilterItem={() => true}
          value={sourcesList?.find((p) => p.uuid === value)?.name ?? ""}
          placeholder={props.placeholder}
          ref={ref}
          invalid={props.invalid}
          invalidText={props.invalidText}
        />
      )}
    />
  );
};

export default PreferredVendorSelector;
