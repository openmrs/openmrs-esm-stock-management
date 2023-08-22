import React from "react";
import { useTranslation } from "react-i18next";
import {
  DataTableSkeleton,
  TableToolbarSearch,
  Button,
  TableToolbarMenu,
  TableToolbarAction,
} from "@carbon/react";
import useStockSourcesPage from "./stock-sources-itesm-table.resource";
import { ResourceRepresentation } from "../core/api/api";
import DataList from "../core/components/table/table.component";
import AddStockSourceActionButton from "./add-stock-source-button.component";

function StockSourcesItems() {
  const { t } = useTranslation();

  // get sources
  const { isLoading, tableHeaders, tableRows } = useStockSourcesPage({
    v: ResourceRepresentation.Full,
  });

  const handleImport = () => {
    // setShowImport(true);
  };

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
