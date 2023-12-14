import React from "react";
import { Button } from "@carbon/react";
import { useTranslation } from "react-i18next";
import { StockItemDTO } from "../../core/api/types/stockItem/StockItem";
import { launchAddOrEditDialog } from "../stock-item.utils";

interface EditStockItemActionsMenuProps {
  data: StockItemDTO;
}

const EditStockItemActionsMenu: React.FC<EditStockItemActionsMenuProps> = ({
  data,
}) => {
  const { t } = useTranslation();

  return (
    <Button
      kind="ghost"
      size="md"
      onClick={() => {
        data.isDrug = !!data.drugUuid;
        launchAddOrEditDialog(data, true);
      }}
      iconDescription={t("editStockItem", "Edit Stock Item")}
    >
      {`${data?.drugName ?? data.conceptName}`}
    </Button>
  );
};
export default EditStockItemActionsMenu;
