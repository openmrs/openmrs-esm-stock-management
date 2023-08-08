import { ArrowLeft16, ArrowRight16 } from "@carbon/icons-react";
import {
  DataTable,
  DataTableSkeleton,
  DatePicker,
  DatePickerInput,
  Pagination,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
} from "carbon-components-react";
import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../../root.module.scss";
import { URL_STOCK_OPERATION } from "../constants";
import { ResourceRepresentation } from "../core/api/api";
import {
  StockItemTransactionFilter,
  useGetStockItemTransactionsQuery,
} from "../core/api/stockItem";
import { Party } from "../core/api/types/Party";
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

interface StockItemTransactionsTableProps {
  partyList: Party[];
  stockItemUuid: string;
}

const MaxDate = today();

const StockItemTransactionsTable: React.FC<StockItemTransactionsTableProps> = ({
  partyList,
  stockItemUuid,
}) => {
  const { t } = useTranslation();
  const isDesktop = isDesktopLayout(useLayoutType());
  const [currentPage, setPageCount] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [partyUuid, setPartyUuid] = useState<string | null | undefined>(null);
  const [stockItemTransactionFilter, setStockItemTransactionFilter] =
    useState<StockItemTransactionFilter>({
      startIndex: 0,
      v: ResourceRepresentation.Default,
      limit: 10,
      q: null,
      totalCount: true,
      stockItemUuid: stockItemUuid,
    });
  const {
    data: stockItemTransactions,
    isLoading: isLoadingTransactions,
    isUninitialized: transactionUnitialised,
  } = useGetStockItemTransactionsQuery(stockItemTransactionFilter, {
    refetchOnMountOrArgChange: true,
  });
  const [transactionDateMin, setTransactionDateMin] = useState<
    string | null | undefined
  >(null);
  const [transactionDateMax, setTransactionDateMax] = useState<
    string | null | undefined
  >(null);
  useEffect(() => {
    setStockItemTransactionFilter({
      startIndex: currentPage - 1,
      v: ResourceRepresentation.Default,
      limit: currentPageSize,
      partyUuid: partyUuid,
      totalCount: true,
      stockItemUuid: stockItemUuid,
      dateMin: transactionDateMin,
      dateMax: transactionDateMax,
    });
  }, [
    currentPage,
    currentPageSize,
    partyUuid,
    stockItemUuid,
    transactionDateMax,
    transactionDateMin,
  ]);

  const headers = [
    {
      key: "date",
      header: t("stockmanagement.stockitem.transactions.datecreated"),
    },
    {
      key: "party",
      header: t("stockmanagement.stockitem.transactions.location"),
    },
    {
      key: "transactiontype",
      header: t("stockmanagement.stockitem.transactions.transactiontype"),
    },
    {
      key: "qtyin",
      header: t("stockmanagement.stockitem.transactions.quantityin"),
    },
    {
      key: "qtyout",
      header: t("stockmanagement.stockitem.transactions.quantityout"),
    },
    {
      key: "batchno",
      header: t("stockmanagement.stockitem.transactions.batchno"),
    },
    {
      key: "reference",
      header: t("stockmanagement.stockitem.transactions.reference"),
    },
    {
      key: "status",
      header: t("stockmanagement.stockitem.transactions.status"),
    },
  ];

  const rows: Array<any> = useMemo(
    () =>
      stockItemTransactions?.results?.map((stockItemTransaction, index) => ({
        id: stockItemTransaction?.uuid,
        key: `key-${stockItemTransaction?.uuid}`,
        uuid: `${stockItemTransaction?.uuid}`,
        date: formatDisplayDateTime(stockItemTransaction?.dateCreated),
        party:
          stockItemTransaction.operationSourcePartyName &&
          stockItemTransaction.operationDestinationPartyName ? (
            stockItemTransaction.operationSourcePartyName ===
            stockItemTransaction?.partyName ? (
              stockItemTransaction.quantity > 0 ? (
                <>
                  <span className="transaction-location">
                    {stockItemTransaction.operationSourcePartyName}
                  </span>{" "}
                  <ArrowLeft16 />{" "}
                  {stockItemTransaction.operationDestinationPartyName}
                </>
              ) : (
                <>
                  <span className="transaction-location">
                    {stockItemTransaction.operationSourcePartyName}
                  </span>{" "}
                  <ArrowRight16 />{" "}
                  {stockItemTransaction.operationDestinationPartyName}
                </>
              )
            ) : stockItemTransaction.operationDestinationPartyName ===
              stockItemTransaction?.partyName ? (
              stockItemTransaction.quantity > 0 ? (
                <>
                  <span className="transaction-location">
                    {stockItemTransaction.operationDestinationPartyName}
                  </span>{" "}
                  <ArrowLeft16 />{" "}
                  {stockItemTransaction.operationSourcePartyName}
                </>
              ) : (
                <>
                  <span className="transaction-location">
                    {stockItemTransaction.operationDestinationPartyName}
                  </span>{" "}
                  <ArrowRight16 />{" "}
                  {stockItemTransaction.operationSourcePartyName}
                </>
              )
            ) : (
              stockItemTransaction?.partyName
            )
          ) : (
            stockItemTransaction?.partyName
          ),
        transactiontype: stockItemTransaction?.isPatientTransaction
          ? t("stockmanagement.patientrelated")
          : stockItemTransaction.stockOperationTypeName,
        quantity: `${stockItemTransaction?.quantity?.toLocaleString()} ${
          stockItemTransaction?.packagingUomName ?? ""
        }`,
        batchno: stockItemTransaction.stockBatchNo
          ? `${stockItemTransaction.stockBatchNo}${
              stockItemTransaction.expiration
                ? ` (${formatDisplayDate(stockItemTransaction.expiration)})`
                : ""
            }`
          : "",
        reference: stockItemTransaction?.stockOperationUuid ? (
          <Link
            to={URL_STOCK_OPERATION(stockItemTransaction?.stockOperationUuid!)}
            target={"_blank"}
          >{`${stockItemTransaction?.stockOperationNumber}`}</Link>
        ) : (
          <></>
        ),
        status: stockItemTransaction?.stockOperationStatus ?? "",
        qtyin:
          stockItemTransaction?.quantity >= 0
            ? `${stockItemTransaction?.quantity?.toLocaleString()} ${
                stockItemTransaction?.packagingUomName ?? ""
              }`
            : "",
        qtyout:
          stockItemTransaction?.quantity < 0
            ? `${(-1 * stockItemTransaction?.quantity)?.toLocaleString()} ${
                stockItemTransaction?.packagingUomName ?? ""
              }`
            : "",
      })) ?? [],
    [stockItemTransactions, t]
  );

  const onPageInfoChanged = (data: { page: number; pageSize: number }) => {
    setPageCount(data.page);
    setCurrentPageSize(data.pageSize);
  };

  const onPartyChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    setPartyUuid(evt.target.value);
  };

  const onActiveDatesChange = (dates: Date[]): void => {
    setTransactionDateMax(
      dates[1]
        ? JSON.stringify(dates[1].setHours(23, 59, 59, 999)).replaceAll('"', "")
        : null
    );
    setTransactionDateMin(
      dates[0] ? JSON.stringify(dates[0]).replaceAll('"', "") : null
    );
  };

  if (isLoadingTransactions || transactionUnitialised) {
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
              <TableToolbar>
                <TableToolbarContent className="stkpg-filters-nosearch">
                  <div></div>
                  <div>
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
                    <Select
                      id="locationFilter"
                      name="locationFilter"
                      className="select-field"
                      labelText=""
                      onChange={onPartyChange}
                    >
                      <SelectItem
                        value=""
                        text={t("stockmanagement.stockitem.alllocations")}
                      />
                      {partyList?.map((party) => {
                        return (
                          <SelectItem
                            key={party.uuid}
                            value={party.uuid}
                            text={party.name}
                          />
                        );
                      })}
                    </Select>
                  </div>
                </TableToolbarContent>
              </TableToolbar>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {headers.map((header: any, index) => (
                      <TableHeader
                        {...getHeaderProps({
                          header,
                          isSortable: header.isSortable,
                        })}
                        className={
                          isDesktop ? styles.desktopHeader : styles.tabletHeader
                        }
                        key={`${header.key}`}
                        isSortable={header.key !== "name"}
                      >
                        {header.header?.content ?? header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row: any, rowIndex) => {
                    return (
                      <React.Fragment key={row.id}>
                        <TableRow
                          className={
                            isDesktop ? styles.desktopRow : styles.tabletRow
                          }
                          {...getRowProps({ row })}
                          key={row.id}
                        >
                          {row.cells.map((cell: any, index: any) => (
                            <TableCell key={cell.id}>{cell.value}</TableCell>
                          ))}
                        </TableRow>
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        ></DataTable>
        <Pagination
          page={currentPage}
          pageSize={currentPageSize}
          pageSizes={[10, 20, 30, 40, 50]}
          totalItems={stockItemTransactions?.totalCount || 0}
          onChange={onPageInfoChanged}
          className={styles.paginationOverride}
          pagesUnknown={false}
          isLastPage={
            (stockItemTransactions?.results?.length || 0) < currentPageSize ||
            currentPage * currentPageSize === stockItemTransactions?.totalCount
          }
        />
      </div>
    </>
  );
};

export default StockItemTransactionsTable;
