import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useStockOperationPages } from "./stock-operations-table.resource";
import { ResourceRepresentation } from "../core/api/api";
import {
  DataTable,
  TabPanel,
  DataTableSkeleton,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableExpandedRow,
  TableExpandHeader,
  TableExpandRow,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Tile,
  StructuredListHead,
  StructuredListRow,
  StructuredListCell,
  StructuredListBody,
  OverflowMenu,
  OverflowMenuItem,
  DatePickerInput,
  DatePicker,
} from "@carbon/react";
import { ArrowRight } from "@carbon/react/icons";
import { formatDisplayDate } from "../core/utils/datetimeUtils";
import styles from "../stock-items/stock-items-table.scss";
import {
  StockOperationStatusCancelled,
  StockOperationStatusNew,
  StockOperationStatusRejected,
  StockOperationStatusReturned,
} from "../core/api/types/stockOperation/StockOperationStatus";
import { isDesktop, showModal } from "@openmrs/esm-framework";
import StockOperationTypesSelector from "./stock-operation-types-selector/stock-operation-types-selector.component";
import { launchAddOrEditDialog } from "./stock-operation.utils";
import { initialStockOperationValue } from "../core/utils/utils";
import { StockOperationType } from "../core/api/types/stockOperation/StockOperationType";
import { useTranslation } from "react-i18next";
import EditStockOperationActionMenu from "./edit-stock-operation/edit-stock-operation-action-menu.component";
import { handleMutate } from "./swr-revalidation";
import StockOperationsFilters from "./stock-operations-filters.component";
import {
  DATE_PICKER_CONTROL_FORMAT,
  DATE_PICKER_FORMAT,
  STOCK_SOURCE_TYPE_CODED_CONCEPT_ID,
  StockFilters,
} from "../constants";

interface StockOperationsTableProps {
  status?: string;
}

const StockOperations: React.FC<StockOperationsTableProps> = () => {
  const { t } = useTranslation();
  const operation: StockOperationType = useMemo(
    () => ({
      uuid: "",
      name: "",
      description: "",
      operationType: "",
      hasSource: false,
      sourceType: "Location",
      hasDestination: false,
      destinationType: "Location",
      hasRecipient: false,
      recipientRequired: false,
      availableWhenReserved: false,
      allowExpiredBatchNumbers: false,
      stockOperationTypeLocationScopes: [],
      creator: undefined,
      dateCreated: undefined,
      changedBy: undefined,
      dateChanged: undefined,
      dateVoided: undefined,
      voidedBy: undefined,
      voidReason: "",
      voided: false,
    }),
    []
  );

  const {
    items,
    tableHeaders,
    currentPage,
    pageSizes,
    totalItems,
    goTo,
    currentPageSize,
    setPageSize,
    isLoading,
  } = useStockOperationPages({
    v: ResourceRepresentation.Full,
    totalCount: true,
  });

  const [filteredItems, setFilteredItems] = useState(items);
  const [selectedFromDate, setSelectedFromDate] = useState(null);
  const [selectedToDate, setSelectedToDate] = useState(null);

  let operations: StockOperationType[] | null | undefined;
  const handleOnComplete = () => {
    const dispose = showModal("stock-operation-dialog", {
      title: "complete",
      operation: operation,
      requireReason: "",
      closeModal: () => dispose(),
    });
    handleMutate("ws/rest/v1/stockmanagement/stockoperation");
  };

  useEffect(() => {
    setFilteredItems(items);
  }, [items]);

  useEffect(() => {
    if (selectedFromDate && selectedToDate) {
      setFilteredItems(
        filteredItems.filter(
          (item) =>
            new Date(item.operationDate) >= new Date(selectedFromDate) &&
            new Date(item.operationDate) <= new Date(selectedToDate)
        )
      );
    } else if (selectedFromDate && !selectedToDate) {
      setFilteredItems(
        filteredItems.filter(
          (item) => new Date(item.operationDate) >= new Date(selectedFromDate)
        )
      );
    } else if (!selectedFromDate && selectedToDate) {
      setFilteredItems(
        filteredItems.filter(
          (item) => new Date(item.operationDate) <= new Date(selectedToDate)
        )
      );
    }
  }, [filteredItems, selectedFromDate, selectedToDate]);

  const handleOnFilterChange = useCallback(
    (selectedItems, filterType) => {
      let newFilteredRows = [...filteredItems];

      switch (filterType) {
        case StockFilters.SOURCES:
          newFilteredRows = newFilteredRows.filter((row) =>
            selectedItems.includes(row.sourceName)
          );
          break;
        case StockFilters.STATUS:
          newFilteredRows = newFilteredRows.filter((row) =>
            selectedItems.includes(row.status)
          );
          break;
        case StockFilters.OPERATION:
          newFilteredRows = newFilteredRows.filter((row) =>
            selectedItems.includes(row.operationTypeName)
          );
          break;
        default:
          break;
      }

      setFilteredItems(newFilteredRows);
    },
    [filteredItems]
  );

  const tableRows = useMemo(() => {
    return filteredItems?.map((stockOperation, index) => ({
      ...stockOperation,
      id: stockOperation?.uuid,
      key: `key-${stockOperation?.uuid}`,
      operationTypeName: `${stockOperation?.operationTypeName}`,
      operationNumber: (
        <EditStockOperationActionMenu
          model={filteredItems[index]}
          operations={operations}
        />
      ),
      status: `${stockOperation?.status}`,
      source: `${stockOperation?.sourceName ?? ""}`,
      destination: `${stockOperation?.destinationName ?? ""}`,
      location: (
        <>
          {" "}
          {stockOperation?.sourceName ?? ""}{" "}
          {stockOperation?.sourceName && stockOperation?.destinationName ? (
            <ArrowRight size={16} />
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
      details: (
        <div className="tbl-expand-display-fields">
          <div className="field-label">
            <span className="field-title">Created</span>
            <span className="field-desc">
              <span className="action-date">
                {formatDisplayDate(stockOperation?.dateCreated)}
              </span>{" "}
              By
              <span className="action-by">
                {stockOperation.creatorFamilyName ?? ""}{" "}
                {stockOperation.creatorGivenName ?? ""}
              </span>
            </span>
          </div>
          {stockOperation?.status !== StockOperationStatusNew &&
            stockOperation?.status !== StockOperationStatusReturned &&
            stockOperation?.submittedDate && (
              <div className="field-label">
                <span className="field-title">Submitted</span>
                <span className="field-desc">
                  <span className="action-date">
                    {formatDisplayDate(stockOperation?.submittedDate)}
                  </span>{" "}
                  By
                  <span className="action-by">
                    {stockOperation.submittedByFamilyName ?? ""}{" "}
                    {stockOperation.submittedByGivenName ?? ""}
                  </span>
                </span>
              </div>
            )}

          {stockOperation?.completedDate && (
            <div className="field-label">
              <span className="field-title">Completed</span>
              <span className="field-desc">
                <span className="action-date">
                  {formatDisplayDate(stockOperation?.completedDate)}
                </span>{" "}
                By
                <span className="action-by">
                  {stockOperation.completedByFamilyName ?? ""}{" "}
                  {stockOperation.completedByGivenName ?? ""}
                </span>
              </span>
            </div>
          )}

          {stockOperation?.status === StockOperationStatusCancelled && (
            <div className="field-label">
              <span className="field-title">Cancelled</span>
              <span className="field-desc">
                <span className="action-date">
                  {formatDisplayDate(stockOperation?.cancelledDate)}
                </span>{" "}
                By
                <span className="action-by">
                  {stockOperation.cancelledByFamilyName ?? ""}{" "}
                  {stockOperation.cancelledByGivenName ?? ""}
                </span>
                <p>{stockOperation.cancelReason}</p>
              </span>
            </div>
          )}

          {stockOperation?.status === StockOperationStatusRejected && (
            <div className="field-label">
              <span className="field-title">Rejected</span>
              <span className="field-desc">
                <span className="action-date">
                  {formatDisplayDate(stockOperation?.rejectedDate)}
                </span>{" "}
                By
                <span className="action-by">
                  {stockOperation.rejectedByFamilyName ?? ""}{" "}
                  {stockOperation.rejectedByGivenName ?? ""}
                </span>
                <p>{stockOperation.rejectionReason}</p>
              </span>
            </div>
          )}

          {stockOperation?.status === StockOperationStatusReturned && (
            <div className="field-label">
              <span className="field-title">Returned</span>
              <span className="field-desc">
                <span className="action-date">
                  {formatDisplayDate(stockOperation?.returnedDate)}
                </span>{" "}
                By
                <span className="action-by">
                  {stockOperation.returnedByFamilyName ?? ""}{" "}
                  {stockOperation.returnedByGivenName ?? ""}
                </span>
                <p>{stockOperation.returnReason}</p>
              </span>
            </div>
          )}
        </div>
      ),
      actions: (
        <OverflowMenu flipped={"true"} aria-label="overflow-menu">
          <OverflowMenuItem itemText="Complete" onClick={handleOnComplete} />
          <OverflowMenuItem
            itemText="Edit"
            onClick={() => {
              launchAddOrEditDialog(
                filteredItems[index],
                true,
                operation,
                operations,
                false
              );
            }}
          />
        </OverflowMenu>
      ),
    }));
  }, [handleOnComplete, filteredItems, operation, operations]);

  if (isLoading) {
    return (
      <DataTableSkeleton
        className={styles.dataTableSkeleton}
        showHeader={false}
        rowCount={5}
        columnCount={5}
        zebra
      />
    );
  }

  return (
    <div className={styles.tableOverride}>
      <TabPanel>{t("Stock operations to track movement of stock.")}</TabPanel>
      <div id="table-tool-bar">
        <div></div>
        <div className="right-filters"></div>
      </div>
      <DataTable
        rows={tableRows}
        headers={tableHeaders}
        isSortable={true}
        useZebraStyles={true}
        render={({
          rows,
          headers,
          getHeaderProps,
          getTableProps,
          getRowProps,
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
              <TableToolbarContent>
                <TableToolbarSearch
                  className={styles.patientListSearch}
                  expanded
                  onChange={onInputChange}
                  placeholder="Filter Table"
                  size="sm"
                />
                <div className={styles.filterContainer}>
                  <DatePicker
                    className={styles.datePickers}
                    datePickerType="range"
                    dateFormat={DATE_PICKER_CONTROL_FORMAT}
                    value={[selectedFromDate, selectedToDate]}
                    onChange={([startDate, endDate]) => {
                      if (endDate < startDate && startDate !== null) {
                        setSelectedFromDate(endDate);
                        setSelectedToDate(startDate);
                      } else {
                        setSelectedFromDate(startDate);
                        setSelectedToDate(endDate);
                      }
                    }}
                  >
                    <DatePickerInput
                      //labelText={t("startDate", "Start date")}
                      placeholder={DATE_PICKER_FORMAT}
                    />
                    <DatePickerInput
                      //labelText={t("endDate", "End date")}
                      placeholder={DATE_PICKER_FORMAT}
                    />
                  </DatePicker>
                  <StockOperationsFilters
                    conceptUuid={STOCK_SOURCE_TYPE_CODED_CONCEPT_ID}
                    filterName={StockFilters.SOURCES}
                    onFilterChange={handleOnFilterChange}
                  />

                  <StockOperationsFilters
                    filterName={StockFilters.STATUS}
                    onFilterChange={handleOnFilterChange}
                  />

                  <StockOperationsFilters
                    filterName={StockFilters.OPERATION}
                    onFilterChange={handleOnFilterChange}
                  />
                </div>

                <StockOperationTypesSelector
                  onOperationTypeSelected={(operation) => {
                    launchAddOrEditDialog(
                      initialStockOperationValue(),
                      false,
                      operation,
                      operations,
                      false
                    );
                  }}
                  onOperationLoaded={(ops) => {
                    operations = ops;
                  }}
                />
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  <TableExpandHeader />
                  {headers.map(
                    (header: any) =>
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
                        >
                          {header.header?.content ?? header.header}
                        </TableHeader>
                      )
                  )}
                  <TableHeader></TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row: any, index) => {
                  return (
                    <React.Fragment key={row.id}>
                      <TableExpandRow
                        className={
                          isDesktop ? styles.desktopRow : styles.tabletRow
                        }
                        {...getRowProps({ row })}
                      >
                        {row.cells.map(
                          (cell: any) =>
                            cell?.info?.header !== "details" && (
                              <TableCell key={cell.id}>{cell.value}</TableCell>
                            )
                        )}
                      </TableExpandRow>
                      <TableExpandedRow colSpan={headers.length + 2}>
                        <>
                          <StructuredListHead>
                            <StructuredListRow head>
                              <StructuredListCell head>
                                {t("dateCreated", "Date Created")}
                              </StructuredListCell>
                              <StructuredListCell head>
                                {t("dateCompleted", "Date Completed")}
                              </StructuredListCell>
                              <StructuredListCell head>
                                {t("batchNumber", "Batch Number")}
                              </StructuredListCell>
                              <StructuredListCell head>Qty</StructuredListCell>
                            </StructuredListRow>
                          </StructuredListHead>
                          <StructuredListBody>
                            <StructuredListRow>
                              <StructuredListCell noWrap>
                                {filteredItems[index]?.dateCreated
                                  ? formatDisplayDate(
                                      filteredItems[index]?.dateCreated
                                    )
                                  : ""}
                                &nbsp;
                                {filteredItems[index]?.dateCreated ? "By" : ""}
                                &nbsp;
                                {filteredItems[index]?.dateCreated
                                  ? filteredItems[index]?.creatorFamilyName
                                  : ""}
                              </StructuredListCell>
                              <StructuredListCell>
                                {filteredItems[index]?.completedDate
                                  ? formatDisplayDate(
                                      filteredItems[index]?.completedDate
                                    )
                                  : ""}
                                &nbsp;
                                {filteredItems[index]?.completedDate
                                  ? "By"
                                  : ""}
                                &nbsp;
                                {filteredItems[index]?.completedDate
                                  ? filteredItems[index]?.creatorFamilyName
                                  : ""}
                              </StructuredListCell>
                              <StructuredListCell>
                                {filteredItems[index]?.stockOperationItems
                                  ? filteredItems[
                                      index
                                    ].stockOperationItems?.map(
                                      (item) => item.batchNo
                                    )[0]
                                  : ""}
                              </StructuredListCell>
                              <StructuredListCell>
                                {filteredItems[index]?.stockOperationItems
                                  ? filteredItems[
                                      index
                                    ].stockOperationItems?.map(
                                      (item) => item.quantity
                                    )[0]
                                  : ""}
                              </StructuredListCell>
                            </StructuredListRow>
                            <StructuredListRow>
                              <StructuredListCell noWrap>
                                {filteredItems[index]?.stockOperationItems.map(
                                  (item) => item.quantity
                                )[1]
                                  ? formatDisplayDate(
                                      filteredItems[index]?.dateCreated
                                    )
                                  : ""}
                                &nbsp;
                                {filteredItems[index]?.stockOperationItems.map(
                                  (item) => item.quantity
                                )[1]
                                  ? "By"
                                  : ""}
                                &nbsp;
                                {filteredItems[index]?.stockOperationItems.map(
                                  (item) => item.quantity
                                )[1]
                                  ? filteredItems[index]?.creatorFamilyName
                                  : ""}
                              </StructuredListCell>
                              <StructuredListCell>
                                {filteredItems[index]?.stockOperationItems.map(
                                  (item) => item.quantity
                                )[1]
                                  ? formatDisplayDate(
                                      filteredItems[index]?.completedDate
                                    )
                                  : ""}
                                &nbsp;
                                {filteredItems[index]?.stockOperationItems.map(
                                  (item) => item.quantity
                                )[1] && filteredItems[index]?.completedDate
                                  ? "By"
                                  : ""}
                                &nbsp;
                                {filteredItems[index]?.stockOperationItems.map(
                                  (item) => item.quantity
                                )[1] && filteredItems[index]?.completedDate
                                  ? items[index]?.creatorFamilyName
                                  : ""}
                              </StructuredListCell>
                              <StructuredListCell>
                                {filteredItems[index]?.stockOperationItems
                                  ? filteredItems[
                                      index
                                    ].stockOperationItems?.map(
                                      (item) => item.batchNo
                                    )[1]
                                  : ""}
                              </StructuredListCell>
                              <StructuredListCell>
                                {filteredItems[index]?.stockOperationItems
                                  ? filteredItems[
                                      index
                                    ].stockOperationItems?.map(
                                      (item) => item.quantity
                                    )[1]
                                  : ""}
                              </StructuredListCell>
                            </StructuredListRow>
                          </StructuredListBody>
                        </>
                      </TableExpandedRow>
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
                      {t("noOperationsToDisplay", "No Stock Items to display")}
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
        totalItems={totalItems}
        onChange={({ pageSize, page }) => {
          if (pageSize !== currentPageSize) {
            setPageSize(pageSize);
          }
          if (page !== currentPage) {
            goTo(page);
          }
        }}
        className={styles.paginationOverride}
      />
    </div>
  );
};

export default StockOperations;
