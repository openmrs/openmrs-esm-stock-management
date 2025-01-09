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
import { formatForDatePicker } from '../../../constants';
import { StockItemDTO } from '../../../core/api/types/stockItem/StockItem';
import StockAvailability from './stock-availability-cell.component';
import QuantityUomCell from './quantity-uom-cell.component';
import StockOperationItemCell from './stock-operation-item-cell.component';

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
    return (observableOperationItems ?? []).map(
      ({ batchNo, expiration, quantity, purchasePrice, uuid, stockItemUuid, stockItemPackagingUOMUuid }) => ({
        id: uuid,
        item: stockItemUuid ? <StockOperationItemCell stockItemUuid={stockItemUuid} /> : '--',
        itemDetails: stockItemUuid ? <StockAvailability stockItemUuid={stockItemUuid} /> : '--',
        batch: batchNo ?? '--',
        expiry: formatForDatePicker(expiration),
        quantity: quantity?.toLocaleString(),
        quantityuom: stockItemPackagingUOMUuid ? (
          <QuantityUomCell stockItemPackagingUOMUuid={stockItemPackagingUOMUuid} stockItemUuid={stockItemUuid} />
        ) : (
          '--'
        ),
        purchasePrice: purchasePrice,
      }),
    );
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
