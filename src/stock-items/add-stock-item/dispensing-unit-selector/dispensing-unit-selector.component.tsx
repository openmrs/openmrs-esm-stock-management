import React, { forwardRef, ReactNode } from "react";
import { ComboBox, TextInputSkeleton } from "@carbon/react";
import { useConceptById } from "../../../stock-lookups/stock-lookups.resource";
import { DISPENSING_UNITS_CONCEPT_ID } from "../../../constants";
import { Concept } from "../../../core/api/types/concept/Concept";

interface DispensingUnitSelectorProps {
  dispensingUnitUuid?: string;
  onDispensingUnitChange?: (unit: Concept) => void;
  title?: string;
  placeholder?: string;
  invalid?: boolean;
  invalidText?: ReactNode;
}

const DispensingUnitSelector = forwardRef<never, DispensingUnitSelectorProps>(
  (
    {
      title,
      onDispensingUnitChange,
      dispensingUnitUuid,
      placeholder,
      invalid,
      invalidText,
    },
    ref
  ) => {
    const {
      items: { setMembers: dispensingUnits },
      isLoading,
    } = useConceptById(DISPENSING_UNITS_CONCEPT_ID);

    if (isLoading) return <TextInputSkeleton />;

    return (
      <ComboBox
        titleText={title}
        name="dispensingUnitUuid"
        className="select-field"
        id="dispensingUnitUuid"
        items={dispensingUnits || []}
        onChange={onDispensingUnitChange}
        initialSelectedItem={
          dispensingUnits?.find((p) => p.uuid === dispensingUnitUuid) || {}
        }
        itemToString={(item?: Concept) =>
          item && item?.display ? `${item?.display}` : ""
        }
        shouldFilterItem={() => true}
        placeholder={placeholder}
        ref={ref}
        invalid={invalid}
        invalidText={invalidText}
      />
    );
  }
);

export default DispensingUnitSelector;
