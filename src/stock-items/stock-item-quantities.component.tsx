import {
  DataTable,
  DataTableSkeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "carbon-components-react";
import React, { useEffect, useMemo, useState } from "react";
import styles from "../../root.module.scss";
import { ResourceRepresentation } from "../core/api/api";
import {
  StockItemInventoryFilter,
  useGetStockItemInventoryQuery,
} from "../core/api/stockItem";
import { Party } from "../core/api/types/Party";
import { StockItemInventory } from "../core/api/types/stockItem/StockItemInventory";
import { isDesktopLayout, useLayoutType } from "../core/utils/layoutUtils";
import useTranslation from "../core/utils/translation";

interface StockItemQuantitiesTableProps {
  partyList: Party[];
  stockItemUuid: string;
}

const StockItemQuantitiesTable: React.FC<StockItemQuantitiesTableProps> = ({
  partyList,
  stockItemUuid,
}) => {
  const { t } = useTranslation();
  const isDesktop = isDesktopLayout(useLayoutType());
  const [currentPage] = useState(1);
  const [currentPageSize] = useState(10);
  const [partyUuid] = useState<string | null | undefined>(null);
  const [stockItemInventoryFilter, setStockItemInventoryFilter] =
    useState<StockItemInventoryFilter>({
      startIndex: 0,
      v: ResourceRepresentation.Default,
      limit: 10,
      q: null,
      totalCount: true,
      stockItemUuid: stockItemUuid,
      groupBy: "LocationStockItem",
      totalBy: "StockItemOnly",
    });
  const {
    data: stockItemQuantities,
    isLoading: isLoadingQuantities,
    isUninitialized: transactionUnitialised,
  } = useGetStockItemInventoryQuery(stockItemInventoryFilter, {
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    setStockItemInventoryFilter({
      startIndex: currentPage - 1,
      v: ResourceRepresentation.Default,
      limit: currentPageSize,
      partyUuid: partyUuid,
      totalCount: true,
      stockItemUuid: stockItemUuid,
      groupBy: "LocationStockItem",
      totalBy: "StockItemOnly",
    });
  }, [currentPage, currentPageSize, partyUuid, stockItemUuid]);

  const headers = [
    {
      key: "location",
      header: t("stockmanagement.stockitem.batchinfo.location"),
      styles: { width: "30%" },
    },
    {
      key: "quantity",
      header: t("stockmanagement.stockitem.batchinfo.quantity"),
      styles: { width: "10%" },
    },
    {
      key: "quantityuom",
      header: t("stockmanagement.stockitem.batchinfo.quantityuom"),
      styles: { width: "20%", whiteSpace: "nowrap" },
    },
  ];

  const total: StockItemInventory | undefined = useMemo(() => {
    return stockItemQuantities?.total?.[0];
  }, [stockItemQuantities]);

  const rows: Array<any> = useMemo(
    () =>
      stockItemQuantities?.results?.map((row, index) => ({
        id: `${row.partyUuid}${row.stockBatchUuid}${index}`,
        key: `${row.partyUuid}${row.stockBatchUuid}${index}`,
        uuid: `${row.partyUuid}${row.stockBatchUuid}${index}`,
        location: row?.partyName,
        quantity: row?.quantity?.toLocaleString() ?? "",
        quantityuom: row.quantityUoM ?? "",
      })) ?? [],
    [stockItemQuantities]
  );

  if (isLoadingQuantities || transactionUnitialised) {
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
                        style={header?.styles}
                        key={`${header.key}`}
                        isSortable={header.key !== "name"}
                      >
                        {header.header?.content ?? header.header}
                      </TableHeader>
                    ))}
                    <TableHeader style={{ width: "40%" }}></TableHeader>
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
                          <TableCell></TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })}
                  <TableRow className="table-totals">
                    <TableCell>Total</TableCell>
                    <TableCell>
                      {total?.quantity?.toLocaleString() ?? ""}
                    </TableCell>
                    <TableCell>{total?.quantityUoM ?? ""}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        ></DataTable>
        <div className="table-bottom-border"></div>
        {/* <Pagination
        page={currentPage}
        pageSize={currentPageSize}
        pageSizes={[10, 20, 30, 40, 50]}
        totalItems={stockItemQuantities?.totalCount || 0}
        onChange={onPageInfoChanged}
        className={styles.paginationOverride}
        pagesUnknown={false}
        isLastPage={(stockItemQuantities?.results?.length || 0) < currentPageSize || ((currentPage * currentPageSize) === stockItemQuantities?.totalCount)}

      /> */}
      </div>
    </>
  );
};

export default StockItemQuantitiesTable;
