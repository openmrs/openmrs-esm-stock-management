import React, { ChangeEvent, useState } from "react";
import { isDesktop } from "@openmrs/esm-framework";
import {
  Button,
  DatePicker,
  DatePickerInput,
  Link,
  NumberInput,
  TableCell,
  TableRow,
  TextInput,
} from "@carbon/react";
import { TrashCan } from "@carbon/react/icons";
import { StockOperationItemFormData } from "../validation-schema";
import QtyUomSelector from "../qty-uom-selector/qty-uom-selector.component";
import StockItemSelector from "../stock-item-selector/stock-item-selector.component";
import {
  Control,
  FieldArrayWithId,
  FieldErrors,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormSetValue,
} from "react-hook-form";
import {
  DATE_PICKER_CONTROL_FORMAT,
  DATE_PICKER_FORMAT,
  URL_STOCK_ITEM,
  formatForDatePicker,
  today,
} from "../../constants";
import { StockBatchDTO } from "../../core/api/types/stockItem/StockBatchDTO";
import { StockItemPackagingUOMDTO } from "../../core/api/types/stockItem/StockItemPackagingUOM";
import { StockItemInventory } from "../../core/api/types/stockItem/StockItemInventory";
import { StockOperationItemDTO } from "../../core/api/types/stockOperation/StockOperationItemDTO";
import { StockItemDTO } from "../../core/api/types/stockItem/StockItem";
import BatchNoSelector from "../batch-no-selector/batch-no-selector.component";
import {
  getStockItemInventory,
  StockItemInventoryFilter,
} from "../stock-operations.resource";

import styles from "./stock-items-addition-row.scss";

interface StockItemsAdditionRowProps {
  canEdit?: boolean;
  rows: StockOperationItemFormData[];
  showQuantityRequested?: boolean;
  requiresActualBatchInformation?: boolean;
  requiresBatchUuid?: boolean;
  canUpdateBatchInformation?: boolean;
  canCapturePurchasePrice?: boolean;
  stockOperationUuid?: string;
  locationUuid?: string;
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
    "stockItems"
  >;
  fields: FieldArrayWithId<
    {
      stockItems: StockOperationItemDTO[];
    },
    "stockItems"
  >[];
}

const StockItemsAdditionRow: React.FC<StockItemsAdditionRowProps> = ({
  canEdit,
  showQuantityRequested,
  requiresActualBatchInformation,
  requiresBatchUuid,
  canUpdateBatchInformation,
  canCapturePurchasePrice,
  control,
  setValue,
  errors,
  remove,
  fields,
  stockOperationUuid,
  locationUuid,
}) => {
  const [stockItemUuid, setStockItemUuid] = useState<
    string | null | undefined
  >();

  const [batchBalances, setBatchBalances] = useState<{ [key: number]: any }>(
    {}
  );
  const [stockItemExpiries, setStockItemExpiries] = useState<{
    [key: number]: Date | null | undefined;
  }>({});

  const [qtyInputErrors, setQtyErrors] = useState({});

  const handleStockItemChange = (index: number, data?: StockItemDTO) => {
    if (!data) return;
    const item = fields[index];
    if (item) {
      item.stockItemName =
        (data?.drugName
          ? `${data?.drugName}${
              data?.commonName ?? data?.conceptName
                ? ` (${data?.commonName ?? data?.conceptName})`
                : ""
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

      setValue(`stockItems.${index}.stockItemUuid`, item?.stockItemUuid);
      setValue(`stockItems.${index}.stockItemName`, item?.stockItemName);
    }
  };

  const handleFetchBatchBalance = ({
    stockItemUuid,
    stockBatchUuid,
    index,
    excludeExpired = true,
  }) => {
    const filters: StockItemInventoryFilter = {
      stockBatchUuid,
      stockItemUuid,
      stockOperationUuid,
      excludeExpired,
      locationUuid,
      groupBy: "LocationStockItemBatchNo",
    };
    if (stockBatchUuid) {
      getStockItemInventory(filters)
        .then(({ data }) => data)
        .then((res: any) => {
          if ((res as any).error) {
            return;
          }
          const inventory: StockItemInventory = (
            res?.results as StockItemInventory[]
          )?.[0];

          const newBatchBalance = inventory
            ? {
                quantity: inventory.quantity,
                quantityUoM: inventory.quantityUoM,
                quantityUoMUuid: inventory.quantityUoMUuid,
              }
            : { quantity: 0, quantityUoM: null };

          setBatchBalances((prevBalances) => ({
            ...prevBalances,
            [index]: newBatchBalance,
          }));

          setValue(
            `stockItems.${index}.stockItemPackagingUOMUuid`,
            inventory.quantityUoMUuid
          );

          setValue(
            `stockItems.${index}.stockItemPackagingUOMName`,
            inventory.quantityUoM
          );
        })
        .catch((error: any) => {
          if ((error as any).error) {
            return;
          }
          return;
        });
    } else {
      setBatchBalances((prevBalances) => ({
        ...prevBalances,
        [index]: null,
      }));
    }
  };

  const handleInputChange = (e: any, index: number) => {
    const inputValue = e?.target?.value;
    const maxQuantity = Number(batchBalances[index]?.quantity);

    if (inputValue > maxQuantity) {
      setQtyErrors((prevErrors) => ({
        ...prevErrors,
        [`stockItems.${index}.quantity`]: `Quantity cannot exceed ${maxQuantity}`,
      }));
    } else {
      setQtyErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[`stockItems.${index}.quantity`];
        return newErrors;
      });
    }
    setValue(`stockItems.${index}.quantity`, inputValue);
  };

  return (
    <>
      {fields?.map((row, index) => {
        const stockItemId = `stockItems.${index}.stockItemUuid`;
        const currentBatchBalance = batchBalances[index];
        const currentStockItemExpiry = stockItemExpiries[index];
        return (
          <TableRow
            className={isDesktop ? styles.desktopRow : styles.tabletRow}
            key={row?.uuid}
          >
            <TableCell>
              {canEdit && row?.uuid.startsWith("new-item") && (
                <StockItemSelector
                  placeholder="Select an item"
                  controllerName={`stockItems.${index}.stockItemUuid`}
                  name={stockItemId}
                  control={control as unknown as Control}
                  invalid={!!errors?.stockItems?.[index]?.stockItemUuid}
                  onStockItemChanged={(item) => {
                    handleStockItemChange(index, item);
                    setValue(
                      `stockItems.${index}.packagingUnits`,
                      item?.packagingUnits
                    );
                    setStockItemUuid(item?.uuid ?? "");
                  }}
                />
              )}
              {(!canEdit || !row.uuid.startsWith("new-item")) && (
                <Link
                  target={"_blank"}
                  to={URL_STOCK_ITEM(row?.stockItemUuid)}
                >{`${row?.stockItemName}`}</Link>
              )}
            </TableCell>
            {showQuantityRequested && (
              <TableCell>
                {row?.quantityRequested?.toLocaleString() ?? ""}{" "}
                {row?.quantityRequestedPackagingUOMName ?? ""}
              </TableCell>
            )}
            {(requiresActualBatchInformation || requiresBatchUuid) && (
              <TableCell>
                {requiresActualBatchInformation &&
                  (canEdit ||
                    (canUpdateBatchInformation &&
                      row?.permission?.canUpdateBatchInformation)) && (
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
                {requiresBatchUuid &&
                  !requiresActualBatchInformation &&
                  canEdit && (
                    <BatchNoSelector
                      batchUuid={row?.stockBatchUuid}
                      onBatchNoChanged={(item) => {
                        setValue(
                          `stockItems.${index}.batchNo`,
                          item?.batchNo ?? ""
                        );

                        setValue(
                          `stockItems.${index}.expiration`,
                          item?.expiration
                        );

                        setValue(
                          `stockItems.${index}.hasExpiration`,
                          item?.expiration ? true : false
                        );

                        setStockItemExpiries((prevExpiries) => ({
                          ...prevExpiries,
                          [index]: item?.expiration ?? null,
                        }));

                        handleFetchBatchBalance({
                          stockItemUuid: row?.stockItemUuid,
                          stockBatchUuid: item?.uuid,
                          index,
                        });
                      }}
                      placeholder={"Filter..."}
                      invalid={!!errors?.stockItems?.[index]?.stockBatchUuid}
                      control={control as unknown as Control}
                      controllerName={`stockItems.${index}.stockBatchUuid`}
                      name={`stockItems.${index}.stockBatchUuid`}
                      stockItemUuid={row.stockItemUuid}
                      selectedItem={stockItemUuid}
                    />
                  )}
                {!(
                  canUpdateBatchInformation &&
                  row?.permission?.canUpdateBatchInformation
                ) &&
                  !canEdit &&
                  row?.batchNo}
              </TableCell>
            )}
            {(requiresActualBatchInformation || requiresBatchUuid) && (
              <TableCell>
                {(canEdit ||
                  (canUpdateBatchInformation &&
                    row?.permission?.canUpdateBatchInformation)) &&
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
                        defaultValue={formatForDatePicker(
                          currentStockItemExpiry || row?.expiration
                        )}
                        invalid={!!errors?.stockItems?.[index]?.expiration}
                      />
                    </DatePicker>
                  )}
                {((!(
                  canUpdateBatchInformation &&
                  row?.permission?.canUpdateBatchInformation
                ) &&
                  !canEdit) ||
                  requiresBatchUuid) &&
                  formatForDatePicker(currentStockItemExpiry || row.expiration)}
              </TableCell>
            )}
            <TableCell>
              {canEdit && (
                <NumberInput
                  className="small-placeholder-text"
                  size="sm"
                  id={`qty-${row?.uuid}`}
                  min={1}
                  max={Number(currentBatchBalance?.quantity)}
                  hideSteppers={true}
                  allowEmpty={true}
                  onChange={(e: any) => handleInputChange(e, index)}
                  value={row?.quantity ?? ""}
                  invalidText={
                    errors?.stockItems?.[index]?.quantity?.message ||
                    qtyInputErrors[`stockItems.${index}.quantity`]
                  }
                  placeholder={
                    requiresBatchUuid &&
                    !requiresActualBatchInformation &&
                    currentBatchBalance
                      ? `Bal: ${
                          currentBatchBalance?.quantity?.toLocaleString() ?? ""
                        } ${currentBatchBalance?.quantityUoM ?? ""}`
                      : ""
                  }
                  invalid={
                    !!errors?.stockItems?.[index]?.quantity ||
                    !!qtyInputErrors[`stockItems.${index}.quantity`]
                  }
                />
              )}
              {!canEdit && row?.quantity?.toLocaleString()}
            </TableCell>
            {/* Qty UoM Cell (Non-editable) */}
            <TableCell>
              {canEdit &&
              row?.uuid.startsWith("new-item") &&
              !currentBatchBalance?.quantityUoM ? (
                <QtyUomSelector
                  stockItemUuid={row.stockItemUuid}
                  onStockPackageChanged={(selectedItem) => {
                    setValue(
                      `stockItems.${index}.stockItemPackagingUOMUuid`,
                      selectedItem?.uuid
                    );
                  }}
                  placeholder={"Filter..."}
                  invalid={
                    !!errors?.stockItems?.[index]?.stockItemPackagingUOMUuid
                  }
                  control={control as unknown as Control}
                  controllerName={`stockItems.${index}.stockItemPackagingUOMUuid`}
                  name={`stockItems.${index}.stockItemPackagingUOMUuid`}
                />
              ) : currentBatchBalance?.quantityUoM ? (
                currentBatchBalance.quantityUoM
              ) : (
                row?.stockItemPackagingUOMName
              )}

              {!canEdit && row?.stockItemPackagingUOMName}
            </TableCell>
            {canCapturePurchasePrice ? (
              <TableCell>
                {canEdit && (
                  <NumberInput
                    size="sm"
                    invalid={!!errors?.stockItems?.[index]?.purchasePrice}
                    invalidText=""
                    id={`purchaseprice-${row.uuid}`}
                    allowEmpty={true}
                    onChange={(e: any) =>
                      setValue(
                        `stockItems.${index}.purchasePrice`,
                        e?.target?.value
                      )
                    }
                    value={row?.purchasePrice ?? ""}
                    title=""
                  />
                )}
                {!canEdit && row?.purchasePrice?.toLocaleString()}
              </TableCell>
            ) : (
              setValue(`stockItems.${index}.purchasePrice`, null)
            )}
            {canEdit && (
              <TableCell>
                <Button
                  type="button"
                  size="sm"
                  className="submitButton clear-padding-margin"
                  iconDescription={"Delete"}
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
