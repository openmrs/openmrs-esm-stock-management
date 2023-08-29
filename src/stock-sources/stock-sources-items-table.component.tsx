import React from "react";
import { useTranslation } from "react-i18next";
import {
  DataTableSkeleton,
  TableToolbarAction,
  TableToolbarMenu,
  TableToolbarSearch,
} from "@carbon/react";
import useStockSourcesPage from "./stock-sources-items-table.resource";
import { ResourceRepresentation } from "../core/api/api";
import DataList from "../core/components/table/table.component";
import AddStockSourceActionButton from "./add-stock-source-button.component";
import StockSourcesFilter from "./stock-sources-filter/stock-sources-filter.component";

function StockSourcesItems() {
  // get sources
  const { isLoading, tableHeaders, tableRows } = useStockSourcesPage({
    v: ResourceRepresentation.Full,
  });

  const handleRefresh = () => {
    // search.refetch()
  };

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  return (
    <DataList columns={tableHeaders} data={tableRows}>
      {({ onInputChange }) => (
        <>
          <TableToolbarSearch persistent onChange={onInputChange} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <StockSourcesFilter />
          </div>
          <TableToolbarMenu>
            <TableToolbarAction onClick={handleRefresh}>
              Refresh
            </TableToolbarAction>
          </TableToolbarMenu>
          <AddStockSourceActionButton />
        </>
      )}
    </DataList>
  );
}

export default StockSourcesItems;
