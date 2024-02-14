import styles from "./stock-sources-filter.scss";
import { Dropdown, DropdownSkeleton } from "@carbon/react";
import React from "react";
import { STOCK_SOURCE_TYPE_CODED_CONCEPT_ID } from "../../constants";
import { useConceptById } from "../../stock-lookups/stock-lookups.resource";

const StockSourcesFilter: React.FC<{
  onFilterChange: (selectedSourceType: string) => void;
}> = ({ onFilterChange }) => {
  // get stock sources
  const { items, isLoading, isError } = useConceptById(
    STOCK_SOURCE_TYPE_CODED_CONCEPT_ID
  );
  if (isLoading || isError) {
    return <DropdownSkeleton />;
  }
  return (
    <>
      <div className={styles.filterContainer}>
        <Dropdown
          id="stockSourcesFiter"
          items={[...items.answers]}
          initialSelectedItem={items.answers[0]}
          itemToString={(item) => (item ? item.display : "Not Set")}
          titleText="Filter: "
          type="inline"
          size="sm"
          onChange={({ selectedItem }) => onFilterChange(selectedItem?.display)}
        />
      </div>
    </>
  );
};

export default StockSourcesFilter;
