import { Button } from "@carbon/react";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { launchOverlay } from "../../core/components/overlay/hook";
import AddEditStockItem from "./add-stock-item.component";
import { initialValues } from "./add-stock-item.resource";
import { createStockItem } from "../stock-items.resource";
import { StockItemDTO } from "../../core/api/types/stockItem/StockItem";

const AddStockItemActionButton: React.FC = () => {
  const { t } = useTranslation();

  const save = async (item: StockItemDTO) => {
    const response = await createStockItem(item);
    if (response?.data) {
      alert("success");
    }
  };

  const handleClick = useCallback(() => {
    launchOverlay(
      "Add Stock Item",
      <AddEditStockItem model={initialValues} onSave={save} />
    );
  }, []);

  return (
    <Button onClick={handleClick} size="md" kind="primary">
      {t("stockmanagement.addnew", "Add New")}
    </Button>
  );
};

export default AddStockItemActionButton;
