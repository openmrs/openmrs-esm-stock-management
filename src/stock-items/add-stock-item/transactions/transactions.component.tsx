import React, { useEffect, useMemo, useState } from "react";
import { ResourceRepresentation } from "../../../core/api/api";
import { useStockItemsTransactions } from "./transactions.resource";
import {
  DataTableSkeleton,
  Tile,
  DatePicker,
  DatePickerInput,
} from "@carbon/react";
import {
  DATE_PICKER_CONTROL_FORMAT,
  DATE_PICKER_FORMAT,
  formatDisplayDate,
} from "../../../core/utils/datetimeUtils";
import { ArrowLeft } from "@carbon/react/icons";
import DataList from "../../../core/components/table/table.component";
import styles from "../../stock-items-table.scss";
import { StockOperationType } from "../../../core/api/types/stockOperation/StockOperationType";
import EditStockOperationActionMenu from "../../../stock-operations/edit-stock-operation/edit-stock-operation-action-menu.component";
import TransactionsLocationsFilter from "./transaction-filters/transaction-locations-filter.component";
import { useForm } from "react-hook-form";
import { StockItemInventoryFilter } from "../../stock-items.resource";

interface TransactionsProps {
  onSubmit?: () => void;
  stockItemUuid: string;
}

const Transactions: React.FC<TransactionsProps> = ({ stockItemUuid }) => {
  const [stockItemFilter, setStockItemFilter] =
    useState<StockItemInventoryFilter>();
  const {
    isLoading,
    items,
    tableHeaders,
    totalCount,
    setCurrentPage,
    setStockItemUuid,
  } = useStockItemsTransactions(stockItemFilter);

  const [selectedFromDate, setSelectedFromDate] = useState(null);
  const [selectedToDate, setSelectedToDate] = useState(null);

  useEffect(() => {
    setStockItemUuid(stockItemUuid);
  }, [stockItemUuid, setStockItemUuid]);

  const { control } = useForm({});

  let operations: StockOperationType[] | null | undefined;
  const tableRows = useMemo(() => {
    return items?.map((stockItemTransaction) => ({
      ...stockItemTransaction,
      id: stockItemTransaction?.uuid,
      key: `key-${stockItemTransaction?.uuid}`,
      uuid: `${stockItemTransaction?.uuid}`,
      date: formatDisplayDate(stockItemTransaction?.dateCreated),
      location:
        stockItemTransaction.operationSourcePartyName &&
        stockItemTransaction.operationDestinationPartyName ? (
          stockItemTransaction.operationSourcePartyName ===
          stockItemTransaction?.partyName ? (
            stockItemTransaction.quantity > 0 ? (
              <>
                <span className="transaction-location">
                  {stockItemTransaction.operationSourcePartyName}
                </span>
                <ArrowLeft size={16} />{" "}
                {stockItemTransaction.operationDestinationPartyName}
              </>
            ) : (
              <>
                <span className="transaction-location">
                  {stockItemTransaction.operationSourcePartyName}
                </span>
                <ArrowLeft size={16} />{" "}
                {stockItemTransaction.operationDestinationPartyName}
              </>
            )
          ) : stockItemTransaction.operationDestinationPartyName ===
            stockItemTransaction?.partyName ? (
            stockItemTransaction.quantity > 0 ? (
              <>
                <span className="transaction-location">
                  {stockItemTransaction.operationDestinationPartyName}
                </span>
                <ArrowLeft size={16} />{" "}
                {stockItemTransaction.operationSourcePartyName}
              </>
            ) : (
              <>
                <span className="transaction-location">
                  {stockItemTransaction.operationDestinationPartyName}
                </span>
                <ArrowLeft size={16} />{" "}
                {stockItemTransaction.operationSourcePartyName}
              </>
            )
          ) : (
            stockItemTransaction?.partyName
          )
        ) : (
          stockItemTransaction?.partyName
        ),
      transaction: stockItemTransaction?.isPatientTransaction
        ? "Patient Dispense"
        : stockItemTransaction.stockOperationTypeName,
      quantity: `${stockItemTransaction?.quantity?.toLocaleString()} ${
        stockItemTransaction?.packagingUomName ?? ""
      }`,
      batch: stockItemTransaction.stockBatchNo
        ? `${stockItemTransaction.stockBatchNo}${
            stockItemTransaction.expiration
              ? ` (${formatDisplayDate(stockItemTransaction.expiration)})`
              : ""
          }`
        : "",
      reference: stockItemTransaction?.stockOperationUuid ? (
        <EditStockOperationActionMenu
          operationUuid={stockItemTransaction?.stockOperationUuid}
          operationNumber={stockItemTransaction?.stockOperationNumber}
          operations={operations}
        />
      ) : (
        <></>
      ),
      status: stockItemTransaction?.stockOperationStatus ?? "",
      in:
        stockItemTransaction?.quantity >= 0
          ? `${stockItemTransaction?.quantity?.toLocaleString()} ${
              stockItemTransaction?.packagingUomName ?? ""
            } of ${stockItemTransaction.packagingUomFactor}`
          : "",
      out:
        stockItemTransaction?.quantity < 0
          ? `${(-1 * stockItemTransaction?.quantity)?.toLocaleString()} ${
              stockItemTransaction?.packagingUomName ?? ""
            } of ${stockItemTransaction.packagingUomFactor}`
          : "",
    }));
  }, [items, operations]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  const handleDateFilterChange = ([startDate, endDate]) => {
    if (startDate) {
      setSelectedFromDate(startDate);
      if (selectedToDate && startDate && selectedToDate < startDate) {
        setSelectedToDate(startDate);
      }
    }
    if (endDate) {
      setSelectedToDate(endDate);
      if (selectedFromDate && endDate && selectedFromDate > endDate) {
        setSelectedFromDate(endDate);
      }
    }
  };

  if (items?.length != undefined) {
    return (
      <DataList
        children={() => (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <DatePicker
              className={styles.dateAlign}
              datePickerType="range"
              dateFormat={DATE_PICKER_CONTROL_FORMAT}
              value={[selectedFromDate, selectedToDate]}
              onChange={([startDate, endDate]) => {
                handleDateFilterChange([startDate, endDate]);
              }}
            >
              <DatePickerInput placeholder={DATE_PICKER_FORMAT} />
              <DatePickerInput placeholder={DATE_PICKER_FORMAT} />
            </DatePicker>
            <TransactionsLocationsFilter
              onLocationIdChange={(q) => {
                setStockItemFilter({ ...stockItemFilter, locationUuid: q });
              }}
              name="TransactionLocationUuid"
              placeholder="Filter by Location"
              control={control}
              controllerName="TransactionLocationUuid"
            />
          </div>
        )}
        columns={tableHeaders}
        data={tableRows}
        totalItems={totalCount}
        goToPage={setCurrentPage}
        hasToolbar={true}
      />
    );
  }

  return (
    <div className={styles.tileContainer}>
      <Tile className={styles.tile}>
        <p className={styles.content}>No transactions to display</p>
      </Tile>
    </div>
  );
};

export default Transactions;
