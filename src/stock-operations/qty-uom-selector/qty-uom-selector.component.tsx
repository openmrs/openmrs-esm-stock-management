import React, { ReactNode } from "react";
import { Control, Controller, FieldValues } from "react-hook-form";
import { StockItemPackagingUOMDTO } from "../../core/api/types/stockItem/StockItemPackagingUOM";
import { ComboBox, SkeletonText } from "@carbon/react";
import { useStockItem } from "../../stock-items/stock-items.resource";

interface QtyUomSelectorProps<T> {
  placeholder?: string;
  stockItemUuid: string;
  stockItemPackagingUOMUuid?: string;
  onStockPackageChanged?: (item: StockItemPackagingUOMDTO) => void;
  title?: string;
  invalid?: boolean;
  invalidText?: ReactNode;

  // Control
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
}

const QtyUomSelector = <T,>(props: QtyUomSelectorProps<T>) => {
  const { isLoading, isError, item } = useStockItem(props.stockItemUuid);

  if (isLoading || isError) return <SkeletonText />;

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
            size={"sm"}
            items={item.packagingUnits || []}
            onChange={(data: { selectedItem?: StockItemPackagingUOMDTO }) => {
              props.onStockPackageChanged?.(data.selectedItem);
              onChange(data.selectedItem.uuid);
            }}
            initialSelectedItem={
              item.packagingUnits?.find(
                (p) => p.uuid === props.stockItemUuid
              ) ?? ""
            }
            itemToString={(s: StockItemPackagingUOMDTO) => s.packagingUomName}
            placeholder={props.placeholder}
            invalid={props.invalid}
            invalidText={props.invalidText}
            ref={ref}
          />
        )}
      />
    </div>
  );
};

export default QtyUomSelector;
