import React from "react";
import { RadioButton, RadioButtonGroup } from "@carbon/react";

interface FilterStockItemsProps {
  filterType: string;
  changeFilterType: React.Dispatch<React.SetStateAction<string>>;
}

const FilterStockItems: React.FC<FilterStockItemsProps> = ({
  filterType,
  changeFilterType,
}) => {
  return (
    <RadioButtonGroup
      name="is-drug"
      defaultSelected={filterType}
      onChange={({ newSelection }) => {
        changeFilterType(newSelection);
      }}
    >
      <RadioButton labelText="All" value="" id="is-drug-all" />
      <RadioButton labelText="Drugs" value="true" id="is-drug-drug" />
      <RadioButton labelText="Other" value="false" id="is-drug-other" />
    </RadioButtonGroup>
  );
};

export default FilterStockItems;
