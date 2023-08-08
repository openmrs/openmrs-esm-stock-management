import {
  DataTable,
  DataTableSkeleton,
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
} from 'carbon-components-react';
import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import styles from '../../root.module.scss';
import { ResourceRepresentation } from '../core/api/api';
import { StockItemInventoryFilter, useGetStockItemInventoryQuery } from '../core/api/stockItem';
import { Party } from '../core/api/types/Party';
import { formatDisplayDate } from '../core/utils/datetimeUtils';
import { isDesktopLayout, useLayoutType } from '../core/utils/layoutUtils';
import useTranslation from '../core/utils/translation';


interface StockItemBatchInformationTableProps {
  partyList: Party[],
  stockItemUuid: string
}

const StockItemBatchInformationTable: React.FC<StockItemBatchInformationTableProps> = ({
  partyList,
  stockItemUuid
}) => {
  const { t } = useTranslation();
  const isDesktop = isDesktopLayout(useLayoutType());
  const [currentPage] = useState(1);
  const [currentPageSize] = useState(10);
  const [partyUuid, setPartyUuid] = useState<string | null | undefined>(null);
  const [stockItemInventoryFilter, setStockItemInventoryFilter] = useState<StockItemInventoryFilter>({ startIndex: 0, v: ResourceRepresentation.Default, limit: 10, q: null, totalCount: true, stockItemUuid: stockItemUuid, groupBy: 'LocationStockItemBatchNo' });
  const { data: stockItemBatchInformation, isLoading: isLoadingBatchInformation, isUninitialized: transactionUnitialised } = useGetStockItemInventoryQuery(stockItemInventoryFilter, { refetchOnMountOrArgChange: true });

  useEffect(() => {
    setStockItemInventoryFilter({ startIndex: currentPage - 1, v: ResourceRepresentation.Default, limit: currentPageSize, partyUuid: partyUuid, totalCount: true, stockItemUuid: stockItemUuid, groupBy: 'LocationStockItemBatchNo' });
  }, [currentPage, currentPageSize, partyUuid, stockItemUuid]);

  const headers = [
    { key: 'location', header: t('stockmanagement.stockitem.batchinfo.location') },
    { key: 'batchno', header: t('stockmanagement.stockitem.batchinfo.batchno') },
    { key: 'quantity', header: t('stockmanagement.stockitem.batchinfo.quantity') },
    { key: 'quantityuom', header: t('stockmanagement.stockitem.batchinfo.quantityuom') },
    { key: 'expiration', header: t('stockmanagement.stockitem.batchinfo.expiration') },
  ];

  const rows: Array<any> = useMemo(() =>
    stockItemBatchInformation?.results?.map((row, index) => ({
      id: `${row.partyUuid}${row.stockBatchUuid}${index}`,
      key: `${row.partyUuid}${row.stockBatchUuid}${index}`,
      uuid: `${row.partyUuid}${row.stockBatchUuid}${index}`,
      expiration: formatDisplayDate(row?.expiration),
      location: row?.partyName,
      quantity: row?.quantity?.toLocaleString() ?? "",
      batchno: row.batchNumber ?? "",
      quantityuom: row.quantityUoM ?? ""
    })) ?? [],
    [stockItemBatchInformation],
  );

  // const onPageInfoChanged = (data: { page: number, pageSize: number }) => {
  //   setPageCount(data.page);
  //   setCurrentPageSize(data.pageSize);
  // }

  const onPartyChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    setPartyUuid(evt.target.value);
  }

  if (isLoadingBatchInformation || transactionUnitialised) {
    return <DataTableSkeleton className={styles.dataTableSkeleton} showHeader={false} rowCount={5} columnCount={5} zebra />;
  }

  return <>
    <div className={styles.tableOverride}>
      <DataTable rows={rows} headers={headers} isSortable={true} useZebraStyles={true}
        render={({ rows, headers, getHeaderProps, getTableProps, getRowProps, getSelectionProps, getBatchActionProps, selectedRows }) => (
          <TableContainer>
            <TableToolbar>
              <TableToolbarContent>
                <Select id="locationFilter"
                  name='locationFilter' className='select-field' labelText=""
                  onChange={onPartyChange}>
                  <SelectItem value="" text={t("stockmanagement.stockitem.alllocations")} />
                  {partyList?.map(party => {
                    return <SelectItem key={party.uuid} value={party.uuid} text={party.name} />
                  })}
                </Select>
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
                      className={isDesktop ? styles.desktopHeader : styles.tabletHeader}
                      key={`${header.key}`} isSortable={header.key !== 'name'}>
                      {header.header?.content ?? header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row: any, rowIndex) => {
                  return <React.Fragment key={row.id}>
                    <TableRow
                      className={isDesktop ? styles.desktopRow : styles.tabletRow}
                      {...getRowProps({ row })}
                      key={row.id}>
                      {row.cells.map((cell: any, index: any) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableRow>
                  </React.Fragment>
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      >
      </DataTable>
      <div className="table-bottom-border"></div>
      {/* <Pagination
        page={currentPage}
        pageSize={currentPageSize}
        pageSizes={[10, 20, 30, 40, 50]}
        totalItems={stockItemBatchInformation?.totalCount || 0}
        onChange={onPageInfoChanged}
        className={styles.paginationOverride}
        pagesUnknown={false}
        isLastPage={(stockItemBatchInformation?.results?.length || 0) < currentPageSize || ((currentPage * currentPageSize) === stockItemBatchInformation?.totalCount)}

      /> */}
    </div>
  </>;
};

export default StockItemBatchInformationTable;
