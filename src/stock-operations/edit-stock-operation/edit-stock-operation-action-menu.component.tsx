import React from "react";
import { Button } from "@carbon/react";
import { Edit } from "@carbon/react/icons";
import { useTranslation } from "react-i18next";
import { StockOperationDTO } from "../../core/api/types/stockOperation/StockOperationDTO";
import { StockOperationType } from "../../core/api/types/stockOperation/StockOperationType";
import { launchAddOrEditDialog } from "../stock-operation.utils";

interface EditStockOperationActionMenuProps {
  model: StockOperationDTO;
  operations: StockOperationType[];
  operationUuid: string;
  operationNumber: string;
  onEdit: (operation: StockOperationDTO) => void;
  showIcon?: boolean;
  showprops?: boolean;
}

const EditStockOperationActionMenu: React.FC<
  EditStockOperationActionMenuProps
> = ({ model, operations, showIcon = true, showprops = true }) => {
  const { t } = useTranslation();

  const handleEdit = () => {
    const operation = operations.find(
      (op) => op.uuid === model.operationTypeUuid
    );
    launchAddOrEditDialog(t, model, true, operation, operations, false);
  };

  return (
    <Button
      kind="ghost"
      size="sm"
      onClick={handleEdit}
      iconDescription={t("editStockOperation", "Edit Stock Operation")}
      renderIcon={showIcon ? Edit : undefined}
    >
      {showprops && model.operationNumber}
    </Button>
  );
};

export default EditStockOperationActionMenu;
