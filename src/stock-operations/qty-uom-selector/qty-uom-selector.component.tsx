import React, { ReactNode, useMemo } from "react";
import { Control, Controller, FieldValues } from "react-hook-form";
import { StockItemPackagingUOMDTO } from "../../core/api/types/stockItem/StockItemPackagingUOM";
import { SkeletonText, TextInput } from "@carbon/react";
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
  const initialSelectedItem = useMemo<StockItemPackagingUOMDTO | null>(
    () => (item?.packagingUnits?.length > 0 ? item.packagingUnits[0] : null),
    [item?.packagingUnits]
  );

  if (isLoading || isError) return <SkeletonText />;

  return (
    <div>
      <Controller
        name={props.controllerName}
        control={props.control}
        defaultValue={initialSelectedItem?.uuid ?? ""}
        render={({ field: { ref } }) => (
          <TextInput
            titleText={props.title}
            name={props.name}
            id={props.name}
            size={"sm"}
            value={
              initialSelectedItem
                ? `${initialSelectedItem?.packagingUomName} - ${initialSelectedItem?.factor}`
                : ""
            }
            placeholder={props.placeholder}
            invalid={props.invalid}
            invalidText={props.invalidText}
            readOnly
            ref={ref}
          />
        )}
      />
    </div>
  );
};

export default QtyUomSelector;
