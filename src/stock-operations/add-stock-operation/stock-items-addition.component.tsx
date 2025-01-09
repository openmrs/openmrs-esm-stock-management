import {
  Button,
  DataTable,
  InlineLoading,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { ArrowRight, Edit, TrashCan } from '@carbon/react/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { isDesktop, launchWorkspace } from '@openmrs/esm-framework';
import React, { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StockOperationDTO } from '../../core/api/types/stockOperation/StockOperationDTO';
import { StockOperationItemDTO } from '../../core/api/types/stockOperation/StockOperationItemDTO';
import { StockOperationType } from '../../core/api/types/stockOperation/StockOperationType';
import { errorAlert } from '../../core/utils/alert';
import { SaveStockOperation } from '../../stock-items/types';
import { InitializeResult } from './types';
import { useValidationSchema } from './validationSchema';

import { Link, TableCell } from '@carbon/react';
import { formatForDatePicker, URL_STOCK_ITEM } from '../../constants';
import { StockItemDTO } from '../../core/api/types/stockItem/StockItem';
import { getStockOperationUniqueId } from '../stock-operation.utils';
import StockItemSearch from './stock-item-search/stock-item-search.component';
import styles from './stock-items-addition.component.scss';
import StockAvailability from '../stock-operations-forms/steps/stock-availability-cell.component';

interface StockItemsAdditionProps {
  isEditing?: boolean;
  canEdit?: boolean;
  model?: StockOperationDTO;
  onSave?: SaveStockOperation;
  operation: StockOperationType;
  setup: InitializeResult;
}

const StockItemsAddition: React.FC<StockItemsAdditionProps> = ({
  setup: {
    hasQtyRequested: showQuantityRequested, // TODO Remove never changed
    requiresBatchUuid,
    requiresActualBatchInfo: requiresActualBatchInformation,
    canCaptureQuantityPrice,
    batchBalance,
    batchNos,
    canUpdateItemsBatchInformation: canUpdateBatchInformation,
    itemUoM,
  },
  canEdit = true,
  model,
  onSave,
  operation,
}) => {
  const { t } = useTranslation();
  const [items, setItems] = useState<Array<StockOperationItemDTO>>(model.stockOperationItems);
  const { operationType } = operation ?? {};
  const validationSchema = useValidationSchema(operationType);
  const handleSave = async (item: { stockItems: StockOperationItemDTO[] }) => {
    if (item.stockItems.length == 0) {
      errorAlert('No stock items', "You haven't added any stock items, tap the add button to add some.");
      return;
    }

    model.stockOperationItems = item?.stockItems;
    await onSave?.(model);
  };

  const formMethods = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      stockItems: model?.stockOperationItems ?? [],
    },
    mode: 'onSubmit',
  });

  const {
    handleSubmit,
    formState: { errors },
  } = formMethods;

  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) {
      Object.keys(errors).forEach((key) => {
        errorAlert(key, JSON.stringify(errors[key]));
      });
    }
  }, [errors]);

  const [isSaving] = useState(false);

  const headers = [
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
    ...(showQuantityRequested
      ? [
          {
            key: 'quantityrequested',
            header: t('quantityRequested', 'Quantity Requested'),
          },
        ]
      : []),
    ...(requiresBatchUuid || requiresActualBatchInformation
      ? [
          {
            key: 'batch',
            header: t('batchNo', 'Batch No'),
            styles: { width: '15% !important' },
          },
        ]
      : []),
    ...(requiresActualBatchInformation
      ? [
          {
            key: 'expiry',
            header: t('expiry', 'Expiry'),
          },
        ]
      : []),
    ...(requiresBatchUuid
      ? [
          {
            key: 'expiry',
            header: t('expiry', 'Expiry'),
          },
        ]
      : []),

    {
      key: 'quantity',
      header: showQuantityRequested ? t('qtyIssued', 'Qty Issued') : t('qty', 'Qty'),
    },
    {
      key: 'quantityuom',
      header: t('quantityUom', 'Qty UoM'),
    },
    ...(canCaptureQuantityPrice
      ? [
          {
            key: 'purchasePrice',
            header: t('purchasePrice', 'Purchase Price'),
          },
        ]
      : []),
  ];
  const isStockItem = (obj: any): obj is StockItemDTO => {
    return typeof obj === 'object' && obj !== null && 'drugName' in obj;
  };

  const handleAddStockItem = (stockItem: StockItemDTO) => {
    const itemId = `new-item-${getStockOperationUniqueId()}`;
    launchWorkspace('stock-operation-stock-items-form', {
      workspaceTitle: t('stockItem', 'StockItem'),
      ...{
        batchBalance,
        batchNos,
        showQuantityRequested,
        requiresActualBatchInformation,
        requiresBatchUuid,
        canUpdateBatchInformation,
        canCapturePurchasePrice: canCaptureQuantityPrice,
        itemUoM,
        operationType,
        canEdit,
        stockOperationItem: {
          uuid: itemId,
          id: itemId,
          permission: stockItem.permission,
          stockItemUuid: stockItem.uuid,
          acronym: stockItem.acronym,
          commonName: stockItem.commonName,
          hasExpiration: stockItem.hasExpiration,
          purchasePrice: stockItem.purchasePrice,
          packagingUnits: stockItem.packagingUnits,
        },
        onSave: (item) => {
          setItems((state) => [
            ...state,
            {
              ...stockItem,
              ...item,
              uuid: itemId,
              id: itemId,
              stockItemUuid: stockItem.uuid,
              stockItemName: stockItem.commonName,
            },
          ]);
        },
      },
    });
  };
  const handleUpdateStockItem = (stockOperationItem: StockOperationItemDTO) => {
    launchWorkspace('stock-operation-stock-items-form', {
      workspaceTitle: t('stockItem', 'StockItem'),
      ...{
        batchBalance,
        batchNos,
        showQuantityRequested,
        requiresActualBatchInformation,
        requiresBatchUuid,
        canUpdateBatchInformation,
        canCapturePurchasePrice: canCaptureQuantityPrice,
        itemUoM,
        operationType,
        canEdit,
        stockOperationItem: stockOperationItem,
        onSave: (item) => {
          setItems((prevItems) => {
            return prevItems.map((currentItem) => {
              if (currentItem.uuid === stockOperationItem.uuid) {
                return {
                  ...currentItem,
                  ...item,
                  uuid: stockOperationItem.uuid,
                  id: stockOperationItem.id,
                };
              }
              return currentItem;
            });
          });
        },
      },
    });
  };
  return (
    <FormProvider {...formMethods}>
      <div style={{ margin: '10px' }}>
        <div className={styles.tableContainer}>
          <StockItemSearch onSelectedItem={handleAddStockItem} />
          <DataTable
            rows={(items ?? []).map((row) => ({
              id: row.uuid,
              item:
                row?.stockItemUuid && isStockItem(row?.stockItemUuid) ? (
                  <Link target={'_blank'} to={URL_STOCK_ITEM(row?.stockItemUuid)}>
                    {row?.stockItemUuid.drugName || 'No stock item name'}
                  </Link>
                ) : (
                  <Link target={'_blank'} to={URL_STOCK_ITEM(row?.stockItemUuid)}>
                    {row?.stockItemName || 'No name available'}
                  </Link>
                ),
              itemDetails: row?.stockItemUuid ? <StockAvailability stockItemUuid={row.stockItemUuid} /> : '--',
              quantityrequested: `${row?.quantityRequested?.toLocaleString() ?? ''} ${
                row?.quantityRequestedPackagingUOMName ?? ''
              }`,
              batch: row?.batchNo ?? '--',
              expiry: formatForDatePicker(row.expiration),
              quantity: row?.quantity?.toLocaleString(),
              quantityuom: row?.stockItemPackagingUOMName ?? '--',
              purchasePrice: row.purchasePrice,
            }))}
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
                      {canEdit && (
                        <TableHeader className={styles.tableHeader}>
                          <div className={styles.TableBody}>
                            <Button
                              name="save"
                              type="button"
                              className="submitButton"
                              onClick={() =>
                                handleSubmit((_) => {
                                  handleSave({
                                    stockItems: items.map((item) => ({
                                      ...item,
                                      id: item?.id?.startsWith('new-item') || !item.id ? undefined : item.id,
                                      uuid: item?.uuid?.startsWith('new-item') || !item.uuid ? undefined : item.uuid,
                                    })),
                                  });
                                })()
                              }
                              kind="primary"
                              renderIcon={ArrowRight}
                            >
                              {isSaving ? <InlineLoading /> : t('next', 'Next')}
                            </Button>
                          </div>
                        </TableHeader>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow {...getRowProps({ row })}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value}</TableCell>
                        ))}
                        {canEdit && (
                          <TableCell>
                            <Button
                              type="button"
                              size="sm"
                              className="submitButton clear-padding-margin"
                              iconDescription={'Edit'}
                              kind="ghost"
                              renderIcon={Edit}
                              onClick={() => {
                                //  TODO handle update item
                                const item = items.find(({ uuid }) => uuid === row.id);
                                handleUpdateStockItem(item);
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
                                //  TODO handle remove item
                                setItems((prevItems) => prevItems.filter(({ uuid }) => uuid !== row.id));
                              }}
                            />
                          </TableCell>
                        )}
                      </TableRow>
                    ))}

                    {/* <StockItemsAdditionRow
                      rows={model?.stockOperationItems ?? [{ uuid: `new-item-1`, id: `new-item-1` }]}
                      batchBalance={batchBalance}
                      batchNos={batchNos}
                      control={control}
                      setValue={setValue}
                      errors={errors}
                      remove={remove}
                      append={append}
                      canEdit={canEdit}
                      showQuantityRequested={showQuantityRequested}
                      requiresActualBatchInformation={requiresActualBatchInformation}
                      requiresBatchUuid={requiresBatchUuid}
                      canUpdateBatchInformation={canUpdateBatchInformation}
                      canCapturePurchasePrice={canCaptureQuantityPrice}
                      itemUoM={itemUoM}
                      fields={fields}
                    />{' '} */}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          ></DataTable>
        </div>
      </div>
    </FormProvider>
  );
};

export default StockItemsAddition;
