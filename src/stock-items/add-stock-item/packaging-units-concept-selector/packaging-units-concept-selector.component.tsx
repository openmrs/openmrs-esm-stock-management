import React, { ReactNode } from "react";
import { Concept } from "../../../core/api/types/concept/Concept";
import { Control, Controller, FieldValues } from "react-hook-form";
import { useConceptById } from "../../../stock-lookups/stock-lookups.resource";
import { PACKAGING_UNITS_CODED_CONCEPT_ID } from "../../../constants";
import { ComboBox, TextInputSkeleton } from "@carbon/react";

interface PackagingUnitsConceptSelectorProps<T> {
  packageUnitUuid?: string;
  onPackageUnitChange?: (unit: Concept) => void;
  title?: string;
  placeholder?: string;
  invalid?: boolean;
  invalidText?: ReactNode;

  // Control
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
}

const PackagingUnitsConceptSelector = <T,>(
  props: PackagingUnitsConceptSelectorProps<T>
) => {
  const {
    items: { answers: dispensingUnits },
    isLoading,
  } = useConceptById(PACKAGING_UNITS_CODED_CONCEPT_ID);

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
          items={dispensingUnits || []}
          onChange={(data: { selectedItem: Concept }) => {
            props.onPackageUnitChange?.(data.selectedItem);
            onChange(data.selectedItem.uuid);
          }}
          initialSelectedItem={
            dispensingUnits?.find((p) => p.uuid === props.packageUnitUuid) || {}
          }
          itemToString={(item?: Concept) =>
            item && item?.display ? `${item?.display}` : ""
          }
          shouldFilterItem={() => true}
          value={dispensingUnits?.find((p) => p.uuid === value)?.display ?? ""}
          placeholder={props.placeholder}
          ref={ref}
          invalid={props.invalid}
          invalidText={props.invalidText}
        />
      )}
    />
  );
};

export default PackagingUnitsConceptSelector;
