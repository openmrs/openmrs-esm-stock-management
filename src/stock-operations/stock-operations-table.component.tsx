import React, { useMemo, useState } from "react";
import { useStockOperationPages } from "./stock-operations-table.resource";
import { ResourceRepresentation } from "../core/api/api";
import {
  Button,
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
  Tooltip,
  StructuredListHead,
  StructuredListRow,
  StructuredListCell,
  StructuredListBody,
  OverflowMenu,
  OverflowMenuItem,
} from "@carbon/react";
import {
  ArrowRight,
  Departure,
  ListChecked,
  Save,
  SendFilled,
  Undo,
  Edit,
  Add,
} from "@carbon/react/icons";
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
import { importTranslation } from "../index";

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
  const tableRows = useMemo(() => {
    return items?.map((stockOperation, index) => ({
      ...stockOperation,
      id: stockOperation?.uuid,
      key: `key-${stockOperation?.uuid}`,
      operationTypeName: `${stockOperation?.operationTypeName}`,
      operationNumber: (
        <EditStockOperationActionMenu
          model={items[index]}
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
                items[index],
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
  }, [handleOnComplete, items, operation, operations]);

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
      <TabPanel>Stock operations to track movement of stock.</TabPanel>
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
              <TableToolbarContent className={styles.toolbarContent}>
                <TableToolbarSearch
                  className={styles.patientListSearch}
                  expanded
                  onChange={onInputChange}
                  placeholder="Filter Table"
                  size="sm"
                />
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
                                Date Created
                              </StructuredListCell>
                              <StructuredListCell head>
                                Date Completed
                              </StructuredListCell>
                              <StructuredListCell head>
                                Batch Number
                              </StructuredListCell>
                              <StructuredListCell head>Qty</StructuredListCell>
                            </StructuredListRow>
                          </StructuredListHead>
                          <StructuredListBody>
                            <StructuredListRow>
                              <StructuredListCell noWrap>
                                {items[index]?.dateCreated
                                  ? formatDisplayDate(items[index]?.dateCreated)
                                  : ""}
                                &nbsp;
                                {items[index]?.dateCreated ? "By" : ""}
                                &nbsp;
                                {items[index]?.dateCreated
                                  ? items[index]?.creatorFamilyName
                                  : ""}
                              </StructuredListCell>
                              <StructuredListCell>
                                {items[index]?.completedDate
                                  ? formatDisplayDate(
                                      items[index]?.completedDate
                                    )
                                  : ""}
                                &nbsp;
                                {items[index]?.completedDate ? "By" : ""}
                                &nbsp;
                                {items[index]?.completedDate
                                  ? items[index]?.creatorFamilyName
                                  : ""}
                              </StructuredListCell>
                              <StructuredListCell>
                                {items[index]?.stockOperationItems
                                  ? items[index].stockOperationItems?.map(
                                      (item) => item.batchNo
                                    )[0]
                                  : ""}
                              </StructuredListCell>
                              <StructuredListCell>
                                {items[index]?.stockOperationItems
                                  ? items[index].stockOperationItems?.map(
                                      (item) => item.quantity
                                    )[0]
                                  : ""}
                              </StructuredListCell>
                            </StructuredListRow>
                            <StructuredListRow>
                              <StructuredListCell noWrap>
                                {items[index]?.stockOperationItems.map(
                                  (item) => item.quantity
                                )[1]
                                  ? formatDisplayDate(items[index]?.dateCreated)
                                  : ""}
                                &nbsp;
                                {items[index]?.stockOperationItems.map(
                                  (item) => item.quantity
                                )[1]
                                  ? "By"
                                  : ""}
                                &nbsp;
                                {items[index]?.stockOperationItems.map(
                                  (item) => item.quantity
                                )[1]
                                  ? items[index]?.creatorFamilyName
                                  : ""}
                              </StructuredListCell>
                              <StructuredListCell>
                                {items[index]?.stockOperationItems.map(
                                  (item) => item.quantity
                                )[1]
                                  ? formatDisplayDate(
                                      items[index]?.completedDate
                                    )
                                  : ""}
                                &nbsp;
                                {items[index]?.stockOperationItems.map(
                                  (item) => item.quantity
                                )[1] && items[index]?.completedDate
                                  ? "By"
                                  : ""}
                                &nbsp;
                                {items[index]?.stockOperationItems.map(
                                  (item) => item.quantity
                                )[1] && items[index]?.completedDate
                                  ? items[index]?.creatorFamilyName
                                  : ""}
                              </StructuredListCell>
                              <StructuredListCell>
                                {items[index]?.stockOperationItems
                                  ? items[index].stockOperationItems?.map(
                                      (item) => item.batchNo
                                    )[1]
                                  : ""}
                              </StructuredListCell>
                              <StructuredListCell>
                                {items[index]?.stockOperationItems
                                  ? items[index].stockOperationItems?.map(
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
