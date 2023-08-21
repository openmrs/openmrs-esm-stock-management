import React from "react";
import { useTranslation } from "react-i18next";
import { isDesktop, useLayoutType } from "@openmrs/esm-framework";
import { useStockLocationPages } from "./stock-locations-table.resource";
import {
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
} from "@carbon/react";
import styles from "../stock-items/stock-items-table.scss";
import rootStyles from "../root.module.scss";
import { ResourceRepresentation } from "../core/api/api";

interface StockLocationsTableProps {
  status?: string;
}

const StockLocations: React.FC<StockLocationsTableProps> = () => {
  const { t } = useTranslation();

  const {
    isLoading,
    paginatedQueueEntries,
    tableHeaders,
    tableRows,
    currentPage,
    currentPageSize,
    goTo,
    pageSizes,
    items,
    setPageSize,
  } = useStockLocationPages({ v: ResourceRepresentation.Full });

  const desktop = isDesktop(useLayoutType());

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
                        {t(
                          "noStockLocationsToDisplay",
                          "No stock locations to display"
                        )}
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

export default StockLocations;
