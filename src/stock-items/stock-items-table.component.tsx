import {
  Button,
  TabPanel,
  DataTable,
  DataTableSkeleton,
  Pagination,
  Table,
  TableBatchActions,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Tile,
  Tooltip,
} from "@carbon/react";
import { Edit } from "@carbon/react/icons";
import { isDesktop } from "@openmrs/esm-framework";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ResourceRepresentation } from "../core/api/api";
import AddStockItemActionButton from "./add-stock-item/add-stock-action-button.component";
import FilterStockItems from "./components/filter-stock-items/filter-stock-items.component";
import { launchAddOrEditDialog } from "./stock-item.utils";
import { useStockItemsPages } from "./stock-items-table.resource";
import styles from "./stock-items-table.scss";
import AddStockItemsBulktImportActionButton from "./add-bulk-stock-item/add-stock-items-bulk-import-action-button.component";
import EditStockItemActionsMenu from "./edit-stock-item/edit-stock-item-action-menu.component";

interface StockItemsTableProps {
  from?: string;
}

const StockItemsTableComponent: React.FC<StockItemsTableProps> = () => {
  const { t } = useTranslation();

  const {
    isLoading,
    items,
    totalCount,
    currentPageSize,
    pageSizes,
    currentPage,
    setCurrentPage,
    isDrug,
    setDrug,
  } = useStockItemsPages(ResourceRepresentation.Full);

  const tableHeaders = useMemo(
    () => [
      {
        id: 0,
        header: t("type", "Type"),
        key: "type",
      },
      {
        id: 1,
        header: t("genericName", "Generic Name"),
        key: "genericName",
      },
      {
        id: 2,
        header: t("commonName", "Common Name"),
        key: "commonName",
      },
      {
        id: 3,
        header: t("tradeName", "Trade Name"),
        key: "tradeName",
      },
      {
        id: 4,
        header: t("dispensingUnitName", "Dispensing UoM"),
        key: "dispensingUnitName",
      },
      {
        id: 5,
        header: t("defaultStockOperationsUoMName", "Bulk Packaging"),
        key: "defaultStockOperationsUoMName",
      },
      {
        id: 6,
        header: t("reorderLevel", "Reorder Level"),
        key: "reorderLevel",
      },
      {
        id: 7,
        key: "actions",
        header: "Actions",
      },
    ],
    [t]
  );

  const tableRows = useMemo(() => {
    return items?.map((stockItem, index) => ({
      ...stockItem,
      id: stockItem?.uuid,
      key: `key-${stockItem?.uuid}`,
      uuid: `${stockItem?.uuid}`,
      type: stockItem?.drugUuid ? t("drug", "Drug") : t("other", "Other"),
      genericName: <EditStockItemActionsMenu data={items[index]} />,
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

  return (
    <>
      <TabPanel>
        {t(
          "panelDescription",
          "Drugs and other stock items managed by the system."
        )}
      </TabPanel>

      <DataTable
        rows={tableRows}
        headers={tableHeaders}
        isSortable
        useZebraStyles
        render={({
          rows,
          headers,
          getHeaderProps,
          getTableProps,
          getRowProps,
          getBatchActionProps,
          onInputChange,
        }) => (
          <TableContainer>
            <TableToolbar
              style={{
                position: "static",
                overflow: "visible",
                backgroundColor: "color",
              }}
            >
              <TableBatchActions {...getBatchActionProps()}></TableBatchActions>
              <TableToolbarContent
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <TableToolbarSearch persistent onChange={onInputChange} />
                <FilterStockItems
                  filterType={isDrug}
                  changeFilterType={setDrug}
                />
                <AddStockItemsBulktImportActionButton />
                <AddStockItemActionButton />
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map(
                    (header) =>
                      header.key !== "details" && (
                        <TableHeader
                          {...getHeaderProps({
                            header,
                            isSortable: header.isSortable,
                          })}
                          className={
                            isDesktop
                              ? styles.desktopHeader
                              : styles.tabletHeader
                          }
                          key={`${header.key}`}
                          isSortable={header.key !== "name"}
                        >
                          {header.header?.content ?? header.header}
                        </TableHeader>
                      )
                  )}
                  <TableHeader></TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  return (
                    <React.Fragment key={row.id}>
                      <TableRow
                        className={
                          isDesktop ? styles.desktopRow : styles.tabletRow
                        }
                        {...getRowProps({ row })}
                        key={row.id}
                      >
                        {row.cells.map(
                          (cell) =>
                            cell?.info?.header !== "details" && (
                              <TableCell key={cell.id}>{cell.value}</TableCell>
                            )
                        )}
                      </TableRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
            {rows.length === 0 ? (
              <div className={styles.tileContainer}>
                <Tile className={styles.tile}>
                  <div className={styles.tileContent}>
                    <p className={styles.content}>
                      {t("noItemsToDisplay", "No Stock Items to display")}
                    </p>
                    <p className={styles.helper}>
                      {t("checkFilters", "Check the filters above")}
                    </p>
                  </div>
                </Tile>
              </div>
            ) : null}
          </TableContainer>
        )}
      ></DataTable>

      <Pagination
        page={currentPage}
        pageSize={currentPageSize}
        pageSizes={pageSizes}
        totalItems={totalCount}
        onChange={({ page }) => setCurrentPage(page)}
        className={styles.paginationOverride}
      />
    </>
  );
};

export default StockItemsTableComponent;
