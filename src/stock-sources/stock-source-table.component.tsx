import { Edit16, TrashCan16 } from '@carbon/icons-react';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  DenormalizedRow,
  Modal,
  Pagination,
  SearchProps,
  Select,
  SelectItem,
  Table,
  TableBatchAction,
  TableBatchActions,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableSelectRow,
  TableToolbar,
  TableToolbarAction,
  TableToolbarContent,
  TableToolbarMenu,
  TableToolbarSearch,
} from 'carbon-components-react';
import debounce from 'lodash-es/debounce';
import React, { CSSProperties, ChangeEvent, useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../root.module.scss';
import { Splash } from '../components/spinner/Splash';
import { URL_STOCK_SOURCES } from '../constants';
import { useDeleteStockSourcesMutation } from '../core/api/stockSource';
import { PageableResult } from '../core/api/types/PageableResult';
import { Concept } from '../core/api/types/concept/Concept';
import { StockSource } from '../core/api/types/stockOperation/StockSource';
import { TASK_STOCKMANAGEMENT_STOCKSOURCES_MUTATE } from '../core/privileges';
import { errorAlert, successAlert } from '../core/utils/alert';
import { ClickElement } from '../core/utils/elementUtil';
import { isDesktopLayout, useLayoutType } from '../core/utils/layoutUtils';
import { toErrorMessage } from '../core/utils/stringUtils';
import useTranslation from '../core/utils/translation';
import { useHasPreviledge } from '../stock-auth/AccessControl';


interface StockSourceTableProps {
  stockSources: PageableResult<StockSource>;
  stockSourceTypes?: Concept;
  style?: CSSProperties;
  autoFocus?: boolean;
  isLoading: boolean;
  isFetching?: boolean;
  search: {
    onSearch(searchTerm: string): any;
    refetch(): void;
    setSourceType: React.Dispatch<React.SetStateAction<string | null | undefined>>;
    currentSearchTerm?: string | null;
    currentSourceType?: string | null;
    otherSearchProps?: SearchProps;
  };
  createStockSource(): void;
  editStockSource(uuid: string): void;
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

const StockSourceTable: React.FC<StockSourceTableProps> = ({
  stockSources,
  stockSourceTypes,
  search,
  pagination,
  isLoading,
  autoFocus,
  isFetching,
  createStockSource,
  editStockSource
}) => {
  const { t } = useTranslation();
  const isDesktop = isDesktopLayout(useLayoutType());
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [selectedDelete, setSelectedDelete] = useState<string[] | null>(null);
  const [startedDeletingStockSource, setStartedDeletingStockSource] = useState(false);
  const [deleteStockSource, { reset: resetDeleteStockSourceHook }] = useDeleteStockSourcesMutation();
  const handlerUserNameClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>, uuid: string) => {
    event.preventDefault();
    editStockSource(uuid);
  }, [editStockSource]);
  const [canCreateModifyStockSources] = useHasPreviledge([TASK_STOCKMANAGEMENT_STOCKSOURCES_MUTATE], false);

  const onViewItem = (itemId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    editStockSource(itemId);
  }

  const headers = [
    {
      key: 'name',
      header: t('stockmanagement.stocksource.list.header.name'),
    },
    {
      key: 'acronym',
      header: t('stockmanagement.stocksource.list.header.acronym'),
    },
    {
      key: 'sourceType',
      header: t('stockmanagement.stocksource.list.header.sourcetype'),
    }
  ];

  const rows: Array<any> = useMemo(() =>
    stockSources?.results?.map((stockSource, index) => ({
      id: stockSource?.uuid,
      key: `key-${stockSource?.uuid}`,
      uuid: `${stockSource?.uuid}`,
      name: !canCreateModifyStockSources ? `${stockSource?.name}` : <Link to={URL_STOCK_SOURCES} onClick={(e) => handlerUserNameClick(e, stockSource?.uuid)}>{`${stockSource?.name}`}</Link>,
      acronym: stockSource?.acronym,
      sourceType: stockSource?.sourceType?.display
    })),
    [stockSources, handlerUserNameClick, canCreateModifyStockSources],
  );

  const handleSearch = useMemo(() => debounce((searchTerm) => search.onSearch(searchTerm), 300), [search]);

  function deleteSelectedRows(event: React.MouseEvent<HTMLButtonElement>, selectedRows: readonly DenormalizedRow[]) {
    if (selectedRows?.length > 0) {
      setSelectedDelete(selectedRows.map(p => p.id))
      setOpenDeleteConfirm(true);
    }
  };

  function deleteStockSourceOnCancel() {
    setSelectedDelete(null)
    setOpenDeleteConfirm(false);
  }

  function deleteStockSourceOnContinue() {
    if (selectedDelete == null || selectedDelete.length === 0) {
      deleteStockSourceOnCancel();
      return;
    }
    setOpenDeleteConfirm(false);
    setStartedDeletingStockSource(true);
    resetDeleteStockSourceHook();
    deleteStockSource(selectedDelete).then(
      (payload: any) => {
        setStartedDeletingStockSource(false);
        if ((payload as any).error) {
          var errorMessage = toErrorMessage(payload);
          errorAlert(`${t("stockmanagement.stocksource.delete.failed")} ${errorMessage}`);
          return;
        }
        ClickElement('button.bx--batch-summary__cancel');
        setSelectedDelete(null);
        search.refetch();
        successAlert(t("stockmanagement.stocksource.delete.success"));
      })
      .catch((error) => {
        setStartedDeletingStockSource(false);
        var errorMessage = toErrorMessage(error);
        errorAlert(`${t("stockmanagement.stocksource.delete.failed")} ${errorMessage}`);
        return;
      });
  }

  const onSourceTypeChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    search.setSourceType(evt.target.value);
  }

  if (isLoading) {
    return <DataTableSkeleton className={styles.dataTableSkeleton} showHeader={false} rowCount={5} columnCount={5} zebra />;
  }

  return <>

    {openDeleteConfirm && <Modal
      primaryButtonText={t("stockmanagement.yes")}
      secondaryButtonText={t("stockmanagement.no")}
      modalHeading={t("stockmanagement.confirm")}
      danger={true}
      onRequestClose={deleteStockSourceOnCancel}
      shouldSubmitOnEnter={false}
      onRequestSubmit={deleteStockSourceOnContinue}
      onSecondarySubmit={deleteStockSourceOnCancel}
      open={true}
      size="sm"
    >
      <p>{t("stockmanagement.stocksource.delete.confirmText")}</p>
    </Modal>
    }
    {startedDeletingStockSource && <Splash active />}
    <div className={styles.tableOverride}>
      <DataTable rows={rows} headers={headers} isSortable={true} useZebraStyles={true}
        render={({ rows, headers, getHeaderProps, getTableProps, getRowProps, getSelectionProps, getBatchActionProps, selectedRows }) => (
          <TableContainer>
            <TableToolbar>
              <TableBatchActions {...getBatchActionProps()}>
                {canCreateModifyStockSources && <TableBatchAction
                  renderIcon={TrashCan16}
                  iconDescription={t('stockmanagement.stocksource.list.deleteselectedrows')}
                  onClick={(e) => deleteSelectedRows(e, selectedRows)}
                >
                  {t('stockmanagement.delete')}
                </TableBatchAction>
                }
              </TableBatchActions>
              <TableToolbarContent>
                <TableToolbarSearch expanded={true} onChange={(evnt) => handleSearch(evnt.target.value)} persistent={true} />
                <Select className='stkpg-datable-select' inline id="sourceType" labelText="" onChange={onSourceTypeChange}>
                  <SelectItem text='All' value={""} />
                  {(stockSourceTypes?.answers && stockSourceTypes?.answers.length > 0 ? stockSourceTypes?.answers : stockSourceTypes?.setMembers)?.map(sourceType => {
                    return <SelectItem key={sourceType.uuid} value={sourceType.uuid} text={sourceType.display} />
                  })}
                </Select>
                <TableToolbarMenu>
                  <TableToolbarAction onClick={() => search.refetch()}>
                    Refresh
                  </TableToolbarAction>
                </TableToolbarMenu>
                {canCreateModifyStockSources && <Button onClick={createStockSource} size="sm" kind="primary">
                  {t('stockmanagement.addnew')}
                </Button>
                }
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {canCreateModifyStockSources && <TableHeader className='checkbox-column' />}
                  {headers.map((header: any, index) => (
                    <TableHeader
                      {...getHeaderProps({
                        header,
                        isSortable: header.isSortable,
                      })}
                      className={isDesktop ? styles.desktopHeader : styles.tabletHeader}
                      key={`${header.key}`}>
                      {header.header?.content ?? header.header}
                    </TableHeader>
                  ))}
                  {canCreateModifyStockSources &&
                    <TableHeader></TableHeader>
                  }
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row: any, rowIndex) => {
                  return (
                    <TableRow
                      className={isDesktop ? styles.desktopRow : styles.tabletRow}
                      key={row.id}>
                      {canCreateModifyStockSources && <TableSelectRow className='checkbox-column' key={`tsr${row.id}`} {...getSelectionProps({ row })} />}
                      {row.cells.map((cell: any, index: any) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                      {canCreateModifyStockSources && <TableCell>
                        <Button type="button" size="sm" className="submitButton clear-padding-margin" iconDescription={"View"} kind="ghost" renderIcon={Edit16} onClick={(e) => onViewItem(row.id, e)} />
                      </TableCell>
                      }
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      >
      </DataTable>
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
  </>;
};

export default StockSourceTable;
