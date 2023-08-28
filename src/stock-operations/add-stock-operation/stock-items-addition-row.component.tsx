import React, { ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./stock-items-addition-row.scss";
import { isDesktop } from "@openmrs/esm-framework";
import {
  Button,
  ComboBox,
  DatePicker,
  DatePickerInput,
  Link,
  NumberInput,
  TableCell,
  TableRow,
  TextInput,
  Tile,
} from "@carbon/react";
import { TrashCan } from "@carbon/react/icons";
import { StockOperationItemFormData } from "../validation-schema";
import StockItemSelector from "../stock-item-selector/stock-item-selector.component";
import {
  Control,
  FieldArray,
  FieldArrayWithId,
  FieldErrors,
  useFieldArray,
  UseFieldArrayRemove,
  useForm,
  UseFormSetValue,
} from "react-hook-form";
import { URL_STOCK_ITEM } from "../../stock-items/stock-items-table.component";
import {
  DATE_PICKER_CONTROL_FORMAT,
  DATE_PICKER_FORMAT,
  formatForDatePicker,
  today,
} from "../../constants";
import { stockOperationItemsSchema } from "./validationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { StockBatchDTO } from "../../core/api/types/stockItem/StockBatchDTO";
import { StockItemPackagingUOMDTO } from "../../core/api/types/stockItem/StockItemPackagingUOM";
import { StockItemInventory } from "../../core/api/types/stockItem/StockItemInventory";
import { StockOperationItemDTO } from "../../core/api/types/stockOperation/StockOperationItemDTO";
import { StockItemDTO } from "../../core/api/types/stockItem/StockItem";

interface StockItemsAdditionRowProps {
  canEdit?: boolean;
  rows: StockOperationItemFormData[];
  showQuantityRequested?: boolean;
  requiresActualBatchInformation?: boolean;
  requiresBatchUuid?: boolean;
  canUpdateBatchInformation?: boolean;
  canCapturePurchasePrice?: boolean;
  batchNos?: { [key: string]: StockBatchDTO[] };
  itemUoM?: { [key: string]: StockItemPackagingUOMDTO[] };
  batchBalance?: { [key: string]: StockItemInventory };
  control: Control<{ stockItems: StockOperationItemDTO[] }>;
  setValue: UseFormSetValue<{ stockItems: StockOperationItemDTO[] }>;
  errors: FieldErrors<{ stockItems: StockOperationItemDTO[] }>;
  remove: UseFieldArrayRemove;
  fields: FieldArrayWithId<
    {
      stockItems: StockOperationItemDTO[];
    },
    "stockItems"
  >[];
}

const StockItemsAdditionRow: React.FC<StockItemsAdditionRowProps> = ({
  canEdit,
  rows,
  showQuantityRequested,
  requiresActualBatchInformation,
  requiresBatchUuid,
  canUpdateBatchInformation,
  canCapturePurchasePrice,
  batchNos,
  itemUoM,
  batchBalance,
  control,
  setValue,
  errors,
  remove,
  fields,
}) => {
  const { t } = useTranslation();

  const [stockItems, setStockItems] = useState<StockOperationItemFormData[]>(
    () => rows
  );

  const handleStockItemChange = (data: StockItemDTO) => {
    // if (item) {
    //   item.stockItemName =
    //     data.selectedItem?.display ??
    //     (data.selectedItem?.drugName
    //       ? `${data.selectedItem?.drugName}${
    //           data.selectedItem?.commonName ?? data.selectedItem?.conceptName
    //             ? ` (${
    //                 data.selectedItem?.commonName ??
    //                 data.selectedItem?.conceptName
    //               })`
    //             : ""
    //         }`
    //       : null) ??
    //     data.selectedItem?.conceptName;
    //
    //   let configureExpiration = data.selectedItem?.hasExpiration ?? true;
    //   item.hasExpiration = configureExpiration;
    //   if (!configureExpiration) {
    //     item.expiration = null;
    //   }
    //
    //   item.stockItemUuid = data.selectedItem?.uuid;
    //
    //   item.stockItemPackagingUOMUuid = null;
    //   item.stockItemPackagingUOMName = null;
    //
    //   item.stockBatchUuid = null;
    //   handleStockItemPackagingUoMsSearch(row, "", data.selectedItem?.uuid);
    //   if (requiresBatchUuid) {
    //     handleStockBatchSearch(row, "", data.selectedItem?.uuid);
    //   }
    //   if (item.uuid === items[items.length - 1].uuid) {
    //     let itemId = `new-item-${getStockOperationUniqueId()}`;
    //     draft.push({ uuid: itemId, id: itemId });
    //   }
    // } else {
    //   item.stockItemName = null;
    //   item.stockItemUuid = null;
    //   item.stockItemPackagingUOMUuid = null;
    //   item.stockItemPackagingUOMName = null;
    //   item.stockBatchUuid = null;
    // }
  };

  return (
    <div
      style={{
        padding: "8px",
      }}
    >
      {fields.map((row, index) => {
        const stockItemId = `stockItems.${index}.stockItemUuid`;
        return (
          <Tile
            className={isDesktop ? styles.desktopRow : styles.tabletRow}
            key={row.uuid}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5em",
            }}
          >
            {canEdit && row.uuid.startsWith("new-item") && (
              <StockItemSelector
                title="Item"
                placeholder="Select an item"
                controllerName={`stockItems.${index}.stockItemUuid`}
                name={stockItemId}
                control={control as unknown as Control}
                invalid={!!errors?.stockItems?.[index]?.stockItemUuid}
              />
            )}
            {(!canEdit || !row.uuid.startsWith("new-item")) && (
              <Link
                target={"_blank"}
                to={URL_STOCK_ITEM(row?.stockItemUuid)}
              >{`${row?.stockItemName}`}</Link>
            )}
            {showQuantityRequested && (
              <span>
                {row?.quantityRequested?.toLocaleString() ?? ""}{" "}
                {row?.quantityRequestedPackagingUOMName ?? ""}
              </span>
            )}
            {(requiresActualBatchInformation || requiresBatchUuid) && (
              <span>
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
                      labelText="Batch No"
                      invalidText=""
                      invalid={errors?.stockItems?.[index]?.batchNo}
                    />
                  )}
                {requiresBatchUuid &&
                  !requiresActualBatchInformation &&
                  canEdit && (
                    <ComboBox
                      titleText="Batch No"
                      size="sm"
                      initialSelectedItem={row?.stockBatchUuid}
                      items={
                        row?.stockBatchUuid
                          ? [
                              ...(row.stockItemUuid in batchNos &&
                              batchNos[row.stockItemUuid] &&
                              batchNos[row.stockItemUuid].some(
                                (x) => x.uuid === row.stockBatchUuid
                              )
                                ? []
                                : [
                                    {
                                      uuid: row?.stockBatchUuid,
                                      display: row?.batchNo,
                                    },
                                  ]),
                              ...((row.stockItemUuid &&
                              row.stockItemUuid in batchNos
                                ? batchNos[row.stockItemUuid]
                                : null) ?? []),
                            ]
                          : (row.stockItemUuid && row.stockItemUuid in batchNos
                              ? batchNos[row.stockItemUuid]
                              : null) ?? []
                      }
                      onChange={({
                        selectedItem,
                      }: {
                        selectedItem: string;
                      }) => {
                        setValue(`stockItems.${index}.batchNo`, selectedItem);
                      }}
                      // onFocus={(e) => handleStockBatchSearch(row, "")}
                      // onToggleClick={(e) => handleStockBatchSearch(row, "")}
                      shouldFilterItem={(data) => true}
                      // onInputChange={(q) => handleStockBatchSearch(row, q)}
                      itemToString={(item) => item?.batchNo ?? ""}
                      placeholder={"Filter..."}
                      invalid={
                        row.uuid in errors &&
                        "stockBatchUuid" in errors[row.uuid] &&
                        !errors[row.uuid]["stockBatchUuid"]
                      }
                    />
                  )}
                {!(
                  canUpdateBatchInformation &&
                  row?.permission?.canUpdateBatchInformation
                ) &&
                  !canEdit &&
                  row?.batchNo}
              </span>
            )}
            {(requiresActualBatchInformation || requiresBatchUuid) && (
              <span>
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
                    >
                      <DatePickerInput
                        size="sm"
                        autoComplete="off"
                        id={`expiration-input-${row.uuid}`}
                        name="operationDate"
                        placeholder={DATE_PICKER_FORMAT}
                        labelText="Expiry"
                        defaultValue={formatForDatePicker(row?.expiration)}
                        onChange={(e) =>
                          setValue(
                            `stockItems.${index}.expiration`,
                            e.target.value
                          )
                        }
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
                  formatForDatePicker(row?.expiration)}
              </span>
            )}
            <span>
              {canEdit && (
                <NumberInput
                  className="small-placeholder-text"
                  size="sm"
                  id={`qty-${row.uuid}`}
                  allowEmpty={true}
                  onChange={(e: any, d: any) =>
                    setValue(`stockItems.${index}.quantity`, e?.target?.value)
                  }
                  value={row?.quantity ?? ""}
                  invalidText=""
                  label="Quantity"
                  placeholder={
                    requiresBatchUuid &&
                    !requiresActualBatchInformation &&
                    row?.stockBatchUuid in batchBalance
                      ? `Bal: ${
                          batchBalance[
                            row?.stockBatchUuid
                          ]?.quantity?.toLocaleString() ?? ""
                        } ${
                          batchBalance[row?.stockBatchUuid]?.quantityUoM ?? ""
                        }`
                      : ""
                  }
                  invalid={!!errors?.stockItems?.[index]?.quantity}
                />
              )}
              {!canEdit && row?.quantity?.toLocaleString()}
            </span>
            <span>
              {canEdit && (
                <ComboBox
                  titleText="Qty UoM"
                  size="sm"
                  id={`quantityuom-${row.uuid}`}
                  initialSelectedItem={
                    row?.stockItemPackagingUOMUuid
                      ? ({
                          uuid: row?.stockItemPackagingUOMUuid,
                          display: row?.stockItemPackagingUOMName,
                        } as any)
                      : null
                  }
                  //172.16.9.176:5600items={row?.stockItemPackagingUOMUuid ? [...((row.stockItemUuid in itemUoM && itemUoM[row.stockItemUuid] && itemUoM[row.stockItemUuid].some(x => x.uuid === row.stockItemPackagingUOMUuid)) ? [] : [{ uuid: row?.stockItemPackagingUOMUuid, display: row?.stockItemPackagingUOMName }]), ...(row.packagingUnits ?? (row.stockItemUuid && (row.stockItemUuid in itemUoM) ? itemUoM[row.stockItemUuid] : null) ?? [])] : (row.packagingUnits ?? (row.stockItemUuid && (row.stockItemUuid in itemUoM) ? itemUoM[row.stockItemUuid] : null) ?? [])}
                  items={
                    row?.packagingUnits
                      ? row.packagingUnits
                      : row?.stockItemPackagingUOMUuid
                      ? [
                          ...(row.stockItemUuid in itemUoM &&
                          itemUoM[row.stockItemUuid] &&
                          itemUoM[row.stockItemUuid].some(
                            (x) => x.uuid === row.stockItemPackagingUOMUuid
                          )
                            ? []
                            : [
                                {
                                  uuid: row?.stockItemPackagingUOMUuid,
                                  display: row?.stockItemPackagingUOMName,
                                },
                              ]),
                          ...(row.packagingUnits ??
                            (row.stockItemUuid && row.stockItemUuid in itemUoM
                              ? itemUoM[row.stockItemUuid]
                              : null) ??
                            []),
                        ]
                      : row.packagingUnits ??
                        (row.stockItemUuid && row.stockItemUuid in itemUoM
                          ? itemUoM[row.stockItemUuid]
                          : null) ??
                        []
                  }
                  onChange={({ selectedItem }: { selectedItem: string }) =>
                    setValue(
                      `stockItems.${index}.stockItemPackagingUOMUuid`,
                      selectedItem
                    )
                  }
                  // onFocus={(e) => handleStockItemPackagingUoMsSearch(row, "")}
                  // onToggleClick={(e) =>
                  //   handleStockItemPackagingUoMsSearch(row, "")
                  // }
                  shouldFilterItem={(data) => true}
                  onInputChange={(q) => {
                    // handleStockItemPackagingUoMsSearch(row, q)
                    // TODO: Search for stock items
                  }}
                  itemToString={(item) =>
                    item?.display ?? item?.packagingUomName ?? ""
                  }
                  placeholder={"Filter..."}
                  invalid={
                    !!errors?.stockItems?.[index]?.stockItemPackagingUOMUuid
                  }
                />
              )}
              {!canEdit && row?.stockItemPackagingUOMName}
            </span>
            {canCapturePurchasePrice && (
              <span>
                {canEdit && (
                  <NumberInput
                    size="sm"
                    label="Purchase Price"
                    invalid={!!errors?.stockItems?.[index]?.purchasePrice}
                    invalidText=""
                    id={`purchaseprice-${row.uuid}`}
                    allowEmpty={true}
                    onChange={(e: any, d: any) =>
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
              </span>
            )}
            {canEdit && (
              <Button
                type="button"
                size="sm"
                className="submitButton clear-padding-margin"
                iconDescription={"Delete"}
                kind="ghost"
                renderIcon={TrashCan}
                onClick={() => remove(index)}
              />
            )}
          </Tile>
        );
      })}
    </div>
  );
};
export default StockItemsAdditionRow;
