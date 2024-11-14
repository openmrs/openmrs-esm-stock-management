import React, { useEffect, useState } from 'react';
import { StockOperationDTO } from '../../core/api/types/stockOperation/StockOperationDTO';
import { SaveStockOperation } from '../../stock-items/types';
import { StockOperationType } from '../../core/api/types/stockOperation/StockOperationType';
import { InitializeResult } from './types';
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
import { isDesktop } from '@openmrs/esm-framework';
import { StockOperationItemDTO } from '../../core/api/types/stockOperation/StockOperationItemDTO';
import { getStockOperationUniqueId } from '../stock-operation.utils';
import { useTranslation } from 'react-i18next';
import { FieldArrayWithId, FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useValidationSchema } from './validationSchema';
import StockItemsAdditionRow from './stock-items-addition-row.component';
import { ArrowRight } from '@carbon/react/icons';
import { errorAlert } from '../../core/utils/alert';

import styles from './stock-items-addition.component.scss';
import StockItemSearch from './stock-item-search/stock-item-search.component';

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
    hasQtyRequested: showQuantityRequested,
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
  const { operationType } = operation ?? {};
  const isStockIssueFromRequisition = Boolean(model?.requisitionStockOperationUuid);
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
      stockItems: model?.stockOperationItems ?? [{ uuid: `new-item-1`, id: `new-item-1` }],
    },
    mode: 'onSubmit',
  });

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = formMethods;

  const [isSaving] = useState(false);

  const formFieldMethods = useFieldArray({
    name: 'stockItems',
    control,
  });
  const { fields, append, remove } = formFieldMethods;
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const handleItemSelect = (itemId: string, selected: boolean) => {
    if (selected) {
      setSelectedItems((prev) => new Set(prev).add(itemId));
    } else {
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    if (fields.length > 0) {
      const lastItemIndex = fields.length - 1;
      const item = fields[lastItemIndex];
      setSelectedItems(new Set([item.id]));
    }
  }, [fields]);

  const headers = [
    ...(isStockIssueFromRequisition
      ? [
          {
            key: 'select',
            header: t('select', 'Select'),
            styles: { width: '50px' },
          },
        ]
      : []),
    {
      key: 'item',
      header: t('item', 'Item'),
      styles: { width: '40% !important' },
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
            key: 'purchaseprice',
            header: t('purchasePrice', 'Purchase Price'),
          },
        ]
      : []),
  ];

  const addNewItem = () => {
    const itemId = `new-item-${getStockOperationUniqueId()}`;
    append({
      uuid: itemId,
      id: itemId,
      stockItemUuid: null,
      stockItemName: '',
    });
  };

  return (
    <FormProvider {...formMethods}>
      <div style={{ margin: '10px' }} className={styles.tableContainer}>
        {isStockIssueFromRequisition && (
          <div className={styles.selectAllContainer}>
            <Button
              kind="ghost"
              size="sm"
              onClick={() => {
                const allIds = fields.map((f) => f.uuid);
                setSelectedItems(new Set(allIds));
              }}
            >
              {t('selectAll', 'Select All')}
            </Button>
            <Button kind="ghost" size="sm" onClick={() => setSelectedItems(new Set())}>
              {t('clearAll', 'Clear All')}
            </Button>
          </div>
        )}
        <DataTable
          rows={model?.stockOperationItems ?? [{ uuid: `new-item-1`, id: `new-item-1` }]}
          headers={headers}
          isSortable={false}
          useZebraStyles={true}
          className={styles.dataTable}
          render={({ headers, getHeaderProps, getTableProps }) => (
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
                            onClick={() => handleSubmit(handleSave)()}
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
                  <StockItemsAdditionRow
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
                    isStockIssueFromRequisition={isStockIssueFromRequisition}
                    selectedItems={selectedItems}
                    onItemSelect={handleItemSelect}
                  />{' '}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        ></DataTable>
      </div>
    </FormProvider>
  );
};

export default StockItemsAddition;
