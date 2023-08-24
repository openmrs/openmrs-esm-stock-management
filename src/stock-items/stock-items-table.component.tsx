import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import styles from "./stock-items-table.scss";
import {
  Button,
  DataTableSkeleton,
  Link,
  TableToolbarAction,
  TableToolbarMenu,
  TableToolbarSearch,
  Tile,
  Tooltip,
} from "@carbon/react";
import { useStockItemsPages } from "./stock-items-table.resource";
import DataList from "../core/components/table/table.component";
import FilterStockItems from "./components/filter-stock-items/filter-stock-items.component";
import AddStockItemActionButton from "./add-stock-item/add-stock-action-button.component";
import { Edit } from "@carbon/react/icons";
import { ResourceRepresentation } from "../core/api/api";
import { launchAddOrEditDialog } from "./stock-item.utils";

interface StockItemsTableProps {
  from?: string;
}

const StockItemsTableComponent: React.FC<StockItemsTableProps> = () => {
  const { t } = useTranslation();

  const {
    isLoading,
    items,
    tableHeaders,
    setDrug,
    isDrug,
    totalCount,
    setCurrentPage,
  } = useStockItemsPages(ResourceRepresentation.Full);

  const handleImport = () => {
    // setShowImport(true);
  };

  const handleRefresh = () => {
    // search.refetch()
  };

  const tableRows = useMemo(() => {
    return items?.map((stockItem) => ({
      ...stockItem,
      id: stockItem?.uuid,
      key: `key-${stockItem?.uuid}`,
      uuid: `${stockItem?.uuid}`,
      type: stockItem?.drugUuid ? t("drug", "Drug") : t("other", "Other"),
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
      actions: (
        <Tooltip align="bottom" label="Edit Stock Item">
          <Button
            kind="ghost"
            size="md"
            onClick={() => {
              stockItem.isDrug = !!stockItem.drugUuid;
              launchAddOrEditDialog(stockItem, true);
            }}
            iconDescription={t("editStockItem", "Edit Stock Item")}
            renderIcon={(props) => <Edit size={16} {...props} />}
          ></Button>
        </Tooltip>
      ),
    }));
  }, [items, t]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (items?.length) {
    return (
      <DataList
        columns={tableHeaders}
        data={tableRows}
        totalItems={totalCount}
        goToPage={setCurrentPage}
      >
        {({ onInputChange }) => (
          <>
            <TableToolbarSearch persistent onChange={onInputChange} />
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <FilterStockItems
                filterType={isDrug}
                changeFilterType={setDrug}
              />
            </div>
            <Button onClick={handleImport} size="sm" kind="ghost">
              {t("stockmanagement.import", "Import")}
            </Button>
            <TableToolbarMenu>
              <TableToolbarAction onClick={handleRefresh}>
                Refresh
              </TableToolbarAction>
            </TableToolbarMenu>
            <AddStockItemActionButton />
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
