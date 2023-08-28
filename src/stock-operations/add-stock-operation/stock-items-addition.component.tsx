import React, { useCallback, useState } from "react";
import { StockOperationDTO } from "../../core/api/types/stockOperation/StockOperationDTO";
import { SaveStockOperation } from "../../stock-items/types";
import { StockOperationType } from "../../core/api/types/stockOperation/StockOperationType";
import { InitializeResult } from "./types";
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
} from "@carbon/react";
import { isDesktop, useLayoutType } from "@openmrs/esm-framework";
import { StockOperationItemDTO } from "../../core/api/types/stockOperation/StockOperationItemDTO";
import { getStockOperationUniqueId } from "../stock-operation.utils";
import { useTranslation } from "react-i18next";
import styles from "./add-stock-operation.scss";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { stockOperationItemsSchema } from "./validationSchema";
import StockItemsAdditionRow from "./stock-items-addition-row.component";
import { Save } from "@carbon/react/icons";

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
}) => {
  const desktop = isDesktop(useLayoutType());
  const { t } = useTranslation();
  const [stockOperationItems, setStockOperationItems] = useState<
    StockOperationItemDTO[]
  >([{ uuid: `new-item-1`, id: `new-item-1` }]);

  const handleSave = (item: { stockItems: StockOperationItemDTO[] }) => {
    alert(JSON.stringify(item));
  };

  const {
    handleSubmit,
    register,
    control,
    setValue,
    getValues,
    formState: { isValid, errors, isValidating, isDirty },
    reset,
  } = useForm({
    resolver: zodResolver(stockOperationItemsSchema),
    defaultValues: { stockItems: stockOperationItems },
    mode: "onSubmit",
  });

  const [isSaving, setIsSaving] = useState(false);

  const { fields, append, remove } = useFieldArray({
    name: "stockItems",
    control,
  });

  const addNewStockOperationItem = useCallback(() => {
    const newId = getStockOperationUniqueId();
    const newItems = [
      ...stockOperationItems,
      {
        id: `new-item-${newId}`,
        edit: true,
        uuid: `new-item-${newId}`,
        permission: { canView: true, canEdit: true },
        hasExpiration: true,
      } as any as StockOperationItemDTO,
    ];
    setStockOperationItems(newItems);
  }, [stockOperationItems]);

  const headers = [
    {
      key: "item",
      header: t("item", "Item"),
      styles: { width: "40%" },
    },
    ...(showQuantityRequested
      ? [
          {
            key: "quantityrequested",
            header: t("quantityRequested", "Quantity Requested"),
            styles: { width: "8%" },
          },
        ]
      : []),
    ...(requiresBatchUuid || requiresActualBatchInformation
      ? [
          {
            key: "batch",
            header: t("batchNo", "Batch No"),
            styles: { width: "15%" },
          },
        ]
      : []),
    ...(requiresActualBatchInformation
      ? [
          {
            key: "expiry",
            header: t("expiry", "Expiry"),
            styles: { width: "15%" },
          },
        ]
      : []),
    ...(requiresBatchUuid
      ? [
          {
            key: "expiry",
            header: t("expiry", "Expiry"),
            styles: { width: "8%" },
          },
        ]
      : []),

    {
      key: "quantity",
      header: showQuantityRequested
        ? t("qtyIssued", "Qty Issued")
        : t("qty", "Qty"),
      styles: { width: "8%" },
    },
    {
      key: "quantityuom",
      header: t("quantityUom", "Qty UoM"),
      styles: { width: "15%" },
    },
    ...(canCaptureQuantityPrice
      ? [
          {
            key: "purchaseprice",
            header: t("purchasePrice", "Purchase Price"),
            styles: { width: "10%" },
          },
        ]
      : []),
  ];

  return (
    <>
      <StockItemsAdditionRow
        rows={stockOperationItems}
        batchBalance={batchBalance}
        batchNos={batchNos}
        control={control}
        setValue={setValue}
        errors={errors}
        remove={remove}
        canEdit={canEdit}
        showQuantityRequested={showQuantityRequested}
        requiresActualBatchInformation={requiresActualBatchInformation}
        requiresBatchUuid={requiresBatchUuid}
        canUpdateBatchInformation={canUpdateBatchInformation}
        canCapturePurchasePrice={canCaptureQuantityPrice}
        itemUoM={itemUoM}
        fields={fields}
      />
      <div style={{ display: "flex", flexDirection: "row-reverse" }}>
        <Button
          name="save"
          type="button"
          className="submitButton"
          onClick={handleSubmit(handleSave, (e) => alert(JSON.stringify(e)))}
          kind="primary"
          renderIcon={Save}
        >
          {isSaving ? <InlineLoading /> : t("save", "Save")}
        </Button>
      </div>
    </>
  );
};

export default StockItemsAddition;
