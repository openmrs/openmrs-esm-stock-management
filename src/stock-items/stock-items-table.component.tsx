import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  DataTableSkeleton,
  IconButton,
  Pagination,
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
  TabPanel,
  Tile,
} from '@carbon/react';
import { Edit } from '@carbon/react/icons';
import { isDesktop, restBaseUrl } from '@openmrs/esm-framework';
import { handleMutate } from '../utils';
import { launchAddOrEditStockItemWorkspace } from './stock-item.utils';
import { ResourceRepresentation } from '../core/api/api';
import { useDebounce } from '../core/hooks/debounce-hook';
import { useStockItemsPages } from './stock-items-table.resource';
import AddStockItemActionButton from './add-stock-item/add-stock-action-button.component';
import AddStockItemsBulktImportActionButton from './add-bulk-stock-item/add-stock-items-bulk-import-action-button.component';
import EditStockItemActionsMenu from './edit-stock-item/edit-stock-item-action-menu.component';
import FilterStockItems from './components/filter-stock-items/filter-stock-items.component';
import styles from './stock-items-table.scss';

interface StockItemsTableProps {
  from?: string;
}

const StockItemsTableComponent: React.FC<StockItemsTableProps> = () => {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState('');

  const handleRefresh = () => {
    handleMutate(`${restBaseUrl}/stockmanagement/stockitem`);
  };

  const {
    currentPage,
    currentPageSize,
    isDrug,
    isLoading,
    items,
    pageSizes,
    setCurrentPage,
    setDrug,
    setPageSize,
    setSearchString,
    totalCount,
  } = useStockItemsPages(ResourceRepresentation.Full);

  const handleSearch = (query: string) => {
    setSearchInput(query);
  };

  const debouncedSearch = useDebounce((query: string) => {
    setSearchString(query);
  }, 1000);

  useEffect(() => {
    debouncedSearch(searchInput);
  }, [searchInput, debouncedSearch]);

  const tableHeaders = useMemo(
    () => [
      {
        id: 0,
        header: t('type', 'Type'),
        key: 'type',
      },
      {
        id: 1,
        header: t('genericName', 'Generic Name'),
        key: 'genericName',
      },
      {
        id: 2,
        header: t('commonName', 'Common Name'),
        key: 'commonName',
      },
      {
        id: 3,
        header: t('tradeName', 'Trade Name'),
        key: 'tradeName',
      },
      {
        id: 4,
        header: t('dispensingUnitName', 'Dispensing UoM'),
        key: 'dispensingUnitName',
      },
      {
        id: 5,
        header: t('defaultStockOperationsUoMName', 'Bulk Packaging'),
        key: 'defaultStockOperationsUoMName',
      },
      {
        id: 6,
        header: t('reorderLevel', 'Reorder Level'),
        key: 'reorderLevel',
      },
      {
        id: 7,
        header: t('actions', 'Actions'),
        key: 'actions',
      },
    ],
    [t],
  );

  const tableRows = useMemo(() => {
    return items?.map((stockItem, index) => ({
      ...stockItem,
      id: stockItem?.uuid,
      key: `key-${stockItem?.uuid}`,
      uuid: `${stockItem?.uuid}`,
      type: stockItem?.drugUuid ? t('drug', 'Drug') : t('other', 'Other'),
      genericName: <EditStockItemActionsMenu data={items[index]} />,
      commonName: stockItem?.commonName,
      tradeName: stockItem?.drugUuid ? stockItem?.conceptName : '',
      preferredVendorName: stockItem?.preferredVendorName,
      dispensingUoM: stockItem?.defaultStockOperationsUoMName,
      dispensingUnitName: stockItem?.dispensingUnitName,
      defaultStockOperationsUoMName: stockItem?.defaultStockOperationsUoMName,
      reorderLevel:
        stockItem?.reorderLevelUoMName && stockItem?.reorderLevel
          ? `${stockItem?.reorderLevel?.toLocaleString()} ${stockItem?.reorderLevelUoMName}`
          : '',
      actions: (
        <IconButton
          kind="ghost"
          label={t('editStockItem', 'Edit stock item')}
          size="md"
          onClick={() => {
            stockItem.isDrug = !!stockItem.drugUuid;
            launchAddOrEditStockItemWorkspace(t, stockItem);
          }}
        >
          <Edit size={16} />
        </IconButton>
      ),
    }));
  }, [items, t]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  return (
    <>
      <TabPanel>{t('panelDescription', 'Drugs and other stock items managed by the system.')}</TabPanel>
      <DataTable
        rows={tableRows}
        headers={tableHeaders}
        isSortable
        useZebraStyles
        render={({ rows, headers, getHeaderProps, getTableProps, getRowProps, getBatchActionProps }) => (
          <TableContainer>
            <TableToolbar
              style={{
                position: 'static',
                overflow: 'visible',
                backgroundColor: 'color',
              }}
            >
              <TableBatchActions {...getBatchActionProps()} />
              <TableToolbarContent
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <TableToolbarSearch
                  onChange={(e) => handleSearch(e.target.value)}
                  persistent
                  placeholder={t('searchStockItems', 'Search stock items')}
                  value={searchInput}
                />
                <FilterStockItems filterType={isDrug} changeFilterType={setDrug} />
                <AddStockItemsBulktImportActionButton />
                <TableToolbarMenu data-testid="stock-items-menu">
                  <TableToolbarAction className={styles.toolbarAction} onClick={handleRefresh}>
                    {t('refresh', 'Refresh')}
                  </TableToolbarAction>
                </TableToolbarMenu>
                <AddStockItemActionButton />
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map(
                    (header) =>
                      header.key !== 'details' && (
                        <TableHeader
                          {...getHeaderProps({
                            header,
                            isSortable: header.isSortable,
                          })}
                          className={isDesktop ? styles.desktopHeader : styles.tabletHeader}
                          key={`${header.key}`}
                          isSortable={header.key !== 'name'}
                        >
                          {header.header?.content ?? header.header}
                        </TableHeader>
                      ),
                  )}
                  <TableHeader />
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  return (
                    <React.Fragment key={row.id}>
                      <TableRow
                        {...getRowProps({ row })}
                        className={isDesktop ? styles.desktopRow : styles.tabletRow}
                        key={row.id}
                      >
                        {row.cells.map(
                          (cell) =>
                            cell?.info?.header !== 'details' && <TableCell key={cell.id}>{cell.value}</TableCell>,
                        )}
                      </TableRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
            {rows.length === 0 ? (
              <div className={styles.tileContainer}>
                <Tile className={styles.tile}>
                  <div className={styles.tileContent}>
                    <p className={styles.content}>{t('noStockItemsToDisplay', 'No stock items to display')}</p>
                    <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
                  </div>
                </Tile>
              </div>
            ) : null}
          </TableContainer>
        )}
      ></DataTable>
      <Pagination
        className={styles.paginationOverride}
        onChange={({ page, pageSize }) => {
          setCurrentPage(page);
          setPageSize(pageSize);
        }}
        page={currentPage}
        pageSize={currentPageSize}
        pageSizes={pageSizes}
        totalItems={totalCount}
      />
    </>
  );
};

export default StockItemsTableComponent;
