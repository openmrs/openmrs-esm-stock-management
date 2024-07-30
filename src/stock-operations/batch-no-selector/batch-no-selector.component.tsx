import React, { ReactNode, useEffect, useMemo } from "react";
import { Control, Controller, FieldValues } from "react-hook-form";
import { ComboBox, InlineLoading } from "@carbon/react";
import { useStockItemBatchNos } from "./batch-no-selector.resource";
import { StockBatchDTO } from "../../core/api/types/stockItem/StockBatchDTO";
import { useStockItemBatchInformationHook } from "../../stock-items/add-stock-item/batch-information/batch-information.resource";
import { ResourceRepresentation } from "../../core/api/api";

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
  const { isLoading, stockItemBatchNos } = useStockItemBatchNos(
    props.stockItemUuid
  );
  const initialSelectedItem = useMemo(
    () =>
      stockItemBatchNos?.find(
        (stockItem) => stockItem.uuid === props.batchUuid
      ) ?? "",
    [stockItemBatchNos, props.batchUuid]
  );

  const { items, setStockItemUuid } = useStockItemBatchInformationHook();

  useEffect(() => {
    setStockItemUuid(props.stockItemUuid);
  }, [props.stockItemUuid, setStockItemUuid]);

  const stockItemBatchesInfo = stockItemBatchNos?.map((item) => {
    const matchingBatch = items?.find(
      (batch) => batch.batchNumber === item.batchNo
    );
    if (matchingBatch) {
      return {
        ...item,
        quantity: matchingBatch.quantity ?? "",
      };
    }
    return item;
  });

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
            items={stockItemBatchesInfo || []}
            onChange={(data: { selectedItem?: StockBatchDTO }) => {
              props.onBatchNoChanged?.(data.selectedItem);
              onChange(data.selectedItem?.uuid);
            }}
            initialSelectedItem={initialSelectedItem}
            itemToString={(s: StockBatchDTO) =>
              s?.batchNo ? `${s?.batchNo} | Qty: ${s?.quantity ?? ""}` : ""
            }
            placeholder={props.placeholder}
            invalid={props.invalid}
            invalidText={props.invalidText}
            ref={ref}
          />
        )}
      />
      {isLoading && <InlineLoading status="active" />}
    </div>
  );
};

export default BatchNoSelector;
