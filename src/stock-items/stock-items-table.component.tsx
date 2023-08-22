import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import styles from "./stock-items-table.scss";
import { DataTableSkeleton, Link, Tile } from "@carbon/react";
import { ResourceRepresentation } from "../core/api/api";
import { useStockItemsPages } from "./stock-items-table.resource";
import DataList from "../core/components/table/table.component";

interface StockItemsTableProps {
  from?: string;
}

const StockItemsTableComponent: React.FC<StockItemsTableProps> = () => {
  const { t } = useTranslation();

  const { isLoading, items, paginatedQueueEntries, tableHeaders } =
    useStockItemsPages({ v: ResourceRepresentation.Full });

  const tableRows = useMemo(() => {
    return paginatedQueueEntries?.map((stockItem) => ({
      ...stockItem,
      id: stockItem?.uuid,
      key: `key-${stockItem?.uuid}`,
      uuid: `${stockItem?.uuid}`,
      type: stockItem?.drugUuid
        ? t("stockmanagement.drug", "Drug")
        : t("stockmanagement.other", "Other"),
      genericName: (
        <Link to={URL_STOCK_ITEM(stockItem?.uuid || "")}>
          {" "}
          {`${stockItem?.drugName ?? stockItem.conceptName}`}
        </Link>
      ),
      commonName: stockItem?.commonName,
      tradeName: stockItem?.drugUuid ? stockItem?.conceptName : "",
      preferredVendorName: stockItem?.preferredVendorName,
      dispensingUoM: stockItem?.defaultStockOperationsUoMName,
      dispensingUnitName: stockItem?.dispensingUnitName,
      defaultStockOperationsUoMName: stockItem?.defaultStockOperationsUoMName,
      reorderLevel:
        stockItem?.reorderLevelUoMName && stockItem?.reorderLevel
          ? `${stockItem?.reorderLevel?.toLocaleString()} ${
              stockItem?.reorderLevelUoMName
            }`
          : "",
    }));
  }, [paginatedQueueEntries, t]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (items?.length) {
    return <DataList columns={tableHeaders} data={tableRows} />;
  }

  return (
    <div className={styles.tileContainer}>
      <Tile className={styles.tile}>
        <p className={styles.content}>No stock items to display</p>
      </Tile>
    </div>
  );
};

export default StockItemsTableComponent;

export const ROUTING_BASE_URL = "/";
export const URL_STOCK_ITEMS = ROUTING_BASE_URL + "stock-items";
export const URL_STOCK_ITEM = (uuid: string, tab?: string): string =>
  `${URL_STOCK_ITEMS}/${uuid}${tab ? `?tab=${tab}` : ""}`;

export const URL_USER_ROLE_SCOPES = ROUTING_BASE_URL + "user-role-scopes";
export const URL_USER_ROLE_SCOPE = (uuid: string): string =>
  `${URL_USER_ROLE_SCOPES}/${uuid}`;

// Stock
export const URL_STOCK_OPERATIONS = ROUTING_BASE_URL + "stock-operations";

export const URL_STOCK_OPERATION = (uuid: string, tab?: string): string =>
  `${URL_STOCK_OPERATIONS}/${uuid}${tab ? `?tab=${tab}` : ""}`;
