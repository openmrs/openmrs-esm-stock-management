import React, { ReactNode } from "react";
import { Control, Controller, FieldValues } from "react-hook-form";
import { StockItemPackagingUOMDTO } from "../../../core/api/types/stockItem/StockItemPackagingUOM";
import { Select, SelectItem, SelectSkeleton } from "@carbon/react";

interface DispensingPackageMeasurementProps<T> {
  dispensingUnitPackagingUoMUuid?: string;
  onDispensingUnitPackagingUoMUuidChange?: (
    unit: StockItemPackagingUOMDTO
  ) => void;
  isLoading?: boolean;
  packagingUnits?: StockItemPackagingUOMDTO[];
  title?: string;
  placeholder?: string;
  invalid?: boolean;
  invalidText?: ReactNode;

  // Control
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
}

const DispensingPackageMeasurement = <T,>(
  props: DispensingPackageMeasurementProps<T>
) => {
  if (props.isLoading) return <SelectSkeleton />;

  if (!(props.packagingUnits && props.packagingUnits.length > 0)) return <></>;
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
          onChange={(data: { selectedItem?: StockItemPackagingUOMDTO }) => {
            props.onDispensingUnitPackagingUoMUuidChange?.(data?.selectedItem);
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
          {props.packagingUnits?.map((uom) => {
            return (
              <SelectItem
                key={uom.uuid}
                value={uom.uuid}
                text={uom.packagingUomName ?? ""}
              />
            );
          })}
        </Select>
      )}
    />
  );
};

export default DispensingPackageMeasurement;
