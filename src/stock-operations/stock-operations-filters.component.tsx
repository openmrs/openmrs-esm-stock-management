import React, { useEffect, useState } from "react";
import {
  getStockOperationTypes,
  useConcept,
} from "../stock-lookups/stock-lookups.resource";
import { DropdownSkeleton, MultiSelect } from "@carbon/react";
import { StockFilters } from "../constants";
import { StockOperationStatusTypes } from "../core/api/types/stockOperation/StockOperationStatus";
import styles from "../stock-items/stock-items-table.scss";

interface StockOperationFiltersProps {
  conceptUuid?: string;
  onFilterChange: (selectedItems: any[], filterType: string) => void;
  filterName: string;
}

const StockOperationsFilters: React.FC<StockOperationFiltersProps> = ({
  conceptUuid,
  onFilterChange,
  filterName,
}) => {
  const { items, isLoading } = useConcept(conceptUuid);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [dataItems, setDataItems] = useState([]);

  useEffect(() => {
    setIsDataLoading(true);
    switch (filterName) {
      case StockFilters.STATUS:
        setDataItems(
          StockOperationStatusTypes.map((option) => ({
            uuid: option,
            display: option,
          }))
        );
        break;
      case StockFilters.SOURCES:
        if (items?.answers?.length) {
          setDataItems([...items.answers]);
          setIsDataLoading(isLoading);
        }

        break;
      case StockFilters.OPERATION:
        getStockOperationTypes().then((response) => {
          setIsDataLoading(true);
          if (response.data?.results.length) {
            setDataItems(
              response.data.results.map((result) => ({
                uuid: result.uuid,
                display: result.name,
              }))
            );
          }

          setIsDataLoading(false);
        });
    }
    setIsDataLoading(false);
  }, [filterName, isLoading, items.answers]);

  if (isDataLoading) {
    return <DropdownSkeleton />;
  }

  return (
    <MultiSelect
      className={styles.filtersAlign}
      id="multiSelect"
      label={filterName}
      size="md"
      labelInline={true}
      items={dataItems}
      itemToString={(item) => (item ? item.display : "Not Set")}
      onChange={({ selectedItems }) => {
        if (selectedItems) {
          onFilterChange(
            selectedItems.map((selectedItem) => selectedItem.display),
            filterName
          );
        }
      }}
      placeholder={`Filter by ${filterName}`}
      style={{ minWidth: "auto", width: "auto" }}
    />
  );
};

export default StockOperationsFilters;
