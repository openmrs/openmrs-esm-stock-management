import styles from "./stock-operation-sources-filter.scss";
import { Dropdown, DropdownSkeleton } from "@carbon/react";
import React from "react";
import { useConcept } from "../../stock-lookups/stock-lookups.resource";
import { type ConfigObject } from "../../config-schema";
import { useConfig } from "@openmrs/esm-framework";

const StockOperationSourcesFilter: React.FC = () => {
  const { stockSourceTypeUUID } = useConfig<ConfigObject>();

  // get stock sources
  const { items, isLoading, isError } = useConcept(stockSourceTypeUUID);
  if (isLoading || isError) {
    return <DropdownSkeleton />;
  }
  return (
    <>
      <div className={styles.filterContainer}>
        <Dropdown
          id="stockOperationSourcesFiter"
          items={[...items.answers]}
          itemToString={(item) => (item ? item.display : "Not Set")}
          type="inline"
          size="sm"
        />
      </div>
    </>
  );
};

export default StockOperationSourcesFilter;
