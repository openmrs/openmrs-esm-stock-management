import React, { ReactNode, useMemo } from "react";
import { Control, Controller, FieldValues } from "react-hook-form";
import { ComboBox, InlineLoading } from "@carbon/react";
import { useDebounce } from "../../core/hooks/debounce-hook";
import { useStockItemBatchNos } from "./batch-no-selector.resource";
import { StockBatchDTO } from "../../core/api/types/stockItem/StockBatchDTO";
import first from "lodash-es/first";

interface BatchNoSelectorProps<T> {
  placeholder?: string;
  stockItemUuid: string;
  batchUuid?: string;
  onBatchNoChanged?: (item: StockBatchDTO) => void;
  title?: string;
  invalid?: boolean;
  invalidText?: ReactNode;

  // Control
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
}

const BatchNoSelector = <T,>(props: BatchNoSelectorProps<T>) => {
  const { isLoading, stockItemBatchNos, setSearchString } =
    useStockItemBatchNos(props.stockItemUuid);
  const initialSelectedItem = useMemo(
    () =>
      stockItemBatchNos?.find(
        (stockItem) => stockItem.uuid === props.batchUuid
      ) ?? "",
    [stockItemBatchNos, props.batchUuid]
  );

  const debouncedSearch = useDebounce((query: string) => {
    setSearchString(query);
  }, 500);

  if (isLoading) return <InlineLoading status="active" />;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
      }}
    >
      <Controller
        name={props.controllerName}
        control={props.control}
        render={({ field: { onChange, ref } }) => (
          <ComboBox
            style={{
              flexGrow: "1",
            }}
            titleText={props.title}
            name={props.name}
            control={props.control}
            controllerName={props.controllerName}
            id={props.name}
            size={"sm"}
            items={stockItemBatchNos || []}
            onChange={(data: { selectedItem?: StockBatchDTO }) => {
              props.onBatchNoChanged?.(data.selectedItem);
              onChange(data.selectedItem?.uuid);
            }}
            initialSelectedItem={initialSelectedItem}
            itemToString={(s: StockBatchDTO) => s.batchNo}
            placeholder={props.placeholder}
            invalid={props.invalid}
            invalidText={props.invalidText}
            onInputChange={debouncedSearch}
            ref={ref}
          />
        )}
      />
      {isLoading && <InlineLoading status="active" />}
    </div>
  );
};

export default BatchNoSelector;
