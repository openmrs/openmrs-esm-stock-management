import React, { useCallback } from "react";

import { Button } from "@carbon/react";
import { showModal } from "@openmrs/esm-framework";
import { useTranslation } from "react-i18next";
import { DeliveryTruck } from "@carbon/react/icons";
import { StockOperationDTO } from "../../core/api/types/stockOperation/StockOperationDTO";

interface StockOperationIssueStockButtonProps {
  operation: StockOperationDTO;
}

const StockOperationIssueStockButton: React.FC<
  StockOperationIssueStockButtonProps
> = ({ operation }) => {
  const { t } = useTranslation();
  const launchIssueStockModal = useCallback(() => {
    const dispose = showModal("stock-operation-dialog", {
      title: "Issue Stock",
      operation: operation,
      requireReason: true,
      closeModal: () => dispose(),
    });
  }, [operation]);

  return (
    <Button
      onClick={launchIssueStockModal}
      kind="tertiary"
      renderIcon={(props) => <DeliveryTruck size={16} {...props} />}
    >
      {t("issueStock", "Issue Stock ")}
    </Button>
  );
};

export default StockOperationIssueStockButton;
