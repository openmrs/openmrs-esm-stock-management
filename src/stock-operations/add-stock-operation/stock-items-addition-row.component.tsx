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
  UseFieldArrayAppend,
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
import {
  StockItem,
  StockItemDTO,
} from "../../core/api/types/stockItem/StockItem";
import { getStockOperationUniqueId } from "../stock-operation.utils";
import append from "react-hook-form/dist/utils/append";
import QtyUomSelector from "../qty-uom-selector/qty-uom-selector.component";

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
  append,
}) => {
  const { t } = useTranslation();

  const [stockItems, setStockItems] = useState<StockOperationItemFormData[]>(
    () => rows
  );

  const [stockItemUuid, setStockItemUuid] = useState<
    string | null | undefined
  >();

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
      // handleStockItemPackagingUoMsSearch(row, "", data.selectedItem?.uuid);
      if (requiresBatchUuid) {
        // handleStockBatchSearch(row, "", data.selectedItem?.uuid);
      }
    } /*else {
      item.stockItemName = null;
      item.stockItemUuid = null;
      item.stockItemPackagingUOMUuid = null;
      item.stockItemPackagingUOMName = null;
      item.stockBatchUuid = null;
    }*/
  };

  return (
    <>
      {fields.map((row, index) => {
        const stockItemId = `stockItems.${index}.stockItemUuid`;
        return (
          <TableRow
            className={isDesktop ? styles.desktopRow : styles.tabletRow}
            key={row.uuid}
          >
            <TableCell>
              {canEdit && row.uuid.startsWith("new-item") && (
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
                      item.packagingUnits
                    );
                    setStockItemUuid(item.uuid);
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
                      invalidText=""
                      invalid={errors?.stockItems?.[index]?.batchNo}
                    />
                  )}
                {requiresBatchUuid &&
                  !requiresActualBatchInformation &&
                  canEdit && (
                    <ComboBox
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
                        defaultValue={formatForDatePicker(row?.expiration)}
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
              </TableCell>
            )}
            <TableCell>
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
            </TableCell>
            <TableCell>
              {canEdit && (
                <QtyUomSelector
                  stockItemUuid={row.stockItemUuid}
                  onStockPackageChanged={(selectedItem) => {
                    setValue(
                      `stockItems.${index}.stockItemPackagingUOMUuid`,
                      selectedItem.uuid
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
              )}
              {!canEdit && row?.stockItemPackagingUOMName}
            </TableCell>
            {canCapturePurchasePrice && (
              <TableCell>
                {canEdit && (
                  <NumberInput
                    size="sm"
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
              </TableCell>
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
