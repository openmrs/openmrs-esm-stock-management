import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useStockOperationPages } from "./stock-operations-table.resource";
import { ResourceRepresentation } from "../core/api/api";
import { URL_STOCK_OPERATION } from "../stock-items/stock-items-table.component";
import {
  Link,
  Tile,
  TableToolbarSearch,
  TableToolbarMenu,
  TableToolbarAction,
  DatePicker,
  DatePickerInput,
} from "@carbon/react";
import { ArrowRight } from "@carbon/react/icons";
import DataList from "../core/components/table/table.component";
import { formatDisplayDate } from "../core/utils/datetimeUtils";
import styles from "../stock-items/stock-items-table.scss";
import AddStockOperationActionButton from "./add-stock-operation-button.component";
import StockOperationSourcesFilter from "./stock-operation-sources-filter/stock-operation-sources-filter.component";
import StockOperationStatusesFilter from "./stock-operation-statuses-filter/stock-operation-statuses-filter.component";
import {
  DATE_PICKER_CONTROL_FORMAT,
  DATE_PICKER_FORMAT,
  formatForDatePicker,
  today,
} from "../constants";
import StockOperationOperationsFilter from "./stock-operation-operations-filter/stock-operation-operations-filter.component";

interface StockOperationsTableProps {
  status?: string;
}

const StockOperations: React.FC<StockOperationsTableProps> = () => {
  const { items, tableHeaders } = useStockOperationPages({
    v: ResourceRepresentation.Default,
  });

  const MaxDate: Date = today();

  const handleImport = () => {
    // setShowImport(true);
  };

  const handleRefresh = () => {
    // search.refetch()
  };

  const createStockItem = () => {
    // search.refetch()
  };

  // const onActiveDatesChange = (dates: Date[]): void => {
  //   search.setOperationDateMax(
  //     dates[1] ? JSON.stringify(dates[1]).replaceAll('"', "") : null
  //   );
  //   search.setOperationDateMin(
  //     dates[0] ? JSON.stringify(dates[0]).replaceAll('"', "") : null
  //   );
  // }

  const tableRows = useMemo(() => {
    return items?.map((stockOperation) => ({
      ...stockOperation,
      id: stockOperation?.uuid,
      key: `key-${stockOperation?.uuid}`,
      operationTypeName: `${stockOperation?.operationTypeName}`,
      operationNumber: (
        <Link
          to={URL_STOCK_OPERATION(stockOperation?.uuid)}
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
            <ArrowRight />
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
    }));
  }, [items]);

  if (items?.length) {
    return (
      <DataList columns={tableHeaders} data={tableRows}>
        {({ onInputChange }) => (
          <>
            <TableToolbarSearch persistent onChange={onInputChange} />
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <DatePicker
                datePickerType="range"
                className="date-range-filter"
                maxDate={formatForDatePicker(MaxDate)}
                locale="en"
                dateFormat={DATE_PICKER_CONTROL_FORMAT}
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
              <StockOperationSourcesFilter />
              <StockOperationStatusesFilter />
              <StockOperationOperationsFilter />
            </div>

            <TableToolbarMenu>
              <TableToolbarAction onClick={handleRefresh}>
                Refresh
              </TableToolbarAction>
            </TableToolbarMenu>
            <AddStockOperationActionButton />
          </>
        )}
      </DataList>
    );
  }

  return (
    <div className={styles.tileContainer}>
      <Tile className={styles.tile}>
        <p className={styles.content}>No stock operations to display</p>
      </Tile>
    </div>
  );
};

export default StockOperations;
