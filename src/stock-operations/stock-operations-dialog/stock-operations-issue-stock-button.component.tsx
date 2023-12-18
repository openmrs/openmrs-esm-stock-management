import React, { useCallback } from "react";

import { Button } from "@carbon/react";
import { showModal } from "@openmrs/esm-framework";
import { useTranslation } from "react-i18next";
import { DeliveryTruck } from "@carbon/react/icons";

interface StockOperationIssueStockButtonProps {
  uuid: string;
}

const StockOperationIssueStockButton: React.FC<
  StockOperationIssueStockButtonProps
> = ({ uuid }) => {
  const { t } = useTranslation();
  const launchIssueStockModal = useCallback(() => {
    const dispose = showModal("stock-operation-dialog", {
      title: "Issue Stock",
      closeModal: () => dispose(),
    });
  }, []);

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
