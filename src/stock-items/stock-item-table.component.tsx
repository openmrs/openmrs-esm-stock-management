import { Edit16 } from '@carbon/icons-react';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  Modal,
  Pagination,
  RadioButton,
  RadioButtonGroup,
  Table,
  TableBatchActions,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarAction,
  TableToolbarContent,
  TableToolbarMenu,
  TableToolbarSearch,
} from 'carbon-components-react';
import debounce from 'lodash-es/debounce';
import React, { CSSProperties, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../../root.module.scss';
import { Splash } from '../components/spinner/Splash';
import { URL_STOCK_ITEM } from '../constants';
import { useDeleteStockItemsMutation } from '../core/api/stockItem';
import { PageableResult } from '../core/api/types/PageableResult';
import { StockItemDTO } from '../core/api/types/stockItem/StockItem';
import { TASK_STOCKMANAGEMENT_STOCKITEMS_MUTATE } from '../core/privileges';
import { errorAlert, successAlert } from '../core/utils/alert';
import { ClickElement } from '../core/utils/elementUtil';
import { isDesktopLayout, useLayoutType } from '../core/utils/layoutUtils';
import { toErrorMessage } from '../core/utils/stringUtils';
import useTranslation from '../core/utils/translation';
import { useHasPreviledge } from '../stock-auth/AccessControl';
import { ImportModalPopup } from './import-modal-popup.component';


interface StockItemTableProps {
  stockItems: PageableResult<StockItemDTO>;
  style?: CSSProperties;
  autoFocus?: boolean;
  isLoading: boolean;
  isFetching?: boolean;
  search: {
    onSearch(searchTerm: string): any;
    onItemTypeChange(isDrug: string): void;
    refetch(): void;
    currentSearchTerm?: string;
    currentItemType?: string;
  };
  createStockItem(): void;
  editStockItem(uuid: string): void;
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

const StockItemTable: React.FC<StockItemTableProps> = ({
  stockItems,
  search,
  pagination,
  isLoading,
  autoFocus,
  isFetching,
  createStockItem,
  editStockItem
}) => {
  const { t } = useTranslation();
  const isDesktop = isDesktopLayout(useLayoutType());
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [selectedDelete, setSelectedDelete] = useState<string[] | null>(null);
  const [startedDeletingStockItem, setStartedDeletingStockItem] = useState(false);
  const [deleteStockItem, { reset: resetDeleteStockItemHook }] = useDeleteStockItemsMutation();
  // const handlerStockItemClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>, uuid: string) => {
  //   event.preventDefault();
  //   editStockItem(uuid);
  // }, [editStockItem]);
  const [canCreateModifyStockItems] = useHasPreviledge([TASK_STOCKMANAGEMENT_STOCKITEMS_MUTATE], false);
  const [showImport, setShowImport] = useState(false);
  const navigate = useNavigate();

  const headers = [
    {
      key: 'type',
      header: t('stockmanagement.stockitem.list.header.type'),
    },
    {
      key: 'genericname',
      header: t('stockmanagement.stockitem.list.header.genericname'),
    },
    {
      key: 'commonname',
      header: t('stockmanagement.stockitem.list.header.commonname'),
    },
    {
      key: 'tradename',
      header: t('stockmanagement.stockitem.list.header.tradename'),
    },
    // {
    //   key: 'preferredVendorName',
    //   header: t('stockmanagement.stockitem.list.header.preferredVendorName'),
    // },
    {
      key: 'dispensingUnitName',
      header: t('stockmanagement.stockitem.list.header.dispensingUnitName'),
    },
    // {
    //   key: 'dispensingUnitPackagingUoMName',
    //   header: t('stockmanagement.stockitem.list.header.dispensingUnitPackagingUoMName'),
    // },
    {
      key: 'defaultStockOperationsUoMName',
      header: t('stockmanagement.stockitem.list.header.defaultStockOperationsUoMName'),
    },
    // {
    //   key: 'retired',
    //   header: t('stockmanagement.stockitem.list.header.retired'),
    // }
    {
      key: 'reorderLevel',
      header: t('stockmanagement.stockitem.list.header.reorderLevel'),
    },
    // { key: 'details', header: "" }
  ];

  const rows: Array<any> = useMemo(() =>
    stockItems?.results?.map((stockItem, index) => ({
      id: stockItem?.uuid,
      key: `key-${stockItem?.uuid}`,
      uuid: `${stockItem?.uuid}`,
      type: stockItem?.drugUuid ? t("stockmanagement.drug") : t("stockmanagement.other"),
      genericname: <Link to={URL_STOCK_ITEM(stockItem?.uuid!)}>{`${stockItem?.drugName ?? stockItem.conceptName}`}</Link>,
      commonname: stockItem?.commonName,
      tradename: stockItem?.drugUuid ? stockItem?.conceptName : "",
      retired: stockItem?.voided ? t("stockmanagement.yes") : t("stockmanagement.no"),
      isdrug: stockItem?.drugUuid ? t("stockmanagement.yes") : t("stockmanagement.no"),
      preferredVendorName: stockItem?.preferredVendorName,
      defaultStockOperationsUoMName: stockItem?.defaultStockOperationsUoMName,
      dispensingUnitName: stockItem?.dispensingUnitName,
      reorderLevel: stockItem?.reorderLevelUoMName && stockItem?.reorderLevel ? `${stockItem?.reorderLevel?.toLocaleString()} ${stockItem?.reorderLevelUoMName}` : "",
      details: <div className='tbl-expand-display-fields'>
        <div className='field-label'>
          <span className='field-title'>{t('stockmanagement.stockitem.edit.commonname')}</span>
          <span className='field-desc'>
            {stockItem.commonName ?? t('stockmanagement.na')}
          </span>
        </div>
        <div className='field-label'>
          <span className='field-title'>{t('stockmanagement.stockitem.edit.abbreviation')}</span>
          <span className='field-desc'>
            {stockItem.acronym ?? t('stockmanagement.na')}
          </span>
        </div>
        {stockItem.drugUuid != null && <div className='field-label'>
          <span className='field-title'>{t('stockmanagement.stockitem.edit.dispensingunit')}</span>
          <span className='field-desc'>
            {stockItem.dispensingUnitPackagingUoMName ?? t('stockmanagement.na')}
          </span>
        </div>
        }
        {
          stockItem.defaultStockOperationsUoMName &&
          <div className='field-label'>
            <span className='field-title'>{t('stockmanagement.stockitem.edit.defaultstockoperationsuom')}</span>
            <span className='field-desc'>
              {stockItem.defaultStockOperationsUoMName}
            </span>
          </div>
        }
        {
          stockItem.reorderLevel &&
          <div className='field-label'>
            <span className='field-title'>{t('stockmanagement.stockitem.edit.reorderlevel')}</span>
            <span className='field-desc'>
              {stockItem?.reorderLevel?.toLocaleString()} {stockItem.reorderLevelUoMName}
            </span>
          </div>
        }
        {
          stockItem.purchasePrice &&
          <div className='field-label'>
            <span className='field-title'>{t('stockmanagement.stockitem.edit.purchaseprice')}</span>
            <span className='field-desc'>
              {stockItem?.purchasePrice?.toLocaleString()}/{stockItem.purchasePriceUoMName}
            </span>
          </div>
        }
      </div>
    })),
    [stockItems, t],
  );

  const handleSearch = useMemo(() => debounce((searchTerm) => search.onSearch(searchTerm), 300), [search]);
  const handleIsDrugChange = (newSelection: string, name: string, event: React.ChangeEvent<HTMLInputElement>): void => {
    search.onItemTypeChange(newSelection);
  }

  // function deleteSelectedRows(event: React.MouseEvent<HTMLButtonElement>, selectedRows: readonly DenormalizedRow[]) {
  //   if (selectedRows?.length > 0) {
  //     setSelectedDelete(selectedRows.map(p => p.id))
  //     setOpenDeleteConfirm(true);
  //   }
  // };

  function deleteStockItemOnCancel() {
    setSelectedDelete(null)
    setOpenDeleteConfirm(false);
  }

  function deleteStockItemOnContinue() {
    if (selectedDelete == null || selectedDelete.length === 0) {
      deleteStockItemOnCancel();
      return;
    }
    setOpenDeleteConfirm(false);
    setStartedDeletingStockItem(true);
    resetDeleteStockItemHook();
    deleteStockItem(selectedDelete).then(
      (payload: any) => {
        setStartedDeletingStockItem(false);
        if ((payload as any).error) {
          var errorMessage = toErrorMessage(payload);
          errorAlert(`${t("stockmanagement.stockitem.delete.failed")} ${errorMessage}`);
          return;
        }
        ClickElement('button.bx--batch-summary__cancel');
        setSelectedDelete(null);
        search.refetch();
        successAlert(t("stockmanagement.stockitem.delete.success"));
      })
      .catch((error) => {
        setStartedDeletingStockItem(false);
        var errorMessage = toErrorMessage(error);
        errorAlert(`${t("stockmanagement.stockitem.delete.failed")} ${errorMessage}`);
        return;
      });
  }

  const onViewItem = (itemId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (itemId) {
      navigate(URL_STOCK_ITEM(itemId));
    }
  }

  const handleImport = () => {
    setShowImport(true);
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
      onRequestClose={deleteStockItemOnCancel}
      shouldSubmitOnEnter={false}
      onRequestSubmit={deleteStockItemOnContinue}
      onSecondarySubmit={deleteStockItemOnCancel}
      open={true}
      size="sm"
    >
      <p>{t("stockmanagement.stockitem.delete.confirmText")}</p>
    </Modal>
    }
    {
      showImport && <ImportModalPopup showModal={true}
        onConfirm={() => setShowImport(false)}
        onClose={() => setShowImport(false)}

      />
    }
    {startedDeletingStockItem && <Splash active />}
    <div className={styles.tableOverride}>
      <DataTable rows={rows} headers={headers} isSortable={true} useZebraStyles={true}
        render={({ rows, headers, getHeaderProps, getTableProps, getRowProps, getSelectionProps, getBatchActionProps, selectedRows }) => (
          <TableContainer>
            <TableToolbar>
              <TableBatchActions {...getBatchActionProps()}>
              </TableBatchActions>
              <TableToolbarContent>
                <TableToolbarSearch expanded={true} onChange={(evnt) => handleSearch(evnt.target.value)} persistent={true} />
                <RadioButtonGroup className="stkpg-datable-rbl" defaultSelected={search.currentItemType} name="is-drug" onChange={handleIsDrugChange} >
                  <RadioButton value="" labelText={t('stockmanagement.stockitem.list.search.isdrug.all')} id="is-drug-all" />
                  <RadioButton value="true" labelText={t('stockmanagement.stockitem.list.search.isdrug.drugs')} id="is-drug-drug" />
                  <RadioButton value="false" labelText={t('stockmanagement.stockitem.list.search.isdrug.other')} id="is-drug-other" />
                </RadioButtonGroup>
                {canCreateModifyStockItems && <>
                  <Button onClick={handleImport} size="sm" kind="ghost">
                    {t('stockmanagement.import')}
                  </Button>
                </>
                }
                <TableToolbarMenu>
                  <TableToolbarAction onClick={() => search.refetch()}>
                    Refresh
                  </TableToolbarAction>
                </TableToolbarMenu>
                {canCreateModifyStockItems && <>    <Button onClick={createStockItem} size="sm" kind="primary">
                  {t('stockmanagement.addnew')}
                </Button>
                </>
                }
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {/* <TableExpandHeader /> */}
                  {headers.map((header: any, index) => (
                    header.key !== "details" &&
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
                  <TableHeader></TableHeader>
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
                        cell?.info?.header !== "details" && <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                      <TableCell>
                        <Button type="button" size="sm" className="submitButton clear-padding-margin" iconDescription={"View"} kind="ghost" renderIcon={Edit16} onClick={(e) => onViewItem(row.id, e)} />
                      </TableCell>
                    </TableRow>
                  </React.Fragment>

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

export default StockItemTable;
