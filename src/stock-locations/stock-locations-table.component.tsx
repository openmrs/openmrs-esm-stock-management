import React from "react";
import { useStockLocationPages } from "./stock-locations-table.resource";
import {
  Button,
  DataTableSkeleton,
  TableToolbarAction,
  TableToolbarMenu,
  TableToolbarSearch,
  Tile,
} from "@carbon/react";
import styles from "../stock-items/stock-items-table.scss";
import { ResourceRepresentation } from "../core/api/api";
import DataList from "../core/components/table/table.component";
import { useTranslation } from "react-i18next";

interface StockLocationsTableProps {
  status?: string;
}

const StockLocationsItems: React.FC<StockLocationsTableProps> = () => {
  const { t } = useTranslation();

  const { tableHeaders, tableRows, items, isLoadingLocations } =
    useStockLocationPages({
      v: ResourceRepresentation.Full,
    });

  const handleRefresh = () => {
    // search.refetch()
  };

  const createStockItem = () => {
    // search.refetch()
  };

  if (isLoadingLocations) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (items?.length) {
    return (
      <DataList columns={tableHeaders} data={tableRows}>
        {({ onInputChange }) => (
          <>
            <TableToolbarSearch persistent onChange={onInputChange} />
            <TableToolbarMenu>
              <TableToolbarAction onClick={handleRefresh}>
                Refresh
              </TableToolbarAction>
            </TableToolbarMenu>
            <Button onClick={createStockItem} size="md" kind="primary">
              {t("stockmanagement.addnewlocation", "Add Location")}
            </Button>
          </>
        )}
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

export default StockLocationsItems;
