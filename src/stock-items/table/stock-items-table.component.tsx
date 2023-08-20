import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocations, usePagination } from "@openmrs/esm-framework";
import { useStockItems } from "../stock-items.resource";
import styles from "./stock-items-table.scss";
import {
  DataTable,
  DataTableSkeleton,
  Layer,
  Link,
  Table,
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
  Pagination,
} from "@carbon/react";

interface StockItemsTableProps {
  from?: string;
}

const StockItemsTableComponent: React.FC<StockItemsTableProps> = () => {
  const { t } = useTranslation();

  const locations = useLocations();

  const { items, isLoading, isError } = useStockItems({});

  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPageSize, setPageSize] = useState(10);
  const [overlayHeader, setOverlayTitle] = useState("");

  const {
    goTo,
    results: paginatedQueueEntries,
    currentPage,
  } = usePagination(items.results, currentPageSize);

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
      { key: "details", header: "" },
    ],
    [t]
  );

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
        <Link to={URL_STOCK_ITEM(stockItem?.uuid || "")}>{`${
          stockItem?.drugName ?? stockItem.conceptName
        }`}</Link>
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
        {/*<div className={styles.headerBtnContainer}></div>*/}
        {/* <div className={styles.headerContainer}>
          <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
            <span className={styles.heading}>{`Patients in ${userLocation} queue`}</span>
          </div>
        </div> */}
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
                <TableToolbarContent className={styles.toolbarContent}>
                  <Layer>
                    <TableToolbarSearch
                      className={styles.search}
                      onChange={onInputChange}
                      placeholder={t("searchThisList", "Search this list")}
                      size="sm"
                    />
                  </Layer>
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
                          >
                            {header.header}
                          </TableHeader>
                        )
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, index) => {
                    return (
                      <React.Fragment key={row.id}>
                        <TableRow {...getRowProps({ row })}>
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
                    <p className={styles.separator}>{t("or", "or")}</p>
                    {/*<Button*/}
                    {/*  kind="ghost"*/}
                    {/*  size="sm"*/}
                    {/*  renderIcon={(props) => <Add size={16} {...props} />}*/}
                    {/*  onClick={() => setShowOverlay(true)}*/}
                    {/*>*/}
                    {/*  {t("addPatientToList", "Add patient to list")}*/}
                    {/*</Button>*/}
                  </Tile>
                </div>
              ) : null}
              <Pagination
                forwardText="Next page"
                backwardText="Previous page"
                page={currentPage}
                pageSize={currentPageSize}
                pageSizes={pageSizes}
                totalItems={items?.results?.length}
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
        {/*{showOverlay && (*/}
        {/*  <PatientSearch*/}
        {/*    view={view}*/}
        {/*    closePanel={() => setShowOverlay(false)}*/}
        {/*    viewState={{*/}
        {/*      selectedPatientUuid: viewState.selectedPatientUuid,*/}
        {/*    }}*/}
        {/*    headerTitle={overlayHeader}*/}
        {/*  />*/}
        {/*)}*/}
      </div>
    );
  }

  return (
    <div className={styles.tileContainer}>
      <Tile className={styles.tile}>
        <p className={styles.content}>
          No stock items to display
          {/*{t("noStockItemsToDisplay", "No stock items to display")}*/}
        </p>
      </Tile>
    </div>
  );
};

export default StockItemsTableComponent;

export const ROUTING_BASE_URL = "/";
export const URL_STOCK_ITEMS = ROUTING_BASE_URL + "stock-items";
export const URL_STOCK_ITEM = (uuid: string, tab?: string): string =>
  `${URL_STOCK_ITEMS}/${uuid}${tab ? `?tab=${tab}` : ""}`;
