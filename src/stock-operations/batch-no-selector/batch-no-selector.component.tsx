import React, { ReactNode, useEffect, useMemo, useState } from "react";
import { ComboBox, InlineLoading } from "@carbon/react";
import { useStockItemBatchNos } from "./batch-no-selector.resource";
import { StockBatchDTO } from "../../core/api/types/stockItem/StockBatchDTO";
import { useStockItemBatchInformationHook } from "../../stock-items/add-stock-item/batch-information/batch-information.resource";
import { useTranslation } from "react-i18next";

interface BatchNoSelectorProps {
  placeholder?: string;
  stockItemUuid: string;
  batchUuid?: string;
  onBatchNoChanged?: (item: StockBatchDTO) => void;
  title?: string;
  invalid?: boolean;
  invalidText?: ReactNode;
  selectedItem?: string;
  name: string; // Ensure name is defined
}

const BatchNoSelector = (props: BatchNoSelectorProps) => {
  const { isLoading, stockItemBatchNos } = useStockItemBatchNos(
    props.stockItemUuid
  );
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null
  );
  const [selectedItem, setSelectedItem] = useState<StockBatchDTO | null>(null);
  const { t } = useTranslation();

  const initialSelectedItem = useMemo(
    () =>
      stockItemBatchNos?.find(
        (stockItem) => stockItem.uuid === props.batchUuid
      ) ?? "",
    [stockItemBatchNos, props.batchUuid]
  );

  const { items, setStockItemUuid } = useStockItemBatchInformationHook();

  useEffect(() => {
    setStockItemUuid(props.stockItemUuid);
  }, [props.stockItemUuid, setStockItemUuid]);

  const stockItemBatchesInfo = useMemo(() => {
    return stockItemBatchNos?.map((item) => {
      const matchingBatch = items?.find(
        (batch) => batch.batchNumber === item.batchNo
      );
      return matchingBatch
        ? { ...item, quantity: matchingBatch.quantity ?? "" }
        : item;
    });
  }, [stockItemBatchNos, items]);

  useEffect(() => {
    if (
      !isLoading &&
      stockItemBatchNos &&
      props.selectedItem &&
      stockItemBatchNos.length === 0
    ) {
      setValidationMessage(
        "No stock batch numbers defined. Do an initial/receipt stock operation first."
      );
    } else {
      setValidationMessage(null);
    }
  }, [isLoading, stockItemBatchNos, props.selectedItem]);

  if (isLoading) return <InlineLoading status="active" />;

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <ComboBox
        style={{ flexGrow: 1 }}
        titleText={props.title}
        name={props.name}
        id={props.name}
        size="sm"
        items={stockItemBatchesInfo || []}
        onChange={(data: { selectedItem?: StockBatchDTO }) => {
          const selected = data.selectedItem || null;
          setSelectedItem(selected);
          props.onBatchNoChanged?.(selected);
        }}
        initialSelectedItem={initialSelectedItem}
        itemToString={(s: StockBatchDTO) =>
          s?.batchNo ? `${s.batchNo} | Qty: ${s.quantity ?? ""}` : ""
        }
        placeholder={props.placeholder}
        invalid={props.invalid}
        invalidText={props.invalidText}
      />
      {validationMessage && (
        <div style={{ color: "red", marginTop: "8px" }}>
          {t(validationMessage)}
        </div>
      )}
    </div>
  );
};

export default BatchNoSelector;
