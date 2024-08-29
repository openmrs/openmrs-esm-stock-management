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
}

const EditStockOperationActionMenu: React.FC<
  EditStockOperationActionMenuProps
> = ({ model, operations }) => {
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
      renderIcon={(props) => <Edit size={16} {...props} />}
    >
      {model.operationNumber}
    </Button>
  );
};

export default EditStockOperationActionMenu;
