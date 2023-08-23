import React, { forwardRef, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ComboBox, TextInputSkeleton } from "@carbon/react";
import { useDrugs } from "../../../stock-lookups/stock-lookups.resource";
import { ResourceRepresentation } from "../../../core/api/api";
import { Drug } from "../../../core/api/types/concept/Drug";

interface DrugSelectorProps {
  name?: string;
  drugUuid?: string;
  onDrugChanged?: (drug: Drug) => void;
  title?: string;
  invalid?: boolean;
  invalidText?: ReactNode;
}

const DrugSelector = forwardRef<never, DrugSelectorProps>(
  ({ drugUuid, onDrugChanged, title, invalid, invalidText, name }, ref) => {
    const { t } = useTranslation();

    const {
      items: { results: drugList },
      isLoading,
    } = useDrugs({
      v: ResourceRepresentation.Default,
    });

    if (isLoading) return <TextInputSkeleton />;

    return (
      <ComboBox
        titleText={title}
        name={name}
        className="select-field"
        id="drugUuid"
        size={"md"}
        items={drugList || []}
        onChange={onDrugChanged}
        initialSelectedItem={drugList?.find((p) => p.uuid === drugUuid) ?? ""}
        itemToString={drugName}
        placeholder={t(
          "stockmanagement.stockitem.edit.drugholder",
          "Choose a drug"
        )}
        invalid={invalid}
        invalidText={invalidText}
        ref={ref}
      />
    );
  }
);

function drugName(item: Drug): string {
  return item
    ? `${item.name}${item.concept ? ` (${item.concept.display})` : ""}`
    : "";
}

export default DrugSelector;
