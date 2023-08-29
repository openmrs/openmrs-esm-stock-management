import styles from "./stock-sources-filter.scss";
import { Dropdown, DropdownSkeleton } from "@carbon/react";
import React from "react";
import { STOCK_SOURCE_TYPE_CODED_CONCEPT_ID } from "../../constants";
import { useConceptById } from "../../stock-lookups/stock-lookups.resource";

const StockSourcesFilter: React.FC = () => {
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
          itemToString={(item) => (item ? item.display : "Not Set")}
          type="inline"
          size="sm"
        />
      </div>
    </>
  );
};

export default StockSourcesFilter;
