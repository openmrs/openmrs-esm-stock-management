import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import styles from "./stock-item-selector.scss";
import { Drug } from "../../core/api/types/concept/Drug";
import { Control, Controller, FieldValues } from "react-hook-form";
import { useDrugsHook } from "../../stock-items/add-stock-item/drug-selector/drug-selector.resource";
import { ComboBox, InlineLoading } from "@carbon/react";
import { StockItemDTO } from "../../core/api/types/stockItem/StockItem";
import { useStockItems } from "./stock-item-selector.resource";

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
              onChange(data.selectedItem.uuid);
            }}
            initialSelectedItem={
              stockItemsList?.find((p) => p.uuid === props.stockItemUuid) ?? ""
            }
            itemToString={stockItemName}
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

function stockItemName(item: StockItemDTO): string {
  return item.drugName || item.conceptName;
}

export default StockItemSelector;
