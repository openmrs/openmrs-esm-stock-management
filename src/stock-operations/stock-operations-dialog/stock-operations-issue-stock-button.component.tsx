import React from "react";

import { Button } from "@carbon/react";
import { useTranslation } from "react-i18next";
import { DeliveryTruck } from "@carbon/react/icons";
import { StockOperationDTO } from "../../core/api/types/stockOperation/StockOperationDTO";
import { StockOperationType } from "../../core/api/types/stockOperation/StockOperationType";
import { launchAddOrEditDialog } from "../stock-operation.utils";

interface StockOperationIssueStockButtonProps {
  operation: StockOperationDTO;
  operations: StockOperationType[];
}

const StockOperationIssueStockButton: React.FC<
  StockOperationIssueStockButtonProps
> = ({ operation, operations }) => {
  const { t } = useTranslation();
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

  const handleButtonClick = () => {
    launchAddOrEditDialog(operation, true, type, operations, false);
  };

  return (
    <Button
      onClick={handleButtonClick}
      kind="tertiary"
      renderIcon={(props) => <DeliveryTruck size={16} {...props} />}
    >
      {t("issueStock", "Issue Stock ")}
    </Button>
  );
};

export default StockOperationIssueStockButton;
