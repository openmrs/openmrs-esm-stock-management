import React from "react";
import { useStockLocationPages } from "./stock-locations-table.resource";
import { DataTableSkeleton, TableToolbarSearch, Tile } from "@carbon/react";
import styles from "../stock-items/stock-items-table.scss";
import { ResourceRepresentation } from "../core/api/api";
import DataList from "../core/components/table/table.component";

interface StockLocationsTableProps {
  status?: string;
}

const StockLocations: React.FC<StockLocationsTableProps> = () => {
  const { isLoading, tableHeaders, tableRows, items } = useStockLocationPages({
    v: ResourceRepresentation.Full,
  });

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (items?.length) {
    return (
      <DataList columns={tableHeaders} data={tableRows}>
        {({ onInputChange }) => <TableToolbarSearch onChange={onInputChange} />}
      </DataList>
    );
  }

  return (
    <div className={styles.tileContainer}>
      <Tile className={styles.tile}>
        <p className={styles.content}>No stock items to display</p>
      </Tile>
    </div>
  );
};

export default StockLocations;
