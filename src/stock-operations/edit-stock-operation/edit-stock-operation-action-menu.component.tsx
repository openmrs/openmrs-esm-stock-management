import React, { useState } from "react";
import { Button } from "@carbon/react";
import { useTranslation } from "react-i18next";
import { StockOperationDTO } from "../../core/api/types/stockOperation/StockOperationDTO";
import { launchAddOrEditDialog } from "../stock-operation.utils";
import { StockOperationType } from "../../core/api/types/stockOperation/StockOperationType";
import { getStockOperation } from "../stock-operations.resource";
interface EditStockOperationActionMenuProps {
  operationUuid?: string;
  operationNumber?: string;
  model?: StockOperationDTO;
  operations: StockOperationType[];
}
const EditStockOperationActionMenu: React.FC<
  EditStockOperationActionMenuProps
> = ({ operationUuid, operationNumber, model, operations }) => {
  const { t } = useTranslation();
  const [operation, setOperation] = useState<StockOperationDTO | null>(null);

  if (operationUuid && !operation) {
    getStockOperation(operationUuid)
      .then((res) => setOperation(res.data))
      .catch((error) =>
        console.error("Error fetching stock operation:", error)
      );
  }
  const type: StockOperationType = {
    uuid: "",
    name: "",
    description: "",
    operationType: "",
    hasSource: false,
    sourceType: "Location",
    hasDestination: false,
    destinationType: "Location",
    hasRecipient: false,
    recipientRequired: false,
    availableWhenReserved: false,
    allowExpiredBatchNumbers: false,
    stockOperationTypeLocationScopes: [],
    creator: undefined,
    dateCreated: undefined,
    changedBy: undefined,
    dateChanged: undefined,
    dateVoided: undefined,
    voidedBy: undefined,
    voidReason: "",
    voided: false,
  };

  return (
    <>
      <Button
        type="button"
        size="sm"
        className="submitButton clear-padding-margin"
        iconDescription={"View"}
        kind="ghost"
        onClick={() => {
          launchAddOrEditDialog(
            t,
            model ?? operation,
            true,
            type,
            operations,
            false
          );
        }}
      >
        {operationNumber ? operationNumber : `${model?.operationNumber}`}
      </Button>
    </>
  );
};

export default EditStockOperationActionMenu;
