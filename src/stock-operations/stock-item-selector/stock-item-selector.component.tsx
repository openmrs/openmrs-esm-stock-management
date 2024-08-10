import React, { ReactNode } from "react";
import { Control, Controller, FieldValues } from "react-hook-form";
import { ComboBox, InlineLoading } from "@carbon/react";
import { StockItemDTO } from "../../core/api/types/stockItem/StockItem";
import { useStockItems } from "./stock-item-selector.resource";
import { useDebounce } from "../../core/hooks/debounce-hook";

interface StockItemSelectorProps<T> {
  placeholder?: string;
  stockItemUuid?: string;
  onStockItemChanged?: (item: StockItemDTO) => void;
  title?: string;
  invalid?: boolean;
  invalidText?: ReactNode;

  // Control
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
}

const StockItemSelector = <T,>(props: StockItemSelectorProps<T>) => {
  const { isLoading, stockItemsList, setSearchString } = useStockItems({});

  const debouncedSearch = useDebounce((query: string) => {
    setSearchString(query);
  }, 500);
  console.log(props)
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
            size={"sm"}
            items={stockItemsList || []}
            onChange={(data: { selectedItem: StockItemDTO }) => {
              props.onStockItemChanged?.(data.selectedItem);
              onChange(data.selectedItem?.uuid);
            }}
            initialSelectedItem={
              stockItemsList?.find((p) => p.uuid === props.stockItemUuid) ?? ""
            }
            itemToString={stockItemName}
            onInputChange={debouncedSearch}
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

function stockItemName(item: StockItemDTO): string {
  return item.drugName || item.conceptName;
}

export default StockItemSelector;
