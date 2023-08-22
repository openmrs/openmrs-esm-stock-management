import React from "react";
import { DataTableSkeleton } from "@carbon/react";
import useStockSourcesPage from "./stock-sources-itesm-table.resource";
import { ResourceRepresentation } from "../core/api/api";
import DataList from "../core/components/table/table.component";
import StockSourcesDelete from "./stock-sources-delete-dialog/stock-sources-delete-dialog.component";
import StockSourcesAddOrCreate from "./stock-sources-add-or-create-dialog/stock-sources-add-or-create-dialog.component";

function StockSourcesItems() {
  // get sources
  const { isLoading, tableHeaders, tableRows } = useStockSourcesPage({
    v: ResourceRepresentation.Full,
  });

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  return (
    <DataList columns={tableHeaders} data={tableRows}>
      {({ onInputChange }) => (
        <>
          <StockSourcesDelete />
          <StockSourcesAddOrCreate />
        </>
      )}
    </DataList>
  );
}

export default StockSourcesItems;
