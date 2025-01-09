import {
  DataTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { isDesktop, launchWorkspace } from '@openmrs/esm-framework';
import React, { useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StockOperationDTO } from '../../../core/api/types/stockOperation/StockOperationDTO';
import { StockOperationType } from '../../../core/api/types/stockOperation/StockOperationType';
import EmptyState from '../../../core/components/empty-state/empty-state.component';
import { BaseStockOperationItemFormData, StockOperationItemDtoSchema } from '../../validation-schema';
import useOperationTypePermisions from '../hooks/useOperationTypePermisions';
import { StockItemFormProps } from '../stock-item-form/stock-item-form.workspace';
import styles from './stock-operation-items-form-step.scc.scss';

type StockOperationItemsFormStepProps = {
  stockOperation?: StockOperationDTO;
  stockOperationType: StockOperationType;
};
const StockOperationItemsFormStep: React.FC<StockOperationItemsFormStepProps> = ({
  stockOperationType,
  stockOperation,
}) => {
  const { t } = useTranslation();
  const operationTypePermision = useOperationTypePermisions(stockOperationType);

  const form = useFormContext<StockOperationItemDtoSchema>();
  const observableOperationItems = form.watch('stockOperationItems');
  const headers = useMemo(() => {
    return [
      {
        key: 'item',
        header: t('item', 'Item'),
        styles: { width: '40% !important' },
      },
      {
        key: 'itemDetails',
        header: t('itemDetails', 'Item Details'),
        styles: { width: '20% !important' },
      },
      ...(operationTypePermision.requiresBatchUuid || operationTypePermision.requiresActualBatchInfo
        ? [
            {
              key: 'batch',
              header: t('batchNo', 'Batch No'),
              styles: { width: '15% !important' },
            },
          ]
        : []),
      ...(operationTypePermision.requiresActualBatchInfo
        ? [
            {
              key: 'expiry',
              header: t('expiry', 'Expiry'),
            },
          ]
        : []),
      ...(operationTypePermision.requiresBatchUuid
        ? [
            {
              key: 'expiry',
              header: t('expiry', 'Expiry'),
            },
          ]
        : []),

      {
        key: 'quantity',
        header: t('qty', 'Qty'),
      },
      {
        key: 'quantityuom',
        header: t('quantityUom', 'Qty UoM'),
      },
      ...(operationTypePermision.canCaptureQuantityPrice
        ? [
            {
              key: 'purchasePrice',
              header: t('purchasePrice', 'Purchase Price'),
            },
          ]
        : []),
      { key: 'actions', header: t('actions', 'Actions') },
    ];
  }, [operationTypePermision, t]);
  const tableRows = useMemo(() => {
    return (observableOperationItems ?? []).map(({ batchNo }) => ({
      // id: row.uuid,
      // item:
      //   row?.stockItemUuid && isStockItem(row?.stockItemUuid) ? (
      //     <Link target={'_blank'} to={URL_STOCK_ITEM(row?.stockItemUuid)}>
      //       {row?.stockItemUuid.drugName || 'No stock item name'}
      //     </Link>
      //   ) : (
      //     <Link target={'_blank'} to={URL_STOCK_ITEM(row?.stockItemUuid)}>
      //       {row?.stockItemName || 'No name available'}
      //     </Link>
      //   ),
      // itemDetails: row?.stockItemUuid ? <StockAvailability stockItemUuid={row.stockItemUuid} /> : '--',
      // quantityrequested: `${row?.quantityRequested?.toLocaleString() ?? ''} ${
      //   row?.quantityRequestedPackagingUOMName ?? ''
      // }`,
      batch: batchNo ?? '--',
      // expiry: formatForDatePicker(row.expiration),
      // quantity: row?.quantity?.toLocaleString(),
      // quantityuom: row?.stockItemPackagingUOMName ?? '--',
      // purchasePrice: row.purchasePrice,
    }));
  }, [observableOperationItems]);

  const handleLaunchStockItem = useCallback(
    (item?: BaseStockOperationItemFormData) => {
      launchWorkspace('stock-operation-stock-items-form', {
        workspaceTitle: t('stockItem', 'StockItem'),
        ...({ stockOperationType, item } as StockItemFormProps),
      });
    },
    [stockOperationType, t],
  );

  if (!observableOperationItems?.length)
    return (
      <EmptyState
        headerTitle={t('stockoperationItems', 'Stock operation items')}
        message={t('emptyMessage', 'No stock operation items to display for this stock operation')}
        handleAdd={() => {
          handleLaunchStockItem();
        }}
      />
    );

  return (
    <div style={{ margin: '10px' }}>
      <div className={styles.tableContainer}>
        <DataTable
          rows={tableRows}
          headers={headers}
          isSortable={false}
          useZebraStyles={true}
          className={styles.dataTable}
          render={({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
            <TableContainer>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {headers.map((header: any) => (
                      <TableHeader
                        {...getHeaderProps({
                          header,
                          isSortable: false,
                        })}
                        className={isDesktop ? styles.desktopHeader : styles.tabletHeader}
                        style={header?.styles}
                        key={`${header.key}`}
                      >
                        {header.header?.content ?? header?.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow {...getRowProps({ row })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        ></DataTable>
      </div>
    </div>
  );
};

export default StockOperationItemsFormStep;
