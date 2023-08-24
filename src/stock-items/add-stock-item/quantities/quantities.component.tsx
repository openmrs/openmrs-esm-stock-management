import React, { useEffect, useMemo } from "react";
import { ResourceRepresentation } from "../../../core/api/api";
import { formatDisplayDate } from "../../../core/utils/datetimeUtils";
import { DataTableSkeleton, Tile } from "@carbon/react";
import DataList from "../../../core/components/table/table.component";
import styles from "../../stock-items-table.scss";
import { useStockItemQuantitiesHook } from "./quantities.resource";

interface StockQuantitiesProps {
  onSubmit?: () => void;
  stockItemUuid: string;
}

const StockQuantities: React.FC<StockQuantitiesProps> = ({ stockItemUuid }) => {
  const {
    isLoading,
    items,
    tableHeaders,

    totalCount,
    setCurrentPage,
    setStockItemUuid,
  } = useStockItemQuantitiesHook(ResourceRepresentation.Default);

  useEffect(() => {
    setStockItemUuid(stockItemUuid);
  }, [stockItemUuid, setStockItemUuid]);

  const tableRows = useMemo(() => {
    return items?.map((row, index) => ({
      ...row,
      id: `${row.partyUuid}${row.stockBatchUuid}${index}`,
      key: `${row.partyUuid}${row.stockBatchUuid}${index}`,
      uuid: `${row.partyUuid}${row.stockBatchUuid}${index}`,
      expires: formatDisplayDate(row?.expiration),
      location: row?.partyName,
      quantity: row?.quantity?.toLocaleString() ?? "",
      batch: row.batchNumber ?? "",
      packaging: row.quantityUoM ?? "",
    }));
  }, [items]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (items?.length != undefined) {
    return (
      <DataList
        columns={tableHeaders}
        data={tableRows}
        totalItems={totalCount}
        goToPage={setCurrentPage}
        hasToolbar={false}
      />
    );
  }

  return (
    <div className={styles.tileContainer}>
      <Tile className={styles.tile}>
        <p className={styles.content}>No transactions to display</p>
      </Tile>
    </div>
  );
};

export default StockQuantities;
