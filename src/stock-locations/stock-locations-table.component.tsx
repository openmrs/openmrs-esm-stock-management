import React from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  TableToolbarAction,
  TableToolbarMenu,
  TableToolbarSearch,
} from "@carbon/react";
import { ResourceRepresentation } from "../core/api/api";
import { useStockLocationPages } from "./stock-locations-table.resource";
import DataList from "../core/components/table/table.component";
import EmptyState from "../empty-state.component";

interface StockLocationsTableProps {
  status?: string;
}

const StockLocations: React.FC<StockLocationsTableProps> = () => {
  const { t } = useTranslation();

  const { tableHeaders, tableRows, items } = useStockLocationPages({
    v: ResourceRepresentation.Full,
  });

  const handleImport = () => {
    // setShowImport(true);
  };

  const handleRefresh = () => {
    // search.refetch()
  };

  const createStockItem = () => {
    // search.refetch()
  };

  // if (isLoading) {
  //   return <DataTableSkeleton role="progressbar" />;
  // }

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

  return <EmptyState msg="No stock locations to display" helper="" />;
};

export default StockLocations;
