import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { isDesktop, useLayoutType, useLocations } from "@openmrs/esm-framework";
import styles from "./stock-items-table.scss";
import rootStyles from "../root.module.scss";
import {
  DataTable,
  DataTableSkeleton,
  Link,
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
} from "@carbon/react";
import { ResourceRepresentation } from "../core/api/api";
import { useStockItemsPages } from "./stock-items-table.resource";

interface StockItemsTableProps {
  from?: string;
}

const StockItemsTableComponent: React.FC<StockItemsTableProps> = () => {
  const { t } = useTranslation();

  const desktop = isDesktop(useLayoutType());

  const {
    isLoading,
    paginatedQueueEntries,
    tableHeaders,
    currentPage,
    currentPageSize,
    goTo,
    pageSizes,
    items,
    setPageSize,
  } = useStockItemsPages({ v: ResourceRepresentation.Full });

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
  }, [items, t]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (paginatedQueueEntries?.length) {
    return (
      <div>
        <DataTable
          data-floating-menu-container
          headers={tableHeaders}
          rows={tableRows}
          isSortable
          size="xs"
          useZebraStyles
        >
          {({
            rows,
            headers,
            getHeaderProps,
            getTableProps,
            getRowProps,
            onInputChange,
            getBatchActionProps,
          }) => (
            <TableContainer className={styles.tableContainer}>
              <TableToolbar
                style={{
                  position: "static",
                  height: "3rem",
                  overflow: "visible",
                  backgroundColor: "color",
                }}
              >
                <TableBatchActions
                  {...getBatchActionProps()}
                ></TableBatchActions>
                <TableToolbarContent>
                  <TableToolbarSearch
                    className={styles.search}
                    onChange={onInputChange}
                    placeholder={t("searchThisList", "Search this list")}
                    size="sm"
                  />
                </TableToolbarContent>
              </TableToolbar>
              <Table {...getTableProps()} className={styles.activeVisitsTable}>
                <TableHead>
                  <TableRow>
                    {headers.map(
                      (header) =>
                        header.key !== "details" && (
                          <TableHeader
                            {...getHeaderProps({
                              header,
                              isSortable: true,
                            })}
                            className={[
                              desktop
                                ? rootStyles.desktopHeader
                                : rootStyles.tabletHeader,
                              rootStyles.boldHeader,
                            ]}
                            key={`${header.key}`}
                            isSortable={header.key !== "name"}
                          >
                            {header.header?.content ?? header.header}
                          </TableHeader>
                        )
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => {
                    return (
                      <React.Fragment key={row.id}>
                        <TableRow
                          className={
                            desktop
                              ? rootStyles.desktopRow
                              : rootStyles.tabletRow
                          }
                          {...getRowProps({ row })}
                          key={row.id}
                        >
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>
                              {cell.value?.content ?? cell.value}
                            </TableCell>
                          ))}
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
                        {t("noPatientsToDisplay", "No patients to display")}
                      </p>
                      <p className={styles.helper}>
                        {t("checkFilters", "Check the filters above")}
                      </p>
                    </div>
                  </Tile>
                </div>
              ) : null}
              <Pagination
                forwardText="Next page"
                backwardText="Previous page"
                page={currentPage}
                pageSize={currentPageSize}
                pageSizes={pageSizes}
                totalItems={items?.length}
                className={styles.pagination}
                onChange={({ pageSize, page }) => {
                  if (pageSize !== currentPageSize) {
                    setPageSize(pageSize);
                  }
                  if (page !== currentPage) {
                    goTo(page);
                  }
                }}
              />
            </TableContainer>
          )}
        </DataTable>
      </div>
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
