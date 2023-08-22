import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useStockOperationPages } from "./stock-operations-table.resource";
import { ResourceRepresentation } from "../core/api/api";
import { URL_STOCK_OPERATION } from "../stock-items/stock-items-table.component";
import {
  Link,
  Tile,
  TableToolbarSearch,
  TableToolbarMenu,
  TableToolbarAction,
  Button,
} from "@carbon/react";
import { ArrowRight } from "@carbon/react/icons";
import DataList from "../core/components/table/table.component";
import { formatDisplayDate } from "../core/utils/datetimeUtils";
import styles from "../stock-items/stock-items-table.scss";
import AddStockOperationActionButton from "./add-stock-operation-button.component";

interface StockOperationsTableProps {
  status?: string;
}

const StockOperations: React.FC<StockOperationsTableProps> = () => {
  const { t } = useTranslation();

  const { items, tableHeaders } = useStockOperationPages({
    v: ResourceRepresentation.Default,
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

  const tableRows = useMemo(() => {
    return items?.map((stockOperation) => ({
      ...stockOperation,
      id: stockOperation?.uuid,
      key: `key-${stockOperation?.uuid}`,
      operationTypeName: `${stockOperation?.operationTypeName}`,
      operationNumber: (
        <Link
          to={URL_STOCK_OPERATION(stockOperation?.uuid)}
        >{`${stockOperation?.operationNumber}`}</Link>
      ),
      status: `${stockOperation?.status}`,
      source: `${stockOperation?.sourceName ?? ""}`,
      destination: `${stockOperation?.destinationName ?? ""}`,
      location: (
        <>
          {" "}
          {stockOperation?.sourceName ?? ""}{" "}
          {stockOperation?.sourceName && stockOperation?.destinationName ? (
            <ArrowRight />
          ) : (
            ""
          )}{" "}
          {stockOperation?.destinationName ?? ""}{" "}
        </>
      ),
      responsiblePerson: `${
        stockOperation?.responsiblePersonFamilyName ??
        stockOperation?.responsiblePersonOther ??
        ""
      } ${stockOperation?.responsiblePersonGivenName ?? ""}`,
      operationDate: formatDisplayDate(stockOperation?.operationDate),
    }));
  }, [items]);

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
            <AddStockOperationActionButton />
          </>
        )}
      </DataList>
    );
  }

  return (
    <div className={styles.tileContainer}>
      <Tile className={styles.tile}>
        <p className={styles.content}>No stock operations to display</p>
      </Tile>
    </div>
  );
};

export default StockOperations;
