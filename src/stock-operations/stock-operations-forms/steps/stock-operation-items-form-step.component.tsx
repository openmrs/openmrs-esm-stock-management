import {
  Button,
  DataTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { Edit, TrashCan } from '@carbon/react/icons';
import { isDesktop, launchWorkspace } from '@openmrs/esm-framework';
import React, { useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StockOperationDTO } from '../../../core/api/types/stockOperation/StockOperationDTO';
import { StockOperationType } from '../../../core/api/types/stockOperation/StockOperationType';
import { getStockOperationUniqueId } from '../../stock-operation.utils';
import { BaseStockOperationItemFormData, StockOperationItemDtoSchema } from '../../validation-schema';
import useOperationTypePermisions from '../hooks/useOperationTypePermisions';
import StockItemSearch from '../input-components/stock-item-search.component';
import { StockItemFormProps } from '../stock-item-form/stock-item-form.workspace';
import QuantityUomCell from './quantity-uom-cell.component';
import StockAvailability from './stock-availability-cell.component';
import StockOperationItemBatchNoCell from './stock-operation-item-batch-no-cell.component';
import StockOperationItemCell from './stock-operation-item-cell.component';
import StockoperationItemExpiryCell from './stock-operation-item-expiry-cell.component';
import styles from './stock-operation-items-form-step.scc.scss';

type StockOperationItemsFormStepProps = {
  stockOperation?: StockOperationDTO;
  stockOperationType: StockOperationType;
  onNext?: () => void;
  onPrevious?: () => void;
};
const StockOperationItemsFormStep: React.FC<StockOperationItemsFormStepProps> = ({
  stockOperationType,
  stockOperation,
  onNext,
  onPrevious,
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

  const handleLaunchStockItem = useCallback(
    (stockOperationItem?: BaseStockOperationItemFormData) => {
      launchWorkspace('stock-operation-stock-items-form', {
        workspaceTitle: t('stockItem', 'StockItem'),
        ...({
          stockOperationType,
          stockOperationItem,
          onSave: (data) => {
            const items = (form.getValues('stockOperationItems') ?? []) as Array<BaseStockOperationItemFormData>;
            const index = items.findIndex((i) => i.uuid === data.uuid);
            if (index === -1) {
              items.push(data);
            } else {
              items[index] = data;
            }
            form.setValue('stockOperationItems', items as any);
          },
        } as StockItemFormProps),
      });
    },
    [stockOperationType, t, form],
  );

  const handleDeleteStockOperationItem = useCallback(
    (item: BaseStockOperationItemFormData) => {
      form.setValue('stockOperationItems', observableOperationItems.filter((i) => i.uuid !== item.uuid) as any);
    },
    [form, observableOperationItems],
  );

  const tableRows = useMemo(() => {
    return observableOperationItems?.map((item) => {
      const {
        batchNo,
        expiration,
        quantity,
        purchasePrice,
        uuid,
        stockItemUuid,
        stockItemPackagingUOMUuid,
        stockBatchUuid,
      } = item;

      return {
        id: uuid,
        item: stockItemUuid ? <StockOperationItemCell stockItemUuid={stockItemUuid} /> : '--',
        itemDetails: stockItemUuid ? <StockAvailability stockItemUuid={stockItemUuid} /> : '--',
        batch: (
          <StockOperationItemBatchNoCell
            operation={stockOperationType}
            stockBatchUuid={stockBatchUuid}
            batchNo={batchNo}
            stockItemUuid={stockItemUuid}
          />
        ),
        expiry: (
          <StockoperationItemExpiryCell
            operation={stockOperationType}
            stockBatchUuid={stockBatchUuid}
            expiration={expiration}
            stockItemUuid={stockItemUuid}
          />
        ),
        quantity: quantity?.toLocaleString(),
        quantityuom: stockItemPackagingUOMUuid ? (
          <QuantityUomCell stockItemPackagingUOMUuid={stockItemPackagingUOMUuid} stockItemUuid={stockItemUuid} />
        ) : (
          '--'
        ),
        purchasePrice: purchasePrice,
        actions: (
          <>
            <Button
              type="button"
              size="sm"
              className="submitButton clear-padding-margin"
              iconDescription={'Edit'}
              kind="ghost"
              renderIcon={Edit}
              onClick={() => {
                handleLaunchStockItem(item);
              }}
            />
            <Button
              type="button"
              size="sm"
              className="submitButton clear-padding-margin"
              iconDescription={'Delete'}
              kind="ghost"
              renderIcon={TrashCan}
              onClick={() => {
                handleDeleteStockOperationItem(item);
              }}
            />
          </>
        ),
      };
    });
  }, [observableOperationItems, handleLaunchStockItem, handleDeleteStockOperationItem, stockOperationType]);

  const headerTitle = t('stockoperationItems', 'Stock operation items');

  return (
    <div style={{ margin: '10px' }}>
      <div className={styles.tableContainer}>
        <div className={styles.heading}>
          <h4>{headerTitle}</h4>
          <div className={styles.btnSet}>
            {typeof onPrevious === 'function' && (
              <Button kind="secondary" onClick={onPrevious}>
                {t('previous', 'Previous')}
              </Button>
            )}
            {typeof onNext === 'function' && (
              <Button kind="primary" onClick={onNext}>
                {t('next', 'Next')}
              </Button>
            )}
          </div>
        </div>
        <StockItemSearch
          onSelectedItem={(stockItem) =>
            handleLaunchStockItem({
              uuid: `new-item-${getStockOperationUniqueId()}`,
              stockItemUuid: stockItem.uuid,
              hasExpiration: stockItem.hasExpiration,
              purchasePrice: stockItem.purchasePrice,
            })
          }
        />

        <DataTable
          rows={tableRows ?? []}
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
