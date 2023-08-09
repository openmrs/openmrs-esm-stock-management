import {
  ArrowRight16,
  Edit16,
  OverflowMenuVertical16,
} from "@carbon/icons-react";
import {
  Button,
  DataTable,
  DataTableSkeleton,
  DatePicker,
  DatePickerInput,
  MultiSelect,
  OverflowMenu,
  OverflowMenuItem,
  Pagination,
  Search,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbarAction,
  TableToolbarMenu,
} from "@carbon/react";
import debounce from "lodash-es/debounce";
import React, { CSSProperties, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../root.module.scss";
import {
  URL_STOCK_OPERATION,
  URL_STOCK_OPERATIONS_NEW_OPERATION,
} from "../constants";
import { PageableResult } from "../core/api/types/PageableResult";
import { Concept } from "../core/api/types/concept/Concept";
import { StockOperationDTO } from "../core/api/types/stockOperation/StockOperationDTO";
import {
  StockOperationStatusCancelled,
  StockOperationStatusNew,
  StockOperationStatusRejected,
  StockOperationStatusReturned,
  StockOperationStatusTypes,
} from "../core/api/types/stockOperation/StockOperationStatus";
import { StockOperationType } from "../core/api/types/stockOperation/StockOperationType";
import { TASK_STOCKMANAGEMENT_STOCKOPERATIONS_MUTATE } from "../core/privileges";
import {
  DATE_PICKER_CONTROL_FORMAT,
  DATE_PICKER_FORMAT,
  formatDisplayDate,
  formatDisplayDateTime,
  formatForDatePicker,
  today,
} from "../core/utils/datetimeUtils";
import { isDesktopLayout, useLayoutType } from "../core/utils/layoutUtils";
import useTranslation from "../core/utils/translation";
import { resolveRouterPath } from "../core/utils/urlUtils";
import { useHasPreviledge } from "../stock-auth/AccessControl";

interface StockOperationTableProps {
  stockOperations: PageableResult<StockOperationDTO>;
  stockOperationTypes?: StockOperationType[];
  createOperationTypes?: StockOperationType[];
  sourceTypes?: Concept[];
  style?: CSSProperties;
  autoFocus?: boolean;
  isLoading: boolean;
  isFetching?: boolean;
  search: {
    onSearch(searchTerm: string): any;
    refetch(): void;
    currentSearchTerm?: string;
    setStatus: React.Dispatch<React.SetStateAction<string | null>>;
    setOperationTypeUuid: React.Dispatch<
      React.SetStateAction<string | null | undefined>
    >;
    setSourceTypeUuid: React.Dispatch<
      React.SetStateAction<string | null | undefined>
    >;
    setLocationUuid: React.Dispatch<
      React.SetStateAction<string | null | undefined>
    >;
    setStockItemUuid: React.Dispatch<
      React.SetStateAction<string | null | undefined>
    >;
    setOperationDateMin: React.Dispatch<
      React.SetStateAction<string | null | undefined>
    >;
    setOperationDateMax: React.Dispatch<
      React.SetStateAction<string | null | undefined>
    >;
    setIsLocationOther: React.Dispatch<
      React.SetStateAction<Boolean | null | undefined>
    >;
    currentOperationTypeUuid: string | null | undefined;
    currentLocationUuid: string | null | undefined;
    currentStockItemUuid: string | null | undefined;
  };
  createStockOperation(): void;
  editStockOperation(uuid: string): void;
  pagination: {
    usePagination: boolean;
    currentPage: number;
    onChange(props: any): any;
    pageSize: number;
    totalItems: number;
    pagesUnknown?: boolean;
    lastPage?: boolean;
  };
}

const MaxDate: Date = today();

const StockOperationTable: React.FC<StockOperationTableProps> = ({
  stockOperations,
  search,
  pagination,
  isLoading,
  autoFocus,
  isFetching,
  createStockOperation,
  editStockOperation,
  stockOperationTypes,
  sourceTypes,
  createOperationTypes,
}) => {
  const { t } = useTranslation();
  const isDesktop = isDesktopLayout(useLayoutType());
  const handlerStockOperationClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, uuid: string) => {
      event.preventDefault();
      editStockOperation(uuid);
    },
    [editStockOperation]
  );
  const [canCreateModifyStockOperations] = useHasPreviledge(
    [TASK_STOCKMANAGEMENT_STOCKOPERATIONS_MUTATE],
    false
  );
  const navigate = useNavigate();

  const headers = [
    {
      key: "operationTypeName",
      header: t("stockmanagement.stockoperation.list.header.operationTypeName"),
    },
    {
      key: "operationNumber",
      header: t("stockmanagement.stockoperation.list.header.operationNumber"),
      isSortable: false,
    },
    {
      key: "status",
      header: t("stockmanagement.stockoperation.list.header.status"),
    },
    {
      key: "location",
      header: t("stockmanagement.stockoperation.list.header.location"),
    },
    {
      key: "responsiblePerson",
      header: t("stockmanagement.stockoperation.list.header.responsiblePerson"),
    },
    {
      key: "operationDate",
      header: t("stockmanagement.stockoperation.list.header.operationDate"),
    },
    { key: "details", header: "" },
  ];

  const rows: Array<any> = useMemo(
    () =>
      stockOperations?.results?.map((stockOperation, index) => ({
        id: stockOperation?.uuid,
        key: `key-${stockOperation?.uuid}`,
        operationTypeName: `${stockOperation?.operationTypeName}`,
        operationNumber: (
          <Link
            to={URL_STOCK_OPERATION(stockOperation?.uuid!)}
            onClick={(e) =>
              handlerStockOperationClick(e, stockOperation?.uuid!)
            }
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
              <ArrowRight16 />
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
              <span className="field-title">
                {t("stockmanagement.created")}
              </span>
              <span className="field-desc">
                <span className="action-date">
                  {formatDisplayDateTime(stockOperation?.dateCreated)}
                </span>{" "}
                {t("stockmanagement.by")}{" "}
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
                  <span className="field-title">
                    {t("stockmanagement.submitted")}
                  </span>
                  <span className="field-desc">
                    <span className="action-date">
                      {formatDisplayDateTime(stockOperation?.submittedDate)}
                    </span>{" "}
                    {t("stockmanagement.by")}{" "}
                    <span className="action-by">
                      {stockOperation.submittedByFamilyName ?? ""}{" "}
                      {stockOperation.submittedByGivenName ?? ""}
                    </span>
                  </span>
                </div>
              )}

            {stockOperation?.completedDate && (
              <div className="field-label">
                <span className="field-title">
                  {t("stockmanagement.completed")}
                </span>
                <span className="field-desc">
                  <span className="action-date">
                    {formatDisplayDateTime(stockOperation?.completedDate)}
                  </span>{" "}
                  {t("stockmanagement.by")}{" "}
                  <span className="action-by">
                    {stockOperation.completedByFamilyName ?? ""}{" "}
                    {stockOperation.completedByGivenName ?? ""}
                  </span>
                </span>
              </div>
            )}

            {stockOperation?.status === StockOperationStatusCancelled && (
              <div className="field-label">
                <span className="field-title">
                  {t("stockmanagement.cancelled")}
                </span>
                <span className="field-desc">
                  <span className="action-date">
                    {formatDisplayDateTime(stockOperation?.cancelledDate)}
                  </span>{" "}
                  {t("stockmanagement.by")}{" "}
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
                <span className="field-title">
                  {t("stockmanagement.rejected")}
                </span>
                <span className="field-desc">
                  <span className="action-date">
                    {formatDisplayDateTime(stockOperation?.rejectedDate)}
                  </span>{" "}
                  {t("stockmanagement.by")}{" "}
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
                <span className="field-title">
                  {t("stockmanagement.returned")}
                </span>
                <span className="field-desc">
                  <span className="action-date">
                    {formatDisplayDateTime(stockOperation?.returnedDate)}
                  </span>{" "}
                  {t("stockmanagement.by")}{" "}
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
      })),
    [stockOperations?.results, t, handlerStockOperationClick]
  );

  const sourceTypesSortable = useMemo(
    () => (sourceTypes ? [...sourceTypes] : []),
    [sourceTypes]
  );
  const handleSearch = useMemo(
    () => debounce((searchTerm) => search.onSearch(searchTerm), 300),
    [search]
  );
  const onSourceTypeChange = ({
    selectedItems,
  }: {
    selectedItems: Concept[];
  }): void => {
    if (!selectedItems || selectedItems.length === 0) {
      search.setSourceTypeUuid(null);
    } else {
      search.setSourceTypeUuid(
        selectedItems.reduce((p, c, i) => {
          if (i === 0) return c.uuid;
          p += (p.length > 0 ? "," : "") + c.uuid;
          return p;
        }, "")
      );
    }
  };

  const onStockOperationTypeChange = ({
    selectedItems,
  }: {
    selectedItems: StockOperationType[];
  }): void => {
    if (!selectedItems || selectedItems.length === 0) {
      search.setOperationTypeUuid(null);
    } else {
      search.setOperationTypeUuid(
        selectedItems.reduce((p, c, i) => {
          if (i === 0) return c.uuid;
          p += (p.length > 0 ? "," : "") + c.uuid;
          return p;
        }, "")
      );
    }
  };

  const onStockOperationStatusChange = ({
    selectedItems,
  }: {
    selectedItems: string[];
  }): void => {
    if (!selectedItems || selectedItems.length === 0) {
      search.setStatus(null);
    } else {
      search.setStatus(
        selectedItems.reduce((p, c, i) => {
          if (i === 0) return c;
          p += (p.length > 0 ? "," : "") + c;
          return p;
        }, "")
      );
    }
  };

  const onActiveDatesChange = (dates: Date[]): void => {
    search.setOperationDateMax(
      dates[1] ? JSON.stringify(dates[1]).replaceAll('"', "") : null
    );
    search.setOperationDateMin(
      dates[0] ? JSON.stringify(dates[0]).replaceAll('"', "") : null
    );
  };

  const onViewItem = (
    itemId: string,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    if (itemId) {
      navigate(URL_STOCK_OPERATION(itemId));
    }
  };

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
    <>
      <div className={styles.tableOverride}>
        <div
          id="table-tool-bar"
          className={`${styles.searchContainer} stkpg-filters ${
            isFetching ? "progress-border" : ""
          }`}
        >
          <div>
            <Search
              id="stock-operation-search"
              placeHolderText={t("stockmanagement.filtertable")}
              labelText=""
              size={"xl"}
              className={styles.search}
              onChange={(evnt) => handleSearch(evnt.target.value)}
            />
          </div>
          <div className="right-filters">
            <DatePicker
              datePickerType="range"
              className="date-range-filter"
              maxDate={formatForDatePicker(MaxDate)}
              locale="en"
              dateFormat={DATE_PICKER_CONTROL_FORMAT}
              onChange={onActiveDatesChange}
            >
              <DatePickerInput
                id="date-picker-input-id-start"
                autoComplete="off"
                placeholder={DATE_PICKER_FORMAT}
                labelText=""
              />
              <DatePickerInput
                id="date-picker-input-id-finish"
                autoComplete="off"
                placeholder={DATE_PICKER_FORMAT}
                labelText=""
              />
            </DatePicker>

            <MultiSelect
              id="stock-operation-source-types"
              useTitleInItem={true}
              onChange={onSourceTypeChange}
              inline
              label={t("stockmanagement.stockoperation.filter.sources")}
              titleText=""
              items={sourceTypesSortable as any}
              itemToString={(item) => item?.display ?? ""}
              selectionFeedback="top-after-reopen"
            ></MultiSelect>
            <MultiSelect
              id="stock-operation-status"
              useTitleInItem={true}
              onChange={onStockOperationStatusChange}
              inline
              label={t("stockmanagement.status")}
              titleText=""
              items={StockOperationStatusTypes}
              itemToString={(item) => item ?? ""}
              selectionFeedback="top-after-reopen"
            ></MultiSelect>
            <MultiSelect
              id="stock-operation-types"
              useTitleInItem={true}
              onChange={onStockOperationTypeChange}
              inline
              label={t("stockmanagement.stockoperation.filter.operation")}
              titleText=""
              items={(stockOperationTypes ?? []) as any}
              itemToString={(item) => item?.name ?? ""}
              selectionFeedback="top-after-reopen"
            ></MultiSelect>
            <TableToolbarMenu>
              <TableToolbarAction onClick={() => search.refetch()}>
                Refresh
              </TableToolbarAction>
            </TableToolbarMenu>
            {canCreateModifyStockOperations && false && (
              <Button
                size="sm"
                hasIcon={true}
                renderIcon={OverflowMenuVertical16}
                kind="primary"
              >
                {t("stockmanagement.startnew")}
              </Button>
            )}
            {canCreateModifyStockOperations &&
              createOperationTypes &&
              createOperationTypes.length > 0 && (
                <OverflowMenu
                  renderIcon={() => (
                    <>
                      {t("stockmanagement.startnew")} <OverflowMenuVertical16 />
                    </>
                  )}
                  className="bx--btn bx--btn--sm bx--btn--primary custom-overflow-menu"
                >
                  {createOperationTypes
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((operation) => {
                      return (
                        <OverflowMenuItem
                          key={operation.uuid}
                          itemText={operation.name}
                          href={`${resolveRouterPath(
                            URL_STOCK_OPERATIONS_NEW_OPERATION(
                              operation.operationType
                            )
                          )}`}
                        />
                      );
                    })}
                </OverflowMenu>
              )}
          </div>
        </div>
        <DataTable
          rows={rows}
          headers={headers}
          isSortable={true}
          useZebraStyles={true}
          render={({
            rows,
            headers,
            getHeaderProps,
            getTableProps,
            getRowProps,
            getSelectionProps,
            getBatchActionProps,
            selectedRows,
          }) => (
            <TableContainer>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    <TableExpandHeader />
                    {headers.map(
                      (header: any, index) =>
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
                  {rows.map((row: any, rowIndex) => {
                    return (
                      <React.Fragment key={row.id}>
                        <TableExpandRow
                          className={
                            isDesktop ? styles.desktopRow : styles.tabletRow
                          }
                          {...getRowProps({ row })}
                        >
                          {row.cells.map(
                            (cell: any, index: any) =>
                              cell?.info?.header !== "details" && (
                                <TableCell key={cell.id}>
                                  {cell.value}
                                </TableCell>
                              )
                          )}
                          <TableCell>
                            <Button
                              type="button"
                              size="sm"
                              className="submitButton clear-padding-margin"
                              iconDescription={"View"}
                              kind="ghost"
                              renderIcon={Edit16}
                              onClick={(e) => onViewItem(row.id, e)}
                            />
                          </TableCell>
                        </TableExpandRow>
                        <TableExpandedRow colSpan={headers.length + 2}>
                          {<div>{row.cells[row.cells.length - 1].value}</div>}
                        </TableExpandedRow>
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        ></DataTable>
        {pagination.usePagination && (
          <Pagination
            page={pagination.currentPage}
            pageSize={pagination.pageSize}
            pageSizes={[10, 20, 30, 40, 50]}
            totalItems={pagination.totalItems}
            onChange={pagination.onChange}
            className={styles.paginationOverride}
            pagesUnknown={pagination?.pagesUnknown}
            isLastPage={pagination.lastPage}
          />
        )}
      </div>
    </>
  );
};

export default StockOperationTable;
