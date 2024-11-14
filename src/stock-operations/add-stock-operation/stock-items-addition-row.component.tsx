import React, { ChangeEvent, useState } from 'react';
import { isDesktop } from '@openmrs/esm-framework';
import { Button, DatePicker, DatePickerInput, Link, NumberInput, TableCell, TableRow, TextInput } from '@carbon/react';
import { TrashCan } from '@carbon/react/icons';
import { StockOperationItemFormData } from '../validation-schema';
import {
  Control,
  FieldArrayWithId,
  FieldErrors,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormSetValue,
} from 'react-hook-form';
import {
  DATE_PICKER_CONTROL_FORMAT,
  DATE_PICKER_FORMAT,
  URL_STOCK_ITEM,
  formatForDatePicker,
  today,
} from '../../constants';
import { StockBatchDTO } from '../../core/api/types/stockItem/StockBatchDTO';
import { StockItemPackagingUOMDTO } from '../../core/api/types/stockItem/StockItemPackagingUOM';
import { StockItemInventory } from '../../core/api/types/stockItem/StockItemInventory';
import { StockOperationItemDTO } from '../../core/api/types/stockOperation/StockOperationItemDTO';
import { StockItemDTO } from '../../core/api/types/stockItem/StockItem';
import QtyUomSelector from '../qty-uom-selector/qty-uom-selector.component';
import BatchNoSelector from '../batch-no-selector/batch-no-selector.component';

import styles from './stock-items-addition-row.scss';
import { Checkbox } from '@carbon/react';

interface StockItemsAdditionRowProps {
  canEdit?: boolean;
  rows: StockOperationItemFormData[];
  showQuantityRequested?: boolean;
  requiresActualBatchInformation?: boolean;
  requiresBatchUuid?: boolean;
  canUpdateBatchInformation?: boolean;
  canCapturePurchasePrice?: boolean;
  isStockIssueFromRequisition?: boolean;
  selectedItems?: Set<string>;
  onItemSelect?: (itemId: string, selected: boolean) => void;
  batchNos?: {
    [key: string]: StockBatchDTO[];
  };
  itemUoM?: {
    [key: string]: StockItemPackagingUOMDTO[];
  };
  batchBalance?: {
    [key: string]: StockItemInventory;
  };
  control: Control<{
    stockItems: StockOperationItemDTO[];
  }>;
  setValue: UseFormSetValue<{
    stockItems: StockOperationItemDTO[];
  }>;
  errors: FieldErrors<{
    stockItems: StockOperationItemDTO[];
  }>;
  remove: UseFieldArrayRemove;
  append: UseFieldArrayAppend<
    {
      stockItems: StockOperationItemDTO[];
    },
    'stockItems'
  >;
  fields: FieldArrayWithId<
    {
      stockItems: StockOperationItemDTO[];
    },
    'stockItems'
  >[];
}

const StockItemsAdditionRow: React.FC<StockItemsAdditionRowProps> = ({
  canEdit,
  showQuantityRequested,
  requiresActualBatchInformation,
  requiresBatchUuid,
  canUpdateBatchInformation,
  canCapturePurchasePrice,
  batchBalance,
  control,
  setValue,
  errors,
  remove,
  fields,
  isStockIssueFromRequisition,
  selectedItems,
  onItemSelect,
}) => {
  const [stockItemUuid, setStockItemUuid] = useState<string | null | undefined>();
  const [stockItemExpiry, setStockItemExpiy] = useState<Date | null | undefined>();

  const handleStockItemChange = (index: number, data?: StockItemDTO) => {
    if (!data) return;
    const item = fields[index];
    if (item) {
      item.stockItemName =
        (data?.drugName
          ? `${data?.drugName}${
              data?.commonName ?? data?.conceptName ? ` (${data?.commonName ?? data?.conceptName})` : ''
            }`
          : null) ?? data?.conceptName;

      const configureExpiration = data?.hasExpiration ?? true;
      item.hasExpiration = configureExpiration;
      if (!configureExpiration) {
        item.expiration = null;
      }

      item.stockItemUuid = data?.uuid;

      item.stockItemPackagingUOMUuid = null;
      item.stockItemPackagingUOMName = null;

      item.stockBatchUuid = null;
      if (requiresBatchUuid) {
        // handleStockBatchSearch(row, "", data.selectedItem?.uuid);
      }
    }
  };
  const isStockItem = (obj: any): obj is StockItemDTO => {
    return typeof obj === 'object' && obj !== null && 'drugName' in obj;
  };
  return (
    <>
      {fields?.map((row, index) => {
        const stockItemId = `stockItems.${index}.stockItemUuid`;
        return (
          <TableRow className={isDesktop ? styles.desktopRow : styles.tabletRow} key={row?.uuid}>
            {isStockIssueFromRequisition && (
              <TableCell className={styles.checkboxCell}>
                <Checkbox
                  id={`select-${row.uuid}`}
                  checked={selectedItems?.has(row.uuid)}
                  onChange={(event) => onItemSelect?.(row.uuid, event.target.checked)}
                  labelText=""
                  disabled={!canEdit}
                />
              </TableCell>
            )}
            <TableCell>
              {row?.stockItemUuid && isStockItem(row?.stockItemUuid) ? (
                <Link target={'_blank'} to={URL_STOCK_ITEM(row?.stockItemUuid)}>
                  {row?.stockItemUuid.drugName || 'No stock item name'}
                </Link>
              ) : (
                <Link target={'_blank'} to={URL_STOCK_ITEM(row?.stockItemUuid)}>
                  {row?.stockItemName || 'No name available'}
                </Link>
              )}
            </TableCell>
            {showQuantityRequested && (
              <TableCell>
                <div className={styles.cellContent}>
                  {row?.quantityRequested?.toLocaleString() ?? ''} {row?.quantityRequestedPackagingUOMName ?? ''}
                </div>
              </TableCell>
            )}
            {(requiresActualBatchInformation || requiresBatchUuid) && (
              <TableCell>
                <div className={styles.cellContent}>
                  {requiresActualBatchInformation &&
                    (canEdit || (canUpdateBatchInformation && row?.permission?.canUpdateBatchInformation)) && (
                      <TextInput
                        size="sm"
                        maxLength={50}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setValue(`stockItems.${index}.batchNo`, e.target.value)
                        }
                        defaultValue={row.batchNo}
                        invalidText=""
                        invalid={errors?.stockItems?.[index]?.batchNo}
                      />
                    )}
                  {requiresBatchUuid && !requiresActualBatchInformation && canEdit && (
                    <BatchNoSelector
                      batchUuid={row?.stockBatchUuid}
                      onBatchNoChanged={(item) => {
                        setValue(`stockItems.${index}.batchNo`, item?.batchNo ?? '');
                        setValue(`stockItems.${index}.expiration`, item?.expiration);
                        setStockItemExpiy(item?.expiration);
                      }}
                      placeholder={'Filter...'}
                      invalid={!!errors?.stockItems?.[index]?.stockBatchUuid}
                      control={control as unknown as Control}
                      controllerName={`stockItems.${index}.stockBatchUuid`}
                      name={`stockItems.${index}.stockBatchUuid`}
                      stockItemUuid={row.stockItemUuid}
                      selectedItem={stockItemUuid}
                    />
                  )}
                  {!(canUpdateBatchInformation && row?.permission?.canUpdateBatchInformation) &&
                    !canEdit &&
                    row?.batchNo}
                </div>
              </TableCell>
            )}
            {(requiresActualBatchInformation || requiresBatchUuid) && (
              <TableCell>
                <div className={styles.cellContent}>
                  {(canEdit || (canUpdateBatchInformation && row?.permission?.canUpdateBatchInformation)) &&
                    requiresActualBatchInformation && (
                      <DatePicker
                        id={`expiration-${row.uuid}`}
                        datePickerType="single"
                        minDate={formatForDatePicker(today())}
                        locale="en"
                        dateFormat={DATE_PICKER_CONTROL_FORMAT}
                        onChange={([newDate]) => {
                          setValue(`stockItems.${index}.expiration`, newDate);
                        }}
                      >
                        <DatePickerInput
                          size="sm"
                          autoComplete="off"
                          id={`expiration-input-${row.uuid}`}
                          name="operationDate"
                          placeholder={DATE_PICKER_FORMAT}
                          defaultValue={formatForDatePicker(row?.expiration)}
                          invalid={!!errors?.stockItems?.[index]?.expiration}
                        />
                      </DatePicker>
                    )}
                  {((!(canUpdateBatchInformation && row?.permission?.canUpdateBatchInformation) && !canEdit) ||
                    requiresBatchUuid) &&
                    formatForDatePicker(row.expiration)}
                </div>
              </TableCell>
            )}
            <TableCell>
              <div className={styles.cellContent}>
                {canEdit && (
                  <NumberInput
                    allowEmpty
                    className="small-placeholder-text"
                    disableWheel
                    hideSteppers
                    size="sm"
                    id={`qty-${row?.uuid}`}
                    onChange={(e: any) => setValue(`stockItems.${index}.quantity`, e?.target?.value)}
                    value={row?.quantity ?? ''}
                    invalidText={errors?.stockItems?.[index]?.quantity?.message}
                    placeholder={
                      requiresBatchUuid && !requiresActualBatchInformation && row?.stockBatchUuid in batchBalance
                        ? `Bal: ${batchBalance[row?.stockBatchUuid]?.quantity?.toLocaleString() ?? ''} ${
                            batchBalance[row?.stockBatchUuid]?.quantityUoM ?? ''
                          }`
                        : ''
                    }
                    invalid={!!errors?.stockItems?.[index]?.quantity}
                  />
                )}
                {!canEdit && row?.quantity?.toLocaleString()}
              </div>
            </TableCell>
            <TableCell>
              <div className={styles.cellContent}>
                {canEdit && (
                  <QtyUomSelector
                    stockItemUuid={row.stockItemUuid}
                    onStockPackageChanged={(selectedItem) => {
                      setValue(`stockItems.${index}.stockItemPackagingUOMUuid`, selectedItem?.uuid);
                    }}
                    placeholder={'Filter...'}
                    invalid={!!errors?.stockItems?.[index]?.stockItemPackagingUOMUuid}
                    control={control as unknown as Control}
                    controllerName={`stockItems.${index}.stockItemPackagingUOMUuid`}
                    name={`stockItems.${index}.stockItemPackagingUOMUuid`}
                  />
                )}
                {!canEdit && row?.stockItemPackagingUOMName}
              </div>
            </TableCell>
            {canCapturePurchasePrice && (
              <TableCell>
                <div className={styles.cellContent}>
                  <div className={styles.cellContent}>
                    {canEdit && (
                      <NumberInput
                        allowEmpty
                        disableWheel
                        size="sm"
                        invalid={!!errors?.stockItems?.[index]?.purchasePrice}
                        invalidText=""
                        id={`purchaseprice-${row.uuid}`}
                        onChange={(e: any) => setValue(`stockItems.${index}.purchasePrice`, e?.target?.value)}
                        value={row?.purchasePrice ?? ''}
                        title=""
                      />
                    )}
                    {!canEdit && row?.purchasePrice?.toLocaleString()}
                  </div>
                </div>
              </TableCell>
            )}
            {canEdit && (
              <TableCell>
                <Button
                  type="button"
                  size="sm"
                  className="submitButton clear-padding-margin"
                  iconDescription={'Delete'}
                  kind="ghost"
                  renderIcon={TrashCan}
                  onClick={() => remove(index)}
                />
              </TableCell>
            )}
          </TableRow>
        );
      })}
    </>
  );
};
export default StockItemsAdditionRow;
